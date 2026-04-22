/**
 * LandingPage — exibida quando não há ?lista=TOKEN na URL.
 *
 * Views:
 *  'home'       → apresentação do produto (só para usuários não logados)
 *  'access'     → campo para colar o código da lista existente
 *  'generate'   → formulário de nova mudança via IA
 *  'auth'       → login / cadastro
 *  'user-area'  → área do usuário logado (destino padrão quando logado)
 */

import { useState, useEffect } from 'react'
import { useListStore } from '../store/useListStore'
import { useAuthStore } from '../store/useAuthStore'
import { GeneratePage } from './GeneratePage'
import { AuthPage } from './AuthPage'
import { UserAreaPage } from './UserAreaPage'
import { LandingHeader } from '../components/LandingHeader'
import { WeMoveIcon } from '../components/WeMoveIcon'

type View = 'home' | 'access' | 'generate' | 'auth' | 'user-area'

// ── Ícone ─────────────────────────────────────────────────────────────────────

function IconSparkle() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"
        stroke="white" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  )
}

// ── Logo ──────────────────────────────────────────────────────────────────────

function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const iconSizes = { sm: 'w-10 h-10', md: 'w-14 h-14', lg: 'w-20 h-20' }
  const textSizes = { sm: 'text-xl', md: 'text-3xl', lg: 'text-4xl md:text-5xl' }
  const iconInner = { sm: 20, md: 26, lg: 34 }
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`${iconSizes[size]} rounded-2xl gradient-bg flex items-center justify-center shadow-btn`}>
        <WeMoveIcon size={iconInner[size]} />
      </div>
      <p className={`font-display font-bold gradient-text ${textSizes[size]}`}>WeMove</p>
    </div>
  )
}

// ── View: Home (apenas para não-logados) ──────────────────────────────────────

