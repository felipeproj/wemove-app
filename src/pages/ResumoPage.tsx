import { useListStore } from '../store/useListStore'
import { fmt, AMB_COLORS } from '../utils/fmt'
import type { Priority } from '../types'

const PRIORITIES: { id: Priority; label: string; color: string }[] = [
  { id: 'Alta',  label: 'Comprar primeiro', color: '#EF4444' },
  { id: 'Média', label: 'Importante',       color: '#F59E0B' },
  { id: 'Baixa', label: 'Quando possível',  color: '#10B981' },
]

export function ResumoPage() {
  const items = useListStore((s) => s.items)
  const rooms = [...new Set(items.map((i) => i.amb))]

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink mb-1">Por ambiente</h1>
      <p className="text-sm text-ink-3 mb-6">Progresso e custos por cômodo</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
        {rooms.map((room) => {
          const its   = items.filter((i) => i.amb === room)
          const comp  = its.filter((i) => i.comprado).length
          const mn    = its.reduce((s, i) => s + (i.preco_min ?? 0) * i.qtd, 0)
          const mx    = its.reduce((s, i) => s + (i.preco_max ?? 0) * i.qtd, 0)
          const spent = its.filter((i) => i.comprado).reduce((s, i) => s + (i.gasto ?? 0), 0)
          const pct   = its.length ? Math.round((comp / its.length) * 100) : 0
          const cor   = AMB_COLORS[room] ?? '#6B7280'

          return (
            <div key={room} className="bg-white rounded-2xl card-shadow border border-border p-5 hover:border-wm-blue/30 transition-all">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cor }} />
                  <span className="font-display text-base font-bold text-ink">{room}</span>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-bg-2 border border-border text-ink-2">
                  {its.length} itens
                </span>
              </div>

              <div className="h-2 bg-bg-2 rounded-full overflow-hidden mb-1.5">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: cor }} />
              </div>
              <p className="text-xs text-ink-3 mb-4">{comp}/{its.length} comprados · {pct}%</p>

              <div className="flex flex-col gap-1.5 mb-4">
                {its.slice(0, 5).map((i) => (
                  <div key={i.id} className="flex items-center gap-2 text-[13px]">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: i.comprado ? cor : '#C8CEEA' }} />
                    <span className={i.comprado ? 'line-through text-ink-3' : 'text-ink-2'}>{i.nome}</span>
                  </div>
                ))}
                {its.length > 5 && <p className="text-xs text-ink-3 pl-3.5">+{its.length - 5} mais</p>}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                <div>
                  <p className="text-[11px] text-ink-3 mb-0.5">Mínimo</p>
                  <p className="font-display text-sm font-bold text-ink">{fmt(mn)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-ink-3 mb-0.5">Máximo</p>
                  <p className="font-display text-sm font-bold text-ink-2">{fmt(mx)}</p>
                </div>
                {spent > 0 && (
                  <div className="col-span-2">
                    <p className="text-[11px] text-ink-3 mb-0.5">Já gasto</p>
                    <p className="font-display text-sm font-bold text-wm-green">{fmt(spent)}</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="h-px bg-border my-8" />

      <h2 className="font-display text-xl font-bold text-ink mb-1">Por prioridade</h2>
      <p className="text-sm text-ink-3 mb-6">Itens agrupados por urgência</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PRIORITIES.map(({ id: pri, label, color }) => {
          const its  = items.filter((i) => i.pri === pri)
          const comp = its.filter((i) => i.comprado).length
          const mn   = its.reduce((s, i) => s + (i.preco_min ?? 0) * i.qtd, 0)
          const pct  = its.length ? Math.round((comp / its.length) * 100) : 0
          const pend = its.filter((i) => !i.comprado)

          return (
            <div key={pri} className="bg-white rounded-2xl card-shadow border border-border p-5">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                  <span className="font-display text-base font-bold text-ink">{pri}</span>
                  <span className="text-xs text-ink-3">{label}</span>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-bg-2 border border-border text-ink-2">
                  {its.length} itens
                </span>
              </div>

              <div className="h-2 bg-bg-2 rounded-full overflow-hidden mb-1.5">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
              </div>
              <p className="text-xs text-ink-3 mb-3">{comp}/{its.length} comprados</p>

              <p className="text-sm text-ink-2 mb-3">
                Mínimo: <span className="font-display font-bold text-ink">{fmt(mn)}</span>
              </p>

              <div className="flex flex-wrap gap-1.5">
                {pend.slice(0, 6).map((i) => (
                  <span key={i.id} className="text-[11px] bg-bg-2 border border-border px-2.5 py-1 rounded-full text-ink-2">
                    {i.nome}
                  </span>
                ))}
                {pend.length > 6 && <span className="text-[11px] text-ink-3">+{pend.length - 6} mais</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
