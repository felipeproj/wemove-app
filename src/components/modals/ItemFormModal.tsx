import { useState, useEffect, useRef } from 'react'
import type { Item, Room, Category, Priority, CreateItemPayload } from '../../types'
import { useListStore } from '../../store/useListStore'

const ROOMS: Room[] = ['Sala','Cozinha','Quarto Casal','Escritório','Área de Serviço','Banheiro / Lavabo','Geral / Tecnologia']
const CATEGORIES: Category[] = ['Essencial','Não Essencial']
const PRIORITIES: Priority[] = ['Alta','Média','Baixa']

interface Props {
  item?: Item
  onClose: () => void
  onSuccess: (msg: string) => void
  onError: (msg: string) => void
}

const inputCls = 'w-full px-4 py-3 border border-border rounded-xl text-sm text-ink bg-bg placeholder-ink-3 outline-none focus:border-wm-blue focus:ring-2 focus:ring-wm-blue/10 transition-all'
const labelCls = 'block text-xs font-bold uppercase tracking-wider text-ink-3 mb-2'

export function ItemFormModal({ item, onClose, onSuccess, onError }: Props) {
  const addItem    = useListStore((s) => s.addItem)
  const updateItem = useListStore((s) => s.updateItem)
  const isEdit     = !!item

  const [nome,     setNome]     = useState(item?.nome    ?? '')
  const [amb,      setAmb]      = useState<Room>(item?.amb ?? 'Sala')
  const [cat,      setCat]      = useState<Category>(item?.cat ?? 'Essencial')
  const [pri,      setPri]      = useState<Priority>(item?.pri ?? 'Alta')
  const [qtd,      setQtd]      = useState(item?.qtd ?? 1)
  const [precoMin, setPrecoMin] = useState(item?.preco_min ? String(item.preco_min) : '')
  const [precoMax, setPrecoMax] = useState(item?.preco_max ? String(item.preco_max) : '')
  const [obs,      setObs]      = useState(item?.obs ?? '')
  const [saving,   setSaving]   = useState(false)
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
      if (isEdit) { await updateItem(item!.id, payload); onSuccess(`"${nomeTrimmed}" atualizado`) }
      else        { await addItem(payload);               onSuccess(`"${nomeTrimmed}" adicionado`) }
      onClose()
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally { setSaving(false) }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-ink/30 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-modal animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-ink">{isEdit ? 'Editar item' : 'Novo item'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-ink-3 hover:bg-bg-2 transition-all">
            <svg width="12" height="12" viewBox="0 0 11 11" fill="none"><path d="M1.5 1.5L9.5 9.5M9.5 1.5L1.5 9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
        </div>

        <div className="mb-4">
          <label className={labelCls}>Nome do item *</label>
          <input ref={nomeRef} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="ex: Sofá 3 lugares" className={inputCls} />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className={labelCls}>Ambiente *</label>
            <select value={amb} onChange={(e) => setAmb(e.target.value as Room)} className={inputCls}>
              {ROOMS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Categoria *</label>
            <select value={cat} onChange={(e) => setCat(e.target.value as Category)} className={inputCls}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className={labelCls}>Prioridade *</label>
            <select value={pri} onChange={(e) => setPri(e.target.value as Priority)} className={inputCls}>
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Quantidade</label>
            <input type="number" min="1" value={qtd} onChange={(e) => setQtd(Number(e.target.value))} className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className={labelCls}>Preço mínimo (R$)</label>
            <input type="number" min="0" placeholder="0" value={precoMin} onChange={(e) => setPrecoMin(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Preço máximo (R$)</label>
            <input type="number" min="0" placeholder="0" value={precoMax} onChange={(e) => setPrecoMax(e.target.value)} className={inputCls} />
          </div>
        </div>

        <div className="mb-6">
          <label className={labelCls}>Observação / Descrição</label>
          <textarea value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Dicas de tamanho, marca, modelo..." rows={3} className={`${inputCls} resize-y`} />
        </div>

        <div className="flex gap-3 border-t border-border pt-5">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-semibold border border-border text-ink-2 hover:bg-bg-2 transition-all">Cancelar</button>
          <button onClick={handleSubmit} disabled={saving} className="flex-1 py-3 rounded-xl text-sm font-semibold gradient-bg text-white shadow-btn hover:opacity-90 disabled:opacity-50 transition-all">
            {saving ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Adicionar item'}
          </button>
        </div>
      </div>
    </div>
  )
}
