import { useState, useCallback } from 'react'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

let nextId = 0

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = nextId++
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  return { toasts, show }
}
