# Security Specification — CreatorLive24/7 Firestore Rules

## 1. Data Invariants
1. **Master Gate & Ownership**: All subcollections (`/users/{userId}/streams/{streamId}`, `/users/{userId}/videos/{videoId}`, `/users/{userId}/upcoming/{upcomingId}`, `/users/{userId}/history/{historyId}`, `/users/{userId}/playlists/{playlistId}`) belong strictly to the user identified by `{userId}`, and require the parent `/users/{userId}` document to exist (`exists(/databases/$(database)/documents/users/$(userId))`) and `request.auth.uid == userId`.
2. **PII Isolation**: User profile documents at `/users/{userId}` contain `email` and `name`. Read and write access is strictly restricted to the document owner (`request.auth.uid == userId`). Blanket `isSignedIn()` reads are forbidden.
3. **Strict Keys & Anti-Update-Gap**: Every create and update operation passes through `isValid[Entity](incoming())`, enforcing exact key allowlists (`hasAll` and `hasOnly`), field types, maxLengths, regex patterns, and identity integrity (`uid == request.auth.uid` / `userId == request.auth.uid`).
4. **Temporal Integrity**: `createdAt == request.time` on creation; `createdAt == existing().createdAt` and `updatedAt == request.time` on update.
5. **Terminal State Locking**: `StreamHistoryRecord` documents have terminal statuses (`Completed`, `Interrupted`, `Failed`) and are immutable once created.

## 2. The "Dirty Dozen" Payloads
1. **Payload 1 (Shadow Field Injection on UserProfile)**: `{ uid: "user1", email: "a@b.com", name: "Alice", avatar: "https://x.com/a.png", emailNotif: true, streamAlerts: true, isAdmin: true, createdAt: SERVER_TIME, updatedAt: SERVER_TIME }` -> Rejected by `hasOnly`.
2. **Payload 2 (Identity Spoofing on UserProfile)**: Authenticated as `user1`, creating `/users/user2` or setting `uid: "user2"` -> Rejected by `isOwner(userId)` and `data.uid == request.auth.uid`.
3. **Payload 3 (Unauthenticated Read of PII)**: Unauthenticated or `user2` reading `/users/user1` -> Rejected by `isOwner(userId)`.
4. **Payload 4 (Orphaned Subcollection Write)**: Authenticated as `user1`, writing `/users/user1/streams/stream_1` when `/users/user1` does not exist -> Rejected by Master Gate `userExists(userId)`.
5. **Payload 5 (ID Poisoning Attack)**: Creating `/users/user1/streams/invalid$id!@#` -> Rejected by `isValidId(streamId)`.
6. **Payload 6 (Denial of Wallet / Oversized String)**: Updating `streamName` with a 5,000-character string -> Rejected by `data.streamName.size() <= 120`.
7. **Payload 7 (Update-Gap / Type Poisoning)**: Updating `StreamConfig.isLive` to `"yes"` (string instead of bool) -> Rejected by `isValidStreamConfig(incoming())`.
8. **Payload 8 (Immutable Field Tampering)**: Updating `UserProfile.createdAt` or `UserProfile.email` to a new value -> Rejected by `incoming().createdAt == existing().createdAt && incoming().email == existing().email`.
9. **Payload 9 (Fake Client Timestamp)**: Creating `UserProfile` with `createdAt: timestamp.date(2020, 1, 1)` -> Rejected by `incoming().createdAt == request.time`.
10. **Payload 10 (Unbounded Array Injection)**: Writing 500 items to `PlaylistConfig.selectedVideoIds` -> Rejected by `data.selectedVideoIds.size() <= 50`.
11. **Payload 11 (Cross-Tenant List Scraping)**: `user2` listing `/users/user1/streams` -> Rejected by `isOwner(userId) && resource.data.userId == request.auth.uid`.
12. **Payload 12 (Terminal History Mutation)**: Attempting to update an existing `/users/user1/history/hist_1` record -> Rejected because `allow update: if false;` on terminal history records.
