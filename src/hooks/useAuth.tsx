import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword, signOut as fbSignOut, onAuthStateChanged,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from '@/lib/firebase'
import type { AppUser } from '@/types'

interface AuthContextValue {
  user: AppUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const DEMO_SESSION_KEY = 'law-portal:demo-session'
// Демо-учётка старосты, работает только когда Firebase не настроен.
// Смените на свою логику после подключения Firebase Authentication.
const DEMO_ADMIN = { email: 'starosta@25b09u.law.spbu.ru', password: 'starosta9' }

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsub = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          setUser({
            uid: fbUser.uid,
            email: fbUser.email ?? '',
            displayName: fbUser.displayName ?? 'Староста',
            role: 'admin',
          })
        } else {
          setUser(null)
        }
        setLoading(false)
      })
      return unsub
    }
    // Демо-режим: проверяем сохранённую сессию в localStorage.
    const saved = localStorage.getItem(DEMO_SESSION_KEY)
    if (saved) setUser(JSON.parse(saved))
    setLoading(false)
  }, [])

  async function signIn(email: string, password: string) {
    if (isFirebaseConfigured && auth) {
      await signInWithEmailAndPassword(auth, email, password)
      return
    }
    if (email === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
      const demoUser: AppUser = { uid: 'demo-admin', email, displayName: 'Староста группы', role: 'admin' }
      localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoUser))
      setUser(demoUser)
      return
    }
    throw new Error('Неверный email или пароль')
  }

  async function signOut() {
    if (isFirebaseConfigured && auth) {
      await fbSignOut(auth)
      return
    }
    localStorage.removeItem(DEMO_SESSION_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth должен использоваться внутри AuthProvider')
  return ctx
}
