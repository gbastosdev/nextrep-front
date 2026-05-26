import { api } from './client'

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
  is_active: boolean
  created_at: string
  days: ApiDay[]
}

export const plansApi = {
  list: () => api<ApiPlan[]>('/workouts/plans'),

  get: (id: string) => api<ApiPlan>(`/workouts/plans/${id}`),

  create: (name: string) =>
    api<ApiPlan>('/workouts/plans', { method: 'POST', body: JSON.stringify({ name }) }),

  delete: (id: string) => api<void>(`/workouts/plans/${id}`, { method: 'DELETE' }),

  addDay: (planId: string, name: string, orderIndex: number) =>
    api<ApiPlan>(`/workouts/plans/${planId}/days`, {
      method: 'POST',
      body: JSON.stringify({ name, order_index: orderIndex }),
    }),

  deleteDay: (dayId: string) =>
    api<void>(`/workouts/days/${dayId}`, { method: 'DELETE' }),

  addExercise: (dayId: string, exerciseId: string, orderIndex: number) =>
    api<ApiDayExercise>(`/workouts/days/${dayId}/exercises`, {
      method: 'POST',
      body: JSON.stringify({ exercise_id: exerciseId, order_index: orderIndex }),
    }),

  removeExercise: (dayExerciseId: string) =>
    api<void>(`/workouts/days/exercises/${dayExerciseId}`, { method: 'DELETE' }),
}
