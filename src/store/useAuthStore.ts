import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthStore {
  user: User | null
  authLoading: boolean

  init: () => () => void   // retorna unsubscribe
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  authLoading: true,

  /** Inicializa listener de sessão — deve ser chamado uma vez no App */
  init: () => {
    // Verifica sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ user: session?.user ?? null, authLoading: false })
    })

    // Escuta mudanças de auth (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null, authLoading: false })
    })

    return () => subscription.unsubscribe()
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
    set({ user: null })
    // Importação dinâmica para evitar dependência circular entre stores.
    // Reseta o estado da lista e força retorno à LandingPage.
    const { useListStore } = await import('./useListStore')
    useListStore.getState().goToLanding()
  },
}))
