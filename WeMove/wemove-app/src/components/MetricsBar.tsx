import { useListStore } from '../store/useListStore'
import { fmt } from '../utils/fmt'

export function MetricsBar() {
  const items = useListStore((s) => s.items)

  const total   = items.length
  const bought  = items.filter((i) => i.comprado).length
  const pct     = total ? Math.round((bought / total) * 100) : 0
  const tMin    = items.reduce((s, i) => s + (i.preco_min ?? 0) * i.qtd, 0)
  const tMax    = items.reduce((s, i) => s + (i.preco_max ?? 0) * i.qtd, 0)
  const spent   = items.filter((i) => i.comprado).reduce((s, i) => s + (i.gasto ?? 0), 0)
  const essentials = items.filter((i) => i.cat === 'Essencial').length

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <MetricCard label="Total de itens" value={String(total)} sub={`${essentials} essenciais`} />
      <MetricCard
        label="Progresso"
        value={`${pct}%`}
        color="green"
        extra={
          <div className="h-1.5 bg-border rounded-full overflow-hidden mt-1">
            <div className="prog-fill h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        }
      />
      <MetricCard label="Orçamento estimado" value={fmt(tMin)} sub={`até ${fmt(tMax)}`} color="amber" />
      <MetricCard label="Já gasto" value={fmt(spent)} sub={`${fmt(Math.max(0, tMin - spent))} restante`} color="blue" />
    </div>
  )
}

interface MetricCardProps {
  label: string
  value: string
  sub?: string
  color?: 'green' | 'amber' | 'blue'
  extra?: React.ReactNode
}

function MetricCard({ label, value, sub, color, extra }: MetricCardProps) {
  const colorMap = {
    green: 'border-wm-green/20 bg-wm-green/10 [&_.val]:text-wm-green',
    amber: 'border-wm-amber/20 bg-wm-amber/10 [&_.val]:text-wm-amber',
    blue:  'border-wm-blue/25 bg-wm-blue/10 [&_.val]:text-wm-blue2',
  }

  return (
    <div className={`rounded-lg border border-border bg-card p-4 ${color ? colorMap[color] : ''}`}>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2">{label}</div>
      <div className="val font-display text-2xl font-bold text-white leading-none">{value}</div>
      {sub && <div className="text-[11px] text-white/40 mt-1">{sub}</div>}
      {extra}
    </div>
  )
}
