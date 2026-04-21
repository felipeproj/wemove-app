// ── Domínio ──────────────────────────────────────────────────────────────────

export type Permission = 'edit' | 'view'

export type Priority = 'Alta' | 'Média' | 'Baixa'
export type Category = 'Essencial' | 'Não Essencial'
export type Room =
  | 'Sala'
  | 'Cozinha'
  | 'Quarto Casal'
  | 'Escritório'
  | 'Área de Serviço'
  | 'Banheiro / Lavabo'
  | 'Geral / Tecnologia'

export interface Item {
  id: string
  list_id: string
  nome: string
  amb: Room
  cat: Category
  pri: Priority
  qtd: number
  preco_min: number
  preco_max: number
  obs: string
  comprado: boolean
  gasto: number
  loja: string
  created_at: string
  updated_at: string
}

export interface ListData {
  id: string
  title: string
  config_json: Record<string, unknown>
  edit_token: string
  view_token?: string    // só presente se permission === 'edit'
  permission: Permission
  created_at: string
  updated_at: string
  items: Item[]
}

// ── Payloads da API ───────────────────────────────────────────────────────────

export interface CreateListPayload {
  title?: string
  config_json?: Record<string, unknown>
}

export interface UpdateListPayload {
  title?: string
  config_json?: Record<string, unknown>
}

export interface CreateItemPayload {
  nome: string
  amb: Room
  cat: Category
  pri: Priority
  qtd: number
  preco_min: number
  preco_max: number
  obs?: string
  comprado?: boolean
  gasto?: number
  loja?: string
}

export type UpdateItemPayload = Partial<CreateItemPayload>

export interface ShareLinks {
  edit_link: string
  view_link: string
}

export type Padrao = 'Simples' | 'Médio' | 'Alto'

export interface GenerateListPayload {
  metros: number
  comodos: Room[]
  padrao: Padrao
  orcamento?: number
  ja_possui?: string
}

export interface GenerateListResult {
  edit_token: string
  view_token: string
  list_id: string
  title: string
  items_count: number
}

// ── UI ────────────────────────────────────────────────────────────────────────

export type FilterType =
  | 'todos'
  | 'Essencial'
  | 'Não Essencial'
  | 'Alta'
  | 'Média'
  | 'Baixa'
  | 'comprados'
  | 'pendentes'

export type TabType = 'lista' | 'resumo' | 'dash'
