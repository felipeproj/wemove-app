import { useState } from 'react'
import { useListStore } from '../store/useListStore'
import { MetricsBar } from '../components/MetricsBar'
import { FilterBar } from '../components/FilterBar'
import { ItemRow } from '../components/ItemRow'
import { ItemFormModal } from '../components/modals/ItemFormModal'
import { CompraModal } from '../components/modals/CompraModal'
import { ConfirmModal } from '../components/modals/ConfirmModal'
import { ToastContainer } from '../components/Toast'
import { useFilteredItems } from '../hooks/useFilteredItems'
import { useToast } from '../hooks/useToast'
import type { Item } from '../types'

export function ListaPage() {
  const permission  = useListStore((s) => s.permission)
  const removeItem  = useListStore((s) => s.removeItem)
  const totalItems  = useListStore((s) => s.items.length)
  const boughtItems = useListStore((s) => s.items.filter((i) => i.comprado).length)

  const [search,       setSearch]       = useState('')
  const [editItem,     setEditItem]     = useState<Item | null>(null)
  const [buyItem,      setBuyItem]      = useState<Item | null>(null)
  const [removeTarget, setRemoveTarget] = useState<Item | null>(null)
  const [showAdd,      setShowAdd]      = useState(false)
  const [removing,     setRemoving]     = useState(false)

  const filtered = useFilteredItems(search)
  const { toasts, show: showToast } = useToast()
  const pending = totalItems - boughtItems

  async function handleRemoveConfirm() {
    if (!removeTarget) return
    setRemoving(true)
    try {
      await removeItem(removeTarget.id)
      showToast('Item removido')
      setRemoveTarget(null)
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Erro ao remover', 'error')
    } finally { setRemoving(false) }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5 gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Lista de compras</h1>
          <p className="text-sm text-ink-3 mt-0.5">{pending} item{pending !== 1 ? 's' : ''} pendente{pending !== 1 ? 's' : ''}</p>
        </div>
        {permission === 'edit' && (
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold gradient-bg text-white shadow-btn hover:opacity-90 transition-all flex-shrink-0">
            <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1V12M1 6.5H12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            Adicionar
          </button>
        )}
      </div>

      <MetricsBar />
      <FilterBar search={search} onSearchChange={setSearch} />

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl card-shadow">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-display text-base font-semibold text-ink">Nenhum item encontrado</p>
            <p className="text-sm text-ink-3 mt-1">Tente outro filtro ou busca</p>
          </div>
        ) : (
          filtered.map((item) => (
            <ItemRow key={item.id} item={item} onEdit={setEditItem} onBuy={setBuyItem} onRemove={setRemoveTarget} />
          ))
        )}
      </div>

      {showAdd && <ItemFormModal onClose={() => setShowAdd(false)} onSuccess={(m) => showToast(m)} onError={(m) => showToast(m, 'error')} />}
      {editItem && <ItemFormModal item={editItem} onClose={() => setEditItem(null)} onSuccess={(m) => showToast(m)} onError={(m) => showToast(m, 'error')} />}
      {buyItem && <CompraModal item={buyItem} onClose={() => setBuyItem(null)} onSuccess={(m) => showToast(m)} onError={(m) => showToast(m, 'error')} />}
      {removeTarget && (
        <ConfirmModal message={`Remover "${removeTarget.nome}" da lista? Esta ação não pode ser desfeita.`}
          onConfirm={handleRemoveConfirm} onCancel={() => setRemoveTarget(null)} loading={removing} />
      )}
      <ToastContainer toasts={toasts} />
    </div>
  )
}
