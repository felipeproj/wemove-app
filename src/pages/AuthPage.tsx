/**
 * AuthPage — login e cadastro com email/senha e Google OAuth.
 */

import { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { WeMoveIcon } from '../components/WeMoveIcon'

interface Props {
  onBack: () => void
  onSuccess?: () => void
}

type Mode = 'login' | 'register'

const inputCls = 'w-full px-4 py-3 border border-border rounded-xl text-sm text-ink bg-bg placeholder-ink-3 outline-none focus:border-wm-blue focus:ring-2 focus:ring-wm-blue/10 transition-all'

export function AuthPage({ onBack, onSuccess }: Props) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuthStore()

  const [mode,     setMode]     = useState<Mode>('login')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [success,  setSuccess]  = useState<string | null>(null)

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) {
      setError('Preencha e-mail e senha.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        await signInWithEmail(email.trim(), password)
      } else {
        await signUpWithEmail(email.trim(), password)
        setSuccess('Conta criada! Verifique seu e-mail para confirmar o cadastro.')
        return
      }
      onSuccess?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao autenticar')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError(null)
    setLoading(true)
    try {
      await signInWithGoogle()
      // O redirect acontece automaticamente — onAuthStateChange no App vai capturar
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao autenticar com Google')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      {/* Back */}
      <button
        onClick={onBack}
        className="self-start flex items-center gap-2 text-sm text-ink-2 hover:text-ink transition-colors mb-8"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        Voltar
      </button>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center shadow-btn mx-auto mb-4">
            <WeMoveIcon size={26} />
          </div>
          <h2 className="font-display text-2xl font-bold text-ink">
            {mode === 'login' ? 'Entrar na conta' : 'Criar conta'}
          </h2>
          <p className="text-sm text-ink-2 mt-1">
            {mode === 'login'
              ? 'Acesse suas listas salvas'
              : 'Salve e gerencie todas as suas listas'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6 shadow-card space-y-4">

          {/* Tabs */}
          <div className="flex gap-1 bg-bg rounded-xl p-1">
            {(['login', 'register'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); setSuccess(null) }}
                className={[
                  'flex-1 py-2 rounded-[9px] text-sm font-semibold transition-all',
                  mode === m ? 'bg-white text-wm-blue shadow-card' : 'text-ink-3 hover:text-ink',
                ].join(' ')}
              >
                {m === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-border bg-white hover:bg-bg text-sm font-semibold text-ink transition-all disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuar com Google
          </button>

          <div className="flex items-center gap-3 text-xs text-ink-3">
            <div className="flex-1 h-px bg-border" />
            ou com e-mail
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* E-mail */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-3 mb-2">E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              autoFocus
            />
          </div>

          {/* Senha */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-3 mb-2">Senha</label>
            <input
              type="password"
              placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className={inputCls}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700">
              ✓ {success}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-semibold text-sm gradient-bg text-white shadow-btn hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar →' : 'Criar conta →'}
          </button>
        </div>
      </div>
    </div>
  )
}
