import { DayExercise } from '../data/mock'
import { useSessionStore } from '../store/session'
import { SetRow } from './SetRow'

interface ExerciseCardProps {
  dayExercise: DayExercise
}

export function ExerciseCard({ dayExercise }: ExerciseCardProps) {
  const { executions, addSet } = useSessionStore()
  const execution = executions.find((e) => e.exerciseId === dayExercise.exercise.id)

  if (!execution) return null

  const doneCount = execution.sets.filter((s) => s.done).length

  return (
    <div className="bg-zinc-900 rounded-2xl p-4 mb-3">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-white text-xl">{dayExercise.exercise.name}</h3>
          {dayExercise.exercise.muscleGroup && (
            <span className="text-sm text-zinc-500">{dayExercise.exercise.muscleGroup}</span>
          )}
        </div>
        <span className="text-xs text-zinc-500 mt-1 shrink-0">
          {doneCount}/{execution.sets.length} séries
        </span>
      </div>

      <div className="flex gap-2 mb-1 pl-6 pr-1 items-center">
        <span className="flex-1 text-center text-xs text-zinc-600">kg</span>
        <span className="flex-1 text-center text-xs text-zinc-600">reps</span>
        <div className="flex gap-1 shrink-0">
          <span className="w-7 text-center text-xs text-zinc-600">F</span>
          <span className="w-7 text-center text-xs text-zinc-600">O</span>
          <span className="w-7 text-center text-xs text-zinc-600">D</span>
          <span className="w-7 text-center text-xs text-zinc-600">M</span>
        </div>
        <span className="w-9" />
      </div>

      {execution.sets.map((set, i) => (
        <SetRow
          key={i}
          exerciseId={dayExercise.exercise.id}
          setIndex={i}
          set={set}
          setNumber={i + 1}
        />
      ))}

      <button
        onClick={() => addSet(dayExercise.exercise.id)}
        className="mt-3 w-full py-2.5 text-sm text-emerald-500 border border-emerald-500/25 rounded-xl active:bg-emerald-500/10 transition-colors"
      >
        + Série
      </button>
    </div>
  )
}
