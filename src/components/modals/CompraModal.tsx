import { useState } from 'react'
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
  const markBought = useListStore((s) => s.markBought)
  const [valor, setValor] = useState('')
  const [loja, setLoja]   = useState('')
  const [saving, setSaving] = useState(false)

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
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card border border-border-2 rounded-[14px] p-7 w-full max-w-md">
        <h2 className="font-display text-xl font-semibold mb-5">Registrar compra</h2>

        {/* Item info */}
        <div className="bg-bg-3 border border-border rounded-lg p-3.5 mb-5">
          <p className="text-[12px] text-white/40 mb-0.5">{item.amb}</p>
          <strong className="text-[15px] font-semibold">{item.nome}</strong>
          <p className="text-[12px] text-wm-blue2 mt-1.5">
            Estimativa: {fmt((item.preco_min ?? 0) * item.qtd)} a {fmt((item.preco_max ?? 0) * item.qtd)} · {item.qtd}un
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">
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
            className="w-full px-3 py-2.5 border border-border-2 rounded-lg text-sm bg-bg-3 text-white placeholder-white/30 outline-none focus:border-wm-blue focus:ring-2 focus:ring-wm-blue/10 transition-all"
          />
        </div>

        <div className="mb-6">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">
            Onde comprou
          </label>
          <input
            type="text"
            placeholder="ex: Magazine Luiza, Tok&Stok..."
            value={loja}
            onChange={(e) => setLoja(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
            className="w-full px-3 py-2.5 border border-border-2 rounded-lg text-sm bg-bg-3 text-white placeholder-white/30 outline-none focus:border-wm-blue focus:ring-2 focus:ring-wm-blue/10 transition-all"
          />
        </div>

        <div className="flex gap-2 justify-end border-t border-border pt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] font-medium border border-border-2 text-white/60 hover:bg-card-2 hover:text-white transition-all">
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-[13px] font-medium gradient-bg text-white hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {saving ? 'Salvando...' : 'Confirmar compra'}
          </button>
        </div>
      </div>
    </div>
  )
}
