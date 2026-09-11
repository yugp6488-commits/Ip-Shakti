import { getApps, initializeApp, type FirebaseOptions } from 'firebase/app'
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth'

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

/** True once the six NEXT_PUBLIC_FIREBASE_* env vars are actually set. */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
)

// `getAuth()` throws synchronously (auth/invalid-api-key) if the config is
// incomplete, and this module is imported from the root layout — so without
// this guard, forgetting to set up .env.local would crash every page, not
// just the login page. We only construct the real Auth instance once the
// config looks valid; otherwise `auth` stays null and callers fall back to a
// clear runtime error instead of a build/render crash.
export let auth: Auth | null = null

if (isFirebaseConfigured) {
  const firebaseApp = getApps()[0] ?? initializeApp(firebaseConfig)
  auth = getAuth(firebaseApp)
} else if (typeof window !== 'undefined') {
  console.warn(
    '[firebase] NEXT_PUBLIC_FIREBASE_* env vars are missing — sign-in is disabled until .env.local is set. See .env.local.example.',
  )
}

export const googleProvider = new GoogleAuthProvider()
