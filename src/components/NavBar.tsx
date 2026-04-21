import { useState } from 'react'
import { useListStore } from '../store/useListStore'
import { ShareModal } from './modals/ShareModal'
import { WeMoveIcon } from './WeMoveIcon'
import type { TabType } from '../types'

const TABS: { id: TabType; label: string }[] = [
  { id: 'lista',  label: 'Lista' },
  { id: 'resumo', label: 'Ambientes' },
  { id: 'dash',   label: 'Dashboard' },
]

export function NavBar() {
  const tab         = useListStore((s) => s.tab)
  const setTab      = useListStore((s) => s.setTab)
  const permission  = useListStore((s) => s.permission)
  const loading     = useListStore((s) => s.loading)
  const loadingMsg  = useListStore((s) => s.loadingMessage)
  const goToLanding = useListStore((s) => s.goToLanding)
  const [showShare, setShowShare] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-border card-shadow">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-3">

          {/* Brand — clicável, volta para a LandingPage */}
          <button
            onClick={goToLanding}
            className="flex items-center gap-2.5 flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center shadow-btn">
              <WeMoveIcon size={16} />
            </div>
            <span className="font-display text-base font-bold gradient-text">WeMove</span>
          </button>

          {/* Tabs — só no desktop */}
          <nav className="hidden md:flex gap-0.5 bg-bg-2 border border-border rounded-xl p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={[
                  'px-4 py-1.5 rounded-[9px] text-[13px] font-semibold transition-all',
                  tab === t.id
                    ? 'bg-white text-wm-blue shadow-card'
                    : 'text-ink-3 hover:text-ink',
                ].join(' ')}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {/* Direita */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {permission === 'edit' && !loading && (
              <button
                onClick={() => setShowShare(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border border-border-2 text-ink-2 hover:border-wm-blue hover:text-wm-blue transition-all"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="hidden sm:inline">Compartilhar</span>
              </button>
            )}

            <span className={[
              'text-[11px] px-2.5 py-1 rounded-full font-semibold border whitespace-nowrap',
              loading
                ? 'bg-amber-50 text-amber-600 border-amber-200 animate-pulse-slow'
                : permission === 'edit'
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                : 'bg-blue-50 text-wm-blue border-blue-200',
            ].join(' ')}>
              {loading ? (loadingMsg || 'Carregando...') : permission === 'edit' ? '● ao vivo' : '👁 visualização'}
            </span>
          </div>
        </div>
      </header>

      {showShare && <ShareModal onClose={() => setShowShare(false)} />}
    </>
  )
}
