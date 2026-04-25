/**
 * AdminPage — Dashboard de métricas e gestão de usuários.
 *
 * Acessível apenas para usuários com role = 'admin'.
 * Exibe KPIs do negócio, gráfico simples de planos e tabela de usuários
 * com capacidade de alterar role e plan.
 */

import { useEffect, useState, useCallback } from 'react'
import { adminApi } from '../services/api'
import type { AdminMetrics, AdminUser } from '../services/api'
import { useAuthStore } from '../store/useAuthStore'

interface Props {
  onBack: () => void
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  icon,
  color = 'blue',
}: {
  label: string
  value: number | string
  sub?: string
  icon: string
  color?: 'blue' | 'green' | 'purple' | 'orange'
}) {
  const colors = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-emerald-50 text-emerald-600',
    purple: 'bg-violet-50 text-violet-600',
    orange: 'bg-amber-50 text-amber-600',
  }
  return (
    <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-ink-2">{label}</span>
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${colors[color]}`}>
          {icon}
        </span>
      </div>
      <div className="text-3xl font-black text-ink tracking-tight">{value}</div>
      {sub && <div className="text-xs text-ink-3 mt-1">{sub}</div>}
    </div>
  )
}

function DeltaBadge({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-lg font-bold text-ink">{value}</div>
      <div className="text-[11px] text-ink-3">{label}</div>
    </div>
  )
}

const PLAN_LABELS: Record<string, string> = {
  free:      'Grátis',
  essencial: 'Essencial',
  familia:   'Família',
  pro:       'Pro',
}

const PLAN_COLORS: Record<string, string> = {
  free:      'bg-slate-100 text-slate-600',
  essencial: 'bg-blue-100 text-blue-700',
  familia:   'bg-violet-100 text-violet-700',
  pro:       'bg-amber-100 text-amber-700',
}

const ROLE_COLORS: Record<string, string> = {
  user:  'bg-slate-100 text-slate-600',
  admin: 'bg-rose-100 text-rose-700',
}

// ── Página principal ──────────────────────────────────────────────────────────

export function AdminPage({ onBack }: Props) {
  const { user: authUser } = useAuthStore()

  const [metrics,      setMetrics]      = useState<AdminMetrics | null>(null)
  const [metricsError, setMetricsError] = useState<string | null>(null)
  const [users,        setUsers]        = useState<AdminUser[]>([])
  const [totalUsers,   setTotalUsers]   = useState(0)
  const [userPage,     setUserPage]     = useState(1)
  const [userSearch,   setUserSearch]   = useState('')
  const [usersLoading, setUsersLoading] = useState(true)
  const [updating,     setUpdating]     = useState<string | null>(null)
  const [toast,        setToast]        = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // Carrega métricas
  useEffect(() => {
    adminApi.getMetrics()
      .then(setMetrics)
      .catch(e => setMetricsError(e.message ?? 'Erro ao carregar métricas'))
  }, [])

  // Carrega usuários
  const loadUsers = useCallback(async (page: number, search: string) => {
    setUsersLoading(true)
    try {
      const res = await adminApi.getUsers(page, 20, search)
      setUsers(res.users)
      setTotalUsers(res.total)
    } catch {
      /* silencioso */
    } finally {
      setUsersLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => loadUsers(userPage, userSearch), 300)
    return () => clearTimeout(t)
  }, [userPage, userSearch, loadUsers])

  async function handleRoleChange(userId: string, field: 'role' | 'plan', value: string) {
    setUpdating(userId)
    try {
      await adminApi.updateUserRole(userId, { [field]: value as never })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, [field]: value } : u))
      showToast('Permissão atualizada ✓')
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Erro ao atualizar')
    } finally {
      setUpdating(null)
    }
  }

  const totalPages = Math.ceil(totalUsers / 20)

  return (
    <div className="min-h-screen bg-surface pb-16">

      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-surface text-ink-2 hover:text-ink transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div>
            <h1 className="font-bold text-ink text-sm leading-none">Admin Dashboard</h1>
            <p className="text-[11px] text-ink-3 mt-0.5">WeMove · acesso restrito</p>
          </div>
          <span className="ml-auto px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-[11px] font-bold">
            🔐 Admin
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-6 space-y-8">

        {/* ── KPI Cards ── */}
        {metricsError ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            {metricsError}
          </div>
        ) : !metrics ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-border rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard
                label="Usuários"
                value={metrics.users.total.toLocaleString('pt-BR')}
                sub={`+${metrics.users.last_7d} esta semana`}
                icon="👥"
                color="blue"
              />
              <KpiCard
                label="Listas criadas"
                value={metrics.lists.total.toLocaleString('pt-BR')}
                sub={`+${metrics.lists.last_7d} esta semana`}
                icon="📋"
                color="purple"
              />
              <KpiCard
                label="Recomendações"
                value={metrics.recommendations.total.toLocaleString('pt-BR')}
                sub={`+${metrics.recommendations.last_7d} esta semana`}
                icon="🛒"
                color="green"
              />
              <KpiCard
                label="Conversão pago"
                value={`${metrics.conversion_rate}%`}
                sub={`${metrics.paid_users} usuários pagos`}
                icon="💰"
                color="orange"
              />
            </div>

            {/* Linha de atividade 24h */}
            <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-ink mb-4">Atividade nas últimas 24h</h2>
              <div className="flex gap-8">
                <DeltaBadge value={metrics.users.last_24h}           label="novos usuários" />
                <DeltaBadge value={metrics.lists.last_24h}           label="listas criadas" />
                <DeltaBadge value={metrics.recommendations.last_24h} label="recomendações" />
              </div>
            </div>

            {/* Distribuição de planos */}
            <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-ink mb-4">Distribuição de planos</h2>
              <div className="space-y-3">
                {(Object.entries(metrics.plans) as [string, number][]).map(([plan, count]) => {
                  const pct = metrics.users.total > 0
                    ? Math.round((count / metrics.users.total) * 100)
                    : 0
                  const barColors: Record<string, string> = {
                    free:      'bg-slate-300',
                    essencial: 'bg-blue-400',
                    familia:   'bg-violet-400',
                    pro:       'bg-amber-400',
                  }
                  return (
                    <div key={plan} className="flex items-center gap-3">
                      <span className="w-20 text-xs font-semibold text-ink-2">{PLAN_LABELS[plan]}</span>
                      <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${barColors[plan]}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-xs text-ink-2">{count} <span className="text-ink-3">({pct}%)</span></span>
                    </div>
                  )
                })}
              </div>
              <p className="text-[11px] text-ink-3 mt-3">
                Atualizado em {new Date(metrics.generated_at).toLocaleString('pt-BR')}
              </p>
            </div>
          </>
        )}

        {/* ── Tabela de usuários ── */}
        <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center gap-3">
            <h2 className="font-semibold text-ink flex-1">Usuários</h2>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" width="13" height="13" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                value={userSearch}
                onChange={e => { setUserSearch(e.target.value); setUserPage(1) }}
                placeholder="Buscar por e-mail..."
                className="pl-8 pr-3 py-2 text-sm border border-border rounded-xl bg-surface outline-none focus:border-wm-blue w-56"
              />
            </div>
            <span className="text-xs text-ink-3">{totalUsers} usuários</span>
          </div>

          {usersLoading ? (
            <div className="p-8 text-center text-sm text-ink-3">Carregando...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-sm text-ink-3">Nenhum usuário encontrado.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-2">Usuário</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-2">Cadastro</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-ink-2">Role</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-ink-2">Plano</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => {
                    const isMe = u.id === authUser?.id
                    const busy = updating === u.id
                    return (
                      <tr key={u.id} className={`border-b border-border last:border-0 ${isMe ? 'bg-blue-50/40' : 'hover:bg-surface'}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {u.avatar_url ? (
                              <img src={u.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {(u.email?.[0] ?? '?').toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-ink truncate max-w-[180px]">{u.email}</div>
                              {u.full_name && (
                                <div className="text-[11px] text-ink-3 truncate max-w-[180px]">{u.full_name}</div>
                              )}
                            </div>
                            {isMe && (
                              <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0">você</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-ink-3 whitespace-nowrap">
                          {new Date(u.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <select
                            value={u.role}
                            disabled={busy || isMe}
                            onChange={e => handleRoleChange(u.id, 'role', e.target.value)}
                            className={`text-[11px] font-semibold px-2 py-1 rounded-lg border-0 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${ROLE_COLORS[u.role]}`}
                          >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <select
                            value={u.plan}
                            disabled={busy}
                            onChange={e => handleRoleChange(u.id, 'plan', e.target.value)}
                            className={`text-[11px] font-semibold px-2 py-1 rounded-lg border-0 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${PLAN_COLORS[u.plan]}`}
                          >
                            <option value="free">Grátis</option>
                            <option value="essencial">Essencial</option>
                            <option value="familia">Família</option>
                            <option value="pro">Pro</option>
                          </select>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-border flex items-center justify-between">
              <button
                onClick={() => setUserPage(p => Math.max(1, p - 1))}
                disabled={userPage === 1}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border disabled:opacity-40 hover:bg-surface transition-colors"
              >
                ← Anterior
              </button>
              <span className="text-xs text-ink-3">
                Página {userPage} de {totalPages}
              </span>
              <button
                onClick={() => setUserPage(p => Math.min(totalPages, p + 1))}
                disabled={userPage === totalPages}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border disabled:opacity-40 hover:bg-surface transition-colors"
              >
                Próxima →
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-ink text-white text-sm px-4 py-2.5 rounded-xl shadow-lg z-50 pointer-events-none">
          {toast}
        </div>
      )}
    </div>
  )
}
