import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { plansApi, ApiPlan } from '../api/plans'
import { sessionsApi, ApiSessionSummary } from '../api/sessions'
import { useAuthStore } from '../store/auth'

function formatSessionDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return `Hoje, ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
  if (diffDays === 1) return `Ontem, ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function SessionCard({ session }: { session: ApiSessionSummary }) {
  return (
    <Link
      to={`/sessions/${session.id}`}
      className="bg-zinc-900 rounded-2xl px-4 py-3 flex items-center justify-between active:bg-zinc-800 transition-colors"
    >
      <div>
        <p className="text-sm font-semibold text-white">{session.day_name ?? 'Treino livre'}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{formatSessionDate(session.started_at)}</p>
      </div>
      <div className="flex items-center gap-3 text-right">
        <div>
          <p className="text-sm font-bold text-emerald-400">{session.total_sets}</p>
          <p className="text-xs text-zinc-600">séries</p>
        </div>
        {session.duration_minutes != null && (
          <div>
            <p className="text-sm font-bold text-zinc-300">{session.duration_minutes}</p>
            <p className="text-xs text-zinc-600">min</p>
          </div>
        )}
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-zinc-600">
          <path d="M4 7h6M7 4l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Link>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return { text: 'Bom dia', icon: 'sun' }
  if (h >= 12 && h < 18) return { text: 'Boa tarde', icon: 'cloud-sun' }
  return { text: 'Boa noite', icon: 'moon' }
}

function GreetingIcon({ icon }: { icon: string }) {
  if (icon === 'sun') return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-amber-400">
      <circle cx="11" cy="11" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M11 2v2M11 18v2M2 11h2M18 11h2M4.22 4.22l1.42 1.42M16.36 16.36l1.42 1.42M4.22 17.78l1.42-1.42M16.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
  if (icon === 'cloud-sun') return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-amber-400">
      <circle cx="13" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M13 3v1M13 13v1M8 8H7M19 8h-1M9.76 4.76l.71.71M16.54 11.54l.71.71" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 16a3 3 0 010-6 4 4 0 018 0 3 3 0 010 6H5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-indigo-400">
      <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function PlansPage() {
  const [plans, setPlans] = useState<ApiPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)
  const [recentSessions, setRecentSessions] = useState<ApiSessionSummary[]>([])
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const greeting = getGreeting()

  const displayName = user?.email.split('@')[0] ?? ''

  useEffect(() => {
    plansApi.list().then(setPlans).finally(() => setLoading(false))
    sessionsApi.recent().then(setRecentSessions).catch(() => {})
  }, [])

  async function handleCreate() {
    const name = newName.trim()
    if (!name || saving) return
    setSaving(true)
    try {
      const plan = await plansApi.create(name)
      setPlans((prev) => [...prev, plan])
      setNewName('')
      setCreating(false)
    } finally {
      setSaving(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleCreate()
    if (e.key === 'Escape') { setCreating(false); setNewName('') }
  }

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="px-4 pt-10 pb-6 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <GreetingIcon icon={greeting.icon} />
            <h1 className="text-2xl font-black text-white">{greeting.text}</h1>
          </div>
          {displayName && (
            <p className="text-zinc-500 text-sm pl-0.5">{displayName}</p>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-zinc-600 active:bg-zinc-900 transition-colors"
          title="Sair"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M7 2H3a1 1 0 00-1 1v12a1 1 0 001 1h4M12 13l4-4-4-4M16 9H7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="px-4 space-y-6">
        {/* History section */}
        <section>
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Histórico recente</h2>
          {recentSessions.length === 0 ? (
            <div className="bg-zinc-900 rounded-2xl p-5 flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mb-1">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-zinc-600">
                  <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zM10 6v4l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-zinc-300 text-sm font-medium">Nenhum treino registrado ainda</p>
              <p className="text-zinc-600 text-xs leading-relaxed">
                Comece seu primeiro treino para começarmos a monitorar sua progressão!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentSessions.map((s) => (
                <SessionCard key={s.id} session={s} />
              ))}
            </div>
          )}
        </section>

        {/* Plans section */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Meus planos</h2>
            <button
              onClick={() => setCreating(true)}
              className="flex items-center gap-1 text-emerald-500 text-xs font-semibold active:opacity-70 transition-opacity"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              Novo plano
            </button>
          </div>

          {creating && (
            <div className="bg-zinc-900 rounded-2xl p-4 mb-3 flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nome do plano..."
                autoFocus
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || saving}
                className="px-4 py-2 bg-emerald-500 text-black text-sm font-bold rounded-xl disabled:opacity-40"
              >
                {saving ? '...' : 'Criar'}
              </button>
              <button
                onClick={() => { setCreating(false); setNewName('') }}
                className="w-10 flex items-center justify-center text-zinc-500 rounded-xl active:bg-zinc-800"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center text-zinc-700 py-8 text-sm">Carregando...</div>
          )}

          {!loading && plans.length === 0 && !creating && (
            <div className="bg-zinc-900 rounded-2xl p-5 flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mb-1">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-zinc-600">
                  <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M7 10h6M10 7v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-zinc-300 text-sm font-medium">Nenhum plano ainda</p>
              <p className="text-zinc-600 text-xs">Crie seu primeiro plano de treino!</p>
              <button
                onClick={() => setCreating(true)}
                className="mt-1 px-4 py-2 bg-emerald-500 text-black text-xs font-bold rounded-xl active:bg-emerald-400 transition-colors"
              >
                Criar plano
              </button>
            </div>
          )}

          {!loading && plans.map((plan) => (
            <div key={plan.id} className="bg-zinc-900 rounded-2xl p-4 mb-3">
              <h3 className="text-base font-semibold text-white mb-2">{plan.name}</h3>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {plan.days.map((day) => (
                  <span key={day.id} className="px-2.5 py-1 bg-zinc-800 rounded-full text-xs text-zinc-400">
                    {day.name}
                  </span>
                ))}
                {plan.days.length === 0 && (
                  <span className="text-xs text-zinc-700">Nenhum dia ainda</span>
                )}
              </div>
              <Link
                to={`/plans/${plan.id}`}
                className="block text-center py-2.5 text-sm text-emerald-500 border border-emerald-500/25 rounded-xl active:bg-emerald-500/10 transition-colors"
              >
                Ver plano
              </Link>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
