interface ToastItem {
  id: number
  message: string
  type: 'success' | 'error'
}

interface Props {
  toasts: ToastItem[]
}

export function ToastContainer({ toasts }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={[
            'px-5 py-3 rounded-[10px] text-[13px] font-medium shadow-2xl animate-toast-in border',
            t.type === 'error'
              ? 'bg-red-500/20 border-red-500/30 text-red-200'
              : 'bg-card-3 border-border-2 text-white',
          ].join(' ')}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
