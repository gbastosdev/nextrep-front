import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DayExercise, SetLog } from '../data/mock'

export interface ActiveSet {
  weight: number | null
  reps: number | null
  effort: 1 | 2 | 3 | 4 | null
  obs: string
  done: boolean
  prefilled: boolean
}

export interface ExerciseExecution {
  exerciseId: string
  sets: ActiveSet[]
}

type SetPatch = Partial<Pick<ActiveSet, 'weight' | 'reps' | 'effort' | 'obs'>>

interface SessionStore {
  dayId: string | null
  dayName: string | null
  startedAt: number | null
  dayExercises: DayExercise[]
  executions: ExerciseExecution[]
  startSession: (dayId: string, dayName: string, dayExercises: DayExercise[]) => void
  addSet: (exerciseId: string) => void
  updateSet: (exerciseId: string, setIndex: number, patch: SetPatch) => void
  toggleDone: (exerciseId: string, setIndex: number) => void
  finishSession: () => void
}

function fromHistory(log: SetLog): ActiveSet {
  return { weight: log.weight, reps: log.reps, effort: log.effort, obs: '', done: false, prefilled: true }
}

function emptySet(last?: ActiveSet): ActiveSet {
  return { weight: last?.weight ?? null, reps: last?.reps ?? null, effort: null, obs: '', done: false, prefilled: false }
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      dayId: null,
      dayName: null,
      startedAt: null,
      dayExercises: [],
      executions: [],

      startSession: (dayId, dayName, dayExercises) =>
        set({
          dayId,
          dayName,
          startedAt: Date.now(),
          dayExercises,
          executions: dayExercises.map((de) => ({
            exerciseId: de.exercise.id,
            sets: de.lastSession.length > 0 ? de.lastSession.map(fromHistory) : [emptySet()],
          })),
        }),

      addSet: (exerciseId) =>
        set((state) => ({
          executions: state.executions.map((ex) =>
            ex.exerciseId !== exerciseId
              ? ex
              : { ...ex, sets: [...ex.sets, emptySet(ex.sets[ex.sets.length - 1])] },
          ),
        })),

      updateSet: (exerciseId, setIndex, patch) =>
        set((state) => ({
          executions: state.executions.map((ex) =>
            ex.exerciseId !== exerciseId
              ? ex
              : {
                  ...ex,
                  sets: ex.sets.map((s, i) =>
                    i !== setIndex ? s : { ...s, ...patch, prefilled: false },
                  ),
                },
          ),
        })),

      toggleDone: (exerciseId, setIndex) =>
        set((state) => ({
          executions: state.executions.map((ex) =>
            ex.exerciseId !== exerciseId
              ? ex
              : {
                  ...ex,
                  sets: ex.sets.map((s, i) => (i !== setIndex ? s : { ...s, done: !s.done })),
                },
          ),
        })),

      finishSession: () =>
        set({ dayId: null, dayName: null, startedAt: null, dayExercises: [], executions: [] }),
    }),
    { name: 'nextrep-session' },
  ),
)
