import { useListStore } from '../store/useListStore'
import { fmt, AMB_COLORS } from '../utils/fmt'
import type { Priority } from '../types'

const PRIORITIES: { id: Priority; label: string; colorClass: string }[] = [
  { id: 'Alta',  label: 'Comprar primeiro', colorClass: 'bg-red-500' },
  { id: 'Média', label: 'Importante',        colorClass: 'bg-amber-500' },
  { id: 'Baixa', label: 'Quando possível',   colorClass: 'bg-wm-green' },
]

const PRI_BADGE: Record<Priority, string> = {
  Alta:  'bg-red-500/10 text-red-300 border border-red-500/20',
  Média: 'bg-amber-500/10 text-yellow-300 border border-amber-500/20',
  Baixa: 'bg-wm-green/10 text-emerald-300 border border-wm-green/20',
}

export function ResumoPage() {
  const items = useListStore((s) => s.items)
  const rooms = [...new Set(items.map((i) => i.amb))]

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold mb-1">Por ambiente</h2>
      <p className="text-[13px] text-white/50 mb-6">Progresso e custos por cômodo</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-10">
        {rooms.map((room) => {
          const its   = items.filter((i) => i.amb === room)
          const comp  = its.filter((i) => i.comprado).length
          const mn    = its.reduce((s, i) => s + (i.preco_min ?? 0) * i.qtd, 0)
          const mx    = its.reduce((s, i) => s + (i.preco_max ?? 0) * i.qtd, 0)
          const spent = its.filter((i) => i.comprado).reduce((s, i) => s + (i.gasto ?? 0), 0)
          const pct   = its.length ? Math.round((comp / its.length) * 100) : 0
          const cor   = AMB_COLORS[room] ?? '#6B7280'

          return (
            <div key={room} className="bg-card border border-border rounded-[14px] p-5 hover:border-border-2 transition-all">
              <div className="flex justify-between items-center mb-3.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cor }} />
                  <span className="font-display text-[15px] font-semibold">{room}</span>
                </div>
                <span className="text-[12px] text-white/40 bg-bg-3 px-2 py-0.5 rounded border border-border">
                  {its.length} itens
                </span>
              </div>

              <div className="h-1.5 bg-border rounded-full overflow-hidden mb-1.5">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: cor }} />
              </div>
              <p className="text-[11px] text-white/40 mb-2.5">{comp}/{its.length} comprados · {pct}%</p>

              <div className="flex flex-col gap-1.5 mb-3.5">
                {its.slice(0, 5).map((i) => (
                  <div key={i.id} className="flex items-center gap-2 text-[12px]">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: i.comprado ? cor : '#2A2A3C' }} />
                    <span className={i.comprado ? 'line-through text-white/30' : 'text-white/60'}>{i.nome}</span>
                  </div>
                ))}
                {its.length > 5 && <p className="text-[11px] text-white/30 pl-3.5">+{its.length - 5} mais</p>}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3.5 border-t border-border">
                <div>
                  <div className="text-[11px] text-white/40 mb-0.5">Mínimo</div>
                  <div className="font-display text-sm font-semibold">{fmt(mn)}</div>
                </div>
                <div>
                  <div className="text-[11px] text-white/40 mb-0.5">Máximo</div>
                  <div className="font-display text-sm font-semibold">{fmt(mx)}</div>
                </div>
                {spent > 0 && (
                  <div className="col-span-2">
                    <div className="text-[11px] text-white/40 mb-0.5">Já gasto</div>
                    <div className="font-display text-sm font-semibold text-wm-green">{fmt(spent)}</div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="h-px bg-border my-8" />

      <h2 className="font-display text-2xl font-semibold mb-1">Por prioridade</h2>
      <p className="text-[13px] text-white/50 mb-6">Itens agrupados por urgência de compra</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {PRIORITIES.map(({ id: pri, label, colorClass }) => {
          const its  = items.filter((i) => i.pri === pri)
          const comp = its.filter((i) => i.comprado).length
          const mn   = its.reduce((s, i) => s + (i.preco_min ?? 0) * i.qtd, 0)
          const pct  = its.length ? Math.round((comp / its.length) * 100) : 0
          const pend = its.filter((i) => !i.comprado)

          return (
            <div key={pri} className="bg-card border border-border rounded-[14px] p-5 hover:border-border-2 transition-all">
              <div className="flex justify-between items-center mb-3.5">
                <div className="flex items-center gap-2.5">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${PRI_BADGE[pri]}`}>{pri}</span>
                  <span className="text-[12px] text-white/40">{label}</span>
                </div>
                <span className="text-[12px] text-white/40 bg-bg-3 px-2 py-0.5 rounded border border-border">{its.length} itens</span>
              </div>

              <div className="h-1.5 bg-border rounded-full overflow-hidden mb-1.5">
                <div className={`h-full rounded-full transition-all duration-500 ${colorClass}`} style={{ width: `${pct}%` }} />
              </div>
              <p className="text-[11px] text-white/40 mb-3">{comp}/{its.length} comprados</p>

              <p className="text-[13px] text-white/60 mb-3">
                Mínimo: <span className="font-display font-semibold text-white">{fmt(mn)}</span>
              </p>

              <div className="flex flex-wrap gap-1.5">
                {pend.slice(0, 6).map((i) => (
                  <span key={i.id} className="text-[11px] bg-bg-3 border border-border px-2.5 py-1 rounded text-white/60">
                    {i.nome}
                  </span>
                ))}
                {pend.length > 6 && <span className="text-[11px] text-white/30">+{pend.length - 6} mais</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
