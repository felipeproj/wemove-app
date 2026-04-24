/**
 * CompraPage — "Me ajude a comprar"
 *
 * Página pública: qualquer visitante pode buscar.
 * Usuários logados têm a consulta salva automaticamente no histórico.
 *
 * Props:
 *  onBack         → volta para a view anterior
 *  initialQuery   → se fornecido, exibe resultados salvos diretamente (vindo do histórico)
 */

import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { recommendApi, comprasApi, type RecommendedItem, type ShoppingQuery } from '../services/api'

// ── Constantes de estilo ─────────────────────────────────────────────────────

const LOJA_COLORS: Record<string, { bg: string; text: string; dark: boolean }> = {
  'Magalu':        { bg: '#E11D48', text: '#fff', dark: true  },
  'Amazon':        { bg: '#F97316', text: '#fff', dark: true  },
  'Mercado Livre': { bg: '#FFE600', text: '#1a1a1a', dark: false },
  'KaBuM!':        { bg: '#F6620A', text: '#fff', dark: true  },
}

const BADGE_CONFIG: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  melhor_custo_beneficio: { label: 'Melhor custo-benefício', bg: '#10B981', text: '#fff',    icon: '⭐' },
  mais_barato:            { label: 'Mais barato',            bg: '#3B82F6', text: '#fff',    icon: '💰' },
  mais_caro:              { label: 'Premium',                bg: '#8B5CF6', text: '#fff',    icon: '👑' },
}

function fmt(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(n)
}

// ── StarRating ────────────────────────────────────────────────────────────────

function StarRating({ value }: { value: number }) {
  const full  = Math.floor(value)
  const half  = value - full >= 0.3
  const empty = 5 - full - (half ? 1 : 0)
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-400 text-sm">
      {'★'.repeat(full)}
      {half ? '½' : ''}
      <span className="text-slate-300">{'★'.repeat(empty)}</span>
      <span className="ml-1 text-xs text-slate-500 font-medium">{value.toFixed(1)}</span>
    </span>
  )
}

// ── Loja badge ────────────────────────────────────────────────────────────────

function LojaBadge({ loja }: { loja: string }) {
  const c = LOJA_COLORS[loja] ?? { bg: '#64748B', text: '#fff', dark: true }
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold"
      style={{ background: c.bg, color: c.text }}
    >
      {loja}
    </span>
  )
}

// ── ProductCard ───────────────────────────────────────────────────────────────

function ProductCard({ item, highlight }: { item: RecommendedItem; highlight?: boolean }) {
  const badge    = item.badge ? BADGE_CONFIG[item.badge] : null
  const [showAll, setShowAll] = useState(false)

  return (
    <div className={[
      'relative flex flex-col bg-white rounded-2xl border overflow-hidden transition-all',
      highlight
        ? 'border-emerald-300 shadow-[0_0_0_2px_#10B981] shadow-btn'
        : 'border-border shadow-card hover:shadow-btn hover:border-wm-blue/30',
    ].join(' ')}>

      {/* Stripe de badge no topo */}
      {badge && (
        <div
          className="h-2 w-full flex-shrink-0"
          style={{ background: badge.bg }}
        />
      )}

      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Cabeçalho: loja + badge */}
        <div className="flex items-center justify-between gap-2">
          <LojaBadge loja={item.loja} />
          {badge && (
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ background: badge.bg + '22', color: badge.bg }}
            >
              {badge.icon} {badge.label}
            </span>
          )}
        </div>

        {/* Nome + descrição */}
        <div>
          <p className="font-display font-bold text-ink text-sm leading-snug line-clamp-2">
            {item.nome}
          </p>
          {item.descricao && (
            <p className="text-xs text-ink-3 mt-0.5 line-clamp-2">{item.descricao}</p>
          )}
        </div>

        {/* Avaliação + preço */}
        <div className="flex items-center justify-between gap-2">
          <StarRating value={item.avaliacao} />
          <div className="text-right">
            <span className="text-lg font-bold text-ink">
              {item.preco_estimado ? '~' : ''}{fmt(item.preco)}
            </span>
            {item.preco_estimado && (
              <p className="text-[10px] text-amber-600 font-medium">preço estimado</p>
            )}
          </div>
        </div>

        {/* Pontos fortes / fracos */}
        <div className="space-y-2 text-xs">
          {item.pontos_fortes.slice(0, showAll ? 3 : 2).map((p, i) => (
            <div key={i} className="flex items-start gap-1.5 text-emerald-700">
              <span className="mt-0.5 flex-shrink-0">✓</span>
              <span>{p}</span>
            </div>
          ))}
          {item.pontos_fracos.slice(0, showAll ? 2 : 1).map((p, i) => (
            <div key={i} className="flex items-start gap-1.5 text-red-600">
              <span className="mt-0.5 flex-shrink-0">✗</span>
              <span>{p}</span>
            </div>
          ))}
          {!showAll && (item.pontos_fortes.length > 2 || item.pontos_fracos.length > 1) && (
            <button
              onClick={() => setShowAll(true)}
              className="text-wm-blue hover:underline text-[11px]"
            >
              Ver mais detalhes
            </button>
          )}
        </div>

        {/* Botão de compra */}
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className={[
            'mt-auto w-full py-2.5 rounded-xl text-sm font-semibold text-center transition-all',
            highlight
              ? 'gradient-bg text-white shadow-btn hover:opacity-90'
              : 'bg-slate-100 text-ink hover:bg-slate-200',
          ].join(' ')}
        >
          🛒 Comprar agora
        </a>
      </div>
    </div>
  )
}

