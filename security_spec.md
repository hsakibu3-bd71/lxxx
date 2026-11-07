# Security Specification (Phase 0: Payload-First Security TDD)

## 1. Data Invariants
1. **Master Gate & Relational Sync**: A transaction in `/users/{userId}/transactions/{transactionId}` cannot be created, read, or updated unless the parent `/users/{userId}` document exists and its `status == 'active'`.
2. **PII & Balance Isolation**: `/users/{userId}` contains player phone and financial balances; `get` and `list` are strictly restricted to `isOwner(userId) || isAdmin()`. No blanket `isSignedIn()` reads are permitted.
3. **Privilege Escalation Prevention**: During `/users/{userId}` creation, a regular user can only set `role == 'player'` and `status == 'active'`, and initial `balance` must be `>= 0 && <= 500`. Only `isAdmin()` can assign or modify `role == 'admin'` or `status == 'banned'`.
4. **Terminal State Locking**: Once a transaction in `/users/{userId}/transactions/{transactionId}` reaches a terminal status (`'approved'`, `'rejected'`, or `'completed'`), non-admin users are strictly forbidden from updating it.
5. **Temporal Integrity & Immortality**: `createdAt` must equal `request.time` on creation and remain immutable (`incoming().createdAt == existing().createdAt`) on update; `updatedAt` must equal `request.time` on both create and update.
6. **Game Catalog Integrity**: `/games/{gameId}` can only be created, updated, or deleted by `isAdmin()`, and `authorId` must match `request.auth.uid` on creation and remain immutable on update.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Payload 1 (Self-Assigned Admin Role)**: Authenticated player attempts `create` on `/users/uid123` with `role: "admin"`. -> `PERMISSION_DENIED`.
2. **Payload 2 (Unverified Email Spoof)**: Attacker with `email: "sakibhasanu3@gmail.com"` but `email_verified: false` attempts admin write on `/games/jili-super-ace`. -> `PERMISSION_DENIED`.
3. **Payload 3 (Shadow Field Injection)**: Player attempts `update` on `/users/uid123` adding ghost field `isSuperVip: true`. -> `PERMISSION_DENIED`.
4. **Payload 4 (Cross-User PII & Balance Scrape)**: Authenticated `uid_attacker` attempts `get` on `/users/uid_victim`. -> `PERMISSION_DENIED`.
5. **Payload 5 (ID Poisoning / Resource Exhaustion)**: Attacker attempts `create` on `/games/{200_char_junk_id}`. -> `PERMISSION_DENIED`.
6. **Payload 6 (Client Timestamp Forgery)**: Player attempts `create` on `/users/uid123/transactions/tx1` with forged past `createdAt`. -> `PERMISSION_DENIED`.
7. **Payload 7 (Orphaned Subcollection Write)**: Player attempts `create` on `/users/non_existent_uid/transactions/tx1` where parent user doc does not exist. -> `PERMISSION_DENIED`.
8. **Payload 8 (Terminal State Mutation)**: Player attempts `update` on `/users/uid123/transactions/tx1` where `existing().status == 'completed'` to change `amount`. -> `PERMISSION_DENIED`.
9. **Payload 9 (Immortal Field Tampering)**: Player attempts `update` on `/users/uid123` modifying `uid` or `createdAt`. -> `PERMISSION_DENIED`.
10. **Payload 10 (Negative or Unbounded Balance Exploit)**: Player attempts `update` on `/users/uid123` setting `balance: -500` or `balance: 9999999999`. -> `PERMISSION_DENIED`.
11. **Payload 11 (Unauthorized Game Catalog Mutation)**: Non-admin player attempts `create` or `delete` on `/games/jili-super-ace`. -> `PERMISSION_DENIED`.
12. **Payload 12 (Banned User Transaction Write)**: Banned user (`parentUser.status == 'banned'`) attempts `create` on `/users/uid123/transactions/tx2`. -> `PERMISSION_DENIED`.
