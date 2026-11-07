/**
 * Firestore Security Rules Verification Specification (Dirty Dozen Test Suite)
 * Verifies that all 12 adversarial payloads in security_spec.md return PERMISSION_DENIED.
 */

export interface DirtyDozenTestCase {
  id: number;
  name: string;
  collectionPath: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: { uid: string; email?: string; email_verified?: boolean } | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TESTS: DirtyDozenTestCase[] = [
  {
    id: 1,
    name: 'Self-Assigned Admin Role on User Registration',
    collectionPath: '/users/user_1',
    operation: 'create',
    auth: { uid: 'user_1', email: 'player@example.com', email_verified: true },
    payload: { uid: 'user_1', role: 'admin', balance: 500 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Unverified Email Admin Spoof on Games Collection',
    collectionPath: '/games/jili-super-ace',
    operation: 'create',
    auth: { uid: 'spoof_admin', email: 'sakibhasanu3@gmail.com', email_verified: false },
    payload: { id: 'jili-super-ace', name: 'Super Ace' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Shadow Field Injection on User Profile Update',
    collectionPath: '/users/user_1',
    operation: 'update',
    auth: { uid: 'user_1', email: 'player@example.com', email_verified: true },
    payload: { nickname: 'NewNick', isVerifiedGhostField: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Cross-User PII and Wallet Scrape',
    collectionPath: '/users/victim_uid',
    operation: 'get',
    auth: { uid: 'attacker_uid', email: 'attacker@example.com', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'ID Poisoning with 200-char Document ID',
    collectionPath: '/games/' + 'a'.repeat(200),
    operation: 'create',
    auth: { uid: 'admin_1', email: 'sakibhasanu3@gmail.com', email_verified: true },
    payload: { id: 'a'.repeat(200) },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Client Timestamp Forgery on Transaction Creation',
    collectionPath: '/users/user_1/transactions/tx_1',
    operation: 'create',
    auth: { uid: 'user_1', email: 'player@example.com', email_verified: true },
    payload: { id: 'tx_1', userId: 'user_1', createdAt: '2020-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Orphaned Subcollection Transaction Write without Parent User',
    collectionPath: '/users/non_existent_user/transactions/tx_1',
    operation: 'create',
    auth: { uid: 'non_existent_user', email: 'ghost@example.com', email_verified: true },
    payload: { id: 'tx_1', userId: 'non_existent_user', amount: 100 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Terminal State Mutation on Completed Transaction',
    collectionPath: '/users/user_1/transactions/tx_completed',
    operation: 'update',
    auth: { uid: 'user_1', email: 'player@example.com', email_verified: true },
    payload: { amount: 999999, status: 'completed' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Immortal Field Tampering (createdAt / uid)',
    collectionPath: '/users/user_1',
    operation: 'update',
    auth: { uid: 'user_1', email: 'player@example.com', email_verified: true },
    payload: { uid: 'user_2', createdAt: '2025-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Negative Balance Exploit',
    collectionPath: '/users/user_1',
    operation: 'update',
    auth: { uid: 'user_1', email: 'player@example.com', email_verified: true },
    payload: { balance: -1000 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Unauthorized Game Catalog Deletion by Player',
    collectionPath: '/games/jili-super-ace',
    operation: 'delete',
    auth: { uid: 'user_1', email: 'player@example.com', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Banned User Transaction Creation',
    collectionPath: '/users/banned_user/transactions/tx_99',
    operation: 'create',
    auth: { uid: 'banned_user', email: 'banned@example.com', email_verified: true },
    payload: { id: 'tx_99', userId: 'banned_user', amount: 500 },
    expectedResult: 'PERMISSION_DENIED',
  },
];
