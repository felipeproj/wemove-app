import { useState, useEffect } from 'react'
import type { Item } from '../../types'
import { fmt } from '../../utils/fmt'
import { useListStore } from '../../store/useListStore'

interface Props {
  item: Item
  onClose: () => void
  onSuccess: (msg: string) => void
  onError: (msg: string) => void
}

export function CompraModal({ item, onClose, onSuccess, onError }: Props) {
  const markBought   = useListStore((s) => s.markBought)
  const setModalOpen = useListStore((s) => s.setModalOpen)
  const [valor,  setValor]  = useState('')
  const [loja,   setLoja]   = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setModalOpen(true)
    return () => setModalOpen(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleConfirm() {
    const v = parseFloat(valor)
    if (!v || v <= 0) { alert('Informe o valor total pago.'); return }
    setSaving(true)
    try {
      await markBought(item.id, v, loja.trim())
      onSuccess(`"${item.nome}" registrado por ${fmt(v)}`)
      onClose()
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Erro ao registrar compra')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-ink/30 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-modal animate-fade-in">
        <h2 className="font-display text-xl font-bold text-ink mb-5">Registrar compra</h2>

        {/* Item info */}
        <div className="bg-bg-2 border border-border rounded-xl p-4 mb-5">
          <p className="text-xs text-ink-3 mb-0.5">{item.amb}</p>
          <p className="text-base font-semibold text-ink">{item.nome}</p>
          <p className="text-xs text-wm-blue font-medium mt-1.5">
            Estimativa: {fmt((item.preco_min ?? 0) * item.qtd)} a {fmt((item.preco_max ?? 0) * item.qtd)}
            {item.qtd > 1 && ` · ${item.qtd} unidades`}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-ink-3 mb-2">
            Valor total pago (R$) *
          </label>
          <input
            autoFocus
            type="number"
            min="0"
            step="0.01"
            placeholder="0,00"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-xl text-base text-ink bg-bg placeholder-ink-3 outline-none focus:border-wm-blue focus:ring-2 focus:ring-wm-blue/10 transition-all"
          />
        </div>

        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-ink-3 mb-2">
            Onde comprou
          </label>
          <input
            type="text"
            placeholder="ex: Magazine Luiza, Tok&Stok..."
            value={loja}
            onChange={(e) => setLoja(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
            className="w-full px-4 py-3 border border-border rounded-xl text-base text-ink bg-bg placeholder-ink-3 outline-none focus:border-wm-blue focus:ring-2 focus:ring-wm-blue/10 transition-all"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-semibold border border-border text-ink-2 hover:bg-bg-2 transition-all">
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={saving}
            className="flex-1 py-3 rounded-xl text-sm font-semibold gradient-bg text-white shadow-btn hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {saving ? 'Salvando...' : 'Confirmar compra'}
          </button>
        </div>
      </div>
    </div>
  )
}