// ── ComparisonTable ───────────────────────────────────────────────────────────

function ComparisonTable({ itens }: { itens: RecommendedItem[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-border">
            <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-ink-3 w-36 sticky left-0 bg-slate-50">
              Produto
            </th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-ink-3 text-center">Loja</th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-ink-3 text-center">Preço</th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-ink-3 text-center">Avaliação</th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-ink-3 text-center min-w-[180px]">Vantagens</th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-ink-3 text-center min-w-[140px]">Desvantagens</th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-ink-3 text-center">Comprar</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((item, i) => {
            const badge = item.badge ? BADGE_CONFIG[item.badge] : null
            return (
              <tr
                key={i}
                className={[
                  'border-b border-border/60 transition-colors',
                  item.badge === 'melhor_custo_beneficio'
                    ? 'bg-emerald-50/60'
                    : i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40',
                ].join(' ')}
              >
                {/* Produto */}
                <td className="px-4 py-3 sticky left-0 bg-inherit">
                  <p className="font-semibold text-ink text-xs leading-snug">{item.nome}</p>
                  {badge && (
                    <span
                      className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: badge.bg, color: badge.text }}
                    >
                      {badge.icon} {badge.label}
                    </span>
                  )}
                </td>
                {/* Loja */}
                <td className="px-4 py-3 text-center">
                  <LojaBadge loja={item.loja} />
                </td>
                {/* Preço */}
                <td className="px-4 py-3 text-center">
                  <span className="font-bold text-ink">
                    {item.preco_estimado ? '~' : ''}{fmt(item.preco)}
                  </span>
                  {item.preco_estimado && (
                    <p className="text-[10px] text-amber-600 font-medium mt-0.5">estimado</p>
                  )}
                </td>
                {/* Avaliação */}
                <td className="px-4 py-3 text-center">
                  <StarRating value={item.avaliacao} />
                </td>
                {/* Vantagens */}
                <td className="px-4 py-3 text-center align-top">
                  <ul className="inline-block text-left space-y-1">
                    {item.pontos_fortes.map((p, j) => (
                      <li key={j} className="flex items-start gap-1 text-xs text-emerald-700">
                        <span className="mt-0.5 flex-shrink-0">✓</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </td>
                {/* Desvantagens */}
                <td className="px-4 py-3 text-center align-top">
                  <ul className="inline-block text-left space-y-1">
                    {item.pontos_fracos.map((p, j) => (
                      <li key={j} className="flex items-start gap-1 text-xs text-red-600">
                        <span className="mt-0.5 flex-shrink-0">✗</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </td>
                {/* Comprar */}
                <td className="px-4 py-3 text-center">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold gradient-bg text-white shadow-btn hover:opacity-90 whitespace-nowrap transition-all"
                  >
                    🛒 Comprar
                  </a>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── SearchForm ────────────────────────────────────────────────────────────────

interface SearchFormProps {
  onSearch: (nome: string, precoMin: number | null, precoMax: number | null) => void
  loading: boolean
  initialNome?: string
  initialPrecoMin?: number | null
  initialPrecoMax?: number | null
}

function SearchForm({ onSearch, loading, initialNome = '', initialPrecoMin = null, initialPrecoMax = null }: SearchFormProps) {
  const [nome,     setNome]     = useState(initialNome)
  const [precoMin, setPrecoMin] = useState(initialPrecoMin != null ? String(initialPrecoMin) : '')
  const [precoMax, setPrecoMax] = useState(initialPrecoMax != null ? String(initialPrecoMax) : '')
  const [error,    setError]    = useState<string | null>(null)

  function handleSubmit() {
    const n = nome.trim()
    if (!n) { setError('Descreva o item que deseja comprar.'); return }
    setError(null)
    const min = precoMin.trim() ? Math.max(0, Number(precoMin)) : null
    const max = precoMax.trim() ? Math.max(0, Number(precoMax)) : null
    onSearch(n, min, max)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Título */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #3B82F6, #6366F1)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"
              stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-ink">
          Me ajude a comprar
        </h1>
        <p className="mt-2 text-sm text-ink-2 max-w-sm mx-auto leading-relaxed">
          Descreva o item que procura e compare as melhores opções do mercado com links diretos para compra.
        </p>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-card space-y-4">
        {/* Nome */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-ink-3 mb-2">
            O que você quer comprar? *
          </label>
          <input
            type="text"
            placeholder="Ex: Sofá cinza 3 lugares retrátil, Geladeira frost free 400L..."
            value={nome}
            onChange={(e) => { setNome(e.target.value); setError(null) }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            autoFocus
            className="w-full px-4 py-3 border border-border rounded-xl text-sm text-ink bg-bg placeholder-ink-3 outline-none focus:border-wm-blue focus:ring-2 focus:ring-wm-blue/10 transition-all"
          />
        </div>

        {/* Faixa de preço */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-ink-3 mb-2">
            Faixa de preço (opcional)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3 text-sm pointer-events-none">R$</span>
              <input
                type="number"
                placeholder="Mínimo"
                value={precoMin}
                onChange={(e) => setPrecoMin(e.target.value)}
                min={0}
                className="w-full pl-9 pr-4 py-3 border border-border rounded-xl text-sm text-ink bg-bg placeholder-ink-3 outline-none focus:border-wm-blue focus:ring-2 focus:ring-wm-blue/10 transition-all"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3 text-sm pointer-events-none">R$</span>
              <input
                type="number"
                placeholder="Máximo"
                value={precoMax}
                onChange={(e) => setPrecoMax(e.target.value)}
                min={0}
                className="w-full pl-9 pr-4 py-3 border border-border rounded-xl text-sm text-ink bg-bg placeholder-ink-3 outline-none focus:border-wm-blue focus:ring-2 focus:ring-wm-blue/10 transition-all"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            ⚠️ {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !nome.trim()}
          className="w-full py-3.5 rounded-xl font-semibold text-sm gradient-bg text-white shadow-btn hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Buscando as melhores opções...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="white" strokeWidth="2"/>
                <path d="M21 21l-4.35-4.35" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Comparar produtos
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// ── ResultsView ───────────────────────────────────────────────────────────────

interface ResultsViewProps {
  nome:       string
  precoMin:   number | null
  precoMax:   number | null
  itens:      RecommendedItem[]
  onNewSearch: () => void
}

function ResultsView({ nome, precoMin, precoMax, itens, onNewSearch }: ResultsViewProps) {
  const [showTable, setShowTable] = useState(true)

  const highlighted = itens.find((i) => i.badge === 'melhor_custo_beneficio')
  const badges      = itens.filter((i) => i.badge && i.badge !== 'melhor_custo_beneficio')
  const rest        = itens.filter((i) => !i.badge)
  const sorted      = highlighted
    ? [highlighted, ...badges, ...rest]
    : [...badges, ...rest]

  return (
    <div className="w-full">
      {/* Cabeçalho de resultados */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">
            Resultados para: <span className="gradient-text">{nome}</span>
          </h2>
          {(precoMin || precoMax) && (
            <p className="text-xs text-ink-3 mt-0.5">
              Faixa: {precoMin ? fmt(precoMin) : 'sem mínimo'} – {precoMax ? fmt(precoMax) : 'sem máximo'}
            </p>
          )}
        </div>
        <button
          onClick={onNewSearch}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-border text-ink-2 hover:border-wm-blue hover:text-wm-blue transition-all flex-shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Nova busca
        </button>
      </div>

      {/* Grid de cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {sorted.map((item, i) => (
          <ProductCard
            key={i}
            item={item}
            highlight={item.badge === 'melhor_custo_beneficio'}
          />
        ))}
      </div>

      {/* Tabela comparativa */}
      <div className="mb-4">
        <button
          onClick={() => setShowTable((v) => !v)}
          className="flex items-center gap-2 text-sm font-semibold text-ink-2 hover:text-ink transition-colors mb-3"
        >
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            className={`transition-transform ${showTable ? 'rotate-180' : ''}`}
          >
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {showTable ? 'Ocultar tabela comparativa' : 'Ver tabela comparativa completa'}
        </button>

        {showTable && <ComparisonTable itens={sorted} />}
      </div>
    </div>
  )
}

// ── LoginCTA ──────────────────────────────────────────────────────────────────

function LoginCTA({ onLogin }: { onLogin: () => void }) {
  return (
    <div
      className="rounded-2xl p-4 border border-blue-200 flex items-center gap-4 mb-6"
      style={{ background: 'linear-gradient(135deg, #EFF6FF, #EDE9FE)' }}
    >
      <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="12" cy="7" r="4" stroke="white" strokeWidth="2"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-ink text-sm">Salve essa consulta</p>
        <p className="text-xs text-ink-2 mt-0.5">Crie uma conta grátis e acesse seu histórico de pesquisas.</p>
      </div>
      <button
        onClick={onLogin}
        className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold gradient-bg text-white shadow-btn hover:opacity-90 transition-all"
      >
        Criar conta
      </button>
    </div>
  )
}

// ── CompraPage ────────────────────────────────────────────────────────────────

interface Props {
  onBack:        () => void
  onLogin:       () => void
  initialQuery?: ShoppingQuery | null
}

export function CompraPage({ onBack, onLogin, initialQuery }: Props) {
  const user = useAuthStore((s) => s.user)

  type View = 'search' | 'loading' | 'results' | 'error'

  const [view,     setView]     = useState<View>(initialQuery ? 'results' : 'search')
  const [nome,     setNome]     = useState(initialQuery?.nome ?? '')
  const [precoMin, setPrecoMin] = useState<number | null>(initialQuery?.preco_min ?? null)
  const [precoMax, setPrecoMax] = useState<number | null>(initialQuery?.preco_max ?? null)
  const [itens,    setItens]    = useState<RecommendedItem[]>(initialQuery?.itens ?? [])
  const [errMsg,   setErrMsg]   = useState<string | null>(null)
  const [saved,    setSaved]    = useState(!!initialQuery)

  // Auto-save quando logado e tem resultados novos (não do histórico)
  useEffect(() => {
    if (!user || saved || itens.length === 0 || !!initialQuery) return
    comprasApi.save(nome, precoMin, precoMax, itens)
      .then(() => { setSaved(true); console.log('[compra] Consulta salva') })
      .catch((e) => console.warn('[compra] Falha ao salvar:', e.message))
  }, [user, itens]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSearch(searchNome: string, searchMin: number | null, searchMax: number | null) {
    setNome(searchNome)
    setPrecoMin(searchMin)
    setPrecoMax(searchMax)
    setView('loading')
    setSaved(false)

    try {
      const amb     = 'Geral'
      const cat     = 'Essencial'
      const minVal  = searchMin ?? 50
      const maxVal  = searchMax ?? minVal * 3
      const result  = await recommendApi.get(searchNome, amb, cat, minVal, maxVal)
      setItens(result.itens)
      setView('results')
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : 'Erro desconhecido')
      setView('error')
    }
  }

  function handleNewSearch() {
    setView('search')
    setItens([])
    setSaved(false)
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Voltar */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink transition-colors mb-6"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        Voltar
      </button>

      {/* CTA de login para não logados com resultados */}
      {!user && view === 'results' && <LoginCTA onLogin={onLogin} />}

      {/* Indicador de salvo */}
      {user && saved && view === 'results' && (
        <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium mb-4">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Consulta salva no seu histórico
        </div>
      )}

      {/* Views */}
      {view === 'search' && (
        <SearchForm
          onSearch={handleSearch}
          loading={false}
          initialNome={nome}
          initialPrecoMin={precoMin}
          initialPrecoMax={precoMax}
        />
      )}

      {view === 'loading' && (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center shadow-btn animate-pulse-slow">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="white" strokeWidth="2"/>
              <path d="M21 21l-4.35-4.35" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-sm text-ink-2">Buscando as melhores opções para <strong>{nome}</strong>…</p>
          <div className="w-8 h-8 border-2 border-border border-t-wm-blue rounded-full animate-spin" />
        </div>
      )}

      {view === 'results' && (
        <ResultsView
          nome={nome}
          precoMin={precoMin}
          precoMax={precoMax}
          itens={itens}
          onNewSearch={handleNewSearch}
        />
      )}

      {view === 'error' && (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-ink font-semibold">Não foi possível buscar os produtos</p>
          <p className="text-sm text-ink-2 max-w-xs">{errMsg}</p>
          <button
            onClick={() => setView('search')}
            className="px-6 py-3 rounded-xl text-sm font-semibold gradient-bg text-white shadow-btn hover:opacity-90 transition-all"
          >
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  )
}
