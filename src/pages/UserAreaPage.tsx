/**
 * UserAreaPage — área logada do usuário.
 *
 * Exibe todas as listas associadas à conta com paginação,
 * permite abrir, vincular, criar, renomear e excluir listas.
 */

import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useListStore } from '../store/useListStore'
import { listApi, userApi, comprasApi, type UserList, type ShoppingQuery, type RecommendedItem } from '../services/api'

interface Props {
  onCreateNew:  () => void
  onGoToCompra: () => void
  onOpenQuery:  (query: ShoppingQuery) => void
}

type AreaTab = 'mudancas' | 'compras'

type PageSize = 10 | 25 | 50 | 100

const ACCENT_ACTIVE = 'linear-gradient(180deg, #3B82F6 0%, #6366F1 100%)'
const ACCENT_DONE   = '#10B981'

// ── Barra de progresso ────────────────────────────────────────────────────────

function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100)
  return (
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${pct}%`,
          background: pct === 100 ? ACCENT_DONE : 'linear-gradient(90deg, #3B82F6, #6366F1)',
        }}
      />
    </div>
  )
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ pct }: { pct: number }) {
  if (pct === 100) {
    return (
      <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 whitespace-nowrap">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5l2.5 2.5L8 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Concluída
      </span>
    )
  }
  if (pct === 0) {
    return (
      <span className="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 whitespace-nowrap">
        Não iniciada
      </span>
    )
  }
  return (
    <span
      className="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap border"
      style={{ background: 'linear-gradient(135deg,#EFF6FF,#EDE9FE)', color: '#4F46E5', borderColor: '#C7D2FE' }}
    >
      {pct}% concluído
    </span>
  )
}

// ── Menu de ações de card ─────────────────────────────────────────────────────

interface CardActionsProps {
  onRename: () => void
  onDelete: () => void
}

function CardActions({ onRename, onDelete }: CardActionsProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Fecha ao clicar fora
  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative flex-shrink-0 self-center">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        className="w-8 h-8 flex items-center justify-center rounded-xl text-ink-3 hover:text-ink hover:bg-slate-100 transition-all"
        title="Opções"
        aria-label="Opções da lista"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5"  r="1.5"/>
          <circle cx="12" cy="12" r="1.5"/>
          <circle cx="12" cy="19" r="1.5"/>
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-30 bg-white rounded-xl border border-border shadow-modal w-40 py-1 animate-fade-in">
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(false); onRename() }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-ink hover:bg-bg transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Renomear
          </button>
          <div className="h-px bg-border mx-2 my-1" />
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete() }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Excluir lista
          </button>
        </div>
      )}
    </div>
  )
}

// ── Card de lista ─────────────────────────────────────────────────────────────

interface ListCardProps {
  list: UserList
  onOpen: () => void
  onRename: () => void
  onDelete: () => void
}

function ListCard({ list, onOpen, onRename, onDelete }: ListCardProps) {
  const pct  = list.items_count === 0 ? 0 : Math.round((list.items_bought / list.items_count) * 100)
  const done = pct === 100
  const date = new Date(list.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

  return (
    <div className="w-full bg-white rounded-2xl border border-border overflow-hidden shadow-card hover:shadow-btn hover:border-wm-blue/40 transition-all group flex">
      {/* Borda lateral colorida */}
      <div
        className="w-1 flex-shrink-0 transition-all"
        style={{ background: done ? ACCENT_DONE : ACCENT_ACTIVE }}
      />

      {/* Área clicável principal */}
      <button
        onClick={onOpen}
        className="flex-1 p-4 min-w-0 text-left"
      >
        {/* Mobile */}
        <div className="md:hidden">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="min-w-0">
              <p className="font-display font-bold text-ink text-sm leading-snug truncate group-hover:text-wm-blue transition-colors">
                {list.title || 'Lista sem título'}
              </p>
              <p className="text-xs text-ink-3 mt-0.5">{date}</p>
            </div>
            <StatusBadge pct={pct} />
          </div>
          <ProgressBar value={list.items_bought} total={list.items_count} />
          <p className="text-xs text-ink-3 mt-1.5">
            {list.items_bought} de {list.items_count} {list.items_count === 1 ? 'item' : 'itens'} comprados
          </p>
        </div>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-display font-semibold text-ink text-sm truncate group-hover:text-wm-blue transition-colors">
              {list.title || 'Lista sem título'}
            </p>
            <p className="text-[11px] text-ink-3 mt-0.5">{date}</p>
          </div>
          <div className="w-36 flex-shrink-0">
            <ProgressBar value={list.items_bought} total={list.items_count} />
            <p className="text-[11px] text-ink-3 mt-1">
              {list.items_bought}/{list.items_count} itens
            </p>
          </div>
          <StatusBadge pct={pct} />
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            className="text-ink-3 group-hover:text-wm-blue transition-colors flex-shrink-0"
          >
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      </button>

      {/* Ações (renomear / excluir) */}
      <div className="flex items-center pr-2">
        <CardActions onRename={onRename} onDelete={onDelete} />
      </div>
    </div>
  )
}

// ── Modal de renomear ─────────────────────────────────────────────────────────

interface RenameModalProps {
  list: UserList
  onSave: (newTitle: string) => Promise<void>
  onCancel: () => void
}

function RenameModal({ list, onSave, onCancel }: RenameModalProps) {
  const [title,   setTitle]   = useState(list.title || '')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus(); inputRef.current?.select() }, [])

  async function handleSave() {
    const t = title.trim()
    if (!t) { setError('O nome não pode ficar vazio.'); return }
    setError(null)
    setLoading(true)
    try {
      await onSave(t)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao renomear')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-ink/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-modal animate-fade-in">
        <h3 className="font-display text-lg font-bold text-ink mb-1">Renomear lista</h3>
        <p className="text-xs text-ink-3 mb-4">Escolha um novo nome para identificar esta mudança.</p>

        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setError(null) }}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onCancel() }}
          maxLength={200}
          className="w-full px-3 py-2.5 border border-border rounded-xl text-sm text-ink bg-bg outline-none focus:border-wm-blue focus:ring-2 focus:ring-wm-blue/10 transition-all"
          placeholder="Nome da lista..."
        />
        {error && <p className="text-xs text-red-600 mt-1.5">⚠️ {error}</p>}

        <div className="flex gap-3 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-border text-ink-2 hover:bg-bg-2 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !title.trim() || title.trim() === (list.title || '')}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold gradient-bg text-white shadow-btn hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modal de confirmação de exclusão ──────────────────────────────────────────

interface DeleteModalProps {
  list: UserList
  onConfirm: () => Promise<void>
  onCancel: () => void
}

function DeleteModal({ list, onConfirm, onCancel }: DeleteModalProps) {
  const [loading,   setLoading]   = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    try {
      await onConfirm()
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-ink/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-modal animate-fade-in">
        {/* Ícone de alerta */}
        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="9" x2="12" y2="13" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="12" y1="17" x2="12.01" y2="17" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        <h3 className="font-display text-lg font-bold text-ink mb-1">Excluir lista</h3>
        <p className="text-sm text-ink-2 mb-1 leading-relaxed">
          Tem certeza que deseja excluir{' '}
          <strong className="text-ink">"{list.title || 'Lista sem título'}"</strong>?
        </p>
        <p className="text-sm text-red-600 font-medium mb-5">
          Esta ação não pode ser desfeita. Todos os {list.items_count} itens serão perdidos.
        </p>

        {/* Checkbox de confirmação */}
        <label className="flex items-center gap-2.5 cursor-pointer mb-5 group">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="w-4 h-4 rounded border-border accent-red-500 cursor-pointer"
          />
          <span className="text-sm text-ink-2 group-hover:text-ink transition-colors">
            Entendo que esta ação é irreversível
          </span>
        </label>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-border text-ink-2 hover:bg-bg-2 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !confirmed}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-40 transition-all"
          >
            {loading ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onCreateNew, onLinkList }: { onCreateNew: () => void; onLinkList: () => void }) {
  return (
    <div className="py-10 text-center">
      <div className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg,#EFF6FF,#EDE9FE)' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="5" width="18" height="16" rx="2" stroke="#6366F1" strokeWidth="1.8"/>
          <path d="M7 10h10M7 14h6" stroke="#6366F1" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M8 2v4M16 2v4" stroke="#3B82F6" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </div>
      <p className="font-display font-bold text-ink text-base mb-1">Nenhuma lista ainda</p>
      <p className="text-sm text-ink-2 max-w-xs mx-auto mb-8">
        Crie uma nova lista com IA ou vincule uma lista que você já tem.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
        <button
          onClick={onCreateNew}
          className="flex flex-col items-start gap-3 p-5 rounded-2xl gradient-bg shadow-btn hover:opacity-95 hover:scale-[1.01] transition-all text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"
                stroke="white" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p className="text-white font-display font-bold text-sm">Criar com IA</p>
            <p className="text-white/80 text-xs mt-0.5 leading-relaxed">Conte sobre seu imóvel e gere uma lista personalizada</p>
          </div>
        </button>

        <button
          onClick={onLinkList}
          className="flex flex-col items-start gap-3 p-5 rounded-2xl border-2 border-border bg-white shadow-card hover:border-wm-blue hover:shadow-btn transition-all text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-wm-blue/10 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p className="text-ink font-display font-bold text-sm">Vincular lista</p>
            <p className="text-ink-2 text-xs mt-0.5 leading-relaxed">Adicione uma lista existente à sua conta</p>
          </div>
        </button>
      </div>
    </div>
  )
}

// ── Link form ─────────────────────────────────────────────────────────────────

function LinkForm({ onLinked, onCancel }: { onLinked: () => void; onCancel: () => void }) {
  const [token,   setToken]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  async function handleLink() {
    const t = token.trim()
    if (!t) { setError('Cole o token da lista.'); return }
    setError(null)
    setLoading(true)
    try {
      await userApi.claimList(t)
      onLinked()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Token inválido ou lista já vinculada')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-border p-4 shadow-card space-y-3">
      <p className="text-xs text-ink-2 leading-relaxed">
        Cole o token de edição da lista. Ele fica na URL após{' '}
        <span className="font-mono bg-bg text-ink px-1 rounded">?lista=</span>
      </p>
      <input
        type="text"
        placeholder="Cole o token aqui..."
        value={token}
        onChange={(e) => { setToken(e.target.value); setError(null) }}
        onKeyDown={(e) => e.key === 'Enter' && handleLink()}
        autoFocus
        className="w-full px-3 py-2.5 border border-border rounded-xl text-sm text-ink bg-bg placeholder-ink-3 outline-none focus:border-wm-blue focus:ring-2 focus:ring-wm-blue/10 transition-all font-mono"
      />
      {error && <p className="text-xs text-red-600">⚠️ {error}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleLink}
          disabled={loading || !token.trim()}
          className="flex-1 py-2.5 rounded-xl font-semibold text-sm gradient-bg text-white shadow-btn hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {loading ? 'Vinculando...' : 'Vincular →'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-border text-ink-2 hover:bg-bg transition-all"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

// ── Paginação ─────────────────────────────────────────────────────────────────

function Pagination({
  page, totalPages, pageSize, total, onPage, onPageSize,
}: {
  page: number; totalPages: number; pageSize: PageSize
  total: number; onPage: (p: number) => void; onPageSize: (s: PageSize) => void
}) {
  if (total === 0) return null
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-border">
      <div className="flex items-center gap-2 text-xs text-ink-2">
        <span>Por página:</span>
        {([10, 25, 50, 100] as PageSize[]).map((s) => (
          <button
            key={s}
            onClick={() => { onPageSize(s); onPage(1) }}
            className={[
              'px-2.5 py-1 rounded-lg font-semibold border transition-all',
              pageSize === s
                ? 'border-wm-blue bg-wm-blue/5 text-wm-blue'
                : 'border-border text-ink-2 hover:border-wm-blue hover:text-wm-blue',
            ].join(' ')}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-ink-2">
          {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} de {total}
        </span>
        <button
          onClick={() => onPage(page - 1)} disabled={page === 1}
          className="w-8 h-8 rounded-xl border border-border flex items-center justify-center text-ink-2 hover:border-wm-blue hover:text-wm-blue disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <button
          onClick={() => onPage(page + 1)} disabled={page >= totalPages}
          className="w-8 h-8 rounded-xl border border-border flex items-center justify-center text-ink-2 hover:border-wm-blue hover:text-wm-blue disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

// ── Toast simples local ───────────────────────────────────────────────────────

function AreaToast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={[
      'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-modal animate-fade-in',
      type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white',
    ].join(' ')}>
      {msg}
    </div>
  )
}

// ── ComprasTab ────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(n)
}

function topItem(itens: RecommendedItem[]): RecommendedItem | undefined {
  return itens.find((i) => i.badge === 'melhor_custo_beneficio') ?? itens[0]
}

function ComprasTab({ onGoToCompra, onOpenQuery }: { onGoToCompra: () => void; onOpenQuery: (q: ShoppingQuery) => void }) {
  const [queries,  setQueries]  = useState<ShoppingQuery[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

  useEffect(() => { fetchQueries() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchQueries() {
    setLoading(true)
    setError(null)
    try {
      const data = await comprasApi.list()
      setQueries(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar histórico')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-ink-3">
        <div className="w-6 h-6 border-2 border-border border-t-wm-blue rounded-full animate-spin" />
        <p className="text-sm">Carregando histórico...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-5 text-sm text-red-700 text-center">
        ⚠️ {error}
        <button onClick={fetchQueries} className="mt-2 block mx-auto text-xs underline">Tentar novamente</button>
      </div>
    )
  }

  if (queries.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#EFF6FF,#EDE9FE)' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"
              stroke="#6366F1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="font-display font-bold text-ink text-base mb-1">Nenhuma consulta ainda</p>
        <p className="text-sm text-ink-2 max-w-xs mx-auto mb-6">
          Use "Me ajude a comprar" para comparar produtos e encontrar os melhores preços.
        </p>
        <button
          onClick={onGoToCompra}
          className="px-6 py-3 rounded-xl text-sm font-semibold gradient-bg text-white shadow-btn hover:opacity-90 transition-all"
        >
          🛒 Começar a comparar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {queries.map((q) => {
        const best = topItem(q.itens)
        const date = new Date(q.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })

        return (
          <div
            key={q.id}
            className="w-full bg-white rounded-2xl border border-border overflow-hidden shadow-card hover:shadow-btn hover:border-wm-blue/40 transition-all group flex"
          >
            {/* Borda lateral */}
            <div className="w-1 flex-shrink-0" style={{ background: 'linear-gradient(180deg, #3B82F6 0%, #6366F1 100%)' }} />

            <button
              onClick={() => onOpenQuery(q)}
              className="flex-1 p-4 text-left min-w-0"
            >
              {/* Mobile */}
              <div className="md:hidden">
                <p className="font-display font-bold text-ink text-sm leading-snug truncate group-hover:text-wm-blue transition-colors">
                  {q.nome}
                </p>
                <p className="text-xs text-ink-3 mt-0.5">{date} · {q.itens.length} opções</p>
                {best && (
                  <p className="text-xs text-ink-2 mt-1">
                    ⭐ Destaque: <span className="font-medium">{best.nome}</span> — {fmt(best.preco)}
                  </p>
                )}
              </div>

              {/* Desktop */}
              <div className="hidden md:flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-ink text-sm truncate group-hover:text-wm-blue transition-colors">
                    {q.nome}
                  </p>
                  <p className="text-[11px] text-ink-3 mt-0.5">{date}</p>
                </div>
                {best && (
                  <div className="flex-1 min-w-0 hidden lg:block">
                    <p className="text-xs text-ink-2 truncate">⭐ {best.nome}</p>
                    <p className="text-xs font-bold text-ink">{fmt(best.preco)}</p>
                  </div>
                )}
                <span className="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap border"
                  style={{ background: 'linear-gradient(135deg,#EFF6FF,#EDE9FE)', color: '#4F46E5', borderColor: '#C7D2FE' }}>
                  {q.itens.length} opções
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  className="text-ink-3 group-hover:text-wm-blue transition-colors flex-shrink-0">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            </button>
          </div>
        )
      })}
    </div>
  )
}

// ── UserAreaPage ──────────────────────────────────────────────────────────────

export function UserAreaPage({ onCreateNew, onGoToCompra, onOpenQuery }: Props) {
  const user            = useAuthStore((s) => s.user)
  const setTokenAndInit = useListStore((s) => s.setTokenAndInit)

  const [areaTab, setAreaTab] = useState<AreaTab>('mudancas')

  const [lists,        setLists]        = useState<UserList[]>([])
  const [listsLoading, setListsLoading] = useState(true)
  const [listsError,   setListsError]   = useState<string | null>(null)
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [search,       setSearch]       = useState('')
  const [page,         setPage]         = useState(1)
  const [pageSize,     setPageSize]     = useState<PageSize>(10)

  // Editar / excluir
  const [renameTarget, setRenameTarget] = useState<UserList | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<UserList | null>(null)

  // Toast local (não usa o Toast do store)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => { fetchLists() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchLists() {
    setListsLoading(true)
    setListsError(null)
    try {
      const data = await userApi.getLists()
      setLists(data)
    } catch (e) {
      setListsError(e instanceof Error ? e.message : 'Erro ao carregar listas')
    } finally {
      setListsLoading(false)
    }
  }

  async function handleLinked() {
    setShowLinkForm(false)
    showToast('Lista vinculada com sucesso!')
    await fetchLists()
  }

  // ── Renomear ────────────────────────────────────────────────────────────────
  async function handleRename(newTitle: string) {
    if (!renameTarget) return
    await listApi.rename(renameTarget.edit_token, newTitle)
    // Atualização otimista
    setLists((prev) => prev.map((l) => l.id === renameTarget.id ? { ...l, title: newTitle } : l))
    setRenameTarget(null)
    showToast('Lista renomeada!')
  }

  // ── Excluir ─────────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return
    await listApi.delete(deleteTarget.edit_token)
    setLists((prev) => prev.filter((l) => l.id !== deleteTarget.id))
    setDeleteTarget(null)
    showToast('Lista excluída.')
    // Volta para página anterior se ficar sem itens na paginação atual
    const remaining = filteredLists.length - 1
    const newTotalPages = Math.max(1, Math.ceil(remaining / pageSize))
    if (page > newTotalPages) setPage(newTotalPages)
  }

  const filteredLists  = search.trim()
    ? lists.filter((l) => (l.title || '').toLowerCase().includes(search.trim().toLowerCase()))
    : lists
  const totalPages     = Math.max(1, Math.ceil(filteredLists.length / pageSize))
  const paginatedLists = filteredLists.slice((page - 1) * pageSize, page * pageSize)

  const email       = user?.email ?? ''
  const totalCount  = lists.length
  const doneCount   = lists.filter((l) => l.items_count > 0 && l.items_bought === l.items_count).length
  const activeCount = totalCount - doneCount

  return (
    <div className="w-full max-w-3xl mx-auto">

      {/* ── Hero header ──────────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-5 mb-6 border border-blue-100"
        style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 60%, #EDE9FE 100%)' }}
      >
        {/* Linha superior: título + ações */}
        {/* Linha superior: título + email */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="font-display font-bold text-2xl gradient-text leading-tight">
              Minha área
            </h2>
            <p className="text-xs text-ink-3 mt-0.5 truncate max-w-[220px]">{email}</p>
          </div>
        </div>

        {/* Submenus */}
        <div className="flex gap-2 bg-white/60 rounded-xl p-1 border border-blue-100">
          <button
            onClick={() => setAreaTab('mudancas')}
            className={[
              'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-[9px] text-sm font-semibold transition-all',
              areaTab === 'mudancas'
                ? 'gradient-bg text-white shadow-btn'
                : 'text-ink-3 hover:text-ink',
            ].join(' ')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Minhas mudanças
          </button>
          <button
            onClick={() => setAreaTab('compras')}
            className={[
              'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-[9px] text-sm font-semibold transition-all',
              areaTab === 'compras'
                ? 'gradient-bg text-white shadow-btn'
                : 'text-ink-3 hover:text-ink',
            ].join(' ')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Minhas compras
          </button>
        </div>

        {/* Ações específicas da aba — só mudanças tem vincular/nova lista */}
        {areaTab === 'mudancas' && (
          <div className="flex items-center gap-2 mt-3 justify-end">
            {!showLinkForm && (
              <button
                onClick={() => setShowLinkForm(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-white border border-border text-ink-2 hover:border-wm-blue hover:text-wm-blue shadow-card transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                <span className="hidden sm:inline">Vincular</span>
              </button>
            )}
            <button
              onClick={onCreateNew}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold gradient-bg text-white shadow-btn hover:opacity-90 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
              <span className="hidden sm:inline">Nova lista</span>
              <span className="sm:hidden">Nova</span>
            </button>
          </div>
        )}

        {areaTab === 'compras' && (
          <div className="flex items-center gap-2 mt-3 justify-end">
            <button
              onClick={onGoToCompra}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold gradient-bg text-white shadow-btn hover:opacity-90 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="white" strokeWidth="2"/>
                <path d="M21 21l-4.35-4.35" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span className="hidden sm:inline">Nova consulta</span>
              <span className="sm:hidden">Buscar</span>
            </button>
          </div>
        )}

        {/* Pills de stats — só na aba mudanças e quando há listas */}
        {areaTab === 'mudancas' && totalCount > 0 && (
          <div className="flex gap-2 flex-wrap mt-4">
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/80 border border-blue-200 text-wm-blue">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 10h10M7 14h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {totalCount} {totalCount === 1 ? 'lista' : 'listas'}
            </span>
            {doneCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/80 border border-emerald-200 text-emerald-600">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5L8 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {doneCount} concluída{doneCount !== 1 ? 's' : ''}
              </span>
            )}
            {activeCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/80 border border-indigo-200 text-indigo-600">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
                {activeCount} em andamento
              </span>
            )}
          </div>
        )}

        {/* Barra de busca — só na aba mudanças */}
        {areaTab === 'mudancas' && totalCount > 0 && (
          <div className="relative mt-3">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar pelo nome da mudança..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-9 pr-9 py-2.5 bg-white/80 border border-blue-100 rounded-xl text-sm text-ink placeholder-ink-3 outline-none focus:border-wm-blue focus:ring-2 focus:ring-wm-blue/10 transition-all"
            />
            {search && (
              <button
                onClick={() => { setSearch(''); setPage(1) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Aba Minhas compras ────────────────────────────────────────────────── */}
      {areaTab === 'compras' && (
        <ComprasTab onGoToCompra={onGoToCompra} onOpenQuery={onOpenQuery} />
      )}

      {/* ── Aba Minhas mudanças ───────────────────────────────────────────────── */}
      {areaTab === 'mudancas' && (
      <>

      {/* ── Formulário de vínculo ─────────────────────────────────────────────── */}
      {showLinkForm && (
        <div className="mb-4">
          <LinkForm onLinked={handleLinked} onCancel={() => setShowLinkForm(false)} />
        </div>
      )}

      {/* ── Conteúdo principal ────────────────────────────────────────────────── */}
      {listsLoading ? (
        <div className="flex flex-col items-center gap-3 py-16 text-ink-3">
          <div className="w-6 h-6 border-2 border-border border-t-wm-blue rounded-full animate-spin" />
          <p className="text-sm">Carregando listas...</p>
        </div>
      ) : listsError ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-5 text-sm text-red-700 text-center">
          ⚠️ {listsError}
          <button onClick={fetchLists} className="mt-2 block mx-auto text-xs underline">
            Tentar novamente
          </button>
        </div>
      ) : lists.length === 0 ? (
        <EmptyState onCreateNew={onCreateNew} onLinkList={() => setShowLinkForm(true)} />
      ) : filteredLists.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-ink-2 text-sm">
            Nenhuma lista encontrada para <strong>"{search}"</strong>
          </p>
          <button onClick={() => setSearch('')} className="mt-2 text-xs text-wm-blue underline">
            Limpar busca
          </button>
        </div>
      ) : (
        <>
          {/* Cabeçalho de colunas — desktop */}
          <div
            className="hidden md:flex items-center gap-4 px-5 py-2 rounded-xl mb-1 text-xs font-bold uppercase tracking-wider text-indigo-500"
            style={{ background: 'linear-gradient(90deg,#EFF6FF,#EDE9FE)' }}
          >
            <span className="flex-1">Lista</span>
            <span className="w-36">Progresso</span>
            <span className="w-28 text-center">Status</span>
            <span className="w-14" />
          </div>

          {/* Cards */}
          <div className="space-y-2">
            {paginatedLists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                onOpen={() => setTokenAndInit(list.edit_token)}
                onRename={() => setRenameTarget(list)}
                onDelete={() => setDeleteTarget(list)}
              />
            ))}
          </div>

          {/* Paginação */}
          <Pagination
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            total={filteredLists.length}
            onPage={setPage}
            onPageSize={setPageSize}
          />
        </>
      )}

      </> // fim areaTab === 'mudancas'
      )}

      {/* ── Modais ───────────────────────────────────────────────────────────── */}
      {renameTarget && (
        <RenameModal
          list={renameTarget}
          onSave={handleRename}
          onCancel={() => setRenameTarget(null)}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          list={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* ── Toast local ───────────────────────────────────────────────────────── */}
      {toast && <AreaToast msg={toast.msg} type={toast.type} />}
    </div>
  )
}
