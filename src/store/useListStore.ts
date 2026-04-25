/**
 * Store global do WeMove usando Zustand.
 *
 * Toda a lógica de estado e side-effects (chamadas API) fica aqui.
 * Os componentes apenas lêem o estado e chamam as actions — sem fetch direto.
 */

import { create } from 'zustand'
import { listApi, itemApi } from '../services/api'
import type {
  Item,
  Permission,
  FilterType,
  TabType,
  CreateItemPayload,
  UpdateItemPayload,
} from '../types'

// ── Estado ────────────────────────────────────────────────────────────────────

interface ListStore {
  // dados
  token: string | null
  permission: Permission
  listTitle: string
  items: Item[]
  configJson: Record<string, unknown>

  // UI
  filter: FilterType
  tab: TabType
  loading: boolean
  loadingMessage: string
  error: string | null
  needsSetup: boolean   // true quando não há token na URL → mostra GeneratePage

  // actions — inicialização
  initList: () => Promise<void>
  refreshItems: () => Promise<void>
  setTokenAndInit: (token: string) => Promise<void>

  // actions — itens
  addItem: (payload: CreateItemPayload) => Promise<Item>
  updateItem: (itemId: string, payload: UpdateItemPayload) => Promise<Item>
  removeItem: (itemId: string) => Promise<void>
  markBought: (itemId: string, gasto: number, loja: string) => Promise<void>
  unmarkBought: (itemId: string) => Promise<void>
  reorderItems: (ids: string[]) => Promise<void>

  // actions — UI
  setFilter: (filter: FilterType) => void
  setTab: (tab: TabType) => void
  goToLanding: () => void
  goToAuth: () => void
  goToUserArea: () => void
  goToCompra: () => void
  modalOpen: boolean
  setModalOpen: (open: boolean) => void
  pendingLandingView: 'auth' | 'user-area' | 'compra' | null
  consumePendingView: () => 'auth' | 'user-area' | 'compra' | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTokenFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search)
  return params.get('lista')
}

