/**
 * GeneratePage — exibida quando não há ?lista=TOKEN na URL.
 * Coleta informações do imóvel e chama POST /lists/generate para
 * criar uma lista personalizada via Claude AI.
 */

import { useState } from 'react'
import { listApi } from '../services/api'
import { useListStore } from '../store/useListStore'
import type { Room, Padrao } from '../types'

const ALL_ROOMS: Room[] = [
  'Sala', 'Cozinha', 'Quarto Casal', 'Escritório',
  'Área de Serviço', 'Banheiro / Lavabo', 'Geral / Tecnologia',
]

const PADROES: { id: Padrao; label: string; desc: string; color: string }[] = [
  { id: 'Simples', label: 'Simples',  desc: 'Itens básicos e funcionais',        color: 'border-emerald-300 bg-emerald-50 text-emerald-700' },
  { id: 'Médio',   label: 'Médio',    desc: 'Bom custo-benefício, intermediário', color: 'border-wm-blue/50 bg-blue-50 text-wm-blue' },
  { id: 'Alto',    label: 'Alto',     desc: 'Produtos premium e de design',       color: 'border-wm-purple/50 bg-purple-50 text-wm-purple' },
]

const inputCls = 'w-full px-4 py-3 border border-border rounded-xl text-sm text-ink bg-white placeholder-ink-3 outline-none focus:border-wm-blue focus:ring-2 focus:ring-wm-blue/10 transition-all'
const labelCls = 'block text-sm font-bold text-ink mb-2'

type Step = 'form' | 'loading' | 'done'

