/**
 * LandingHeader — header sticky usado nas views pós-home da LandingPage
 * (auth, user-area, generate).
 *
 * Mantém o mesmo padrão visual do NavBar da tela de lista.
 */

import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { WeMoveIcon } from './WeMoveIcon'

interface Props {
  onHome: () => void
  onUserArea?: () => void  // navega para minhas listas (se não estiver lá)
}

export function LandingHeader({ onHome, onUserArea }: Props) {
  const user    = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)

  const [dropOpen, setDropOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border card-shadow">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-3">

        {/* Brand */}
        <button
          onClick={onHome}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center shadow-btn">
            <WeMoveIcon size={16} />
          </div>
          <span className="font-display text-base font-bold gradient-text">WeMove</span>
        </button>

        {/* Usuário */}
        {user && (
          <div ref={ref} className="relative">
            <button
              onClick={() => setDropOpen((v) => !v)}
              className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center text-white text-sm font-bold shadow-btn hover:opacity-90 transition-opacity"
              title={user.email ?? ''}
            >
              {(user.email ?? '?')[0].toUpperCase()}
            </button>

            {dropOpen && (
              <div className="absolute right-0 top-10 w-52 bg-white border border-border rounded-2xl shadow-card py-1 z-50">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-xs font-semibold text-ink truncate">{user.email}</p>
                </div>
                {onUserArea && (
                  <button
                    onClick={() => { setDropOpen(false); onUserArea() }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-bg transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                      <path d="M7 10h10M7 14h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    Minhas listas
                  </button>
                )}
                <button
                  onClick={async () => { setDropOpen(false); await signOut() }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Sair da conta
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
