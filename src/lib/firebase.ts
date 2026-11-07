import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  deleteDoc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { GameItem, Transaction, UserProfile } from '../types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// Sanitize strings to blueprint maxLength boundaries
function clampStr(val: string | undefined, min: number, max: number, fallback: string): string {
  const clean = (val || fallback).trim();
  if (clean.length < min) return fallback.slice(0, max);
  return clean.slice(0, max);
}

export async function signInWithGooglePopup() {
  const cred = await signInWithPopup(auth, googleAuthProvider);
  return cred.user;
}

export async function signOutFirebase() {
  try {
    if (auth.currentUser) {
      await signOut(auth);
    }
  } catch {
    // Ignore sign-out errors if offline
  }
}

/**
 * Ensures the authenticated Firebase user has a valid UserProfileDoc in `/users/{uid}`
 */
export async function ensureFirestoreUserDoc(user: UserProfile): Promise<void> {
  const currentAuth = auth.currentUser;
  if (!currentAuth || !currentAuth.emailVerified) return;

  const uid = currentAuth.uid;
  const userPath = `users/${uid}`;
  const userRef = doc(db, 'users', uid);

  try {
    const snap = await getDoc(userRef);
    const isAdminEmail = currentAuth.email === 'sakibhasanu3@gmail.com';
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid,
        username: clampStr(user.username, 3, 50, 'player_' + uid.slice(0, 6)),
        nickname: clampStr(user.nickname, 1, 80, 'Player'),
        phone: clampStr(user.phone, 5, 30, '01700000000'),
        avatar: clampStr(
          user.avatar,
          1,
          500,
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
        ),
        role: isAdminEmail ? 'admin' : 'player',
        status: 'active',
        vipLevel: Math.min(Math.max(user.vipLevel || 1, 0), 1),
        vipPoints: 0,
        balance: Math.min(Math.max(Number(user.wallet.balance || 200), 0), 500),
        frozenBalance: 0,
        currency: 'BDT',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
      handleFirestoreError(error, OperationType.WRITE, userPath);
    }
  }
}

/**
 * Atomically updates a player's balance and records a transaction in `/users/{uid}/transactions/{txId}`
 */
export async function atomicRecordTransactionFirestore(
  delta: number,
  tx: Transaction
): Promise<void> {
  const currentAuth = auth.currentUser;
  if (!currentAuth || !currentAuth.emailVerified) return;

  const uid = currentAuth.uid;
  const userRef = doc(db, 'users', uid);
  const cleanTxId = tx.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120) || `TX_${Date.now()}`;
  const txRef = doc(db, 'users', uid, 'transactions', cleanTxId);
  const path = `users/${uid}/transactions/${cleanTxId}`;

  try {
    await runTransaction(db, async transaction => {
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) return;

      const data = userSnap.data();
      const currentBal = Number(data.balance || 0);
      const nextBal = Math.max(0, Math.min(100000000, Number((currentBal + delta).toFixed(2))));

      transaction.update(userRef, {
        balance: nextBal,
        updatedAt: serverTimestamp(),
      });

      transaction.set(txRef, {
        id: cleanTxId,
        userId: uid,
        type: tx.type,
        amount: Math.max(1, Math.min(10000000, Number(tx.amount || 1))),
        status: tx.status,
        method: clampStr(tx.method || 'system', 1, 50, 'system'),
        note: clampStr(tx.note || `${tx.type} transaction`, 1, 300, 'Wallet transaction'),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
}

/**
 * Admin helper to upsert a game into `/games/{gameId}`
 */
export async function upsertGameCatalogFirestore(game: GameItem): Promise<void> {
  const currentAuth = auth.currentUser;
  if (!currentAuth || !currentAuth.emailVerified) return;

  const cleanGameId = game.id.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120);
  const gameRef = doc(db, 'games', cleanGameId);
  const path = `games/${cleanGameId}`;

  try {
    const snap = await getDoc(gameRef);
    const demoUrl = clampStr(
      game.demoLink || `/game_frame.php?gameid=${encodeURIComponent(cleanGameId)}&name=${encodeURIComponent(game.name)}&provider=${encodeURIComponent(game.provider)}&demo=1`,
      1,
      500,
      '/game_frame.php'
    );

    if (!snap.exists()) {
      await setDoc(gameRef, {
        id: cleanGameId,
        name: clampStr(game.name, 1, 120, 'Casino Game'),
        bengaliName: clampStr(game.bengaliName, 1, 120, game.name),
        category: game.category,
        provider: clampStr(game.provider, 1, 60, 'Jili'),
        image: clampStr(
          game.image,
          1,
          500,
          'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400'
        ),
        demoLink: demoUrl,
        rtp: Math.min(99.9, Math.max(50, Number(game.rtp || 97.0))),
        minBet: Math.min(100000, Math.max(1, Number(game.minBet || 1))),
        maxBet: Math.min(1000000, Math.max(Number(game.minBet || 1), Number(game.maxBet || 5000))),
        active: Boolean(game.active),
        authorId: currentAuth.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      const existingData = snap.data();
      await setDoc(gameRef, {
        ...existingData,
        name: clampStr(game.name, 1, 120, 'Casino Game'),
        bengaliName: clampStr(game.bengaliName, 1, 120, game.name),
        category: game.category,
        provider: clampStr(game.provider, 1, 60, 'Jili'),
        image: clampStr(
          game.image,
          1,
          500,
          'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400'
        ),
        demoLink: demoUrl,
        rtp: Math.min(99.9, Math.max(50, Number(game.rtp || 97.0))),
        minBet: Math.min(100000, Math.max(1, Number(game.minBet || 1))),
        maxBet: Math.min(1000000, Math.max(Number(game.minBet || 1), Number(game.maxBet || 5000))),
        active: Boolean(game.active),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
}

export async function deleteGameCatalogFirestore(gameId: string): Promise<void> {
  const currentAuth = auth.currentUser;
  if (!currentAuth || !currentAuth.emailVerified) return;

  const cleanGameId = gameId.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120);
  const gameRef = doc(db, 'games', cleanGameId);
  const path = `games/${cleanGameId}`;

  try {
    await deleteDoc(gameRef);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
}
