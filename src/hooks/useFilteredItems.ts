import { useMemo } from 'react'
import { useListStore } from '../store/useListStore'
import type { Item, FilterType } from '../types'

export function useFilteredItems(search: string, ambFilter: string | null = null): Item[] {
  const items  = useListStore((s) => s.items)
  const filter = useListStore((s) => s.filter)

  return useMemo(() => {
    const q = search.toLowerCase().trim()
    return items.filter((i) => {
      const matchSearch =
        !q ||
        i.nome.toLowerCase().includes(q) ||
        i.amb.toLowerCase().includes(q) ||
        (i.obs ?? '').toLowerCase().includes(q)

      const matchFilter = applyFilter(i, filter)
      const matchAmb    = !ambFilter || i.amb === ambFilter

      return matchSearch && matchFilter && matchAmb
    })
  }, [items, filter, search, ambFilter])
}

function applyFilter(item: Item, filter: FilterType): boolean {
  switch (filter) {
    case 'Essencial':     return item.cat === 'Essencial'
    case 'Não Essencial': return item.cat === 'Não Essencial'
    case 'Alta':          return item.pri === 'Alta'
    case 'pendentes':     return !item.comprado
    case 'comprados':     return item.comprado
    default:              return true
  }
}
