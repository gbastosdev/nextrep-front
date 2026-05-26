import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { mockPlans, DayExercise } from '../data/mock'
import { ApiDay } from '../storage/plans'
import { useSessionStore } from '../store/session'
import { ExerciseCard } from '../components/ExerciseCard'

function apiDayToExercises(day: ApiDay): DayExercise[] {
  return day.day_exercises
    .slice()
    .sort((a, b) => a.order_index - b.order_index)
    .map((de) => ({
      exercise: { id: de.exercise_id, name: de.exercise.name, muscleGroup: de.exercise.muscle_group ?? '' },
      lastSession: [],
    }))
}

export function WorkoutPage() {
  const { dayId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { dayId: activeDayId, startedAt, executions, startSession, finishSession } = useSessionStore()
  const [elapsed, setElapsed] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)

  const apiDay = location.state?.day as ApiDay | undefined
  const mockDay = mockPlans.flatMap((p) => p.days).find((d) => d.id === dayId)

  const dayName = apiDay?.name ?? mockDay?.name ?? 'Treino'
  const dayExercises: DayExercise[] = apiDay ? apiDayToExercises(apiDay) : (mockDay?.exercises ?? [])
  const dayFound = apiDay != null || mockDay != null

  useEffect(() => {
    if (!dayFound || !dayId) return
    if (activeDayId !== dayId) {
      startSession(dayId, dayExercises)
      setCurrentIndex(0)
    }
  }, [dayId])

  useEffect(() => {
    if (!startedAt) return
    const diff = Math.floor((Date.now() - startedAt) / 1000)
    setElapsed(diff)
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(interval)
  }, [startedAt])

  if (!dayFound) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-400">
        Dia não encontrado
      </div>
    )
  }

  const totalSets = executions.flatMap((e) => e.sets).length
  const doneSets = executions.flatMap((e) => e.sets).filter((s) => s.done).length
  const isLast = currentIndex >= dayExercises.length - 1
  const currentExercise = dayExercises[currentIndex]

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  function handleFinish() {
    finishSession()
    navigate('/plans')
  }

  function handleNext() {
    if (!isLast) setCurrentIndex((i) => i + 1)
  }

  return (
    <div className="min-h-screen pb-36">
      {/* Header */}
      <div className="sticky top-0 bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-800/60 px-4 py-3">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-lg font-bold text-white">{dayName}</h1>
            <p className="text-xs text-zinc-500 mt-0.5">{doneSets}/{totalSets} séries concluídas</p>
          </div>
          <span className="font-mono text-zinc-400 text-sm mt-0.5">{formatTime(elapsed)}</span>
        </div>
        {totalSets > 0 && (
          <div className="mt-2 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${(doneSets / totalSets) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Exercise position indicator */}
      <div className="px-4 pt-5 pb-1 flex items-center justify-between">
        <div className="flex gap-1.5">
          {dayExercises.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === currentIndex ? 'w-6 bg-emerald-500' : 'w-1.5 bg-zinc-700'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-zinc-500">
          {currentIndex + 1} / {dayExercises.length}
        </span>
      </div>

      {/* Current exercise */}
      <div className="px-4 pt-3">
        {currentExercise && <ExerciseCard dayExercise={currentExercise} />}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 py-4 bg-zinc-950/95 backdrop-blur-sm border-t border-zinc-800/60 flex flex-col gap-2">
        {!isLast && (
          <button
            onClick={handleNext}
            className="w-full py-3.5 bg-zinc-800 text-white font-semibold rounded-2xl text-sm active:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
          >
            Próximo exercício
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <button
          onClick={handleFinish}
          className={`w-full py-3.5 font-bold rounded-2xl text-sm transition-colors ${
            isLast
              ? 'bg-emerald-500 text-black active:bg-emerald-400'
              : 'bg-zinc-900 text-zinc-400 border border-zinc-800 active:bg-zinc-800'
          }`}
        >
          Finalizar treino
        </button>
      </div>
    </div>
  )
}
