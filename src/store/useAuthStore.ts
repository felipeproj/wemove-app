import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export type UserRole = 'user' | 'admin'
export type UserPlan = 'free' | 'essencial' | 'familia' | 'pro'

interface AuthStore {
  user:        User | null
  role:        UserRole
  plan:        UserPlan
  authLoading: boolean

  init:             () => () => void   // retorna unsubscribe
  fetchRole:        () => Promise<void>
  signInWithEmail:  (email: string, password: string) => Promise<void>
  signUpWithEmail:  (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut:          () => Promise<void>
}

const BASE_URL = import.meta.env.VITE_API_URL as string

async function loadRole(_userId: string): Promise<{ role: UserRole; plan: UserPlan }> {
  try {
    const { data } = await supabase.auth.getSession()
    const session = data?.session
    if (!session?.access_token) return { role: 'user', plan: 'free' }

    const res = await fetch(`${BASE_URL}/me/role`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    if (!res.ok) return { role: 'user', plan: 'free' }
    return await res.json() as { role: UserRole; plan: UserPlan }
  } catch {
    return { role: 'user', plan: 'free' }
  }
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user:        null,
  role:        'user',
  plan:        'free',
  authLoading: true,

  /** Inicializa listener de sessão — deve ser chamado uma vez no App */
  init: () => {
    // Verifica sessão existente
    supabase.auth.getSession().then(async (result) => {
      const session = result.data?.session
      const user = session?.user ?? null
      if (user) {
        const { role, plan } = await loadRole(user.id)
        set({ user, role, plan, authLoading: false })
      } else {
        set({ user: null, role: 'user', plan: 'free', authLoading: false })
      }
    })

    // Escuta mudanças de auth (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      const user = session?.user ?? null
      if (user) {
        const { role, plan } = await loadRole(user.id)
        set({ user, role, plan, authLoading: false })
      } else {
        set({ user: null, role: 'user', plan: 'free', authLoading: false })
      }
    })

    return () => subscription.unsubscribe()
  },

  /** Recarrega role/plan manualmente (ex: após promoção) */
  fetchRole: async () => {
    const { user } = get()
    if (!user) return
    const { role, plan } = await loadRole(user.id)
    set({ role, plan })
  },

  signInWithEmail: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
  },

  signUpWithEmail: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw new Error(error.message)
  },

  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) throw new Error(error.message)
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, role: 'user', plan: 'free' })
    // Importação dinâmica para evitar dependência circular entre stores.
    // Reseta o estado da lista e força retorno à LandingPage.
    const { useListStore } = await import('./useListStore')
    useListStore.getState().goToLanding()
  },
}))
