/**
 * ItemDetailModal — modal de detalhes do item com duas abas:
 *  - "Detalhes"        → informações do item + ações (editar/comprar/remover)
 *  - "Recomendações"   → sugestões de compra geradas por IA com comparação
 */

import { useEffect, useState } from 'react'
import type { Item } from '../../types'
import { fmt } from '../../utils/fmt'
import { useListStore } from '../../store/useListStore'
import { recommendApi, type RecommendedItem } from '../../services/api'

// ── Helpers ───────────────────────────────────────────────────────────────────

function StarRating({ value }: { value: number }) {
  const full  = Math.floor(value)
  const half  = value - full >= 0.25 && value - full < 0.75
  const empty = 5 - full - (half ? 1 : 0)
  return (
    <span className="flex items-center gap-0.5">
      {Array(full).fill(0).map((_, i) => (
        <svg key={`f${i}`} width="11" height="11" viewBox="0 0 24 24" fill="#F59E0B">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
      {half && (
        <svg key="h" width="11" height="11" viewBox="0 0 24 24">
          <defs><linearGradient id="hg"><stop offset="50%" stopColor="#F59E0B"/><stop offset="50%" stopColor="#E2E8F0"/></linearGradient></defs>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#hg)"/>
        </svg>
      )}
      {Array(empty).fill(0).map((_, i) => (
        <svg key={`e${i}`} width="11" height="11" viewBox="0 0 24 24" fill="#E2E8F0">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
      <span className="text-[10px] text-ink-3 ml-1">{value.toFixed(1)}</span>
    </span>
  )
}

const LOJA_COLORS: Record<string, string> = {
  'Magalu':        '#0086FF',
  'Amazon':        '#FF9900',
  'Shopee':        '#EE4D2D',
  'Mercado Livre': '#FFE600',
  'Americanas':    '#E60014',
}
const LOJA_TEXT: Record<string, string> = {
  'Mercado Livre': '#333',
}

function LojaChip({ loja }: { loja: string }) {
  const bg   = LOJA_COLORS[loja] ?? '#64748B'
  const text = LOJA_TEXT[loja]   ?? 'white'
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold"
      style={{ background: bg, color: text }}
    >
      {loja}
    </span>
  )
}

const BADGE_STYLE: Record<string, { label: string; icon: string; bg: string; text: string; border: string }> = {
  melhor_custo_beneficio: {
    label: 'Custo-benefício',
    icon: '🏆',
    bg: 'linear-gradient(135deg,#EFF6FF,#EDE9FE)',
    text: '#4F46E5',
    border: '#C7D2FE',
  },
  mais_barato: {
    label: 'Mais barato',
    icon: '💰',
    bg: '#F0FDF4',
    text: '#15803D',
    border: '#BBF7D0',
  },
  mais_caro: {
    label: 'Mais premium',
    icon: '⭐',
    bg: '#FFFBEB',
    text: '#B45309',
    border: '#FDE68A',
  },
}

// ── Product Card (Recomendações) ──────────────────────────────────────────────

function ProductCard({ rec, selected, onSelect }: { rec: RecommendedItem; selected: boolean; onSelect: () => void }) {
  const badge = rec.badge ? BADGE_STYLE[rec.badge] : null

  return (
    <button
      onClick={onSelect}
      className={[
        'flex-shrink-0 w-[220px] sm:w-[240px] rounded-2xl border-2 p-4 text-left transition-all',
        selected
          ? 'border-wm-blue shadow-btn bg-blue-50/40'
          : 'border-border bg-white hover:border-wm-blue/40 hover:shadow-card',
      ].join(' ')}
    >
      {/* Badge */}
      {badge && (
        <div
          className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 border"
          style={{ background: badge.bg, color: badge.text, borderColor: badge.border }}
        >
          {badge.icon} {badge.label}
        </div>
      )}

      {/* Nome + loja */}
      <p className="text-xs font-bold text-ink leading-snug mb-1 line-clamp-2">{rec.nome}</p>
      {rec.descricao && <p className="text-[10px] text-ink-3 leading-relaxed mb-2 line-clamp-2">{rec.descricao}</p>}

      <div className="flex items-center gap-1.5 mb-2">
        <LojaChip loja={rec.loja} />
        <StarRating value={rec.avaliacao} />
      </div>

      {/* Preço */}
      <p className="font-display text-lg font-bold text-ink">{fmt(rec.preco)}</p>
    </button>
  )
}

// ── Comparação expandida ──────────────────────────────────────────────────────

function ComparisonTable({ itens }: { itens: RecommendedItem[] }) {
  return (
    <div className="mt-4 overflow-x-auto -mx-1 px-1">
      <table className="w-full text-xs border-collapse min-w-[500px]">
        <thead>
          <tr>
            <th className="text-left text-[10px] font-bold uppercase tracking-wider text-ink-3 pb-2 pr-3 w-24">Critério</th>
            {itens.map((rec, i) => (
              <th key={i} className="pb-2 px-2 text-center">
                <div className="text-[10px] font-bold text-ink leading-tight">{rec.nome.split(' ').slice(0,3).join(' ')}</div>
                <div className="font-display text-sm font-bold text-wm-blue mt-0.5">{fmt(rec.preco)}</div>
                {rec.badge && (
                  <div
                    className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1 border"
                    style={{
                      background: BADGE_STYLE[rec.badge].bg,
                      color: BADGE_STYLE[rec.badge].text,
                      borderColor: BADGE_STYLE[rec.badge].border,
                    }}
                  >
                    {BADGE_STYLE[rec.badge].icon} {BADGE_STYLE[rec.badge].label}
                  </div>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Linha: avaliação */}
          <tr className="border-t border-border">
            <td className="py-2 pr-3 text-ink-3 font-semibold">Avaliação</td>
            {itens.map((rec, i) => (
              <td key={i} className="py-2 px-2 text-center">
                <StarRating value={rec.avaliacao} />
              </td>
            ))}
          </tr>
          {/* Linha: loja */}
          <tr className="border-t border-border bg-bg/50">
            <td className="py-2 pr-3 text-ink-3 font-semibold">Loja</td>
            {itens.map((rec, i) => (
              <td key={i} className="py-2 px-2 text-center">
                <LojaChip loja={rec.loja} />
              </td>
            ))}
          </tr>
          {/* Linhas: pontos fortes */}
          <tr className="border-t border-border">
            <td className="py-2 pr-3 text-ink-3 font-semibold align-top">Pontos fortes</td>
            {itens.map((rec, i) => (
              <td key={i} className="py-2 px-2 text-left align-top">
                <ul className="space-y-0.5">
                  {rec.pontos_fortes.map((pf, j) => (
                    <li key={j} className="flex items-start gap-1">
                      <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                      <span className="text-ink-2">{pf}</span>
                    </li>
                  ))}
                </ul>
              </td>
            ))}
          </tr>
          {/* Linhas: pontos fracos */}
          <tr className="border-t border-border bg-bg/50">
            <td className="py-2 pr-3 text-ink-3 font-semibold align-top">Pontos fracos</td>
            {itens.map((rec, i) => (
              <td key={i} className="py-2 px-2 text-left align-top">
                <ul className="space-y-0.5">
                  {rec.pontos_fracos.map((pf, j) => (
                    <li key={j} className="flex items-start gap-1">
                      <span className="text-red-400 mt-0.5 flex-shrink-0">−</span>
                      <span className="text-ink-2">{pf}</span>
                    </li>
                  ))}
                </ul>
              </td>
            ))}
          </tr>
          {/* Linha: ação comprar */}
          <tr className="border-t border-border">
            <td className="py-2 pr-3 text-ink-3 font-semibold">Comprar</td>
            {itens.map((rec, i) => (
              <td key={i} className="py-2 px-2 text-center">
                <a
                  href={rec.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold gradient-bg text-white shadow-btn hover:opacity-90 transition-all"
                >
                  Ver oferta →
                </a>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ── Tab: Recomendações ────────────────────────────────────────────────────────

function RecommendacoesTab({ item }: { item: Item }) {
  const [loading,   setLoading]   = useState(false)
  const [recs,      setRecs]      = useState<RecommendedItem[]>([])
  const [error,     setError]     = useState<string | null>(null)
  const [selected,  setSelected]  = useState<number | null>(null)
  const [comparing, setComparing] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    recommendApi
      .get(item.nome, item.amb, item.cat, item.preco_min, item.preco_max)
      .then((res) => {
        if (cancelled) return
        setRecs(res.itens)
        // Auto-selecionar o melhor custo-benefício
        const idx = res.itens.findIndex((r) => r.badge === 'melhor_custo_beneficio')
        setSelected(idx >= 0 ? idx : 0)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Erro ao carregar recomendações')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [item.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center gap-4 text-center">
        <div className="relative w-12 h-12">
          <div className="w-12 h-12 border-2 border-border border-t-wm-blue rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-lg">🔍</div>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Buscando as melhores opções...</p>
          <p className="text-xs text-ink-3 mt-1">Nossa IA está pesquisando os melhores preços no varejo brasileiro</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-10 text-center">
        <p className="text-3xl mb-3">⚠️</p>
        <p className="text-sm text-ink-2 font-semibold mb-1">Não foi possível carregar</p>
        <p className="text-xs text-ink-3 mb-4">{error}</p>
        <button
          onClick={() => { setError(null); setLoading(true); setRecs([]) }}
          className="text-xs text-wm-blue underline"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  if (recs.length === 0) return null

  const bestCB  = recs.find((r) => r.badge === 'melhor_custo_beneficio')
  const cheapest = recs.find((r) => r.badge === 'mais_barato')
  const premium  = recs.find((r) => r.badge === 'mais_caro')

  return (
    <div className="space-y-5">

      {/* ── Cards carrossel ─────────────────────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-ink-3 mb-3">
          Comparação direta · {recs.length} opções encontradas
        </p>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
          {recs.map((rec, i) => (
            <div key={i} className="snap-start">
              <ProductCard
                rec={rec}
                selected={selected === i}
                onSelect={() => setSelected(selected === i ? null : i)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Detalhe do selecionado ───────────────────────────────────────────── */}
      {selected !== null && recs[selected] && (
        <div className="rounded-2xl border border-border bg-white p-4 animate-fade-in">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-ink leading-tight">{recs[selected].nome}</p>
              {recs[selected].descricao && (
                <p className="text-xs text-ink-3 mt-0.5">{recs[selected].descricao}</p>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-display text-xl font-bold text-ink">{fmt(recs[selected].preco)}</p>
              <LojaChip loja={recs[selected].loja} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1.5">Pontos fortes</p>
              <ul className="space-y-1">
                {recs[selected].pontos_fortes.map((p, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-emerald-800">
                    <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-red-50 rounded-xl p-3 border border-red-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-red-600 mb-1.5">Pontos fracos</p>
              <ul className="space-y-1">
                {recs[selected].pontos_fracos.map((p, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-red-800">
                    <span className="text-red-400 mt-0.5 flex-shrink-0">−</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <a
            href={recs[selected].link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold gradient-bg text-white shadow-btn hover:opacity-90 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <polyline points="15 3 21 3 21 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="10" y1="14" x2="21" y2="3" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Ver oferta na {recs[selected].loja}
          </a>
        </div>
      )}

      {/* ── Botão comparar ───────────────────────────────────────────────────── */}
      <button
        onClick={() => setComparing((v) => !v)}
        className="w-full py-2.5 rounded-xl border border-border text-sm font-semibold text-ink-2 hover:border-wm-blue hover:text-wm-blue bg-white transition-all flex items-center justify-center gap-2"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="3" width="6" height="18" rx="1" stroke="currentColor" strokeWidth="1.8"/>
          <rect x="9" y="7" width="6" height="14" rx="1" stroke="currentColor" strokeWidth="1.8"/>
          <rect x="16" y="11" width="6" height="10" rx="1" stroke="currentColor" strokeWidth="1.8"/>
        </svg>
        {comparing ? 'Ocultar comparação' : 'Comparar todos os produtos'}
      </button>

      {/* ── Tabela de comparação ─────────────────────────────────────────────── */}
      {comparing && <ComparisonTable itens={recs} />}

      {/* ── Destaques ────────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Minha recomendação direta</p>

        {bestCB && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-white border-2 border-indigo-200"
            style={{ background: 'linear-gradient(135deg,#EFF6FF,#EDE9FE)' }}>
            <span className="text-xl flex-shrink-0">🏆</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-indigo-700">Melhor custo-benefício</p>
              <p className="text-sm font-bold text-ink mt-0.5">{bestCB.nome}</p>
              <p className="text-xs text-ink-3">{fmt(bestCB.preco)} · {bestCB.loja} · ⭐{bestCB.avaliacao}</p>
            </div>
          </div>
        )}

        {cheapest && cheapest !== bestCB && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-xl flex-shrink-0">💰</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-emerald-700">Opção mais barata</p>
              <p className="text-sm font-bold text-ink mt-0.5">{cheapest.nome}</p>
              <p className="text-xs text-ink-3">{fmt(cheapest.preco)} · {cheapest.loja}</p>
            </div>
          </div>
        )}

        {premium && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
            <span className="text-xl flex-shrink-0">⭐</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-amber-700">Premium — melhor qualidade</p>
              <p className="text-sm font-bold text-ink mt-0.5">{premium.nome}</p>
              <p className="text-xs text-ink-3">{fmt(premium.preco)} · {premium.loja} · ⭐{premium.avaliacao}</p>
            </div>
          </div>
        )}
      </div>

      <p className="text-[10px] text-ink-3 text-center leading-relaxed">
        Preços e disponibilidade podem variar. Links direcionam para busca na loja.
      </p>
    </div>
  )
}

// ── Tab: Detalhes ─────────────────────────────────────────────────────────────

const PRI_BADGE: Record<string, { bg: string; text: string }> = {
  Alta:  { bg: '#FEF2F2', text: '#DC2626' },
  Média: { bg: '#FFFBEB', text: '#D97706' },
  Baixa: { bg: '#ECFDF5', text: '#059669' },
}

function DetalhesTab({
  item,
  onEdit,
  onBuy,
  onRemove,
}: {
  item: Item
  onEdit: () => void
  onBuy: () => void
  onRemove: () => void
}) {
  const permission  = useListStore((s) => s.permission)
  const isEdit      = permission === 'edit'

  return (
    <div className="space-y-4">
      {/* Info principal */}
      <div className="bg-bg-2 rounded-2xl border border-border p-4 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-bg border border-border text-ink-2">
            {item.amb}
          </span>
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full border"
            style={{ background: PRI_BADGE[item.pri]?.bg, color: PRI_BADGE[item.pri]?.text, borderColor: PRI_BADGE[item.pri]?.bg }}
          >
            Prioridade {item.pri}
          </span>
          <span className={[
            'text-xs font-semibold px-2.5 py-1 rounded-full border',
            item.cat === 'Essencial'
              ? 'bg-blue-50 text-wm-blue border-blue-200'
              : 'bg-bg text-ink-3 border-border'
          ].join(' ')}>
            {item.cat}
          </span>
        </div>

        {item.obs && (
          <p className="text-sm text-ink-2 leading-relaxed">{item.obs}</p>
        )}
      </div>

      {/* Preços */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-border p-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-3 mb-1">Estimativa mínima</p>
          <p className="font-display text-xl font-bold text-ink">{fmt((item.preco_min ?? 0) * item.qtd)}</p>
          {item.qtd > 1 && <p className="text-xs text-ink-3 mt-0.5">{item.qtd}× {fmt(item.preco_min)}</p>}
        </div>
        <div className="bg-white rounded-2xl border border-border p-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-3 mb-1">Estimativa máxima</p>
          <p className="font-display text-xl font-bold text-ink">{fmt((item.preco_max ?? 0) * item.qtd)}</p>
          {item.qtd > 1 && <p className="text-xs text-ink-3 mt-0.5">{item.qtd}× {fmt(item.preco_max)}</p>}
        </div>
      </div>

      {/* Comprado */}
      {item.comprado && (
        <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8l4 4L14 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-700">Comprado!</p>
            {item.gasto > 0 && <p className="text-xs text-emerald-600">Pago: {fmt(item.gasto)}</p>}
            {item.loja && <p className="text-xs text-emerald-600">em {item.loja}</p>}
          </div>
        </div>
      )}

      {/* Ações — só para quem tem permissão de edição */}
      {isEdit && (
        <div className="flex gap-2 pt-1">
          {!item.comprado && (
            <button
              onClick={onBuy}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold gradient-bg text-white shadow-btn hover:opacity-90 transition-all"
            >
              ✓ Marcar como comprado
            </button>
          )}
          <button
            onClick={onEdit}
            className={[
              'py-2.5 rounded-xl text-sm font-semibold border border-border text-ink-2 hover:border-wm-blue hover:text-wm-blue transition-all',
              item.comprado ? 'flex-1' : 'px-4',
            ].join(' ')}
          >
            Editar
          </button>
          <button
            onClick={onRemove}
            className="py-2.5 px-4 rounded-xl text-sm font-semibold border border-border text-red-500 hover:border-red-300 hover:bg-red-50 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

// ── ItemDetailModal ───────────────────────────────────────────────────────────

type TabType = 'detalhes' | 'recomendacoes'

interface Props {
  item: Item
  onClose: () => void
  onEdit: () => void
  onBuy: () => void
  onRemove: () => void
}

export function ItemDetailModal({ item, onClose, onEdit, onBuy, onRemove }: Props) {
  const [tab, setTab] = useState<TabType>('detalhes')
  const setModalOpen  = useListStore((s) => s.setModalOpen)

  useEffect(() => {
    setModalOpen(true)
    return () => setModalOpen(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-ink/30 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-bg w-full max-w-xl rounded-2xl shadow-modal animate-fade-in flex flex-col max-h-[90vh]">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-start gap-3 p-4 pb-0 flex-shrink-0">
          <div className="flex-1 min-w-0">
            {/* Quantidade */}
            {item.qtd > 1 && (
              <span className="inline-block text-[10px] font-bold bg-wm-blue/10 text-wm-blue px-2 py-0.5 rounded-full mb-1">
                {item.qtd}×
              </span>
            )}
            <h2 className="font-display text-lg font-bold text-ink leading-snug">{item.nome}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-border text-ink-3 hover:bg-bg-2 transition-all flex-shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* ── Tab bar ─────────────────────────────────────────────────────── */}
        <div className="flex gap-1 mx-4 mt-3 mb-0 p-1 bg-bg-2 border border-border rounded-xl flex-shrink-0">
          <button
            onClick={() => setTab('detalhes')}
            className={[
              'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all',
              tab === 'detalhes'
                ? 'bg-white text-ink shadow-card border border-border'
                : 'text-ink-3 hover:text-ink-2',
            ].join(' ')}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
              <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Detalhes
          </button>
          <button
            onClick={() => setTab('recomendacoes')}
            className={[
              'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all',
              tab === 'recomendacoes'
                ? 'gradient-bg text-white shadow-btn'
                : 'text-ink-3 hover:text-ink-2',
            ].join(' ')}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
            </svg>
            Recomendações
          </button>
        </div>

        {/* ── Conteúdo scrollável ─────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 pt-3">
          {tab === 'detalhes' ? (
            <DetalhesTab
              item={item}
              onEdit={() => { onClose(); onEdit() }}
              onBuy={() => { onClose(); onBuy() }}
              onRemove={() => { onClose(); onRemove() }}
            />
          ) : (
            <RecommendacoesTab item={item} />
          )}
        </div>

      </div>
    </div>
  )
}
