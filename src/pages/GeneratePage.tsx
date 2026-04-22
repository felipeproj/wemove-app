/**
 * GeneratePage — formulário de nova mudança via IA.
 * Exibida dentro da LandingPage quando o usuário escolhe "Iniciar nova mudança".
 */

import { useState, useEffect } from 'react'
import { listApi } from '../services/api'
import { useListStore } from '../store/useListStore'
import { WeMoveIcon } from '../components/WeMoveIcon'
import type { Room, Padrao } from '../types'

// ── Constantes ────────────────────────────────────────────────────────────────

const PADROES: { id: Padrao; label: string; desc: string; cls: string }[] = [
  { id: 'Simples', label: 'Simples', desc: 'Básico e funcional',       cls: 'border-emerald-300 bg-emerald-50 text-emerald-700' },
  { id: 'Médio',   label: 'Médio',   desc: 'Bom custo-benefício',      cls: 'border-wm-blue/50 bg-blue-50 text-wm-blue' },
  { id: 'Alto',    label: 'Alto',    desc: 'Premium e design',          cls: 'border-wm-purple/50 bg-purple-50 text-wm-purple' },
]

const OUTROS_COMODOS: { key: string; label: string; room: Room }[] = [
  { key: 'sala',       label: 'Sala de estar',       room: 'Sala' },
  { key: 'cozinha',    label: 'Cozinha',              room: 'Cozinha' },
  { key: 'areaServ',   label: 'Área de serviço',      room: 'Área de Serviço' },
  { key: 'escritorio', label: 'Escritório / Home office', room: 'Escritório' },
]

const LOADING_MSGS = [
  'Analisando as informações do imóvel...',
  'Gerando lista personalizada com IA...',
  'Calculando estimativas de preço...',
  'Quase pronto, organizando os itens...',
]

const TITLE_PLACEHOLDERS = [
  'Meu primeiro apartamento ✨',
  'Casa nova, vida nova 🏡',
  'Mudança dos sonhos...',
  'Novo lar em São Paulo 🌆',
  'Apartamento 2025 🎉',
]

