import { useEffect } from 'react'
import { useListStore } from '../../store/useListStore'

interface Props {
  message: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function ConfirmModal({ message, onConfirm, onCancel, loading }: Props) {
  const setModalOpen = useListStore((s) => s.setModalOpen)
  useEffect(() => {
    setModalOpen(true)
    return () => setModalOpen(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-ink/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-modal animate-fade-in">
        <h3 className="font-display text-lg font-bold text-ink mb-2">Remover item</h3>
        <p className="text-sm text-ink-2 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl text-sm font-semibold border border-border text-ink-2 hover:bg-bg-2 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-all"
          >
            {loading ? 'Removendo...' : 'Remover'}
          </button>
        </div>
      </div>
    </div>
  )
}
