/**
 * usePolling — sincroniza a lista com a API a cada INTERVAL ms.
 *
 * Pausa automaticamente se:
 * - a aba estiver oculta (document.hidden)
 * - a lista ainda estiver carregando
 * - ocorrer erro de rede (tenta de novo no próximo ciclo)
 */

import { useEffect, useRef } from 'react'
import { useListStore } from '../store/useListStore'

const INTERVAL = 5000 // 5 segundos

export function usePolling() {
  const token      = useListStore((s) => s.token)
  const loading    = useListStore((s) => s.loading)
  const refreshItems = useListStore((s) => s.refreshItems)
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // Só começa a polear quando a lista estiver pronta
    if (!token || loading) return

    function tick() {
      if (document.hidden) return   // aba inativa — não desperdiça rede
      refreshItems()
    }

    timerRef.current = setInterval(tick, INTERVAL)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [token, loading, refreshItems])
}
