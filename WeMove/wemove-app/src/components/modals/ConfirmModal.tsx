interface Props {
  message: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function ConfirmModal({ message, onConfirm, onCancel, loading }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/70 backdrop-blur-sm">
      <div className="bg-card border border-border-2 rounded-[14px] p-6 w-full max-w-sm">
        <h3 className="font-display text-[17px] font-semibold mb-2.5">Confirmar remoção</h3>
        <p className="text-[13px] text-white/60 mb-5 leading-relaxed">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-[13px] font-medium border border-border-2 text-white/60 hover:bg-card-2 hover:text-white transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-[13px] font-medium bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50"
          >
            {loading ? 'Removendo...' : 'Remover'}
          </button>
        </div>
      </div>
    </div>
  )
}
