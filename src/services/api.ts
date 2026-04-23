/**
 * Camada de serviço da WeMove API.
 *
 * Todas as chamadas HTTP passam por aqui — nenhum fetch espalhado nos componentes.
 * A URL base vem de variável de ambiente (VITE_API_URL), nunca hardcodada.
 * O token de autenticação é injetado automaticamente quando o usuário está logado.
 */

import type {
  ListData,
  Item,
  CreateListPayload,
  UpdateListPayload,
  CreateItemPayload,
  UpdateItemPayload,
  ShareLinks,
  GenerateListPayload,
  GenerateListResult,
} from '../types'
import { getAccessToken } from '../lib/supabase'

const BASE_URL = import.meta.env.VITE_API_URL as string

if (!BASE_URL) {
  throw new Error('VITE_API_URL não definida. Verifique seu arquivo .env')
}

// ── Helper interno ────────────────────────────────────────────────────────────

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }

  // Injeta token de auth quando disponível
  const token = await getAccessToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new ApiError(
      (err as { error?: string }).error ?? `HTTP ${res.status}`,
      res.status,
    )
  }

  return res.json() as Promise<T>
}

// ── Listas ────────────────────────────────────────────────────────────────────

export const listApi = {
  get: (token: string) =>
    request<ListData>('GET', `/lists/${token}`),

  create: (payload?: CreateListPayload) =>
    request<Pick<ListData, 'id' | 'title' | 'edit_token' | 'view_token' | 'created_at'>>(
      'POST', '/lists', payload ?? {},
    ),

  update: (token: string, payload: UpdateListPayload) =>
    request<{ ok: boolean }>('PATCH', `/lists/${token}`, payload),

  rename: (token: string, title: string) =>
    request<{ ok: boolean }>('PATCH', `/lists/${token}`, { title }),

  delete: (token: string) =>
    request<{ ok: boolean }>('DELETE', `/lists/${token}`),

  share: (token: string) =>
    request<ShareLinks>('GET', `/lists/${token}/share`),

  generate: (payload: GenerateListPayload) =>
    request<GenerateListResult>('POST', '/lists/generate', payload),
}

// ── Itens ─────────────────────────────────────────────────────────────────────

export const itemApi = {
  create: (token: string, payload: CreateItemPayload) =>
    request<Item>('POST', `/lists/${token}/items`, payload),

  update: (token: string, itemId: string, payload: UpdateItemPayload) =>
    request<Item>('PATCH', `/lists/${token}/items/${itemId}`, payload),

  remove: (token: string, itemId: string) =>
    request<{ ok: boolean; deleted: string }>('DELETE', `/lists/${token}/items/${itemId}`),
}

// ── Sugestão de item ──────────────────────────────────────────────────────────

export interface SuggestItemResult {
  inappropriate: boolean
  reason?: string
  preco_min?: number
  preco_max?: number
  obs?: string
}

export const suggestApi = {
  suggest: (nome: string, amb: string, cat: string) =>
    request<SuggestItemResult>('POST', '/items/suggest', { nome, amb, cat }),
}

// ── Recomendações de compra ───────────────────────────────────────────────────

export interface RecommendedItem {
  nome:          string
  descricao:     string
  imagem_query:  string
  loja:          string
  preco:         number
  avaliacao:     number
  pontos_fortes: string[]
  pontos_fracos: string[]
  badge:         'melhor_custo_beneficio' | 'mais_barato' | 'mais_caro' | null
  link:          string
}

export interface RecommendResult {
  itens: RecommendedItem[]
}

export const recommendApi = {
  get: (nome: string, amb: string, cat: string, preco_min: number, preco_max: number) =>
    request<RecommendResult>('POST', '/items/recommend', { nome, amb, cat, preco_min, preco_max }),
}

// ── Usuário autenticado ───────────────────────────────────────────────────────

export interface UserList {
  id: string
  title: string
  edit_token: string
  view_token?: string
  created_at: string
  items_count: number
  items_bought: number
}

export const userApi = {
  getLists: () =>
    request<UserList[]>('GET', '/me/lists'),

  claimList: (token: string) =>
    request<{ ok: boolean; list_id: string }>('POST', '/me/lists/claim', { token }),
}
