import { db } from './db'

export interface ApiExerciseInfo {
  name: string
  muscle_group: string | null
}

export interface ApiDayExercise {
  id: string
  exercise_id: string
  exercise: ApiExerciseInfo
  order_index: number
}

export interface ApiDay {
  id: string
  name: string
  order_index: number
  day_exercises: ApiDayExercise[]
}

export interface ApiPlan {
  id: string
  name: string
  days: ApiDay[]
}

async function buildPlan(planId: string): Promise<ApiPlan | null> {
  const plan = await db.plans.get(planId)
  if (!plan) return null

  const days = await db.days.where('plan_id').equals(planId).sortBy('order_index')

  const fullDays: ApiDay[] = await Promise.all(
    days.map(async (day) => {
      const dayExercises = await db.day_exercises
        .where('day_id')
        .equals(day.id)
        .sortBy('order_index')

      const fullExercises: ApiDayExercise[] = await Promise.all(
        dayExercises.map(async (de) => {
          const exercise = await db.exercises.get(de.exercise_id)
          return {
            id: de.id,
            exercise_id: de.exercise_id,
            exercise: { name: exercise?.name ?? '', muscle_group: exercise?.muscle_group ?? null },
            order_index: de.order_index,
          }
        }),
      )

      return { id: day.id, name: day.name, order_index: day.order_index, day_exercises: fullExercises }
    }),
  )

  return { id: plan.id, name: plan.name, days: fullDays }
}

export const plansApi = {
  list: async (): Promise<ApiPlan[]> => {
    const plans = await db.plans.orderBy('created_at').toArray()
    return Promise.all(plans.map((p) => buildPlan(p.id) as Promise<ApiPlan>))
  },

  get: async (id: string): Promise<ApiPlan> => {
    const plan = await buildPlan(id)
    if (!plan) throw new Error('Plan not found')
    return plan
  },

  create: async (name: string): Promise<ApiPlan> => {
    const id = crypto.randomUUID()
    await db.plans.add({ id, name, created_at: new Date().toISOString() })
    return { id, name, days: [] }
  },

  delete: async (id: string): Promise<void> => {
    const days = await db.days.where('plan_id').equals(id).toArray()
    for (const day of days) {
      await db.day_exercises.where('day_id').equals(day.id).delete()
    }
    await db.days.where('plan_id').equals(id).delete()
    await db.plans.delete(id)
  },

  addDay: async (planId: string, name: string, orderIndex: number): Promise<ApiDay> => {
    const id = crypto.randomUUID()
    await db.days.add({ id, plan_id: planId, name, order_index: orderIndex })
    return { id, name, order_index: orderIndex, day_exercises: [] }
  },

  deleteDay: async (dayId: string): Promise<void> => {
    await db.day_exercises.where('day_id').equals(dayId).delete()
    await db.days.delete(dayId)
  },

  addExercise: async (dayId: string, exerciseId: string, orderIndex: number): Promise<ApiDayExercise> => {
    const id = crypto.randomUUID()
    await db.day_exercises.add({ id, day_id: dayId, exercise_id: exerciseId, order_index: orderIndex })
    const exercise = await db.exercises.get(exerciseId)
    return {
      id,
      exercise_id: exerciseId,
      exercise: { name: exercise?.name ?? '', muscle_group: exercise?.muscle_group ?? null },
      order_index: orderIndex,
    }
  },

  removeExercise: async (dayExerciseId: string): Promise<void> => {
    await db.day_exercises.delete(dayExerciseId)
  },
}
