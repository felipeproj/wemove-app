import { useListStore } from '../store/useListStore'
import { fmt, AMB_COLORS } from '../utils/fmt'

export function DashPage() {
  const items = useListStore((s) => s.items)

  const total  = items.length
  const bought = items.filter((i) => i.comprado).length
  const pend   = total - bought
  const tMin   = items.reduce((s, i) => s + (i.preco_min ?? 0) * i.qtd, 0)
  const tMax   = items.reduce((s, i) => s + (i.preco_max ?? 0) * i.qtd, 0)
  const spent  = items.filter((i) => i.comprado).reduce((s, i) => s + (i.gasto ?? 0), 0)
  const pct    = total ? Math.round((bought / total) * 100) : 0
  const altaP  = items.filter((i) => !i.comprado && i.pri === 'Alta').length
  const rooms  = [...new Set(items.map((i) => i.amb))]
  const maxV   = Math.max(...rooms.map((r) => items.filter((i) => i.amb === r).reduce((s, i) => s + (i.preco_min ?? 0) * i.qtd, 0)), 0)
  const recent = items.filter((i) => i.comprado && i.gasto > 0).slice(-5).reverse()

  const metrics = [
    { label: 'Total de itens',    value: String(total),  sub: undefined,                   accent: 'text-ink' },
    { label: 'Comprados',         value: String(bought), sub: `${pct}% concluído`,          accent: 'text-wm-green' },
    { label: 'Pendentes',         value: String(pend),   sub: `${altaP} urgentes`,          accent: 'text-wm-amber' },
    { label: 'Já gasto',          value: fmt(spent),     sub: undefined,                   accent: 'text-wm-pink' },
  ]

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink mb-1">Dashboard</h1>
      <p className="text-sm text-ink-3 mb-6">Visão geral do planejamento da mudança</p>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {metrics.map(({ label, value, sub, accent }) => (
          <div key={label} className="bg-white rounded-2xl card-shadow border border-border p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-3 mb-2">{label}</p>
            <p className={`font-display text-2xl font-bold leading-none ${accent}`}>{value}</p>
            {sub && <p className="text-[11px] text-ink-3 mt-1">{sub}</p>}
          </div>
        ))}
      </div>

      {/* Progresso */}
      <div className="bg-white rounded-2xl card-shadow border border-border p-5 mb-5">
        <div className="flex justify-between items-center mb-3">
          <p className="font-display text-sm font-bold text-ink">Progresso da mudança</p>
          <span className="font-display text-3xl font-bold gradient-text">{pct}%</span>
        </div>
        <div className="h-3 bg-bg-2 rounded-full overflow-hidden">
          <div className="prog-fill h-full rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-xs text-ink-3">
          <span>{bought} comprados</span>
          <span>{pend} pendentes</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Orçamento por ambiente */}
        <div className="bg-white rounded-2xl card-shadow border border-border p-5">
          <p className="font-display text-sm font-bold text-ink mb-4">Orçamento por ambiente</p>
          {rooms.map((room) => {
            const v   = items.filter((i) => i.amb === room).reduce((s, i) => s + (i.preco_min ?? 0) * i.qtd, 0)
            const w   = maxV > 0 ? Math.round((v / maxV) * 100) : 0
            const cor = AMB_COLORS[room] ?? '#6B7280'
            return (
              <div key={room} className="flex items-center gap-2.5 mb-3">
                <p className="text-[12px] text-ink-2 w-28 flex-shrink-0 truncate">{room.split('/')[0].trim()}</p>
                <div className="flex-1 h-2.5 bg-bg-2 rounded-full border border-border overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${w}%`, background: cor }} />
                </div>
                <p className="text-[11px] text-ink-3 min-w-[60px] text-right">{fmt(v)}</p>
              </div>
            )
          })}
        </div>

        {/* Resumo financeiro */}
        <div className="bg-white rounded-2xl card-shadow border border-border p-5">
          <p className="font-display text-sm font-bold text-ink mb-4">Resumo financeiro</p>
          {[
            { label: 'Orçamento mínimo',     value: fmt(tMin),                                        color: 'text-ink' },
            { label: 'Orçamento máximo',     value: fmt(tMax),                                        color: 'text-ink-2' },
            { label: 'Já gasto',             value: fmt(spent),                                       color: 'text-wm-green' },
            { label: 'Restante (vs mínimo)', value: fmt(Math.max(0, tMin - spent)),                   color: 'text-wm-amber' },
            { label: 'Progresso financeiro', value: `${Math.round(tMin > 0 ? spent / tMin * 100 : 0)}%`, color: 'text-wm-blue' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex justify-between items-center py-2.5 border-b border-border last:border-0">
              <span className="text-[13px] text-ink-2">{label}</span>
              <span className={`font-display text-sm font-bold ${color}`}>{value}</span>
            </div>
          ))}

          <p className="font-display text-sm font-bold text-ink mt-5 mb-3">Últimas compras</p>
          {recent.length === 0 ? (
            <p className="text-[13px] text-ink-3">Nenhuma compra registrada ainda.</p>
          ) : (
            recent.map((i) => (
              <div key={i.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-[13px] font-semibold text-ink">{i.nome}</p>
                  {i.loja && <p className="text-[11px] text-ink-3">{i.loja}</p>}
                </div>
                <span className="font-display text-sm font-bold text-wm-green">{fmt(i.gasto)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
