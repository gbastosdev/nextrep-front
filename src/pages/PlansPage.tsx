import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { plansApi, ApiPlan } from '../storage/plans'

export function PlansPage() {
  const [plans, setPlans] = useState<ApiPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    plansApi.list().then(setPlans).finally(() => setLoading(false))
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

  return (
    <div className="min-h-screen px-4 pt-8 pb-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Meus Planos</h1>
        <button
          onClick={() => setCreating(true)}
          className="w-9 h-9 flex items-center justify-center text-emerald-500 border border-emerald-500/30 rounded-xl text-xl leading-none active:bg-emerald-500/10 transition-colors"
        >
          +
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
        <div className="text-center text-zinc-600 mt-16 text-sm">Carregando...</div>
      )}

      {!loading && plans.map((plan) => (
        <div key={plan.id} className="bg-zinc-900 rounded-2xl p-4 mb-3">
          <h2 className="text-lg font-semibold text-white mb-3">{plan.name}</h2>

          <div className="flex flex-wrap gap-2 mb-4">
            {plan.days.map((day) => (
              <span key={day.id} className="px-3 py-1 bg-zinc-800 rounded-full text-xs text-zinc-300">
                {day.name}
              </span>
            ))}
            {plan.days.length === 0 && (
              <span className="text-xs text-zinc-600">Nenhum dia ainda</span>
            )}
          </div>

          <Link
            to={`/plans/${plan.id}`}
            className="block text-center py-2.5 text-sm text-emerald-500 border border-emerald-500/25 rounded-xl"
          >
            Ver plano
          </Link>
        </div>
      ))}

      {!loading && plans.length === 0 && !creating && (
        <div className="text-center text-zinc-500 mt-16">
          <p className="text-lg mb-1">Nenhum plano ainda</p>
          <p className="text-sm">Toque em + para criar seu primeiro plano</p>
        </div>
      )}
    </div>
  )
}
