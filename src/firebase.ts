import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { GameItem, CategoryCardItem, ProviderConfig } from './types';

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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
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

const ID_REGEX = /^[a-zA-Z0-9_\-]+$/;

export function sanitizeDocId(rawId: string): string {
  const cleaned = rawId.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 100);
  return cleaned && ID_REGEX.test(cleaned) ? cleaned : 'item_' + Date.now();
}

export async function signInWithGoogleFirebase(): Promise<User | null> {
  const cred = await signInWithPopup(auth, googleAuthProvider);
  return cred.user;
}

export function canWriteCatalogAsAdmin(): boolean {
  const u = auth.currentUser;
  return Boolean(u && u.emailVerified && u.email === 'sakibhasanu3@gmail.com');
}

export async function syncGameToFirestore(game: GameItem): Promise<void> {
  if (!canWriteCatalogAsAdmin()) return;
  const safeId = sanitizeDocId(game.id);
  const path = `games/${safeId}`;
  const payload: Record<string, unknown> = {
    id: safeId,
    name: String(game.name || 'Game').slice(0, 120),
    bengaliName: String(game.bengaliName || game.name || 'গেম').slice(0, 150),
    category: ['hot', 'slots', 'fishing', 'live', 'poker', 'lottery', 'sports'].includes(game.category)
      ? game.category
      : 'slots',
    provider: String(game.provider || 'Jili').slice(0, 80),
    image: String(game.image || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400').slice(0, 1000),
    rating: Math.min(5, Math.max(0, Number(game.rating ?? 5))),
    rtp: Math.min(100, Math.max(50, Number(game.rtp ?? 97.0))),
    minBet: Math.min(1000000, Math.max(0, Number(game.minBet ?? 1))),
    maxBet: Math.min(10000000, Math.max(Number(game.minBet ?? 1), Number(game.maxBet ?? 5000))),
    active: Boolean(game.active),
    updatedAt: serverTimestamp(),
  };
  if (game.multiplier !== undefined) payload.multiplier = String(game.multiplier).slice(0, 40);
  if (game.isHot !== undefined) payload.isHot = Boolean(game.isHot);
  if (game.isNew !== undefined) payload.isNew = Boolean(game.isNew);
  if (game.playableType) payload.playableType = String(game.playableType).slice(0, 40);
  if (game.remoteGameCode) payload.remoteGameCode = String(game.remoteGameCode).slice(0, 120);
  if (game.demoUrl !== undefined) payload.demoUrl = String(game.demoUrl).slice(0, 1000);

  try {
    await setDoc(doc(db, 'games', safeId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteGameFromFirestore(gameId: string): Promise<void> {
  if (!canWriteCatalogAsAdmin()) return;
  const safeId = sanitizeDocId(gameId);
  const path = `games/${safeId}`;
  try {
    await deleteDoc(doc(db, 'games', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function syncCategoryToFirestore(cat: CategoryCardItem): Promise<void> {
  if (!canWriteCatalogAsAdmin()) return;
  const safeId = sanitizeDocId(cat.id);
  const path = `categories/${safeId}`;
  const payload = {
    id: safeId,
    titleBn: String(cat.titleBn || 'ক্যাটাগরি').slice(0, 80),
    subBn: String(cat.subBn || 'জনপ্রিয় গেম').slice(0, 120),
    image: String(cat.image || 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=200').slice(0, 1000),
    iconBg: String(cat.iconBg || 'from-orange-600 to-red-800').slice(0, 100),
    updatedAt: serverTimestamp(),
  };
  try {
    await setDoc(doc(db, 'categories', safeId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncProviderToFirestore(prov: ProviderConfig): Promise<void> {
  if (!canWriteCatalogAsAdmin()) return;
  const safeId = sanitizeDocId(prov.id);
  const path = `providers/${safeId}`;
  const payload: Record<string, unknown> = {
    id: safeId,
    name: String(prov.name || 'Provider').slice(0, 80),
    displayName: String(prov.displayName || prov.name || 'Provider').slice(0, 80),
    showType: ['image_only', 'text_only', 'both'].includes(prov.showType || 'both') ? prov.showType : 'both',
    apiUrl: String(prov.apiUrl || 'https://api.livexwin.com/v1').slice(0, 500),
    merchantCode: String(prov.merchantCode || 'LXW_MERCHANT').slice(0, 120),
    agentCode: String(prov.agentCode || 'LXW_AGENT').slice(0, 120),
    currency: String(prov.currency || 'BDT').slice(0, 10),
    callbackUrl: String(prov.callbackUrl || 'https://livexwin.com/api/callback').slice(0, 500),
    status: ['active', 'maintenance', 'disabled'].includes(prov.status) ? prov.status : 'active',
    updatedAt: serverTimestamp(),
  };
  if (prov.logoUrl !== undefined && !prov.logoUrl.startsWith('data:')) {
    payload.logoUrl = String(prov.logoUrl).slice(0, 1000);
  }
  if (typeof prov.lastPingMs === 'number') {
    payload.lastPingMs = Math.min(60000, Math.max(0, prov.lastPingMs));
  }

  try {
    await setDoc(doc(db, 'providers', safeId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteProviderFromFirestore(providerId: string): Promise<void> {
  if (!canWriteCatalogAsAdmin()) return;
  const safeId = sanitizeDocId(providerId);
  const path = `providers/${safeId}`;
  try {
    await deleteDoc(doc(db, 'providers', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function syncFavoriteToFirestore(gameId: string, isFavorited: boolean): Promise<void> {
  const u = auth.currentUser;
  if (!u || !u.emailVerified) return;
  const safeUid = sanitizeDocId(u.uid);
  const safeGameId = sanitizeDocId(gameId);
  const path = `users/${safeUid}/favorites/${safeGameId}`;
  try {
    if (isFavorited) {
      await setDoc(doc(db, 'users', safeUid, 'favorites', safeGameId), {
        userId: safeUid,
        gameId: safeGameId,
        createdAt: serverTimestamp(),
      });
    } else {
      await deleteDoc(doc(db, 'users', safeUid, 'favorites', safeGameId));
    }
  } catch (error) {
    handleFirestoreError(error, isFavorited ? OperationType.CREATE : OperationType.DELETE, path);
  }
}

export function initFirestoreCatalogSync(callbacks: {
  onGamesSnapshot: (games: GameItem[]) => void;
  onCategoriesSnapshot: (categories: CategoryCardItem[]) => void;
  onProvidersSnapshot: (providers: ProviderConfig[]) => void;
  onFavoritesSnapshot: (favGameIds: string[]) => void;
}) {
  const unsubGames = onSnapshot(
    collection(db, 'games'),
    snapshot => {
      if (!snapshot.empty) {
        const items: GameItem[] = [];
        snapshot.forEach(docSnap => {
          const d = docSnap.data();
          items.push({
            id: d.id,
            name: d.name,
            bengaliName: d.bengaliName,
            category: d.category,
            provider: d.provider,
            image: d.image,
            rating: d.rating,
            multiplier: d.multiplier,
            isHot: d.isHot,
            isNew: d.isNew,
            rtp: d.rtp,
            playableType: d.playableType,
            remoteGameCode: d.remoteGameCode,
            demoUrl: d.demoUrl,
            minBet: d.minBet,
            maxBet: d.maxBet,
            active: d.active,
          });
        });
        callbacks.onGamesSnapshot(items);
      }
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, 'games');
    }
  );

  const unsubCategories = onSnapshot(
    collection(db, 'categories'),
    snapshot => {
      if (!snapshot.empty) {
        const cats: CategoryCardItem[] = [];
        snapshot.forEach(docSnap => {
          const d = docSnap.data();
          cats.push({
            id: d.id,
            titleBn: d.titleBn,
            subBn: d.subBn,
            image: d.image,
            iconBg: d.iconBg,
          });
        });
        callbacks.onCategoriesSnapshot(cats);
      }
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, 'categories');
    }
  );

  const unsubProviders = onSnapshot(
    collection(db, 'providers'),
    snapshot => {
      if (!snapshot.empty) {
        const provs: ProviderConfig[] = [];
        snapshot.forEach(docSnap => {
          const d = docSnap.data();
          provs.push({
            id: d.id,
            name: d.name,
            displayName: d.displayName,
            logoUrl: d.logoUrl,
            showType: d.showType,
            apiUrl: d.apiUrl,
            merchantCode: d.merchantCode,
            secretKey: '••••••••••••',
            agentCode: d.agentCode,
            currency: d.currency,
            callbackUrl: d.callbackUrl,
            status: d.status,
            lastPingMs: d.lastPingMs,
          });
        });
        callbacks.onProvidersSnapshot(provs);
      }
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, 'providers');
    }
  );

  let unsubFavorites: (() => void) | null = null;
  const unsubAuth = onAuthStateChanged(auth, user => {
    if (unsubFavorites) {
      unsubFavorites();
      unsubFavorites = null;
    }
    if (user && user.emailVerified) {
      const safeUid = sanitizeDocId(user.uid);
      unsubFavorites = onSnapshot(
        collection(db, 'users', safeUid, 'favorites'),
        snapshot => {
          const favs: string[] = [];
          snapshot.forEach(docSnap => {
            const d = docSnap.data();
            if (d.gameId) favs.push(d.gameId);
          });
          callbacks.onFavoritesSnapshot(favs);
        },
        error => {
          handleFirestoreError(error, OperationType.LIST, `users/${safeUid}/favorites`);
        }
      );
    }
  });

  return () => {
    unsubGames();
    unsubCategories();
    unsubProviders();
    if (unsubFavorites) unsubFavorites();
    unsubAuth();
  };
}