/** Label animado que cicla entre sugestões de nome */
function AnimatedPlaceholder({ visible }: { visible: boolean }) {
  const [idx, setIdx] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    if (!visible) return
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setIdx((i) => (i + 1) % TITLE_PLACEHOLDERS.length)
        setFade(true)
      }, 300)
    }, 2800)
    return () => clearInterval(interval)
  }, [visible])

  if (!visible) return null

  return (
    <span
      className="text-ink-3 font-normal pointer-events-none transition-opacity duration-300"
      style={{ opacity: fade ? 1 : 0 }}
    >
      {TITLE_PLACEHOLDERS[idx]}
    </span>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputCls = 'w-full px-4 py-3 border border-border rounded-xl text-sm text-ink bg-white placeholder-ink-3 outline-none focus:border-wm-blue focus:ring-2 focus:ring-wm-blue/10 transition-all'
const labelCls = 'block text-sm font-bold text-ink mb-2'

function Stepper({ value, onChange, min = 0, max = 8 }: { value: number; onChange: (n: number) => void; min?: number; max?: number }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-8 h-8 rounded-lg border border-border text-ink-2 font-bold text-lg flex items-center justify-center hover:border-wm-blue hover:text-wm-blue disabled:opacity-30 transition-all"
      >−</button>
      <span className="w-6 text-center font-bold text-ink text-base">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-8 h-8 rounded-lg border border-border text-ink-2 font-bold text-lg flex items-center justify-center hover:border-wm-blue hover:text-wm-blue disabled:opacity-30 transition-all"
      >+</button>
    </div>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface GeneratePageProps {
  onBack?: () => void
}

// ── Componente ────────────────────────────────────────────────────────────────

export function GeneratePage({ onBack }: GeneratePageProps = {}) {
  const setTokenAndInit = useListStore((s) => s.setTokenAndInit)

  const [step,       setStep]       = useState<'form' | 'loading' | 'done'>('form')
  const [loadingMsg, setLoadingMsg] = useState('')
  const [error,      setError]      = useState<string | null>(null)

  // Nome da mudança
  const [titulo,    setTitulo]    = useState('')

  // Dados do imóvel
  const [metros,    setMetros]    = useState('')
  const [padrao,    setPadrao]    = useState<Padrao>('Médio')
  const [orcamento, setOrcamento] = useState('')
  const [jaPossui,  setJaPossui]  = useState('')

  // Cômodos — detalhados
  const [quartos,   setQuartos]   = useState(1)
  const [suites,    setSuites]    = useState(0)
  const [banheiros, setBanheiros] = useState(1)
  const [lavabos,   setLavabos]   = useState(0)
  const [outros,    setOutros]    = useState<Record<string, boolean>>({
    sala: true, cozinha: true, areaServ: false, escritorio: false,
  })

  function toggleOutro(key: string) {
    setOutros((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function buildComodos(): Room[] {
    const rooms: Room[] = []
    if (outros.sala)       rooms.push('Sala')
    if (outros.cozinha)    rooms.push('Cozinha')
    if (quartos > 0)       rooms.push('Quarto Casal')
    if (outros.escritorio) rooms.push('Escritório')
    if (outros.areaServ)   rooms.push('Área de Serviço')
    if (banheiros > 0 || lavabos > 0) rooms.push('Banheiro / Lavabo')
    rooms.push('Geral / Tecnologia')
    return rooms
  }

  function buildDetalhes(): string {
    const parts: string[] = []
    if (quartos > 0) {
      const s = suites > 0 ? ` (${suites} suíte${suites > 1 ? 's' : ''})` : ''
      parts.push(`${quartos} quarto${quartos > 1 ? 's' : ''}${s}`)
    }
    if (banheiros > 0) parts.push(`${banheiros} banheiro${banheiros > 1 ? 's' : ''}`)
    if (lavabos > 0)   parts.push(`${lavabos} lavabo${lavabos > 1 ? 's' : ''}`)
    if (outros.sala)       parts.push('sala de estar')
    if (outros.cozinha)    parts.push('cozinha')
    if (outros.areaServ)   parts.push('área de serviço')
    if (outros.escritorio) parts.push('escritório/home office')
    return parts.join(', ')
  }

  async function handleGenerate() {
    if (!metros || Number(metros) < 10) {
      setError('Informe o tamanho do imóvel (mínimo 10 m²).')
      return
    }
    const comodos = buildComodos()
    if (comodos.length === 0) {
      setError('Selecione pelo menos um cômodo.')
      return
    }

    setError(null)
    setStep('loading')
    setLoadingMsg(LOADING_MSGS[0])

    LOADING_MSGS.forEach((msg, i) => {
      if (i > 0) setTimeout(() => setLoadingMsg(msg), i * 3000)
    })

    try {
      const result = await listApi.generate({
        titulo:          titulo.trim() || undefined,
        metros:          Number(metros),
        comodos,
        padrao,
        orcamento:       orcamento ? Number(orcamento) : undefined,
        ja_possui:       jaPossui || undefined,
        detalhes_imovel: buildDetalhes(),
      })

      setLoadingMsg(`✓ ${result.items_count} itens gerados! Abrindo sua lista...`)
      setStep('done')
      setTimeout(() => setTokenAndInit(result.edit_token), 1000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar lista. Tente novamente.')
      setStep('form')
    }
  }

  // ── Loading / Done ────────────────────────────────────────────────────────

  if (step === 'loading' || step === 'done') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 text-center">
        <div className="w-20 h-20 rounded-3xl gradient-bg flex items-center justify-center shadow-btn animate-pulse-slow">
          <WeMoveIcon size={36} />
        </div>
        <div>
          <p className="font-display text-2xl font-bold gradient-text mb-2">WeMove IA</p>
          <p className="text-sm text-ink-2 max-w-xs mx-auto">{loadingMsg}</p>
        </div>
        {step === 'loading' && (
          <div className="w-10 h-10 border-2 border-border border-t-wm-blue rounded-full animate-spin" />
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

  // ── Form ──────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-xl mx-auto">
      {/* Botão voltar */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-ink-2 hover:text-ink transition-colors mb-6"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Voltar
        </button>
      )}

      {/* Título */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Iniciar nova mudança</h1>
        <p className="text-ink-2 text-sm mt-1">
          Conte sobre seu imóvel e a IA cria uma lista personalizada.
        </p>
      </div>

      <div className="space-y-5">

        {/* Nome da mudança */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <label className={labelCls}>
            Nome da sua mudança
            <span className="ml-2 text-xs font-normal text-ink-3">(opcional)</span>
          </label>
          <div className="relative">
            <input
              type="text"
              maxLength={100}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder=" "
              className={inputCls + ' peer'}
            />
            {/* Placeholder animado — some quando há texto */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none peer-focus:hidden peer-[:not(:placeholder-shown)]:hidden">
              <AnimatedPlaceholder visible={titulo === ''} />
            </div>
          </div>
          <p className="text-xs text-ink-3 mt-1.5">
            Esse nome vai aparecer na sua lista de mudanças
          </p>
        </div>

        {/* Tamanho */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <label className={labelCls}>Tamanho do imóvel *</label>
          <div className="relative">
            <input
              type="number" min="10" max="1000" placeholder="ex: 65"
              value={metros} onChange={(e) => setMetros(e.target.value)}
              className={inputCls}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ink-3 font-medium">m²</span>
          </div>
        </div>

        {/* Cômodos detalhados */}
        <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
          <p className={labelCls + ' mb-0'}>Cômodos do imóvel *</p>

          {/* Quartos */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">Quartos</p>
              <p className="text-xs text-ink-3">Total de quartos</p>
            </div>
            <Stepper value={quartos} onChange={setQuartos} min={0} max={8} />
          </div>

          {/* Suítes */}
          {quartos > 0 && (
            <div className="flex items-center justify-between pl-4 border-l-2 border-wm-blue/20">
              <div>
                <p className="text-sm font-semibold text-ink">Suítes</p>
                <p className="text-xs text-ink-3">Quartos com banheiro privativo</p>
              </div>
              <Stepper value={suites} onChange={(n) => setSuites(Math.min(n, quartos))} min={0} max={quartos} />
            </div>
          )}

          {/* Banheiros */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">Banheiros</p>
              <p className="text-xs text-ink-3">Banheiros completos</p>
            </div>
            <Stepper value={banheiros} onChange={setBanheiros} min={0} max={6} />
          </div>

          {/* Lavabos */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">Lavabos</p>
              <p className="text-xs text-ink-3">Banheiro sem chuveiro</p>
            </div>
            <Stepper value={lavabos} onChange={setLavabos} min={0} max={4} />
          </div>

          {/* Outros cômodos (checkboxes) */}
          <div className="pt-2 border-t border-border">
            <p className="text-xs font-bold uppercase tracking-wider text-ink-3 mb-3">Outros cômodos</p>
            <div className="grid grid-cols-2 gap-2">
              {OUTROS_COMODOS.map(({ key, label }) => {
                const sel = outros[key]
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleOutro(key)}
                    className={[
                      'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[13px] font-semibold text-left transition-all',
                      sel
                        ? 'gradient-bg text-white border-transparent shadow-btn'
                        : 'bg-bg border-border text-ink-2 hover:border-wm-blue hover:text-wm-blue',
                    ].join(' ')}
                  >
                    <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border ${sel ? 'border-white/50 bg-white/20' : 'border-border'}`}>
                      {sel && <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                    </span>
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Padrão */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <label className={labelCls}>Padrão desejado *</label>
          <div className="grid grid-cols-3 gap-2">
            {PADROES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPadrao(p.id)}
                className={[
                  'p-3 rounded-xl border-2 text-left transition-all',
                  padrao === p.id ? p.cls : 'border-border bg-bg hover:border-border',
                ].join(' ')}
              >
                <p className="text-sm font-bold">{p.label}</p>
                <p className="text-[11px] opacity-70 mt-0.5 leading-tight">{p.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Orçamento */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <label className={labelCls}>
            Orçamento total <span className="text-ink-3 font-normal">(opcional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-ink-3 font-medium">R$</span>
            <input
              type="number" min="0" placeholder="ex: 15000"
              value={orcamento} onChange={(e) => setOrcamento(e.target.value)}
              className={inputCls + ' pl-10'}
            />
          </div>
          <p className="text-xs text-ink-3 mt-1.5">A IA vai priorizar itens dentro do seu orçamento</p>
        </div>

        {/* Já possui */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <label className={labelCls}>
            O que você já possui? <span className="text-ink-3 font-normal">(opcional)</span>
          </label>
          <textarea
            placeholder="ex: sofá, geladeira, cama de casal, TV 50'..."
            value={jaPossui} onChange={(e) => setJaPossui(e.target.value)}
            rows={3} className={inputCls + ' resize-none'}
          />
          <p className="text-xs text-ink-3 mt-1.5">Esses itens não serão incluídos na lista</p>
        </div>

        {/* Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            ⚠️ {error}
          </div>
        )}

        {/* Botão gerar */}
        <button
          onClick={handleGenerate}
          className="w-full py-4 rounded-xl text-base font-bold gradient-bg text-white shadow-btn hover:opacity-90 transition-all"
        >
          ✨ Gerar minha lista com IA
        </button>

        <p className="text-xs text-ink-3 text-center pb-4">
          Leva cerca de 15 segundos · Você poderá editar todos os itens depois
        </p>
      </div>
    </div>
  )
}
