/**
 * UserAreaPage — área logada do usuário.
 *
 * Exibe todas as listas associadas à conta, permite abrir uma lista,
 * vincular uma lista existente pelo token e fazer logout.
 */

import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useListStore } from '../store/useListStore'
import { userApi, type UserList } from '../services/api'
import { WeMoveIcon } from '../components/WeMoveIcon'

interface Props {
  onBack: () => void
}

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

function ListCard({ list, onOpen }: { list: UserList; onOpen: () => void }) {
  const pct = list.items_count === 0 ? 0 : Math.round((list.items_bought / list.items_count) * 100)
  const date = new Date(list.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <button
      onClick={onOpen}
      className="w-full text-left bg-white rounded-2xl border border-border p-4 shadow-card hover:border-wm-blue hover:shadow-btn transition-all group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="font-display font-bold text-ink text-sm leading-snug truncate group-hover:text-wm-blue transition-colors">
            {list.title || 'Lista sem título'}
          </p>
          <p className="text-xs text-ink-3 mt-0.5">{date}</p>
        </div>
        <span className={[
          'flex-shrink-0 text-xs font-semibold px-2 py-1 rounded-full border',
          pct === 100
            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
            : 'bg-blue-50 text-wm-blue border-blue-200',
        ].join(' ')}>
          {pct === 100 ? '✓ Concluída' : `${pct}%`}
        </span>
      </div>

      <ProgressBar value={list.items_bought} total={list.items_count} />

      <p className="text-xs text-ink-3 mt-2">
        {list.items_bought} de {list.items_count} {list.items_count === 1 ? 'item comprado' : 'itens comprados'}
      </p>
    </button>
  )
}

export function UserAreaPage({ onBack }: Props) {
  const user        = useAuthStore((s) => s.user)
  const signOut     = useAuthStore((s) => s.signOut)
  const setTokenAndInit = useListStore((s) => s.setTokenAndInit)

  const [lists,       setLists]       = useState<UserList[]>([])
  const [listsLoading, setListsLoading] = useState(true)
  const [listsError,   setListsError]   = useState<string | null>(null)
  const [linkToken,    setLinkToken]    = useState('')
  const [linking,      setLinking]      = useState(false)
  const [linkError,    setLinkError]    = useState<string | null>(null)
  const [linkSuccess,  setLinkSuccess]  = useState<string | null>(null)
  const [showLinkForm, setShowLinkForm] = useState(false)

  useEffect(() => {
    fetchLists()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

  async function handleLink() {
    const t = linkToken.trim()
    if (!t) { setLinkError('Cole o token da lista.'); return }
    setLinkError(null)
    setLinking(true)
    try {
      await userApi.claimList(t)
      setLinkSuccess('Lista vinculada com sucesso!')
      setLinkToken('')
      setShowLinkForm(false)
      await fetchLists()
    } catch (e) {
      setLinkError(e instanceof Error ? e.message : 'Token inválido ou lista já vinculada')
    } finally {
      setLinking(false)
    }
  }

  async function handleSignOut() {
    await signOut()
    onBack()
  }

  function openList(editToken: string) {
    setTokenAndInit(editToken)
  }

  const email = user?.email ?? ''

  return (
    <div className="flex flex-col items-center">
      {/* Back */}
      <button
        onClick={onBack}
        className="self-start flex items-center gap-2 text-sm text-ink-2 hover:text-ink transition-colors mb-8"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        Voltar
      </button>

      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center shadow-btn">
              <WeMoveIcon size={22} />
            </div>
            <div>
              <p className="font-display font-bold text-ink text-base">Minha conta</p>
              <p className="text-xs text-ink-2 truncate max-w-[200px]">{email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-border text-ink-2 hover:border-red-300 hover:text-red-600 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sair
          </button>
        </div>

        {/* Link success */}
        {linkSuccess && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700">
            ✓ {linkSuccess}
          </div>
        )}

        {/* Lists section */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display font-bold text-ink text-sm">Minhas listas</h3>
          <button
            onClick={() => { setShowLinkForm((v) => !v); setLinkError(null) }}
            className="flex items-center gap-1.5 text-xs font-semibold text-wm-blue hover:opacity-80 transition-opacity"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Vincular lista
          </button>
        </div>

        {/* Link form */}
        {showLinkForm && (
          <div className="mb-4 bg-white rounded-2xl border border-border p-4 shadow-card space-y-3">
            <p className="text-xs text-ink-2 leading-relaxed">
              Cole o token de edição da lista que deseja vincular à sua conta.
              O token fica na URL após <span className="font-mono bg-bg text-ink px-1 rounded">?lista=</span>
            </p>
            <input
              type="text"
              placeholder="Cole o token aqui..."
              value={linkToken}
              onChange={(e) => { setLinkToken(e.target.value); setLinkError(null) }}
              onKeyDown={(e) => e.key === 'Enter' && handleLink()}
              autoFocus
              className="w-full px-3 py-2.5 border border-border rounded-xl text-sm text-ink bg-bg placeholder-ink-3 outline-none focus:border-wm-blue focus:ring-2 focus:ring-wm-blue/10 transition-all font-mono"
            />
            {linkError && (
              <p className="text-xs text-red-600">⚠️ {linkError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleLink}
                disabled={linking || !linkToken.trim()}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm gradient-bg text-white shadow-btn hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {linking ? 'Vinculando...' : 'Vincular →'}
              </button>
              <button
                onClick={() => { setShowLinkForm(false); setLinkError(null); setLinkToken('') }}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-border text-ink-2 hover:bg-bg transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lists */}
        {listsLoading ? (
          <div className="flex flex-col items-center gap-3 py-12 text-ink-3">
            <div className="w-6 h-6 border-2 border-border border-t-wm-blue rounded-full animate-spin" />
            <p className="text-sm">Carregando listas...</p>
          </div>
        ) : listsError ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-4 text-sm text-red-700 text-center">
            ⚠️ {listsError}
            <button onClick={fetchLists} className="mt-2 block mx-auto text-xs underline">
              Tentar novamente
            </button>
          </div>
        ) : lists.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-bg border border-border flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5" width="18" height="16" rx="2" stroke="#94A3B8" strokeWidth="1.8"/>
                <path d="M7 10h10M7 14h6" stroke="#94A3B8" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="font-display font-bold text-ink text-sm mb-1">Nenhuma lista ainda</p>
            <p className="text-xs text-ink-2 leading-relaxed max-w-xs mx-auto">
              Crie uma nova lista pela tela inicial ou vincule uma lista existente usando o botão acima.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {lists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                onOpen={() => openList(list.edit_token)}
              />
            ))}
          </div>
        )}

        {/* Avatar initial indicator */}
        {lists.length > 0 && (
          <p className="text-center text-xs text-ink-3 mt-6">
            {lists.length} {lists.length === 1 ? 'lista' : 'listas'} na sua conta
          </p>
        )}
      </div>
    </div>
  )
}
