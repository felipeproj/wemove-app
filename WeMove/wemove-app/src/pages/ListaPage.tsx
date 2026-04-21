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
  const permission = useListStore((s) => s.permission)
  const removeItem = useListStore((s) => s.removeItem)

  const [search,    setSearch]    = useState('')
  const [editItem,  setEditItem]  = useState<Item | null>(null)
  const [buyItem,   setBuyItem]   = useState<Item | null>(null)
  const [removeTarget, setRemoveTarget] = useState<Item | null>(null)
  const [showAdd,   setShowAdd]   = useState(false)
  const [removing,  setRemoving]  = useState(false)

  const filtered = useFilteredItems(search)
  const { toasts, show: showToast } = useToast()

  const total  = useListStore((s) => s.items.length)
  const bought = useListStore((s) => s.items.filter((i) => i.comprado).length)

  async function handleRemoveConfirm() {
    if (!removeTarget) return
    setRemoving(true)
    try {
      await removeItem(removeTarget.id)
      showToast('Item removido')
      setRemoveTarget(null)
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Erro ao remover', 'error')
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-5 flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold">Lista de compras</h2>
          <p className="text-[13px] text-white/50 mt-1">
            {total - bought} item{total - bought !== 1 ? 's' : ''} pendente{total - bought !== 1 ? 's' : ''}
          </p>
        </div>
        {permission === 'edit' && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium gradient-bg text-white hover:opacity-90 transition-all"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1V12M1 6.5H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Adicionar item
          </button>
        )}
      </div>

      <MetricsBar />
      <FilterBar search={search} onSearchChange={setSearch} />

      {/* Lista */}
      <div className="flex flex-col gap-[5px]">
        {filtered.length === 0 ? (
          <div className="text-center py-14 text-white/40">
            <h3 className="font-display text-lg font-medium text-white/60 mb-2">Nenhum item encontrado</h3>
            <p className="text-[13px]">Tente outro filtro ou busca</p>
          </div>
        ) : (
          filtered.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onEdit={setEditItem}
              onBuy={setBuyItem}
              onRemove={setRemoveTarget}
            />
          ))
        )}
      </div>

      {/* Modais */}
      {showAdd && (
        <ItemFormModal
          onClose={() => setShowAdd(false)}
          onSuccess={(msg) => showToast(msg)}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}
      {editItem && (
        <ItemFormModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSuccess={(msg) => showToast(msg)}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}
      {buyItem && (
        <CompraModal
          item={buyItem}
          onClose={() => setBuyItem(null)}
          onSuccess={(msg) => showToast(msg)}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}
      {removeTarget && (
        <ConfirmModal
          message={`Remover "${removeTarget.nome}" da lista? Esta ação não pode ser desfeita.`}
          onConfirm={handleRemoveConfirm}
          onCancel={() => setRemoveTarget(null)}
          loading={removing}
        />
      )}

      <ToastContainer toasts={toasts} />
    </div>
  )
}
