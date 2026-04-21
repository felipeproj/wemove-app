import { useState } from 'react'
import { useListStore } from '../store/useListStore'
import { ShareModal } from './modals/ShareModal'
import type { TabType } from '../types'

const TABS: { id: TabType; label: string }[] = [
  { id: 'lista',  label: 'Lista' },
  { id: 'resumo', label: 'Ambientes' },
  { id: 'dash',   label: 'Dashboard' },
]

export function NavBar() {
  const tab        = useListStore((s) => s.tab)
  const setTab     = useListStore((s) => s.setTab)
  const permission = useListStore((s) => s.permission)
  const loading    = useListStore((s) => s.loading)
  const loadingMsg = useListStore((s) => s.loadingMessage)
  const [showShare, setShowShare] = useState(false)

  const badgeContent = loading
    ? loadingMsg || '⏳ carregando...'
    : permission === 'edit'
    ? '● ao vivo'
    : '👁 visualização'

  return (
    <>
      <nav className="sticky top-0 z-50 flex items-center justify-between gap-4 border-b border-border bg-bg/90 px-5 md:px-7 backdrop-blur-xl h-[58px]">
        {/* Brand */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 14L9 4L14 14M6 11H12" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <div className="font-display text-lg font-bold gradient-text">WeMove</div>
            <div className="text-[11px] text-white/40">Família Novais</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 bg-card border border-border rounded-[10px] p-[3px]">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={[
                'px-3 md:px-4 py-1.5 rounded-[7px] text-[12px] md:text-[13px] font-medium transition-all',
                tab === t.id
                  ? 'bg-card-3 text-white shadow-sm'
                  : 'text-white/50 hover:text-white',
              ].join(' ')}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Direita: botão compartilhar + badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {permission === 'edit' && !loading && (
            <button
              onClick={() => setShowShare(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border border-border-2 text-white/60 hover:text-white hover:border-white/30 transition-all"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="hidden sm:inline">Compartilhar</span>
            </button>
          )}

          <span className={[
            'text-[11px] px-2.5 py-1 rounded-full font-medium border whitespace-nowrap',
            loading
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/20 animate-pulse-slow'
              : permission === 'edit'
              ? 'bg-wm-green/10 text-wm-green border-wm-green/20'
              : 'bg-wm-blue/10 text-wm-blue2 border-wm-blue/20',
          ].join(' ')}>
            {badgeContent}
          </span>
        </div>
      </nav>

      {showShare && <ShareModal onClose={() => setShowShare(false)} />}
    </>
  )
}
