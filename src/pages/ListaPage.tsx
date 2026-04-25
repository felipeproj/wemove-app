import { useRef, useState } from 'react'
import { useListStore } from '../store/useListStore'
import type { RecommendedItem } from '../services/api'
import { MetricsBar } from '../components/MetricsBar'
import { FilterBar } from '../components/FilterBar'
import { ItemRow } from '../components/ItemRow'
import { ItemFormModal } from '../components/modals/ItemFormModal'
import { CompraModal } from '../components/modals/CompraModal'
import { ConfirmModal } from '../components/modals/ConfirmModal'
import { ItemDetailModal } from '../components/modals/ItemDetailModal'
import { ToastContainer } from '../components/Toast'
import { useFilteredItems } from '../hooks/useFilteredItems'
import { useToast } from '../hooks/useToast'
import type { Item } from '../types'

// ── PDF Export ────────────────────────────────────────────────────────────────

const ROOMS_ORDER = [
  'Sala', 'Cozinha', 'Quarto Casal', 'Escritório',
  'Área de Serviço', 'Banheiro / Lavabo', 'Geral / Tecnologia',
]

function fmt(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
}

function exportToPdf(title: string, items: Item[]) {
  const groups: Record<string, Item[]> = {}
  for (const item of items) {
    if (!groups[item.amb]) groups[item.amb] = []
    groups[item.amb].push(item)
  }

  const totalMin   = items.reduce((s, i) => s + i.preco_min * i.qtd, 0)
  const totalMax   = items.reduce((s, i) => s + i.preco_max * i.qtd, 0)
  const gastoTotal = items.reduce((s, i) => s + (i.comprado ? (i.gasto || i.preco_min) * i.qtd : 0), 0)
  const bought     = items.filter((i) => i.comprado).length
  const pending    = items.length - bought
  const date       = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  const roomsHtml = ROOMS_ORDER
    .filter((r) => groups[r]?.length)
    .map((room) => {
      const roomItems = groups[room]
      const rows = roomItems.map((i) => `
        <tr class="${i.comprado ? 'bought' : ''}">
          <td class="item-name">
            ${i.comprado ? '<span class="check">✓</span> ' : ''}${i.nome}
            ${i.obs ? `<br><span class="obs">${i.obs}</span>` : ''}
          </td>
          <td class="center">${i.qtd}</td>
          <td class="center pri-${i.pri.toLowerCase().replace(' ', '-')}">${i.pri}</td>
          <td class="right">${i.preco_min === i.preco_max ? fmt(i.preco_min) : `${fmt(i.preco_min)} – ${fmt(i.preco_max)}`}</td>
          <td class="right">${i.comprado ? `<strong>${fmt(i.gasto || i.preco_min)}</strong>` : '—'}</td>
        </tr>
      `).join('')

      return `
        <div class="room-section">
          <div class="room-header">${room}</div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th class="center">Qtd</th>
                <th class="center">Prioridade</th>
                <th class="right">Preço estimado</th>
                <th class="right">Gasto</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `
    }).join('')

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${title} — WeMove</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 11px; color: #1e293b; background: white; padding: 28px 32px; }
    .header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #e2e8f0; }
    .brand { font-size: 18px; font-weight: 800; background: linear-gradient(90deg, #3B82F6, #6366F1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.5px; }
    .list-title { font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 2px; }
    .meta { font-size: 10px; color: #64748b; margin-top: 2px; }
    .header-right { text-align: right; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
    .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; }
    .stat-label { font-size: 9px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
    .stat-value { font-size: 14px; font-weight: 700; color: #0f172a; }
    .stat-value.green { color: #059669; }
    .stat-value.blue  { color: #3B82F6; }
    .room-section { margin-bottom: 18px; page-break-inside: avoid; }
    .room-header { background: linear-gradient(90deg, #EFF6FF, #EDE9FE); color: #4F46E5; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; padding: 5px 10px; border-radius: 6px 6px 0 0; border: 1px solid #C7D2FE; border-bottom: none; }
    table { width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 0 0 6px 6px; overflow: hidden; }
    thead { background: #f8fafc; }
    th { padding: 6px 10px; font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.4px; border-bottom: 1px solid #e2e8f0; }
    td { padding: 6px 10px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
    tr:last-child td { border-bottom: none; }
    tr.bought { background: #f0fdf4; }
    tr.bought td { color: #475569; }
    .item-name { max-width: 280px; line-height: 1.4; }
    .obs { color: #94a3b8; font-size: 9px; font-style: italic; }
    .check { color: #059669; font-weight: 700; }
    .center { text-align: center; }
    .right  { text-align: right; white-space: nowrap; }
    .pri-alta  { color: #dc2626; font-weight: 700; }
    .pri-média { color: #d97706; font-weight: 600; }
    .pri-baixa { color: #64748b; }
    .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
    .footer-brand { font-size: 10px; color: #94a3b8; }
    .footer-brand strong { color: #6366F1; }
    .footer-total { font-size: 11px; font-weight: 700; color: #0f172a; }
    .footer-total span { color: #059669; }
    @media print { body { padding: 0; } .room-section { page-break-inside: avoid; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">WeMove</div>
      <div class="list-title">${title}</div>
      <div class="meta">Gerado em ${date}</div>
    </div>
    <div class="header-right">
      <div class="meta">${items.length} item${items.length !== 1 ? 's' : ''} na lista</div>
      <div class="meta">${bought} comprado${bought !== 1 ? 's' : ''} · ${pending} pendente${pending !== 1 ? 's' : ''}</div>
    </div>
  </div>
  <div class="stats">
    <div class="stat-card"><div class="stat-label">Total de itens</div><div class="stat-value">${items.length}</div></div>
    <div class="stat-card"><div class="stat-label">Comprados</div><div class="stat-value green">${bought}</div></div>
    <div class="stat-card"><div class="stat-label">Estimativa total</div><div class="stat-value blue">${totalMin === totalMax ? fmt(totalMin) : `${fmt(totalMin)} – ${fmt(totalMax)}`}</div></div>
    <div class="stat-card"><div class="stat-label">Já gasto</div><div class="stat-value${gastoTotal > 0 ? ' green' : ''}">${gastoTotal > 0 ? fmt(gastoTotal) : '—'}</div></div>
  </div>
  ${roomsHtml}
  <div class="footer">
    <div class="footer-brand">Planejamento de mudança por <strong>WeMove</strong> · wemoveapp.co</div>
    ${gastoTotal > 0
      ? `<div class="footer-total">Total gasto: <span>${fmt(gastoTotal)}</span></div>`
      : `<div class="footer-total">Estimativa: ${fmt(totalMin)} – ${fmt(totalMax)}</div>`
    }
  </div>
</body>
</html>`

  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) { alert('Permita pop-ups para exportar o PDF.'); return }
  win.document.write(html)
  win.document.close()
  win.onload = () => win.print()
  setTimeout(() => { try { win.print() } catch { /* já imprimiu */ } }, 800)
}

// ── ListaPage ─────────────────────────────────────────────────────────────────

export function ListaPage() {
  const permission    = useListStore((s) => s.permission)
  const removeItem    = useListStore((s) => s.removeItem)
  const reorderItems  = useListStore((s) => s.reorderItems)
  const listTitle     = useListStore((s) => s.listTitle)
  const allItems      = useListStore((s) => s.items)
  const filter        = useListStore((s) => s.filter)
  const totalItems    = allItems.length
  const boughtItems   = allItems.filter((i) => i.comprado).length

  const [search,       setSearch]       = useState('')
  const [ambFilter,    setAmbFilter]    = useState<string | null>(null)
  const [detailItem,   setDetailItem]   = useState<Item | null>(null)
  const [editItem,     setEditItem]     = useState<Item | null>(null)
  const [buyItem,      setBuyItem]      = useState<Item | null>(null)
  const [removeTarget, setRemoveTarget] = useState<Item | null>(null)
  const [showAdd,      setShowAdd]      = useState(false)
  const [removing,     setRemoving]     = useState(false)

  // Cache de recomendações — persiste enquanto a página está montada
  const recoCache = useRef<Map<string, RecommendedItem[]>>(new Map())

  // Drag & drop — só disponível sem filtros ativos e com permissão de edição
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const canDrag = permission === 'edit' && !search && !ambFilter && filter === 'todos'

  const filtered = useFilteredItems(search, ambFilter)
  const { toasts, show: showToast } = useToast()
  const pending = totalItems - boughtItems

  // ── DnD handlers ──────────────────────────────────────────────────────────
  function handleDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.effectAllowed = 'move'
    setDraggedId(id)
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    if (!canDrag) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (id !== dragOverId) setDragOverId(id)
  }

  function handleDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault()
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null); setDragOverId(null); return
    }
    const ids = allItems.map((i) => i.id)
    const from = ids.indexOf(draggedId)
    const to   = ids.indexOf(targetId)
    const next = [...ids]
    next.splice(from, 1)
    next.splice(to, 0, draggedId)
    void reorderItems(next)
    setDraggedId(null); setDragOverId(null)
  }

  function handleDragEnd() {
    setDraggedId(null); setDragOverId(null)
  }

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

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Botão exportar PDF */}
          <button
            onClick={() => exportToPdf(listTitle || 'Minha Mudança', allItems)}
            disabled={allItems.length === 0}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold border border-border bg-white text-ink-2 hover:border-wm-blue hover:text-wm-blue shadow-card disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Exportar lista em PDF"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="12" x2="12" y2="18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <polyline points="9 15 12 18 15 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="hidden sm:inline">Exportar PDF</span>
          </button>

          {/* Botão adicionar item */}
          {permission === 'edit' && (
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold gradient-bg text-white shadow-btn hover:opacity-90 transition-all"
            >
              <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
                <path d="M6.5 1V12M1 6.5H12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
              Adicionar
            </button>
          )}
        </div>
      </div>

      <MetricsBar />
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        ambFilter={ambFilter}
        onAmbChange={setAmbFilter}
      />

      {/* Dica de reordenação */}
      {canDrag && filtered.length > 1 && (
        <p className="text-[11px] text-ink-3 text-center mb-2 select-none">
          ↕ Arraste os itens para reordenar
        </p>
      )}

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl card-shadow">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-display text-base font-semibold text-ink">Nenhum item encontrado</p>
            <p className="text-sm text-ink-3 mt-1">Tente outro filtro ou busca</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              draggable={canDrag}
              onDragStart={canDrag ? (e) => handleDragStart(e, item.id) : undefined}
              onDragOver={canDrag ? (e) => handleDragOver(e, item.id) : undefined}
              onDrop={canDrag ? (e) => handleDrop(e, item.id) : undefined}
              onDragEnd={canDrag ? handleDragEnd : undefined}
              className={[
                'transition-all duration-150',
                draggedId === item.id  ? 'opacity-40 scale-[0.98]'   : '',
                dragOverId === item.id && draggedId !== item.id ? 'translate-y-0.5 ring-2 ring-wm-blue/30 rounded-2xl' : '',
              ].join(' ')}
            >
              <ItemRow
                item={item}
                onDetail={setDetailItem}
                onEdit={setEditItem}
                onBuy={setBuyItem}
                onRemove={setRemoveTarget}
              />
            </div>
          ))
        )}
      </div>

      {/* Modais */}
      {showAdd && (
        <ItemFormModal
          onClose={() => setShowAdd(false)}
          onSuccess={(m) => showToast(m)}
          onError={(m) => showToast(m, 'error')}
        />
      )}
      {editItem && (
        <ItemFormModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSuccess={(m) => showToast(m)}
          onError={(m) => showToast(m, 'error')}
        />
      )}
      {buyItem && (
        <CompraModal
          item={buyItem}
          onClose={() => setBuyItem(null)}
          onSuccess={(m) => showToast(m)}
          onError={(m) => showToast(m, 'error')}
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
      {detailItem && (
        <ItemDetailModal
          item={detailItem}
          onClose={() => setDetailItem(null)}
          onEdit={() => setEditItem(detailItem)}
          onBuy={() => setBuyItem(detailItem)}
          onRemove={() => setRemoveTarget(detailItem)}
          recoCache={recoCache}
        />
      )}

      <ToastContainer toasts={toasts} />
    </div>
  )
}
