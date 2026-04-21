/**
 * BottomNav — navegação inferior para mobile.
 * Visível apenas em telas pequenas (md:hidden).
 * No desktop os tabs ficam na NavBar.
 */

import { useListStore } from '../store/useListStore'
import type { TabType } from '../types'

const TABS: { id: TabType; label: string; icon: string }[] = [
  {
    id: 'lista',
    label: 'Lista',
    icon: `<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  },
  {
    id: 'resumo',
    label: 'Ambientes',
    icon: `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/><polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  },
  {
    id: 'dash',
    label: 'Dashboard',
    icon: `<rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.8" fill="none"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.8" fill="none"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.8" fill="none"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.8" fill="none"/>`,
  },
]

export function BottomNav() {
  const tab       = useListStore((s) => s.tab)
  const setTab    = useListStore((s) => s.setTab)
  const modalOpen = useListStore((s) => s.modalOpen)

  if (modalOpen) return null

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border card-shadow">
      <div className="flex">
        {TABS.map((t) => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={[
                'flex-1 flex flex-col items-center gap-1 py-3 transition-all',
                active ? 'text-wm-blue' : 'text-ink-3',
              ].join(' ')}
            >
              <svg width="22" height="22" viewBox="0 0 24 24"
                dangerouslySetInnerHTML={{ __html: t.icon }}
              />
              <span className={`text-[10px] font-semibold ${active ? 'text-wm-blue' : 'text-ink-3'}`}>
                {t.label}
              </span>
              {active && (
                <span className="absolute bottom-0 h-[2px] w-8 rounded-t-full bg-wm-blue" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
