/**
 * Store global do WeMove usando Zustand.
 *
 * Toda a lógica de estado e side-effects (chamadas API) fica aqui.
 * Os componentes apenas lêem o estado e chamam as actions — sem fetch direto.
 */

import { create } from 'zustand'
import { listApi, itemApi } from '../services/api'
import { INITIAL_ITEMS } from '../data/initialItems'
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

  // UI
  filter: FilterType
  tab: TabType
  loading: boolean
  loadingMessage: string
  error: string | null

  // actions — inicialização
  initList: () => Promise<void>
  refreshItems: () => Promise<void>

  // actions — itens
  addItem: (payload: CreateItemPayload) => Promise<Item>
  updateItem: (itemId: string, payload: UpdateItemPayload) => Promise<Item>
  removeItem: (itemId: string) => Promise<void>
  markBought: (itemId: string, gasto: number, loja: string) => Promise<void>
  unmarkBought: (itemId: string) => Promise<void>

  // actions — UI
  setFilter: (filter: FilterType) => void
  setTab: (tab: TabType) => void
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

const BATCH_SIZE = 8

// ── Store ─────────────────────────────────────────────────────────────────────

export const useListStore = create<ListStore>((set, get) => ({
  token: null,
  permission: 'edit',
  listTitle: '',
  items: [],
  filter: 'todos',
  tab: 'lista',
  loading: false,
  loadingMessage: '',
  error: null,

  // ── Inicialização ──────────────────────────────────────────────────────────

  initList: async () => {
    const urlToken = getTokenFromUrl()
    set({ loading: true, loadingMessage: urlToken ? '⏳ carregando lista...' : '⏳ criando lista...', error: null })

    try {
      if (urlToken) {
        // Lista existente
        const data = await listApi.get(urlToken)
        set({
          token: urlToken,
          permission: data.permission,
          listTitle: data.title,
          items: data.items,
          loading: false,
          loadingMessage: '',
        })
      } else {
        // Nova lista — cria e pré-popula
        const created = await listApi.create({ title: 'Minha Mudança — Família Novais' })
        const newToken = created.edit_token
        setTokenInUrl(newToken)
        set({ token: newToken, permission: 'edit', listTitle: created.title, loadingMessage: '⏳ importando itens...' })

        const allItems: Item[] = []
        for (let i = 0; i < INITIAL_ITEMS.length; i += BATCH_SIZE) {
          const batch = INITIAL_ITEMS.slice(i, i + BATCH_SIZE)
          const results = await Promise.all(
            batch.map((item) => itemApi.create(newToken, item)),
          )
          allItems.push(...results)
          set({ loadingMessage: `⏳ importando... ${allItems.length}/${INITIAL_ITEMS.length}` })
        }

        set({ items: allItems, loading: false, loadingMessage: '' })
      }
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

  // ── UI ─────────────────────────────────────────────────────────────────────

  setFilter: (filter) => set({ filter }),
  setTab: (tab) => set({ tab }),
}))