function HomeView({ onSelect }: { onSelect: (v: View) => void }) {
  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <div className="text-center mb-10 md:mb-14">
        <Logo size="lg" />
        <p className="mt-5 text-2xl md:text-3xl font-display font-bold text-ink leading-tight">
          Planeje sua mudança<br className="hidden sm:block" /> sem estresse
        </p>
        <p className="mt-3 text-sm md:text-base text-ink-2 max-w-md mx-auto leading-relaxed">
          Crie uma lista de compras personalizada com IA, acompanhe o progresso e compartilhe com quem vai morar com você.
        </p>
      </div>

      {/* Cards principais */}
      <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => onSelect('generate')}
          className="group relative flex flex-col items-start gap-4 p-6 rounded-2xl border-2 border-transparent gradient-bg shadow-btn hover:opacity-95 hover:scale-[1.02] transition-all text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <IconSparkle />
          </div>
          <div>
            <p className="text-white font-display font-bold text-lg">Iniciar nova mudança</p>
            <p className="text-white/80 text-sm mt-1 leading-relaxed">
              Conte sobre seu imóvel e a IA cria uma lista personalizada em segundos.
            </p>
          </div>
          <span className="mt-auto inline-flex items-center gap-1.5 text-white font-semibold text-sm">
            Começar agora
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
        </button>

        <button
          onClick={() => onSelect('access')}
          className="group flex flex-col items-start gap-4 p-6 rounded-2xl border-2 border-border bg-white shadow-card hover:border-wm-blue hover:shadow-btn transition-all text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-wm-blue/10 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="18" height="16" rx="2" stroke="#3B82F6" strokeWidth="1.8"/>
              <path d="M7 10h10M7 14h6" stroke="#3B82F6" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M8 2v4M16 2v4" stroke="#3B82F6" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p className="text-ink font-display font-bold text-lg">Já tenho uma lista</p>
            <p className="text-ink-2 text-sm mt-1 leading-relaxed">
              Acesse uma lista existente com o código compartilhado com você.
            </p>
          </div>
          <span className="mt-auto inline-flex items-center gap-1.5 text-wm-blue font-semibold text-sm group-hover:gap-2.5 transition-all">
            Inserir código
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
        </button>
      </div>

      {/* Card conta */}
      <div className="w-full max-w-2xl mt-4">
        <button
          onClick={() => onSelect('auth')}
          className="group w-full flex items-center justify-between gap-4 p-4 rounded-2xl border-2 border-border bg-white shadow-card hover:border-wm-blue hover:shadow-btn transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round"/>
                <circle cx="12" cy="7" r="4" stroke="#64748B" strokeWidth="1.8"/>
              </svg>
            </div>
            <div>
              <p className="text-ink font-semibold text-sm">Entrar / Criar conta</p>
              <p className="text-ink-3 text-xs mt-0.5">Salve suas listas e acesse de qualquer dispositivo</p>
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 text-ink-3 group-hover:text-wm-blue transition-colors">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Features */}
      <div className="w-full max-w-2xl mt-10 grid grid-cols-3 gap-4 text-center">
        {[
          { emoji: '🤖', label: 'Lista gerada por IA' },
          { emoji: '📱', label: 'Funciona offline (PWA)' },
          { emoji: '🔗', label: 'Compartilhe com facilidade' },
        ].map((f) => (
          <div key={f.label} className="flex flex-col items-center gap-2">
            <span className="text-2xl">{f.emoji}</span>
            <p className="text-xs text-ink-2 font-medium leading-snug">{f.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── View: Acessar lista ───────────────────────────────────────────────────────

function AccessView({ onBack }: { onBack: () => void }) {
  const setTokenAndInit = useListStore((s) => s.setTokenAndInit)
  const loading         = useListStore((s) => s.loading)

  const [token, setToken] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleAccess() {
    const t = token.trim()
    if (!t) { setError('Cole ou digite o código da lista.'); return }
    setError(null)
    try {
      await setTokenAndInit(t)
    } catch {
      setError('Código inválido ou lista não encontrada.')
    }
  }

  return (
    <div className="flex flex-col items-center pt-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-wm-blue/10 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className="font-display text-2xl font-bold text-ink">Acessar lista</h2>
          <p className="text-sm text-ink-2 mt-2">
            Cole o código que foi compartilhado com você.<br/>
            Ele fica na URL depois de{' '}
            <span className="font-mono text-ink bg-bg px-1 rounded">?lista=</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6 shadow-card space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-3 mb-2">
              Código da lista
            </label>
            <input
              type="text"
              placeholder="Cole o código aqui..."
              value={token}
              onChange={(e) => { setToken(e.target.value); setError(null) }}
              onKeyDown={(e) => e.key === 'Enter' && handleAccess()}
              autoFocus
              className="w-full px-4 py-3 border border-border rounded-xl text-sm text-ink bg-bg placeholder-ink-3 outline-none focus:border-wm-blue focus:ring-2 focus:ring-wm-blue/10 transition-all font-mono"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={handleAccess}
            disabled={loading || !token.trim()}
            className="w-full py-3.5 rounded-xl font-semibold text-sm gradient-bg text-white shadow-btn hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {loading ? 'Acessando...' : 'Acessar lista →'}
          </button>

          <button
            onClick={onBack}
            className="w-full py-3 rounded-xl text-sm font-semibold border border-border text-ink-2 hover:bg-bg transition-all"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── LandingPage ───────────────────────────────────────────────────────────────

export function LandingPage() {
  const consumePendingView = useListStore((s) => s.consumePendingView)
  const user               = useAuthStore((s) => s.user)
  const authLoading        = useAuthStore((s) => s.authLoading)

  const [view, setView] = useState<View>('home')

  // Redireciona quando auth termina de carregar
  useEffect(() => {
    if (authLoading) return
    const pending = consumePendingView()
    if (pending) { setView(pending); return }
    if (user) setView('user-area')   // logado → vai para sua área
  }, [authLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  // Segurança: quando usuário faz logout enquanto está em user-area → vai para home
  useEffect(() => {
    if (!authLoading && !user && view === 'user-area') {
      setView('home')
    }
  }, [user, authLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  // Enquanto auth carrega, mostra tela vazia com gradiente
  if (authLoading && view === 'home') {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-border border-t-wm-blue rounded-full animate-spin" />
      </div>
    )
  }

  // Views que usam o header padrão (sem a home, que tem layout próprio)
  const hasHeader = view !== 'home'

  return (
    <div className="min-h-screen bg-bg">
      {/* Gradiente decorativo no topo */}
      {!hasHeader && (
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-blue-50/60 to-transparent pointer-events-none" />
      )}

      {/* Header padrão para views pós-home */}
      {hasHeader && (
        <LandingHeader
          onHome={() => {
            // Se logado, "home" é a área do usuário
            if (user) setView('user-area')
            else setView('home')
          }}
          onUserArea={user && view !== 'user-area' ? () => setView('user-area') : undefined}
        />
      )}

      <div className={[
        'relative z-10 w-full max-w-3xl mx-auto px-4 pb-16',
        hasHeader ? 'pt-8' : 'pt-12 md:pt-20',
      ].join(' ')}>
        {view === 'home'      && <HomeView onSelect={setView} />}
        {view === 'access'    && <AccessView onBack={() => setView(user ? 'user-area' : 'home')} />}
        {view === 'generate'  && <GeneratePage onBack={() => setView(user ? 'user-area' : 'home')} />}
        {view === 'auth'      && (
          <AuthPage
            onBack={() => setView('home')}
            onSuccess={() => setView('user-area')}
          />
        )}
        {view === 'user-area' && (
          <UserAreaPage onCreateNew={() => setView('generate')} />
        )}
      </div>
    </div>
  )
}
