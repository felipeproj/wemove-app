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
    <div className="fixed bottom-24 md:bottom-6 right-4 z-[999] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={[
            'px-4 py-3 rounded-xl text-[13px] font-semibold animate-toast-in border',
            t.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700 shadow-modal'
              : 'bg-white border-border text-ink shadow-card',
          ].join(' ')}
        >
          {t.type === 'error' ? '⚠️ ' : '✓ '}{t.message}
        </div>
      ))}
    </div>
  )
}