export function GeneratePage() {
  const setTokenAndInit = useListStore((s) => s.setTokenAndInit)

  const [step,       setStep]      = useState<Step>('form')
  const [loadingMsg, setLoadingMsg] = useState('')
  const [error,      setError]     = useState<string | null>(null)

  // Form fields
  const [metros,    setMetros]    = useState('')
  const [comodos,   setComodos]   = useState<Room[]>(['Sala', 'Cozinha', 'Quarto Casal', 'Banheiro / Lavabo'])
  const [padrao,    setPadrao]    = useState<Padrao>('Médio')
  const [orcamento, setOrcamento] = useState('')
  const [jaPossui,  setJaPossui]  = useState('')

  function toggleComodo(room: Room) {
    setComodos((prev) =>
      prev.includes(room) ? prev.filter((r) => r !== room) : [...prev, room]
    )
  }

  async function handleGenerate() {
    if (!metros || Number(metros) < 10) {
      setError('Informe o tamanho do imóvel (mínimo 10m²).')
      return
    }
    if (comodos.length === 0) {
      setError('Selecione pelo menos um cômodo.')
      return
    }

    setError(null)
    setStep('loading')
    setLoadingMsg('Analisando as informações do imóvel...')

    try {
      setTimeout(() => setLoadingMsg('Gerando lista personalizada com IA...'), 2000)
      setTimeout(() => setLoadingMsg('Calculando estimativas de preço...'), 5000)
      setTimeout(() => setLoadingMsg('Quase pronto, organizando os itens...'), 9000)

      const result = await listApi.generate({
        metros:    Number(metros),
        comodos,
        padrao,
        orcamento: orcamento ? Number(orcamento) : undefined,
        ja_possui: jaPossui || undefined,
      })

      setLoadingMsg(`✓ ${result.items_count} itens gerados! Abrindo sua lista...`)
      setStep('done')

      setTimeout(() => setTokenAndInit(result.edit_token), 1000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar lista. Tente novamente.')
      setStep('form')
    }
  }

  // Loading screen
  if (step === 'loading' || step === 'done') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 px-6 text-center">
        <div className="w-20 h-20 rounded-3xl gradient-bg flex items-center justify-center shadow-btn animate-pulse-slow">
          <svg width="36" height="36" viewBox="0 0 18 18" fill="none">
            <path d="M4 14L9 4L14 14M6 11H12" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <p className="font-display text-2xl font-bold gradient-text mb-2">WeMove IA</p>
          <p className="text-sm text-ink-2">{loadingMsg}</p>
        </div>
        {step === 'loading' && (
          <div className="w-10 h-10 border-2 border-border-2 border-t-wm-blue rounded-full animate-spin" />
        )}
        {step === 'done' && (
          <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center shadow-btn">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 9l5 5 7-7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>
    )
  }

  // Form
  return (
    <div className="max-w-xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center shadow-btn mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 18 18" fill="none">
            <path d="M4 14L9 4L14 14M6 11H12" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="font-display text-3xl font-bold gradient-text mb-2">WeMove</h1>
        <p className="text-ink-2 text-sm leading-relaxed">
          Conte um pouco sobre seu novo imóvel e a nossa IA vai gerar<br/>
          uma lista de compras personalizada para você.
        </p>
      </div>

      <div className="bg-white rounded-2xl card-shadow border border-border p-6 space-y-6">

        {/* Tamanho */}
        <div>
          <label className={labelCls}>Qual o tamanho do imóvel? *</label>
          <div className="relative">
            <input
              type="number"
              min="10"
              max="1000"
              placeholder="ex: 65"
              value={metros}
              onChange={(e) => setMetros(e.target.value)}
              className={inputCls}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ink-3 font-medium">m²</span>
          </div>
        </div>

        {/* Cômodos */}
        <div>
          <label className={labelCls}>Quais cômodos precisam ser mobilados? *</label>
          <div className="grid grid-cols-2 gap-2">
            {ALL_ROOMS.map((room) => {
              const sel = comodos.includes(room)
              return (
                <button
                  key={room}
                  type="button"
                  onClick={() => toggleComodo(room)}
                  className={[
                    'px-3 py-2.5 rounded-xl border text-[13px] font-semibold text-left transition-all',
                    sel
                      ? 'gradient-bg text-white border-transparent shadow-btn'
                      : 'bg-bg border-border text-ink-2 hover:border-wm-blue hover:text-wm-blue',
                  ].join(' ')}
                >
                  {room}
                </button>
              )
            })}
          </div>
        </div>

        {/* Padrão */}
        <div>
          <label className={labelCls}>Qual o padrão desejado? *</label>
          <div className="grid grid-cols-3 gap-2">
            {PADROES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPadrao(p.id)}
                className={[
                  'p-3 rounded-xl border-2 text-left transition-all',
                  padrao === p.id ? p.color + ' border-2' : 'border-border bg-bg hover:border-border-2',
                ].join(' ')}
              >
                <p className="text-sm font-bold">{p.label}</p>
                <p className="text-[11px] opacity-70 mt-0.5 leading-tight">{p.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Orçamento */}
        <div>
          <label className={labelCls}>
            Orçamento total disponível
            <span className="text-ink-3 font-normal ml-1">(opcional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-ink-3 font-medium">R$</span>
            <input
              type="number"
              min="0"
              placeholder="ex: 15000"
              value={orcamento}
              onChange={(e) => setOrcamento(e.target.value)}
              className={inputCls + ' pl-10'}
            />
          </div>
          <p className="text-xs text-ink-3 mt-1.5">A IA vai priorizar itens dentro do seu orçamento</p>
        </div>

        {/* Já possui */}
        <div>
          <label className={labelCls}>
            O que você já possui?
            <span className="text-ink-3 font-normal ml-1">(opcional)</span>
          </label>
          <textarea
            placeholder="ex: sofá, geladeira, cama de casal, TV 50'..."
            value={jaPossui}
            onChange={(e) => setJaPossui(e.target.value)}
            rows={3}
            className={inputCls + ' resize-none'}
          />
          <p className="text-xs text-ink-3 mt-1.5">Esses itens não serão incluídos na lista gerada</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            ⚠️ {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          className="w-full py-4 rounded-xl text-base font-bold gradient-bg text-white shadow-btn hover:opacity-90 transition-all"
        >
          ✨ Gerar minha lista com IA
        </button>

        <p className="text-xs text-ink-3 text-center">
          Leva cerca de 15 segundos · Você poderá editar todos os itens depois
        </p>
      </div>
    </div>
  )
}
