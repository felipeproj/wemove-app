import type { Item } from '../types'
import { fmt } from '../utils/fmt'
import { useListStore } from '../store/useListStore'

interface Props {
  item: Item
  onEdit: (item: Item) => void
  onBuy: (item: Item) => void
  onRemove: (item: Item) => void
}

const PRI_BADGE: Record<string, string> = {
  Alta:  'bg-red-50 text-red-600 border-red-200',
  Média: 'bg-amber-50 text-amber-600 border-amber-200',
  Baixa: 'bg-emerald-50 text-emerald-600 border-emerald-200',
}

export function ItemRow({ item, onEdit, onBuy, onRemove }: Props) {
  const unmarkBought = useListStore((s) => s.unmarkBought)
  const permission   = useListStore((s) => s.permission)
  const isEdit = permission === 'edit'

  function handleCheckClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (!isEdit) return
    if (item.comprado) void unmarkBought(item.id)
    else onBuy(item)
  }

  return (
    <div
      onClick={() => isEdit && onEdit(item)}
      className={[
        'bg-white rounded-2xl card-shadow border border-border p-4 transition-all',
        item.comprado ? 'opacity-60' : 'hover:border-wm-blue/30 hover:shadow-btn',
        isEdit ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleCheckClick}
          className={[
            'mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all',
            item.comprado
              ? 'gradient-bg border-transparent shadow-btn'
              : 'border-border-2 bg-bg hover:border-wm-blue',
          ].join(' ')}
        >
          {item.comprado && (
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M1.5 5.5L4.5 8.5L9.5 2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Info principal */}
        <div className="flex-1 min-w-0">
          <p className={`text-[15px] font-semibold leading-tight ${item.comprado ? 'line-through text-ink-3' : 'text-ink'}`}>
            {item.nome}
          </p>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-bg-2 text-ink-2 border border-border">
              {item.amb.split('/')[0].trim()}
            </span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${PRI_BADGE[item.pri]}`}>
              {item.pri}
            </span>
            {item.cat === 'Essencial' && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-wm-blue border border-blue-200">
                Essencial
              </span>
            )}
          </div>

          {/* Obs */}
          {item.obs && (
            <p className="text-xs text-ink-3 mt-1.5 leading-relaxed line-clamp-2">{item.obs}</p>
          )}

          {/* Loja quando comprado */}
          {item.comprado && item.loja && (
            <p className="text-xs text-ink-3 mt-1">📍 {item.loja}</p>
          )}
        </div>

        {/* Preço + ações */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {item.comprado && item.gasto ? (
            <div className="text-right">
              <p className="font-display text-base font-bold text-wm-green">{fmt(item.gasto)}</p>
              <p className="text-[10px] text-ink-3">pago</p>
            </div>
          ) : (
            <div className="text-right">
              <p className="font-display text-base font-bold text-ink">{fmt((item.preco_min ?? 0) * item.qtd)}</p>
              <p className="text-[10px] text-ink-3">{item.qtd > 1 ? `${item.qtd}un · ` : ''}até {fmt((item.preco_max ?? 0) * item.qtd)}</p>
            </div>
          )}

          {isEdit && !item.comprado && (
            <button
              onClick={() => onBuy(item)}
              className="px-3 py-1.5 rounded-lg text-[12px] font-bold gradient-bg text-white shadow-btn hover:opacity-90 transition-all"
            >
              Comprei
            </button>
          )}

          {isEdit && (
            <div className="flex gap-1.5">
              <button
                onClick={() => onEdit(item)}
                title="Editar"
                className="w-8 h-8 rounded-lg border border-border bg-bg-2 flex items-center justify-center text-ink-3 hover:border-wm-blue hover:text-wm-blue transition-all"
              >
                <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                  <path d="M8.5 1.5L10.5 3.5L4 10H2V8L8.5 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={() => onRemove(item)}
                title="Remover"
                className="w-8 h-8 rounded-lg border border-border bg-bg-2 flex items-center justify-center text-ink-3 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all"
              >
                <svg width="12" height="12" viewBox="0 0 11 11" fill="none">
                  <path d="M1.5 1.5L9.5 9.5M9.5 1.5L1.5 9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
