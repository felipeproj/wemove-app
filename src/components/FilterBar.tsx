import { useListStore } from '../store/useListStore'
import type { FilterType } from '../types'

const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'todos',          label: 'Todos' },
  { id: 'Essencial',      label: 'Essencial' },
  { id: 'Não Essencial',  label: 'Não essencial' },
  { id: 'Alta',           label: 'Urgente' },
  { id: 'pendentes',      label: 'Pendentes' },
  { id: 'comprados',      label: 'Comprados' },
]

interface Props {
  search: string
  onSearchChange: (v: string) => void
}

export function FilterBar({ search, onSearchChange }: Props) {
  const filter    = useListStore((s) => s.filter)
  const setFilter = useListStore((s) => s.setFilter)

  return (
    <div className="mb-4 space-y-3">
      {/* Busca */}
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" width="15" height="15" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
          <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar item ou ambiente..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-xl text-sm text-ink placeholder-ink-3 outline-none focus:border-wm-blue focus:ring-2 focus:ring-wm-blue/10 transition-all card-shadow"
        />
      </div>

      {/* Filtros — scroll horizontal no mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={[
              'flex-shrink-0 px-3.5 py-1.5 rounded-full border text-[12px] font-semibold transition-all',
              filter === f.id
                ? 'gradient-bg text-white border-transparent shadow-btn'
                : 'bg-white border-border text-ink-2 hover:border-wm-blue hover:text-wm-blue',
            ].join(' ')}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  )
}
