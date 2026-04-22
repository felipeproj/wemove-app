/**
 * UserAreaPage — área logada do usuário.
 *
 * Exibe todas as listas associadas à conta com paginação,
 * permite abrir, vincular e criar novas listas.
 */

import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useListStore } from '../store/useListStore'
import { userApi, type UserList } from '../services/api'

interface Props {
  onCreateNew: () => void   // navega para o fluxo de geração de lista
}

type PageSize = 10 | 25 | 50 | 100

// ── Barra de progresso ────────────────────────────────────────────────────────

function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100)
  return (
    <div className="w-full h-1.5 bg-bg rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{
          width: `${pct}%`,
          background: pct === 100 ? '#10B981' : 'linear-gradient(90deg, #3B82F6, #6366F1)',
        }}
      />
    </div>
  )
}

// ── Card de lista (mobile) / Row (desktop) ────────────────────────────────────

function ListRow({ list, onOpen }: { list: UserList; onOpen: () => void }) {
  const pct = list.items_count === 0 ? 0 : Math.round((list.items_bought / list.items_count) * 100)
  const date = new Date(list.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

  return (
    <button
      onClick={onOpen}
      className="w-full text-left bg-white rounded-2xl border border-border p-4 shadow-card hover:border-wm-blue hover:shadow-btn transition-all group"
    >
      {/* Mobile layout */}
      <div className="flex items-start justify-between gap-3 mb-2 md:hidden">
        <div className="min-w-0">
          <p className="font-display font-bold text-ink text-sm leading-snug truncate group-hover:text-wm-blue transition-colors">
            {list.title || 'Lista sem título'}
          </p>
          <p className="text-xs text-ink-3 mt-0.5">{date}</p>
        </div>
        <StatusBadge pct={pct} />
      </div>
      <div className="md:hidden">
        <ProgressBar value={list.items_bought} total={list.items_count} />
        <p className="text-xs text-ink-3 mt-1.5">
          {list.items_bought} de {list.items_count} {list.items_count === 1 ? 'item' : 'itens'} comprados
        </p>
      </div>

      {/* Desktop layout — row estilo tabela */}
      <div className="hidden md:flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold text-ink text-sm truncate group-hover:text-wm-blue transition-colors">
            {list.title || 'Lista sem título'}
          </p>
        </div>
        <p className="text-xs text-ink-3 whitespace-nowrap w-28 text-right">{date}</p>
        <div className="w-32">
          <ProgressBar value={list.items_bought} total={list.items_count} />
          <p className="text-[11px] text-ink-3 mt-1">
            {list.items_bought}/{list.items_count} itens
          </p>
        </div>
        <StatusBadge pct={pct} />
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-ink-3 group-hover:text-wm-blue transition-colors flex-shrink-0">
          <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
    </button>
  )
}

function StatusBadge({ pct }: { pct: number }) {
  return (
    <span className={[
      'flex-shrink-0 text-xs font-semibold px-2 py-1 rounded-full border',
      pct === 100
        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
        : 'bg-blue-50 text-wm-blue border-blue-200',
    ].join(' ')}>
      {pct === 100 ? '✓ Concluída' : `${pct}%`}
    </span>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({
  onCreateNew,
  onLinkList,
}: {
  onCreateNew: () => void
  onLinkList: () => void
}) {
  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-bg border border-border flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="5" width="18" height="16" rx="2" stroke="#94A3B8" strokeWidth="1.8"/>
            <path d="M7 10h10M7 14h6" stroke="#94A3B8" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="font-display font-bold text-ink text-base mb-1">Nenhuma lista ainda</p>
        <p className="text-sm text-ink-2 max-w-xs mx-auto">
          Crie uma nova lista com IA ou vincule uma lista que você já tem.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
        {/* Criar nova */}
        <button
          onClick={onCreateNew}
          className="flex flex-col items-start gap-3 p-5 rounded-2xl gradient-bg shadow-btn hover:opacity-95 hover:scale-[1.02] transition-all text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"
                stroke="white" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p className="text-white font-display font-bold text-sm">Criar com IA</p>
            <p className="text-white/80 text-xs mt-0.5">Conte sobre seu imóvel e gere uma lista personalizada</p>
          </div>
        </button>

        {/* Vincular existente */}
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
            <p className="text-ink-2 text-xs mt-0.5">Adicione uma lista existente à sua conta</p>
          </div>
        </button>
      </div>
    </div>
  )
}

// ── Link form inline ──────────────────────────────────────────────────────────

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
  page,
  totalPages,
  pageSize,
  total,
  onPage,
  onPageSize,
}: {
  page: number
  totalPages: number
  pageSize: PageSize
  total: number
  onPage: (p: number) => void
  onPageSize: (s: PageSize) => void
}) {
  if (total === 0) return null

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-border">
      <div className="flex items-center gap-2 text-xs text-ink-2">
        <span>Itens por página:</span>
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
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="w-8 h-8 rounded-xl border border-border flex items-center justify-center text-ink-2 hover:border-wm-blue hover:text-wm-blue disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
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

// ── UserAreaPage ──────────────────────────────────────────────────────────────

export function UserAreaPage({ onCreateNew }: Props) {
  const user            = useAuthStore((s) => s.user)
  const setTokenAndInit = useListStore((s) => s.setTokenAndInit)

  const [lists,        setLists]        = useState<UserList[]>([])
  const [listsLoading, setListsLoading] = useState(true)
  const [listsError,   setListsError]   = useState<string | null>(null)
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [linkSuccess,  setLinkSuccess]  = useState<string | null>(null)
  const [search,       setSearch]       = useState('')

  // paginação
  const [page,     setPage]     = useState(1)
  const [pageSize, setPageSize] = useState<PageSize>(10)

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
    setLinkSuccess('Lista vinculada com sucesso!')
    await fetchLists()
    setTimeout(() => setLinkSuccess(null), 4000)
  }

  // Busca por nome (partial match, case-insensitive)
  const filteredLists = search.trim()
    ? lists.filter((l) =>
        (l.title || '').toLowerCase().includes(search.trim().toLowerCase())
      )
    : lists

  const totalPages     = Math.max(1, Math.ceil(filteredLists.length / pageSize))
  const paginatedLists = filteredLists.slice((page - 1) * pageSize, page * pageSize)

  const email = user?.email ?? ''

  return (
    <div className="w-full max-w-3xl mx-auto">

      {/* Cabeçalho da seção */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-display font-bold text-ink text-lg">Minhas listas</h2>
            <p className="text-xs text-ink-2 mt-0.5 truncate max-w-[200px]">{email}</p>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Botão vincular lista */}
            {!showLinkForm && (
              <button
                onClick={() => setShowLinkForm(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border-2 border-border text-ink-2 hover:border-wm-blue hover:text-wm-blue transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                <span className="hidden sm:inline">Vincular</span>
              </button>
            )}

            {/* Botão nova lista */}
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
        </div>

        {/* Campo de busca */}
        {lists.length > 0 && (
          <div className="relative">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar pelo nome da mudança..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm text-ink bg-white placeholder-ink-3 outline-none focus:border-wm-blue focus:ring-2 focus:ring-wm-blue/10 transition-all"
            />
            {search && (
              <button
                onClick={() => { setSearch(''); setPage(1) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Feedback de vínculo */}
      {linkSuccess && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700">
          ✓ {linkSuccess}
        </div>
      )}

      {/* Formulário de vínculo inline */}
      {showLinkForm && (
        <div className="mb-4">
          <LinkForm
            onLinked={handleLinked}
            onCancel={() => { setShowLinkForm(false) }}
          />
        </div>
      )}

      {/* Estados de loading / erro */}
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
        <EmptyState
          onCreateNew={onCreateNew}
          onLinkList={() => setShowLinkForm(true)}
        />
      ) : filteredLists.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-ink-2 text-sm">Nenhuma lista encontrada para <strong>"{search}"</strong></p>
          <button onClick={() => setSearch('')} className="mt-2 text-xs text-wm-blue underline">
            Limpar busca
          </button>
        </div>
      ) : (
        <>
          {/* Desktop: cabeçalho de colunas */}
          <div className="hidden md:flex items-center gap-4 px-4 pb-2 text-xs font-bold uppercase tracking-wider text-ink-3">
            <span className="flex-1">Lista</span>
            <span className="w-28 text-right">Data</span>
            <span className="w-32">Progresso</span>
            <span className="w-20 text-center">Status</span>
            <span className="w-5" />
          </div>

          {/* Lista de cards */}
          <div className="space-y-2">
            {paginatedLists.map((list) => (
              <ListRow
                key={list.id}
                list={list}
                onOpen={() => setTokenAndInit(list.edit_token)}
              />
            ))}
          </div>

          {/* Paginação */}
          <Pagination
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            total={filteredLists.length}
            onPage={(p) => setPage(p)}
            onPageSize={(s) => setPageSize(s)}
          />
        </>
      )}
    </div>
  )
}
