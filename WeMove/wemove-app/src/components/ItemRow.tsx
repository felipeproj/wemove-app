import type { Item } from '../types'
import { fmt } from '../utils/fmt'
import { useListStore } from '../store/useListStore'

interface Props {
  item: Item
  onEdit: (item: Item) => void
  onBuy: (item: Item) => void
  onRemove: (item: Item) => void
}

export function ItemRow({ item, onEdit, onBuy, onRemove }: Props) {
  const unmarkBought = useListStore((s) => s.unmarkBought)
  const permission   = useListStore((s) => s.permission)

  const isEdit = permission === 'edit'

  function handleCheckClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (!isEdit) return
    if (item.comprado) {
      void unmarkBought(item.id)
    } else {
      onBuy(item)
    }
  }

  const priClass: Record<string, string> = {
    Alta:  'bg-red-500/10 text-red-300 border border-red-500/20',
    Média: 'bg-amber-500/10 text-yellow-300 border border-amber-500/20',
    Baixa: 'bg-wm-green/10 text-emerald-300 border border-wm-green/20',
  }

  return (
    <div
      onClick={() => isEdit && onEdit(item)}
      className={[
        'grid items-center gap-3 rounded-[10px] border border-border bg-card px-4 py-3 transition-all cursor-pointer',
        'grid-cols-[28px_1fr_auto]',
        item.comprado ? 'opacity-50 bg-bg-2' : 'hover:border-border-2 hover:bg-card-2',
        isEdit ? 'cursor-pointer' : 'cursor-default',
      ].join(' ')}
    >
      {/* Checkbox */}
      <button
        onClick={handleCheckClick}
        className={[
          'w-[22px] h-[22px] rounded-md border-[1.5px] flex items-center justify-center transition-all flex-shrink-0',
          item.comprado
            ? 'gradient-bg border-transparent'
            : 'border-border-2 hover:border-wm-blue bg-transparent',
        ].join(' ')}
      >
        {item.comprado && (
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M1.5 5.5L4.5 8.5L9.5 2.5" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Info */}
      <div className="min-w-0">
        <div className={`text-sm font-medium truncate ${item.comprado ? 'line-through text-white/40' : 'text-white'}`}>
          {item.nome}
        </div>
        <div className="flex gap-1.5 items-center mt-1 flex-wrap">
          <span className="text-[11px] text-white/40 bg-bg-3 px-1.5 py-0.5 rounded border border-border">
            {item.amb}
          </span>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${item.cat === 'Essencial' ? 'bg-wm-blue/10 text-wm-blue2 border border-wm-blue/25' : 'bg-wm-purple/10 text-purple-300 border border-purple-500/25'}`}>
            {item.cat}
          </span>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${priClass[item.pri]}`}>
            {item.pri}
          </span>
          {item.comprado && item.loja && (
            <span className="text-[11px] text-white/30">{item.loja}</span>
          )}
        </div>
        {item.obs && (
          <div className="text-[11px] text-white/30 mt-0.5 truncate max-w-[420px]">{item.obs}</div>
        )}
      </div>

      {/* Actions */}
      <div
        className="flex gap-2 items-center flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-right whitespace-nowrap">
          {item.comprado && item.gasto ? (
            <>
              <strong className="block font-display text-sm font-semibold text-wm-green">{fmt(item.gasto)}</strong>
              <div className="text-[11px] text-white/40">pago</div>
            </>
          ) : (
            <>
              <strong className="block font-display text-sm font-semibold text-white">{fmt((item.preco_min ?? 0) * item.qtd)}</strong>
              <div className="text-[11px] text-white/40">até {fmt((item.preco_max ?? 0) * item.qtd)} · {item.qtd}un</div>
            </>
          )}
        </div>

        {isEdit && !item.comprado && (
          <button
            onClick={() => onBuy(item)}
            className="px-2.5 py-1 rounded-md text-[12px] font-medium bg-wm-blue/10 text-wm-blue2 border border-wm-blue/25 hover:bg-wm-blue hover:text-white transition-all"
          >
            Comprei
          </button>
        )}
        {isEdit && (
          <>
            <button
              onClick={() => onEdit(item)}
              title="Editar"
              className="p-1.5 rounded-md text-white/40 border border-border-2 hover:bg-card-2 hover:text-white transition-all"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M8.5 1.5L10.5 3.5L4 10H2V8L8.5 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => onRemove(item)}
              title="Remover"
              className="p-1.5 rounded-md text-red-400/60 border border-border-2 hover:bg-red-500/10 hover:text-red-400 transition-all"
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M1.5 1.5L9.5 9.5M9.5 1.5L1.5 9.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
