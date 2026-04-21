import { useListStore } from '../store/useListStore'
import type { FilterType } from '../types'

const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'todos',        label: 'Todos' },
  { id: 'Essencial',    label: 'Essencial' },
  { id: 'Não Essencial',label: 'Não essencial' },
  { id: 'Alta',         label: 'Alta prioridade' },
  { id: 'pendente',     label: 'Pendentes' },
  { id: 'comprado',     label: 'Comprados' },
]

interface Props {
  search: string
  onSearchChange: (v: string) => void
}

export function FilterBar({ search, onSearchChange }: Props) {
  const filter    = useListStore((s) => s.filter)
  const setFilter = useListStore((s) => s.setFilter)

  return (
    <div className="flex gap-2 flex-wrap mb-4 items-center">
      <input
        className="flex-1 min-w-[180px] px-3.5 py-[7px] border border-border-2 rounded-lg text-[13px] bg-card text-white placeholder-white/30 outline-none focus:border-wm-blue focus:ring-2 focus:ring-wm-blue/10 transition-all"
        placeholder="Buscar item ou ambiente..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      {FILTERS.map((f) => (
        <button
          key={f.id}
          onClick={() => setFilter(f.id)}
          className={[
            'px-3 py-[5px] rounded-full border text-[12px] font-medium transition-all',
            filter === f.id
              ? 'bg-card-3 text-white border-border-2'
              : 'border-border-2 text-white/50 hover:text-white hover:border-white/30',
          ].join(' ')}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
