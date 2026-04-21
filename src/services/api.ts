/**
 * Camada de serviço da WeMove API.
 *
 * Todas as chamadas HTTP passam por aqui — nenhum fetch espalhado nos componentes.
 * A URL base vem de variável de ambiente (VITE_API_URL), nunca hardcodada.
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
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
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
  /** Busca lista + itens pelo edit_token ou view_token */
  get: (token: string) =>
    request<ListData>('GET', `/lists/${token}`),

  /** Cria uma nova lista vazia */
  create: (payload?: CreateListPayload) =>
    request<Pick<ListData, 'id' | 'title' | 'edit_token' | 'view_token' | 'created_at'>>(
      'POST',
      '/lists',
      payload ?? {},
    ),

  /** Atualiza título ou config da lista (requer edit_token) */
  update: (token: string, payload: UpdateListPayload) =>
    request<{ ok: boolean }>('PATCH', `/lists/${token}`, payload),

  /** Gera links de compartilhamento (requer edit_token) */
  share: (token: string) =>
    request<ShareLinks>('GET', `/lists/${token}/share`),

  /** Gera lista personalizada via IA */
  generate: (payload: GenerateListPayload) =>
    request<GenerateListResult>('POST', '/lists/generate', payload),
}

// ── Itens ─────────────────────────────────────────────────────────────────────

export const itemApi = {
  /** Adiciona um item à lista (requer edit_token) */
  create: (token: string, payload: CreateItemPayload) =>
    request<Item>('POST', `/lists/${token}/items`, payload),

  /** Atualiza campos de um item (requer edit_token) */
  update: (token: string, itemId: string, payload: UpdateItemPayload) =>
    request<Item>('PATCH', `/lists/${token}/items/${itemId}`, payload),

  /** Remove um item (requer edit_token) */
  remove: (token: string, itemId: string) =>
    request<{ ok: boolean; deleted: stri