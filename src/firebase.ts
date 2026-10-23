import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signOut, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, setLogLevel } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Suppress noisy internal @firebase/firestore console errors when token service or network is unavailable
try {
  setLogLevel('silent');
} catch {
  // ignore
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const YOUTUBE_LIVE_SCOPES = [
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/youtube.readonly'
];

export const youtubeOAuthProvider = new GoogleAuthProvider();
YOUTUBE_LIVE_SCOPES.forEach(scope => youtubeOAuthProvider.addScope(scope));
youtubeOAuthProvider.setCustomParameters({
  prompt: 'consent select_account',
  access_type: 'offline',
  include_granted_scopes: 'true'
});

export { GoogleAuthProvider };

/**
 * Verifies that the current Firebase user can retrieve a valid ID token.
 * If the project's Secure Token API (securetoken.googleapis.com) is disabled or the cached token is invalid,
 * signs out the stale Firebase session so Firestore does not repeatedly fail with token fetch errors.
 */
export async function ensureValidFirebaseAuthUser(fbUser: FirebaseUser | null): Promise<boolean> {
  if (!fbUser) return false;
  try {
    await fbUser.getIdToken();
    return true;
  } catch (err: any) {
    const msg = String(err?.message || err?.code || err || '');
    if (
      msg.includes('token-service-api') ||
      msg.includes('securetoken') ||
      msg.includes('Fetching auth token failed') ||
      msg.includes('auth/')
    ) {
      try {
        await signOut(auth);
      } catch {
        // ignore signOut error
      }
      return false;
    }
    return false;
  }
}

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
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore operation fallback:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await auth.authStateReady();
    if (auth.currentUser) {
      const valid = await ensureValidFirebaseAuthUser(auth.currentUser);
      if (!valid) return;
    }
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch {
    // Gracefully operate in hybrid/offline fallback mode without noisy console errors
  }
}

testConnection();
