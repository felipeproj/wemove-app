import { useState, useEffect, useRef } from 'react'
import type { Item, Room, Category, Priority, CreateItemPayload } from '../../types'
import { useListStore } from '../../store/useListStore'

const ROOMS: Room[] = ['Sala','Cozinha','Quarto Casal','Escritório','Área de Serviço','Banheiro / Lavabo','Geral / Tecnologia']
const CATEGORIES: Category[] = ['Essencial','Não Essencial']
const PRIORITIES: Priority[] = ['Alta','Média','Baixa']

interface Props {
  item?: Item          // undefined = modo add, definido = modo edit
  onClose: () => void
  onSuccess: (msg: string) => void
  onError: (msg: string) => void
}

export function ItemFormModal({ item, onClose, onSuccess, onError }: Props) {
  const addItem    = useListStore((s) => s.addItem)
  const updateItem = useListStore((s) => s.updateItem)
  const isEdit     = !!item

  const [nome,    setNome]    = useState(item?.nome    ?? '')
  const [amb,     setAmb]     = useState<Room>(item?.amb ?? 'Sala')
  const [cat,     setCat]     = useState<Category>(item?.cat ?? 'Essencial')
  const [pri,     setPri]     = useState<Priority>(item?.pri ?? 'Alta')
  const [qtd,     setQtd]     = useState(item?.qtd ?? 1)
  const [precoMin,setPrecoMin] = useState(item?.preco_min ? String(item.preco_min) : '')
  const [precoMax,setPrecoMax] = useState(item?.preco_max ? String(item.preco_max) : '')
  const [obs,     setObs]     = useState(item?.obs ?? '')
  const [saving,  setSaving]  = useState(false)
  const nomeRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setTimeout(() => nomeRef.current?.focus(), 100) }, [])

  async function handleSubmit() {
    const nomeTrimmed = nome.trim()
    if (!nomeTrimmed) { alert('Nome do item é obrigatório.'); return }

    const payload: CreateItemPayload = {
      nome: nomeTrimmed, amb, cat, pri,
      qtd: Math.max(1, qtd),
      preco_min: parseFloat(precoMin) || 0,
      preco_max: parseFloat(precoMax) || 0,
      obs: obs.trim(),
    }

    setSaving(true)
    try {
      if (isEdit) {
        await updateItem(item!.id, payload)
        onSuccess(`"${nomeTrimmed}" atualizado`)
      } else {
        await addItem(payload)
        onSuccess(`"${nomeTrimmed}" adicionado`)
      }
      onClose()
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card border border-border-2 rounded-[14px] p-7 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="font-display text-xl font-semibold mb-5">
          {isEdit ? 'Editar item' : 'Novo item'}
        </h2>

        {/* Nome */}
        <div className="mb-4">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">Nome do item *</label>
          <input
            ref={nomeRef}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="ex: Sofá 3 lugares"
            className="w-full px-3 py-2.5 border border-border-2 rounded-lg text-sm bg-bg-3 text-white placeholder-white/30 outline-none focus:border-wm-blue focus:ring-2 focus:ring-wm-blue/10 transition-all"
          />
        </div>

        {/* Ambiente + Categoria */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">Ambiente *</label>
            <select value={amb} onChange={(e) => setAmb(e.target.value as Room)} className="w-full px-3 py-2.5 border border-border-2 rounded-lg text-sm bg-bg-3 text-white outline-none focus:border-wm-blue transition-all appearance-none">
              {ROOMS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">Categoria *</label>
            <select value={cat} onChange={(e) => setCat(e.target.value as Category)} className="w-full px-3 py-2.5 border border-border-2 rounded-lg text-sm bg-bg-3 text-white outline-none focus:border-wm-blue transition-all appearance-none">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Prioridade + Qtd */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">Prioridade *</label>
            <select value={pri} onChange={(e) => setPri(e.target.value as Priority)} className="w-full px-3 py-2.5 border border-border-2 rounded-lg text-sm bg-bg-3 text-white outline-none focus:border-wm-blue transition-all appearance-none">
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">Quantidade</label>
            <input type="number" min="1" value={qtd} onChange={(e) => setQtd(Number(e.target.value))} className="w-full px-3 py-2.5 border border-border-2 rounded-lg text-sm bg-bg-3 text-white outline-none focus:border-wm-blue transition-all" />
          </div>
        </div>

        {/* Preços */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">Preço mínimo (R$)</label>
            <input type="number" min="0" placeholder="0" value={precoMin} onChange={(e) => setPrecoMin(e.target.value)} className="w-full px-3 py-2.5 border border-border-2 rounded-lg text-sm bg-bg-3 text-white placeholder-white/30 outline-none focus:border-wm-blue transition-all" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">Preço máximo (R$)</label>
            <input type="number" min="0" placeholder="0" value={precoMax} onChange={(e) => setPrecoMax(e.target.value)} className="w-full px-3 py-2.5 border border-border-2 rounded-lg text-sm bg-bg-3 text-white placeholder-white/30 outline-none focus:border-wm-blue transition-all" />
          </div>
        </div>

        {/* Obs */}
        <div className="mb-6">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">Observação / Descrição</label>
          <textarea
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            placeholder="Dicas de tamanho, marca, modelo..."
            rows={3}
            className="w-full px-3 py-2.5 border border-border-2 rounded-lg text-sm bg-bg-3 text-white placeholder-white/30 outline-none focus:border-wm-blue transition-all resize-y"
          />
        </div>

        <div className="flex gap-2 justify-end border-t border-border pt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] font-medium border border-border-2 text-white/60 hover:bg-card-2 hover:text-white transition-all">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-[13px] font-medium gradient-bg text-white hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {saving ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Adicionar item'}
          </button>
        </div>
      </div>
    </div>
  )
}
