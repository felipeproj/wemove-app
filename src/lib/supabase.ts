import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseKey) {
  throw new Error('VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Token cacheado em memória para evitar getSession() em cada request de API.
// Atualizado pelo listener onAuthStateChange — jamais fica desatualizado.
let _cachedAccessToken: string | null = null

supabase.auth.onAuthStateChange((_, session) => {
  _cachedAccessToken = session?.access_token ?? null
})

/** Retorna o access_token da sessão atual, ou null */
export async function getAccessToken(): Promise<string | null> {
  if (_cachedAccessToken) return _cachedAccessToken

  // Primeira chamada antes do listener disparar: tenta getSession() com timeout
  try {
    const result = await Promise.race([
      supabase.auth.getSession(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('getSession timeout')), 3000),
      ),
    ])
    _cachedAccessToken = result.data.session?.access_token ?? null
    return _cachedAccessToken
  } catch {
    return null
  }
}
