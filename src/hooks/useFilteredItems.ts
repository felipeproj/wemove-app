import { useMemo } from 'react'
import { useListStore } from '../store/useListStore'
import type { Item, FilterType } from '../types'

export function useFilteredItems(search: string): Item[] {
  const items = useListStore((s) => s.items)
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
      return matchSearch && matchFilter
    })
  }, [items, filter, search])
}

function applyFilter(item: Item, filter: FilterType): boolean {
  switch (filter) {
    case 'Essencial':     return item.cat === 'Essencial'
    case 'Não Essencial': return item.cat === 'Não Essencial'
    case 'Alta':          return item.pri === 'Alta'
    case 'pendente':      return !item.comprado
    case 'comprado':      return item.comprado
    default:              return true
  }
}
