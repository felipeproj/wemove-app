import { useMemo } from 'react'
import { useListStore } from '../store/useListStore'
import type { FilterType, Room } from '../types'

const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'todos',          label: 'Todos' },
  { id: 'Essencial',      label: 'Essencial' },
  { id: 'Não Essencial',  label: 'Não essencial' },
  { id: 'Alta',           label: 'Urgente' },
  { id: 'pendentes',      label: 'Pendentes' },
  { id: 'comprados',      label: 'Comprados' },
]

/** Ícones compactos para cada ambiente */
const AMB_ICON: Record<string, string> = {
  'Sala':                   '🛋️',
  'Cozinha':                '🍳',
  'Quarto Casal':           '🛏️',
  'Escritório':             '💻',
  'Área de Serviço':        '🧺',
  'Banheiro / Lavabo':      '🚿',
  'Geral / Tecnologia':     '📦',
}

interface Props {
  search: string
  onSearchChange: (v: string) => void
  ambFilter: string | null
  onAmbChange: (amb: string | null) => void
}

export function FilterBar({ search, onSearchChange, ambFilter, onAmbChange }: Props) {
  const filter    = useListStore((s) => s.filter)
  const setFilter = useListStore((s) => s.setFilter)
  const items     = useListStore((s) => s.items)

  // Ambientes presentes na lista atual, na ordem do enum Room
  const AMB_ORDER: Room[] = ['Sala','Cozinha','Quarto Casal','Escritório','Área de Serviço','Banheiro / Lavabo','Geral / Tecnologia']
  const ambs = useMemo(() => {
    const present = new Set<Room>(items.map((i) => i.amb))
    return AMB_ORDER.filter((a) => present.has(a))
  }, [items]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mb-4 space-y-2.5">
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
          className="w-full pl-10 pr-9 py-3 bg-white border border-border rounded-xl text-sm text-ink placeholder-ink-3 outline-none focus:border-wm-blue focus:ring-2 focus:ring-wm-blue/10 transition-all card-shadow"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Filtros de status/categoria — scroll horizontal no mobile */}
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

      {/* Filtros de ambiente — só aparece quando há mais de 1 ambiente */}
      {ambs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {/* Chip "Todos os ambientes" */}
          <button
            onClick={() => onAmbChange(null)}
            className={[
              'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-semibold transition-all',
              ambFilter === null
                ? 'bg-slate-700 text-white border-transparent shadow-btn'
                : 'bg-white border-border text-ink-2 hover:border-slate-400 hover:text-ink',
            ].join(' ')}
          >
            🏠 Todos
          </button>
          {ambs.map((amb) => (
            <button
              key={amb}
              onClick={() => onAmbChange(ambFilter === amb ? null : amb)}
              className={[
                'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-semibold transition-all whitespace-nowrap',
                ambFilter === amb
                  ? 'bg-slate-700 text-white border-transparent shadow-btn'
                  : 'bg-white border-border text-ink-2 hover:border-slate-400 hover:text-ink',
              ].join(' ')}
            >
              {AMB_ICON[amb] ?? '📦'} {amb.split('/')[0].trim()}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