function setTokenInUrl(token: string): void {
  const url = new URL(window.location.href)
  url.searchParams.set('lista', token)
  window.history.replaceState({}, '', url.toString())
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Reordena os itens conforme o array de IDs salvo em config_json.item_order */
function applyOrder(items: Item[], config: Record<string, unknown>): Item[] {
  const order = config.item_order as string[] | undefined
  if (!order?.length) return items
  const idxMap = new Map(order.map((id, i) => [id, i]))
  return [...items].sort(
    (a, b) => (idxMap.get(a.id) ?? 9999) - (idxMap.get(b.id) ?? 9999),
  )
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useListStore = create<ListStore>((set, get) => ({
  token: null,
  permission: 'edit',
  listTitle: '',
  items: [],
  configJson: {},
  filter: 'todos',
  tab: 'lista',
  loading: false,
  loadingMessage: '',
  error: null,
  needsSetup: false,
  modalOpen: false,
  pendingLandingView: null,

  // ── Inicialização ──────────────────────────────────────────────────────────

  initList: async () => {
    const urlToken = getTokenFromUrl()

    // Sem token → mostrar formulário de geração por IA
    if (!urlToken) {
      set({ needsSetup: true, loading: false, loadingMessage: '', error: null })
      return
    }

    set({ loading: true, loadingMessage: 'Carregando lista...', error: null, needsSetup: false })

    try {
      const data = await listApi.get(urlToken)
      const cfg = (data.config_json ?? {}) as Record<string, unknown>
      set({
        token: urlToken,
        permission: data.permission,
        listTitle: data.title,
        configJson: cfg,
        items: applyOrder(data.items, cfg),
        loading: false,
        loadingMessage: '',
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      set({ loading: false, loadingMessage: '', error: message })
    }
  },

  // Chamado pela GeneratePage após receber o token da IA
  setTokenAndInit: async (token: string) => {
    setTokenInUrl(token)
    // Define permission como 'edit' imediatamente — esta função sempre é chamada
    // com um edit_token (GeneratePage + UserAreaPage). O valor correto vem da API
    // logo depois, mas isso evita que estado obsoleto de 'view' bloqueie os botões.
    set({ needsSetup: false, loading: true, loadingMessage: 'Carregando sua lista...', error: null, permission: 'edit' })
    try {
      const data = await listApi.get(token)
      const cfg = (data.config_json ?? {}) as Record<string, unknown>
      set({
        token,
        permission: data.permission,
        listTitle: data.title,
        configJson: cfg,
        items: applyOrder(data.items, cfg),
        loading: false,
        loadingMessage: '',
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      set({ loading: false, loadingMessage: '', error: message })
    }
  },

  // ── Refresh silencioso (polling) ───────────────────────────────────────────

  refreshItems: async () => {
    const { token } = get()
    if (!token) return
    try {
      const data = await listApi.get(token)
      set({ items: data.items })
    } catch {
      // falha silenciosa — não interrompe o usuário
    }
  },

  // ── Itens ──────────────────────────────────────────────────────────────────

  addItem: async (payload) => {
    const { token } = get()
    if (!token) throw new Error('Lista não inicializada')
    const item = await itemApi.create(token, payload)
    set((s) => ({ items: [...s.items, item] }))
    return item
  },

  updateItem: async (itemId, payload) => {
    const { token } = get()
    if (!token) throw new Error('Lista não inicializada')
    const updated = await itemApi.update(token, itemId, payload)
    set((s) => ({
      items: s.items.map((i) => (i.id === itemId ? updated : i)),
    }))
    return updated
  },

  removeItem: async (itemId) => {
    const { token } = get()
    if (!token) throw new Error('Lista não inicializada')
    await itemApi.remove(token, itemId)
    set((s) => ({ items: s.items.filter((i) => i.id !== itemId) }))
  },

  markBought: async (itemId, gasto, loja) => {
    await get().updateItem(itemId, { comprado: true, gasto, loja })
  },

  unmarkBought: async (itemId) => {
    await get().updateItem(itemId, { comprado: false, gasto: 0, loja: '' })
  },

  reorderItems: async (ids: string[]) => {
    const { token, configJson, items } = get()
    if (!token) return
    const newConfig = { ...configJson, item_order: ids }
    const idxMap = new Map(ids.map((id, i) => [id, i]))
    const sorted = [...items].sort(
      (a, b) => (idxMap.get(a.id) ?? 9999) - (idxMap.get(b.id) ?? 9999),
    )
    // Atualização otimista
    set({ items: sorted, configJson: newConfig })
    try {
      await listApi.update(token, { config_json: newConfig })
    } catch {
      // Rollback em caso de erro
      set({ items, configJson })
    }
  },

  // ── UI ────────────────────────────────────────────────────────────────────

  setFilter: (filter) => set({ filter }),
  setTab: (tab) => set({ tab }),
  setModalOpen: (open) => set({ modalOpen: open }),

  consumePendingView: () => {
    const v = get().pendingLandingView
    set({ pendingLandingView: null })
    return v
  },

  goToLanding: () => {
    // Remove token da URL e reseta o estado para exibir a LandingPage
    const url = new URL(window.location.href)
    url.searchParams.delete('lista')
    window.history.replaceState({}, '', url.toString())
    set({
      needsSetup: true,
      token: null,
      permission: 'edit',   // reset para evitar que 'view' vaze entre sessões
      items: [],
      configJson: {},
      listTitle: '',
      error: null,
      loading: false,
      loadingMessage: '',
      filter: 'todos',
      tab: 'lista',
    })
  },

  goToAuth: () => {
    set({ pendingLandingView: 'auth' })
    get().goToLanding()
  },

  goToUserArea: () => {
    set({ pendingLandingView: 'user-area' })
    get().goToLanding()
  },

  goToCompra: () => {
    set({ pendingLandingView: 'compra' })
    get().goToLanding()
  },
}))
