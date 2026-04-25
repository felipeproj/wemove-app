import { useEffect, useState } from 'react'
import { useListStore } from './store/useListStore'
import { useAuthStore } from './store/useAuthStore'
import { WeMoveIcon } from './components/WeMoveIcon'
import { NavBar } from './components/NavBar'
import { BottomNav } from './components/BottomNav'
import { ListaPage } from './pages/ListaPage'
import { ResumoPage } from './pages/ResumoPage'
import { DashPage } from './pages/DashPage'
import { LandingPage } from './pages/LandingPage'
import { AdminPage } from './pages/AdminPage'
import { usePolling } from './hooks/usePolling'

export default function App() {
  const initList   = useListStore((s) => s.initList)
  const loading    = useListStore((s) => s.loading)
  const loadingMsg = useListStore((s) => s.loadingMessage)
  const error      = useListStore((s) => s.error)
  const tab        = useListStore((s) => s.tab)
  const needsSetup = useListStore((s) => s.needsSetup)
  const initAuth   = useAuthStore((s) => s.init)
  const role       = useAuthStore((s) => s.role)
  const [showAdmin, setShowAdmin] = useState(false)

  useEffect(() => { initList() }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const unsub = initAuth(); return unsub }, []) // eslint-disable-line react-hooks/exhaustive-deps
  usePolling()

  // ── Admin (overlay prioritário) ───────────────────────────────────────────
  if (showAdmin && role === 'admin') {
    return <AdminPage onBack={() => setShowAdmin(false)} />
  }

  // ── Landing (sem token na URL) ────────────────────────────────────────────
  if (needsSetup) return <LandingPage onOpenAdmin={role === 'admin' ? () => setShowAdmin(true) : undefined} />

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-bg px-6">
        <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center shadow-btn animate-pulse-slow">
          <WeMoveIcon size={30} />
        </div>
        <p className="font-display text-2xl font-bold gradient-text">WeMove</p>
        <p className="text-sm text-ink-3">{loadingMsg || 'Carregando...'}</p>
        <div className="mt-1 w-8 h-8 border-2 border-border-2 border-t-wm-blue rounded-full animate-spin" />
      </div>
    )
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
              stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="font-display text-xl font-semibold text-ink">Erro ao carregar lista</p>
        <p className="text-sm text-ink-2 max-w-xs">{error}</p>
        <button
          onClick={() => initList()}
          className="mt-2 px-6 py-3 rounded-xl text-sm font-semibold gradient-bg text-white shadow-btn hover:opacity-90 transition-all"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  // ── App ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <NavBar onOpenAdmin={role === 'admin' ? () => setShowAdmin(true) : undefined} />

      {/* pb-20 reserva espaço para o BottomNav no mobile */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 pb-24 md:pb-8">
        {tab === 'lista'  && <ListaPage />}
        {tab === 'resumo' && <ResumoPage />}
        {tab === 'dash'   && <DashPage />}
      </main>

      <BottomNav />
    </div>
  )
}
