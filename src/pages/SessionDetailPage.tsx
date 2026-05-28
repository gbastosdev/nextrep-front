import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { sessionsApi, ApiSessionDetail } from '../api/sessions'

type Effort = 1 | 2 | 3 | 4

const EFFORT_LABEL: Record<Effort, string> = {
  1: 'Fácil',
  2: 'Ok',
  3: 'Difícil',
  4: 'Máximo',
}

const EFFORT_COLOR: Record<Effort, string> = {
  1: 'text-sky-400 bg-sky-500/15',
  2: 'text-emerald-400 bg-emerald-500/15',
  3: 'text-amber-400 bg-amber-500/15',
  4: 'text-red-400 bg-red-500/15',
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return `Hoje, ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
  if (diffDays === 1) return `Ontem, ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })
}

function avgEffort(detail: ApiSessionDetail): Effort | null {
  const values = detail.executions
    .flatMap((e) => e.sets)
    .map((s) => s.perceived_difficulty)
    .filter((v): v is number => v != null)
  if (values.length === 0) return null
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length) as Effort
}

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [detail, setDetail] = useState<ApiSessionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    sessionsApi.detail(id).then(setDetail).finally(() => setLoading(false))
  }, [id])

  async function handleDelete() {
    if (!id || deleting) return
    setDeleting(true)
    try {
      await sessionsApi.delete(id)
      navigate('/plans', { replace: true })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-600 text-sm">
        Carregando...
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-500 text-sm">
        Sessão não encontrada.
      </div>
    )
  }

  const totalSets = detail.executions.reduce((n, e) => n + e.sets.length, 0)
  const effort = avgEffort(detail)

  return (
    <div className="min-h-screen pb-10">
      {/* Header */}
      <div className="px-4 pt-10 pb-5">
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-zinc-500 text-sm active:text-zinc-300 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Voltar
          </button>
          <button
            onClick={() => setConfirming((c) => !c)}
            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${
              confirming ? 'bg-red-500/20 text-red-400' : 'text-zinc-600 active:bg-zinc-800'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 5h12M6 5V3.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V5M7 8v4M9 8v4M3 5l.9 8.1a1 1 0 001 .9h4.2a1 1 0 001-.9L11 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {confirming && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 mb-4 flex items-center justify-between">
            <p className="text-sm text-red-400">Excluir este treino?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirming(false)}
                className="px-3 py-1.5 text-xs text-zinc-400 border border-zinc-700 rounded-lg active:bg-zinc-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-1.5 text-xs text-white font-bold bg-red-500 rounded-lg active:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {deleting ? '...' : 'Excluir'}
              </button>
            </div>
          </div>
        )}

        <h1 className="text-2xl font-black text-white">{detail.day_name ?? 'Treino livre'}</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {formatDate(detail.started_at)}
          {detail.duration_minutes != null && ` · ${detail.duration_minutes} min`}
        </p>
      </div>

      <div className="px-4 space-y-4">
        {/* Stats */}
        <div className="flex gap-3">
          <div className="flex-1 bg-zinc-900 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-white">{totalSets}</p>
            <p className="text-xs text-zinc-500 mt-1">séries</p>
          </div>
          <div className="flex-1 bg-zinc-900 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-white">{detail.executions.length}</p>
            <p className="text-xs text-zinc-500 mt-1">exercícios</p>
          </div>
          {effort != null && (
            <div className="flex-1 bg-zinc-900 rounded-2xl p-4 text-center flex flex-col items-center justify-center">
              <span className={`text-sm font-bold px-2.5 py-1 rounded-lg ${EFFORT_COLOR[effort]}`}>
                {EFFORT_LABEL[effort]}
              </span>
              <p className="text-xs text-zinc-500 mt-1.5">estímulo</p>
            </div>
          )}
        </div>

        {/* Exercises */}
        {detail.executions.map((ex) => (
          <div key={ex.id} className="bg-zinc-900 rounded-2xl p-4">
            <div className="mb-3">
              <h3 className="font-bold text-white">{ex.exercise_name}</h3>
              {ex.muscle_group && (
                <p className="text-xs text-zinc-500 mt-0.5">{ex.muscle_group}</p>
              )}
            </div>

            <div className="flex gap-2 mb-1 pl-5 pr-1 items-center">
              <span className="flex-1 text-center text-xs text-zinc-600">kg</span>
              <span className="flex-1 text-center text-xs text-zinc-600">reps</span>
              <span className="w-16 text-center text-xs text-zinc-600">estímulo</span>
            </div>

            <div className="space-y-1">
              {ex.sets.map((s) => {
                const eff = s.perceived_difficulty as Effort | null
                return (
                  <div key={s.id} className="flex items-center gap-2 py-1.5">
                    <span className="w-4 shrink-0 text-center text-xs text-zinc-600">{s.set_number}</span>
                    <span className="flex-1 text-center text-sm text-zinc-300">
                      {s.weight != null ? s.weight : '—'}
                    </span>
                    <span className="flex-1 text-center text-sm text-zinc-300">
                      {s.reps != null ? s.reps : '—'}
                    </span>
                    <div className="w-16 flex justify-center">
                      {eff != null ? (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${EFFORT_COLOR[eff]}`}>
                          {EFFORT_LABEL[eff]}
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-700">—</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {ex.sets.some((s) => s.notes) && (
              <div className="mt-2 pt-2 border-t border-zinc-800 space-y-1">
                {ex.sets
                  .filter((s) => s.notes)
                  .map((s) => (
                    <p key={s.id} className="text-xs text-zinc-500">
                      Série {s.set_number}: {s.notes}
                    </p>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
