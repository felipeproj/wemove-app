/**
 * App.tsx — componente raiz do WeMove.
 *
 * - Inicializa a lista na montagem (lê token da URL ou cria nova)
 * - Renderiza NavBar + a página ativa (baseada no tab do Zustand)
 * - Loading/Error screens bloqueiam a UI até a lista estar pronta
 */

import { useEffect } from 'react'
import { useListStore } from './store/useListStore'
import { NavBar } from './components/NavBar'
import { ListaPage } from './pages/ListaPage'
import { ResumoPage } from './pages/ResumoPage'
import { DashPage } from './pages/DashPage'
import { usePolling } from './hooks/usePolling'

export default function App() {
  const initList     = useListStore((s) => s.initList)
  const loading      = useListStore((s) => s.loading)
  const loadingMsg   = useListStore((s) => s.loadingMessage)
  const error        = useListStore((s) => s.error)
  const tab          = useListStore((s) => s.tab)

  useEffect(() => {
    initList()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  usePolling()

  // ── Loading screen ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-bg">
        {/* Logo */}
        <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mb-2 animate-pulse-slow">
          <svg width="28" height="28" viewBox="0 0 18 18" fill="none">
            <path d="M4 14L9 4L14 14M6 11H12" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
        <p className="font-display text-2xl font-bold gradient-text">WeMove</p>
        <p className="text-[13px] text-white/50">{loadingMsg || '⏳ carregando...'}</p>

        {/* Spinner */}
        <div className="mt-2 w-8 h-8 border-2 border-white/10 border-t-wm-blue rounded-full animate-spin" />
      </div>
    )
  }

  // ── Error screen ─────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-2">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
              stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="font-display text-xl font-semibold text-white">Erro ao carregar lista</p>
        <p className="text-[13px] text-white/50 max-w-xs">{error}</p>
        <button
          onClick={() => initList()}
          className="mt-3 px-5 py-2.5 rounded-lg text-[13px] font-medium gradient-bg text-white hover:opacity-90 transition-all"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  // ── Main app ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <NavBar />

      <main className="flex-1 w-full max-w-5xl mx-auto px-5 py-7">
        {tab === 'lista'  && <ListaPage />}
        {tab === 'resumo' && <ResumoPage />}
        {tab === 'dash'   && <DashPage />}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-[11px] text-white/20 border-t border-border">
        WeMove · Planejamento de mudança
      </footer>
    </div>
  )
}
