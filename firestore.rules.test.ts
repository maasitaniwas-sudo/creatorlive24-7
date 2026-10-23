/**
 * Firestore Security Rules Test Specification (Dirty Dozen Verification)
 */
export interface DirtyDozenTestCase {
  id: number;
  name: string;
  collectionPath: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  authUid: string | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

export const dirtyDozenTests: DirtyDozenTestCase[] = [
  {
    id: 1,
    name: 'Shadow Field Injection on UserProfile',
    collectionPath: '/users/user_1',
    operation: 'create',
    authUid: 'user_1',
    payload: {
      uid: 'user_1',
      email: 'user1@example.com',
      name: 'User One',
      avatar: 'https://example.com/a.png',
      emailNotif: true,
      streamAlerts: true,
      isAdmin: true
    },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 2,
    name: 'Identity Spoofing on UserProfile',
    collectionPath: '/users/user_2',
    operation: 'create',
    authUid: 'user_1',
    payload: {
      uid: 'user_2',
      email: 'user2@example.com',
      name: 'User Two',
      avatar: 'https://example.com/a.png',
      emailNotif: true,
      streamAlerts: true
    },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 3,
    name: 'Cross-User PII Read Attempt',
    collectionPath: '/users/user_1',
    operation: 'get',
    authUid: 'user_2',
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 4,
    name: 'Orphaned Subcollection Write Without Parent User Doc',
    collectionPath: '/users/nonexistent_user/streams/stream_1',
    operation: 'create',
    authUid: 'nonexistent_user',
    payload: { id: 'stream_1', userId: 'nonexistent_user' },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 5,
    name: 'ID Poisoning Attack',
    collectionPath: '/users/user_1/streams/bad$id!',
    operation: 'create',
    authUid: 'user_1',
    payload: { id: 'bad$id!', userId: 'user_1' },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 6,
    name: 'Oversized String Denial of Wallet',
    collectionPath: '/users/user_1/streams/stream_1',
    operation: 'update',
    authUid: 'user_1',
    payload: { streamName: 'A'.repeat(500) },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 7,
    name: 'Type Poisoning in Update',
    collectionPath: '/users/user_1/streams/stream_1',
    operation: 'update',
    authUid: 'user_1',
    payload: { isLive: 'true_string_instead_of_boolean' },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 8,
    name: 'Immutable Field Tampering on UserProfile',
    collectionPath: '/users/user_1',
    operation: 'update',
    authUid: 'user_1',
    payload: { email: 'spoofed@example.com' },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 9,
    name: 'Spoofed Client Timestamp on Create',
    collectionPath: '/users/user_1',
    operation: 'create',
    authUid: 'user_1',
    payload: { createdAt: '2020-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 10,
    name: 'Unbounded Array Injection on PlaylistConfig',
    collectionPath: '/users/user_1/playlists/default',
    operation: 'update',
    authUid: 'user_1',
    payload: { selectedVideoIds: new Array(100).fill('vid_1') },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 11,
    name: 'Cross-Tenant List Scraping',
    collectionPath: '/users/user_1/streams',
    operation: 'list',
    authUid: 'user_2',
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 12,
    name: 'Terminal History Record Mutation',
    collectionPath: '/users/user_1/history/hist_1',
    operation: 'update',
    authUid: 'user_1',
    payload: { status: 'Completed', duration: '999h' },
    expectedResult: 'PERMISSION_DENIED'
  }
];
