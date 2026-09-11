'use client'

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { auth, googleProvider, isFirebaseConfigured } from './firebase'

interface AuthContextValue {
  user: User | null
  loading: boolean
  /** False until real Firebase keys are set in .env.local — see .env.local.example. */
  isConfigured: boolean
  signInWithGoogle: () => Promise<User>
  signInWithEmail: (email: string, password: string) => Promise<User>
  signUpWithEmail: (email: string, password: string) => Promise<User>
  signOut: () => Promise<void>
}

const NOT_CONFIGURED_MESSAGE =
  'Firebase is not configured yet. Add your project keys to .env.local (see .env.local.example) and restart the dev server.'

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const value: AuthContextValue = {
    user,
    loading,
    isConfigured: isFirebaseConfigured,
    signInWithGoogle: async () => {
      if (!auth) throw new Error(NOT_CONFIGURED_MESSAGE)
      const credential = await signInWithPopup(auth, googleProvider)
      return credential.user
    },
    signInWithEmail: async (email, password) => {
      if (!auth) throw new Error(NOT_CONFIGURED_MESSAGE)
      const credential = await signInWithEmailAndPassword(auth, email, password)
      return credential.user
    },
    signUpWithEmail: async (email, password) => {
      if (!auth) throw new Error(NOT_CONFIGURED_MESSAGE)
      const credential = await createUserWithEmailAndPassword(auth, email, password)
      return credential.user
    },
    signOut: () => (auth ? firebaseSignOut(auth) : Promise.resolve()),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

/** Maps Firebase Auth error codes to short, user-facing copy. */
export function getAuthErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : ''

  switch (code) {
    case 'auth/invalid-email':
      return 'That email address looks invalid.'
    case 'auth/user-disabled':
      return 'This account has been disabled.'
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.'
    case 'auth/email-already-in-use':
      return 'An account already exists with that email.'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.'
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was closed before finishing.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.'
    default:
      // Covers our own "not configured yet" Error, and anything unexpected.
      return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
  }
}
