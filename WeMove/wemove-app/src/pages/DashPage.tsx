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

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold mb-1">Dashboard</h2>
      <p className="text-[13px] text-white/50 mb-6">Visão geral do planejamento da mudança</p>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Total de itens', value: String(total) },
          { label: 'Comprados',      value: String(bought), sub: `${pct}% concluído`,      color: 'green' },
          { label: 'Pendentes',      value: String(pend),   sub: `${altaP} alta prioridade`, color: 'amber' },
          { label: 'Já gasto',       value: fmt(spent),                                     color: 'pink' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className={`rounded-lg border bg-card p-4 ${
            color === 'green' ? 'border-wm-green/20 bg-wm-green/10' :
            color === 'amber' ? 'border-wm-amber/20 bg-wm-amber/10' :
            color === 'pink'  ? 'border-wm-pink/25 bg-wm-pink/10' :
            'border-border'
          }`}>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2">{label}</div>
            <div className={`font-display text-2xl font-bold leading-none ${
              color === 'green' ? 'text-wm-green' :
              color === 'amber' ? 'text-wm-amber' :
              color === 'pink'  ? 'text-wm-pink2' :
              'text-white'
            }`}>{value}</div>
            {sub && <div className="text-[11px] text-white/40 mt-1">{sub}</div>}
          </div>
        ))}
      </div>

      {/* Progresso */}
      <div className="bg-card border border-border rounded-[14px] p-5 mb-4">
        <div className="flex justify-between items-center mb-3.5">
          <div className="font-display text-sm font-semibold">Progresso da mudança</div>
          <span className="font-display text-3xl font-bold gradient-text">{pct}%</span>
        </div>
        <div className="h-2.5 bg-border rounded-full overflow-hidden">
          <div className="prog-fill h-full rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-[11px] text-white/40">
          <span>{bought} comprados</span>
          <span>{pend} pendentes</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Orçamento por ambiente */}
        <div className="bg-card border border-border rounded-[14px] p-5">
          <div className="font-display text-sm font-semibold mb-4">Orçamento por ambiente</div>
          {rooms.map((room) => {
            const v   = items.filter((i) => i.amb === room).reduce((s, i) => s + (i.preco_min ?? 0) * i.qtd, 0)
            const w   = maxV > 0 ? Math.round((v / maxV) * 100) : 0
            const cor = AMB_COLORS[room] ?? '#6B7280'
            return (
              <div key={room} className="flex items-center gap-2.5 mb-2.5">
                <div className="text-[12px] text-white/60 w-28 flex-shrink-0 truncate">{room.split('/')[0].trim()}</div>
                <div className="flex-1 h-3.5 bg-bg-3 rounded border border-border overflow-hidden">
                  <div className="h-full rounded transition-all duration-700" style={{ width: `${w}%`, background: cor }} />
                </div>
                <div className="text-[11px] text-white/40 min-w-[60px] text-right">{fmt(v)}</div>
              </div>
            )
          })}
        </div>

        {/* Resumo financeiro */}
        <div className="bg-card border border-border rounded-[14px] p-5">
          <div className="font-display text-sm font-semibold mb-4">Resumo financeiro</div>
          {[
            { label: 'Orçamento mínimo',    value: fmt(tMin),                          color: 'text-white' },
            { label: 'Orçamento máximo',    value: fmt(tMax),                          color: 'text-white/50' },
            { label: 'Já gasto',            value: fmt(spent),                         color: 'text-wm-green' },
            { label: 'Restante (vs mínimo)',value: fmt(Math.max(0, tMin - spent)),      color: 'text-wm-amber' },
            { label: 'Progresso financeiro',value: `${Math.round(tMin > 0 ? spent / tMin * 100 : 0)}%`, color: 'text-wm-blue2' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex justify-between items-center py-2.5 border-b border-border last:border-0">
              <span className="text-[13px] text-white/60">{label}</span>
              <span className={`font-display text-sm font-semibold ${color}`}>{value}</span>
            </div>
          ))}

          <div className="font-display text-sm font-semibold mt-4 mb-3">Últimas compras</div>
          {recent.length === 0 ? (
            <p className="text-[13px] text-white/30">Nenhuma compra registrada ainda.</p>
          ) : (
            recent.map((i) => (
              <div key={i.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                <div>
                  <div className="text-[13px] font-medium">{i.nome}</div>
                  {i.loja && <div className="text-[11px] text-white/30">{i.loja}</div>}
                </div>
                <span className="font-display text-sm font-semibold text-wm-green">{fmt(i.gasto)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
