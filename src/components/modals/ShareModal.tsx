import { useState, useEffect } from 'react'
import { listApi } from '../../services/api'
import { useListStore } from '../../store/useListStore'
import type { ShareLinks } from '../../types'

interface Props {
  onClose: () => void
}

export function ShareModal({ onClose }: Props) {
  const token = useListStore((s) => s.token)
  const [links,   setLinks]   = useState<ShareLinks | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [copied,  setCopied]  = useState<'edit' | 'view' | null>(null)

  useEffect(() => {
    if (!token) return
    listApi.share(token)
      .then(setLinks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [token])

  async function copy(text: string, type: 'edit' | 'view') {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-ink/30 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-modal animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-ink">Compartilhar lista</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-ink-3 hover:bg-bg-2 transition-all">
            <svg width="12" height="12" viewBox="0 0 11 11" fill="none">
              <path d="M1.5 1.5L9.5 9.5M9.5 1.5L1.5 9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {loading && <p className="text-sm text-ink-3 py-4 text-center">Gerando links...</p>}
        {error   && <p className="text-sm text-red-600 py-4 text-center">{error}</p>}

        {links && (
          <div className="space-y-4">
            {/* Edição */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-wm-green" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Link de edição</span>
              </div>
              <p className="text-xs text-ink-2 mb-3">Quem tiver este link pode editar a lista</p>
              <div className="flex gap-2">
                <input readOnly value={links.edit_link}
                  className="flex-1 text-xs bg-white border border-emerald-200 rounded-lg px-3 py-2 text-ink-2 outline-none truncate" />
                <button
                  onClick={() => copy(links.edit_link, 'edit')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    copied === 'edit'
                      ? 'bg-emerald-500 text-white'
                      : 'gradient-bg text-white shadow-btn hover:opacity-90'
                  }`}
                >
                  {copied === 'edit' ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            {/* Visualização */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-wm-blue" />
                <span className="text-xs font-bold uppercase tracking-wider text-wm-blue">Somente leitura</span>
              </div>
              <p className="text-xs text-ink-2 mb-3">Para familiares que só precisam visualizar</p>
              <div className="flex gap-2">
                <input readOnly value={links.view_link}
                  className="flex-1 text-xs bg-white border border-blue-200 rounded-lg px-3 py-2 text-ink-2 outline-none truncate" />
                <button
                  onClick={() => copy(links.view_link, 'view')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    copied === 'view'
                      ? 'bg-wm-blue text-white'
                      : 'bg-white border border-blue-200 text-wm-blue hover:bg-blue-50'
                  }`}
                >
                  {copied === 'view' ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            <p className="text-xs text-ink-3 text-center">
              Guarde o link de edição em lugar seguro — ele dá acesso total à lista.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
