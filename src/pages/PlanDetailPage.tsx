import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { plansApi, ApiPlan, ApiDay } from '../storage/plans'
import { exercisesApi, ApiExercise } from '../storage/exercises'

type DragPos = { dayId: string; index: number }

export function PlanDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [plan, setPlan] = useState<ApiPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [exercises, setExercises] = useState<ApiExercise[]>([])
  const [editingDayId, setEditingDayId] = useState<string | null>(null)
  const [pickerDayId, setPickerDayId] = useState<string | null>(null)
  const [creatingDay, setCreatingDay] = useState(false)
  const [newDayName, setNewDayName] = useState('')
  const [dragFrom, setDragFrom] = useState<DragPos | null>(null)
  const [dragOver, setDragOver] = useState<DragPos | null>(null)

  useEffect(() => {
    if (!id) return
    Promise.all([plansApi.get(id), exercisesApi.list()])
      .then(([p, ex]) => { setPlan(p); setExercises(ex) })
      .finally(() => setLoading(false))
  }, [id])

  async function reload() {
    if (!id) return
    const p = await plansApi.get(id)
    setPlan(p)
  }

  async function handleAddDay() {
    const name = newDayName.trim()
    if (!name || !plan) return
    await plansApi.addDay(plan.id, name, plan.days.length)
    setNewDayName('')
    setCreatingDay(false)
    await reload()
  }

  async function handleDeleteDay(dayId: string) {
    await plansApi.deleteDay(dayId)
    if (editingDayId === dayId) setEditingDayId(null)
    await reload()
  }

  async function handleAddExercise(dayId: string, exercise: ApiExercise) {
    const day = plan?.days.find((d) => d.id === dayId)
    await plansApi.addExercise(dayId, exercise.id, day?.day_exercises.length ?? 0)
    setPickerDayId(null)
    await reload()
  }

  async function handleRemoveExercise(dayExerciseId: string) {
    await plansApi.removeExercise(dayExerciseId)
    await reload()
  }

  async function handleCreateExercise(dayId: string, name: string, muscleGroup?: string) {
    const exercise = await exercisesApi.create(name, muscleGroup)
    setExercises((prev) => [...prev, exercise])
    await handleAddExercise(dayId, exercise)
  }

  function handleDragStart(dayId: string, index: number) {
    setDragFrom({ dayId, index })
  }

  function handleDragOver(e: React.DragEvent, dayId: string, index: number) {
    e.preventDefault()
    if (dragFrom?.dayId !== dayId) return
    setDragOver({ dayId, index })
  }

  function handleDrop(day: ApiDay) {
    if (!dragFrom || !dragOver || dragFrom.dayId !== day.id) return
    const from = dragFrom.index
    const to = dragOver.index
    if (from === to) { setDragFrom(null); setDragOver(null); return }
    // Optimistic local reorder (not persisted — will be connected when backend supports it)
    setPlan((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        days: prev.days.map((d) => {
          if (d.id !== day.id) return d
          const exs = [...d.day_exercises]
          const [moved] = exs.splice(from, 1)
          exs.splice(to, 0, moved)
          return { ...d, day_exercises: exs }
        }),
      }
    })
    setDragFrom(null)
    setDragOver(null)
  }

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-600 text-sm">Carregando...</div>
  if (!plan) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">Plano não encontrado</div>

  return (
    <div className="min-h-screen pb-6">
      <div className="sticky top-0 bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-800/60 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center text-zinc-400 rounded-xl active:bg-zinc-800"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 15l-5-5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-white">{plan.name}</h1>
      </div>

      <div className="px-4 pt-4">
        {plan.days.map((day) => {
          const isEditing = editingDayId === day.id

          return (
            <div key={day.id} className="bg-zinc-900 rounded-2xl p-4 mb-3">
              {/* Card header */}
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold text-white">{day.name}</h2>
                <div className="flex items-center gap-1">
                  {isEditing && (
                    <button
                      onClick={() => handleDeleteDay(day.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 active:text-red-400 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 4h10M5 4V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4M6 7v4M8 7v4M3 4l.8 7.2a1 1 0 001 .8h4.4a1 1 0 001-.8L11 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => { setEditingDayId(isEditing ? null : day.id); setPickerDayId(null) }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 active:bg-zinc-800 transition-colors"
                  >
                    {isEditing ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 8l4 4 8-8" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                        <path d="M10.5 1.5a2.121 2.121 0 013 3L4.5 13.5l-4 1 1-4 9-9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Exercise list */}
              <div className="mb-3">
                {day.day_exercises.map((de, idx) => {
                  const isDragging = dragFrom?.dayId === day.id && dragFrom?.index === idx
                  const isOver = dragOver?.dayId === day.id && dragOver?.index === idx
                  return (
                    <div
                      key={de.id}
                      draggable={isEditing}
                      onDragStart={() => handleDragStart(day.id, idx)}
                      onDragOver={(e) => handleDragOver(e, day.id, idx)}
                      onDrop={() => handleDrop(day)}
                      onDragEnd={() => { setDragFrom(null); setDragOver(null) }}
                      className={`flex items-center gap-2 py-2 border-t-2 transition-colors group ${isOver ? 'border-emerald-500' : 'border-transparent'} ${isDragging ? 'opacity-40' : ''}`}
                    >
                      {isEditing && (
                        <span className="shrink-0 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                            <circle cx="4" cy="2.5" r="1.2" /><circle cx="4" cy="7" r="1.2" /><circle cx="4" cy="11.5" r="1.2" />
                            <circle cx="10" cy="2.5" r="1.2" /><circle cx="10" cy="7" r="1.2" /><circle cx="10" cy="11.5" r="1.2" />
                          </svg>
                        </span>
                      )}
                      <span className="flex-1 text-zinc-200 text-sm">{de.exercise.name}</span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-zinc-500 text-xs">{de.exercise.muscle_group}</span>
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveExercise(de.id)}
                            className="w-5 h-5 flex items-center justify-center text-zinc-500 active:text-red-400 transition-colors"
                          >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
                {day.day_exercises.length === 0 && (
                  <p className="text-zinc-600 text-sm py-1">Nenhum exercício ainda.</p>
                )}
              </div>

              {/* Card footer */}
              {isEditing ? (
                <>
                  <button
                    onClick={() => setPickerDayId(pickerDayId === day.id ? null : day.id)}
                    className="w-full py-2.5 text-sm text-emerald-500 border border-emerald-500/25 rounded-xl active:bg-emerald-500/10 transition-colors"
                  >
                    + Adicionar exercício
                  </button>
                  {pickerDayId === day.id && (
                    <ExercisePicker
                      existingIds={day.day_exercises.map((e) => e.exercise_id)}
                      exercises={exercises}
                      onSelect={(ex) => handleAddExercise(day.id, ex)}
                      onCreate={(name, muscleGroup) => handleCreateExercise(day.id, name, muscleGroup)}
                    />
                  )}
                </>
              ) : (
                <div className="flex justify-end">
                  <Link
                    to={`/workout/${day.id}`}
                    state={{ day }}
                    className="px-5 py-2 bg-emerald-500 text-black text-sm font-bold rounded-xl active:bg-emerald-400 transition-colors"
                  >
                    Iniciar
                  </Link>
                </div>
              )}
            </div>
          )
        })}

        {/* Add day */}
        {creatingDay ? (
          <div className="bg-zinc-900 rounded-2xl p-4 mb-3 flex gap-2">
            <input
              type="text"
              value={newDayName}
              onChange={(e) => setNewDayName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddDay()
                if (e.key === 'Escape') { setCreatingDay(false); setNewDayName('') }
              }}
              placeholder="Nome do treino (ex: Push)..."
              autoFocus
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleAddDay}
              disabled={!newDayName.trim()}
              className="px-4 py-2 bg-emerald-500 text-black text-sm font-bold rounded-xl disabled:opacity-40"
            >
              Criar
            </button>
            <button
              onClick={() => { setCreatingDay(false); setNewDayName('') }}
              className="w-10 flex items-center justify-center text-zinc-500 rounded-xl"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setCreatingDay(true)}
            className="w-full py-3 text-sm text-zinc-500 border border-zinc-800 rounded-2xl active:bg-zinc-900 transition-colors"
          >
            + Adicionar treino
          </button>
        )}
      </div>
    </div>
  )
}

function ExercisePicker({
  existingIds,
  exercises,
  onSelect,
  onCreate,
}: {
  existingIds: string[]
  exercises: ApiExercise[]
  onSelect: (ex: ApiExercise) => void
  onCreate: (name: string, muscleGroup?: string) => void
}) {
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState<string | null>(null)
  const [muscleGroup, setMuscleGroup] = useState('')

  const available = exercises.filter(
    (e) => !existingIds.includes(e.id) && e.name.toLowerCase().includes(query.toLowerCase()),
  )
  const trimmed = query.trim()
  const hasExactMatch = exercises.some((e) => e.name.toLowerCase() === trimmed.toLowerCase())
  const canCreate = trimmed.length > 0 && !hasExactMatch

  function startCreating() {
    setCreating(trimmed)
    setMuscleGroup('')
  }

  function confirmCreate() {
    if (!creating) return
    onCreate(creating, muscleGroup.trim() || undefined)
  }

  function cancelCreate() {
    setCreating(null)
    setMuscleGroup('')
  }

  return (
    <div className="mt-3 bg-zinc-800 rounded-xl overflow-hidden">
      {creating ? (
        <div className="p-3 flex flex-col gap-2">
          <p className="text-sm text-zinc-100 font-medium">{creating}</p>
          <input
            type="text"
            placeholder="Grupamento muscular (opcional)"
            value={muscleGroup}
            onChange={(e) => setMuscleGroup(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') confirmCreate()
              if (e.key === 'Escape') cancelCreate()
            }}
            autoFocus
            className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
          <div className="flex gap-2">
            <button
              onClick={cancelCreate}
              className="flex-1 py-2 text-sm text-zinc-400 border border-zinc-700 rounded-lg active:bg-zinc-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmCreate}
              className="flex-1 py-2 text-sm text-black font-bold bg-emerald-500 rounded-lg active:bg-emerald-400 transition-colors"
            >
              Criar
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="px-3 py-2 border-b border-zinc-700">
            <input
              type="text"
              placeholder="Buscar ou criar exercício..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {available.map((ex) => (
              <button
                key={ex.id}
                onClick={() => onSelect(ex)}
                className="w-full flex justify-between items-center px-3 py-2.5 text-left active:bg-zinc-700 transition-colors"
              >
                <span className="text-sm text-zinc-100">{ex.name}</span>
                <span className="text-xs text-zinc-500">{ex.muscle_group}</span>
              </button>
            ))}
            {canCreate && (
              <button
                onClick={startCreating}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-left active:bg-zinc-700 border-t border-zinc-700"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-emerald-500 shrink-0">
                  <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="text-sm text-emerald-400">Criar "{trimmed}"</span>
              </button>
            )}
            {available.length === 0 && !canCreate && (
              <p className="text-center text-zinc-600 text-sm py-4">Nenhum resultado</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
