import { useEffect, useState } from 'react'
import { useListStore } from '../../store/useListStore'
import { useAuthStore } from '../../store/useAuthStore'
import { paymentApi } from '../../services/api'

interface Props {
  onClose: () => void
}

type PlanKey = 'essencial' | 'familia'

const PLANS: { key: PlanKey; name: string; price: string; period: string; desc: string; features: string[]; featured: boolean }[] = [
  {
    key: 'essencial',
    name: 'Essencial',
    price: 'R$ 19,90',
    period: 'pagamento único · 6 meses',
    desc: 'Ideal para quem está se mudando sozinho ou em casal.',
    features: [
      'Listas e itens ilimitados',
      'Re-geração por IA à vontade',
      'Compartilhar com edição (3 pessoas)',
      'Recomendações de produtos com links',
      'Histórico de gastos e orçamento',
    ],
    featured: true,
  },
  {
    key: 'familia',
    name: 'Família',
    price: 'R$ 29,90',
    period: 'pagamento único · 12 meses',
    desc: 'Para mudanças com muita gente envolvida.',
    features: [
      'Tudo do plano Essencial',
      'Até 10 colaboradores com edição',
      'Múltiplas listas simultâneas',
      'Comentários por item',
      'Validade de 12 meses',
    ],
    featured: false,
  },
]

export function UpgradeModal({ onClose }: Props) {
  const setModalOpen = useListStore((s) => s.setModalOpen)
  const user         = useAuthStore((s) => s.user)
  const [loading, setLoading] = useState<PlanKey | null>(null)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    setModalOpen(true)
    return () => setModalOpen(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleUpgrade(plan: PlanKey) {
    if (!user) {
      setError('Faça login para continuar com o pagamento.')
      return
    }
    setLoading(plan)
    setError(null)
    try {
      const { url } = await paymentApi.createCheckout(plan)
      window.location.href = url
    } catch {
      setError('Não foi possível iniciar o pagamento. Tente novamente.')
      setLoading(null)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-ink/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-modal animate-fade-in overflow-hidden">

        {/* Header */}
        <div className="grad px-6 pt-6 pb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">
                Limite atingido
              </p>
              <h2 className="font-display text-xl font-bold text-white leading-tight">
                Você chegou aos 30 itens do plano grátis 🎉
              </h2>
              <p className="text-sm text-white/80 mt-2 leading-relaxed">
                Sua mudança está bem encaminhada! Libere itens ilimitados com um pagamento único — sem assinatura.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white shrink-0 mt-0.5 transition-colors"
              aria-label="Fechar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="p-5 flex flex-col sm:flex-row gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.key}
              className={`flex-1 rounded-xl border p-4 flex flex-col gap-3 ${
                plan.featured ? 'border-wm-blue ring-1 ring-wm-blue' : 'border-border'
              }`}
            >
              {plan.featured && (
                <span className="self-start text-[10px] font-bold uppercase tracking-wider bg-wm-blue/10 text-wm-blue px-2.5 py-1 rounded-full">
                  Mais popular
                </span>
              )}
              <div>
                <p className="text-xs font-bold text-ink-3 uppercase tracking-wide">{plan.name}</p>
                <p className="font-display text-2xl font-bold text-ink mt-0.5">{plan.price}</p>
                <p className="text-xs text-ink-3 mt-0.5">{plan.period}</p>
              </div>
              <p className="text-xs text-ink-2 leading-relaxed">{plan.desc}</p>
              <ul className="flex flex-col gap-1.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-ink-2">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-wm-blue/10 text-wm-blue flex items-center justify-center shrink-0 text-[9px] font-bold">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleUpgrade(plan.key)}
                disabled={loading !== null}
                className={`mt-1 w-full py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60 ${
                  plan.featured
                    ? 'grad text-white shadow-btn hover:opacity-90'
                    : 'border border-border text-ink-2 hover:border-wm-blue hover:text-wm-blue'
                }`}
              >
                {loading === plan.key ? 'Redirecionando...' : plan.name === 'Essencial' ? 'Quero o Essencial' : 'Quero o Família'}
              </button>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="px-5 pb-3">
            <p className="text-xs text-red-500 text-center bg-red-50 rounded-lg py-2 px-3">{error}</p>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 pb-5 pt-1 text-center">
          <button onClick={onClose} className="text-xs text-ink-3 hover:text-ink-2 transition-colors">
            Continuar no plano grátis
          </button>
        </div>

      </div>
    </div>
  )
}
