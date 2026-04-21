import { useListStore } from '../store/useListStore'
import { fmt } from '../utils/fmt'

export function MetricsBar() {
  const items = useListStore((s) => s.items)

  const total  = items.length
  const bought = items.filter((i) => i.comprado).length
  const pct    = total ? Math.round((bought / total) * 100) : 0
  const tMin   = items.reduce((s, i) => s + (i.preco_min ?? 0) * i.qtd, 0)
  const tMax   = items.reduce((s, i) => s + (i.preco_max ?? 0) * i.qtd, 0)
  const spent  = items.filter((i) => i.comprado).reduce((s, i) => s + (i.gasto ?? 0), 0)

  return (
    <div className="grid grid-cols-2 gap-3 mb-5">
      {/* Progresso */}
      <div className="col-span-2 bg-white rounded-2xl card-shadow p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-ink">Progresso da mudança</span>
          <span className="font-display text-xl font-bold gradient-text">{pct}%</span>
        </div>
        <div className="h-3 bg-bg-2 rounded-full overflow-hidden">
          <div className="prog-fill h-full rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between mt-1.5 text-xs text-ink-3">
          <span>{bought} comprados</span>
          <span>{total - bought} pendentes</span>
        </div>
      </div>

      {/* Orçamento mínimo */}
      <div className="bg-white rounded-2xl card-shadow p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-3 mb-1">Orçamento</p>
        <p className="font-display text-lg font-bold text-wm-blue">{fmt(tMin)}</p>
        <p className="text-[11px] text-ink-3 mt-0.5">até {fmt(tMax)}</p>
      </div>

      {/* Já gasto */}
      <div className="bg-white rounded-2xl card-shadow p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-3 mb-1">Já gasto</p>
        <p className="font-display text-lg font-bold text-wm-pink">{fmt(spent)}</p>
        <p className="text-[11px] text-ink-3 mt-0.5">{fmt(Math.max(0, tMin - spent))} restante</p>
      </div>
    </div>
  )
}
