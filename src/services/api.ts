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

export class ApiError extends Error {
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
  nome:            string
  descricao:       string
  imagem_query:    string
  loja:            string
  preco:           number
  preco_estimado:  boolean   // true = preço gerado pela IA; false = preço real da loja (ML)
  avaliacao:       number
  pontos_fortes:   string[]
  pontos_fracos:   string[]
  badge:           'melhor_custo_beneficio' | 'mais_barato' | 'mais_caro' | null
  link:            string
}

export interface RecommendResult {
  itens: RecommendedItem[]
}

export const recommendApi = {
  get: (nome: string, amb: string, cat: string, preco_min: number, preco_max: number) =>
    request<RecommendResult>('POST', '/items/recommend', { nome, amb, cat, preco_min, preco_max }),
}

// ── Histórico de compras ──────────────────────────────────────────────────────

export interface ShoppingQuery {
  id:         string
  nome:       string
  preco_min:  number | null
  preco_max:  number | null
  itens:      RecommendedItem[]
  created_at: string
}

export const comprasApi = {
  save: (nome: string, preco_min: number | null, preco_max: number | null, itens: RecommendedItem[]) =>
    request<ShoppingQuery>('POST', '/me/compras', { nome, preco_min, preco_max, itens }),

  list: () =>
    request<ShoppingQuery[]>('GET', '/me/compras'),
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

// ── Admin ─────────────────────────────────────────────────────────────────────

export interface AdminMetrics {
  users:           { total: number; last_24h: number; last_7d: number }
  lists:           { total: number; last_24h: number; last_7d: number }
  recommendations: { total: number; last_24h: number; last_7d: number }
  plans:           { free: number; essencial: number; familia: number; pro: number }
  paid_users:      number
  conversion_rate: number
  generated_at:    string
}

export interface AdminUser {
  id:              string
  email:           string
  full_name:       string | null
  avatar_url:      string | null
  provider:        string
  created_at:      string
  last_sign_in_at: string | null
  role:            'user' | 'admin'
  plan:            'free' | 'essencial' | 'familia' | 'pro'
  plan_expires_at: string | null
}

export interface AdminUsersResult {
  users: AdminUser[]
  total: number
  page:  number
  limit: number
}

export const paymentApi = {
  createCheckout: (plan: 'essencial' | 'familia', listToken?: string | null) =>
    request<{ url: string }>('POST', '/payments/checkout', { plan, list_token: listToken ?? undefined }),
}

export const adminApi = {
  getMetrics: () =>
    request<AdminMetrics>('GET', '/admin/metrics'),

  getUsers: (page = 1, limit = 50, search = '') =>
    request<AdminUsersResult>('GET', `/admin/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`),

  updateUserRole: (
    userId: string,
    updates: { role?: 'user' | 'admin'; plan?: 'free' | 'essencial' | 'familia' | 'pro'; plan_expires_at?: string | null }
  ) =>
    request<{ user_id: string; role: string; plan: string }>('PATCH', `/admin/users/${userId}/role`, updates),
}
