import { useState, useEffect } from 'react'
import { listApi } from '../../services/api'
import { useListStore } from '../../store/useListStore'
import type { ShareLinks } from '../../types'

interface Props {
  onClose: () => void
}

export function ShareModal({ onClose }: Props) {
  const token = useListStore((s) => s.token)
  const [links, setLinks]   = useState<ShareLinks | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)
  const [copied, setCopied] = useState<'edit' | 'view' | null>(null)

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
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card border border-border-2 rounded-[14px] p-7 w-full max-w-md">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-display text-xl font-semibold">Compartilhar lista</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-all text-xl leading-none">×</button>
        </div>

        {loading && (
          <p className="text-[13px] text-white/50 py-4 text-center">Gerando links...</p>
        )}

        {error && (
          <p className="text-[13px] text-red-400 py-4 text-center">{error}</p>
        )}

        {links && (
          <div className="flex flex-col gap-4">
            {/* Link de edição */}
            <div className="bg-bg-3 border border-border rounded-[10px] p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-wm-green" />
                <span className="text-[12px] font-semibold text-white/60 uppercase tracking-wider">Link de edição</span>
              </div>
              <p className="text-[11px] text-white/40 mb-3">Quem tiver este link pode editar a lista (você e sua esposa)</p>
              <div className="flex gap-2 items-center">
                <input
                  readOnly
                  value={links.edit_link}
                  className="flex-1 text-[11px] bg-card border border-border rounded-lg px-3 py-2 text-white/60 outline-none truncate"
                />
                <button
                  onClick={() => copy(links.edit_link, 'edit')}
                  className={`px-3 py-2 rounded-lg text-[12px] font-medium transition-all whitespace-nowrap ${
                    copied === 'edit'
                      ? 'bg-wm-green/20 text-wm-green border border-wm-green/30'
                      : 'gradient-bg text-white hover:opacity-90'
                  }`}
                >
                  {copied === 'edit' ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            {/* Link de visualização */}
            <div className="bg-bg-3 border border-border rounded-[10px] p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-wm-blue2" />
                <span className="text-[12px] font-semibold text-white/60 uppercase tracking-wider">Link somente leitura</span>
              </div>
              <p className="text-[11px] text-white/40 mb-3">Para compartilhar com familiares ou amigos que só precisam visualizar</p>
              <div className="flex gap-2 items-center">
                <input
                  readOnly
                  value={links.view_link}
                  className="flex-1 text-[11px] bg-card border border-border rounded-lg px-3 py-2 text-white/60 outline-none truncate"
                />
                <button
                  onClick={() => copy(links.view_link, 'view')}
                  className={`px-3 py-2 rounded-lg text-[12px] font-medium transition-all whitespace-nowrap ${
                    copied === 'view'
                      ? 'bg-wm-green/20 text-wm-green border border-wm-green/30'
                      : 'bg-card-3 border border-border-2 text-white hover:bg-card-2'
                  }`}
                >
                  {copied === 'view' ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-white/30 text-center">
              Guarde o link de edição em lugar seguro — ele dá acesso total à lista.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
