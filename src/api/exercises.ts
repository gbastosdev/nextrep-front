import { api } from './client'

export interface ApiExercise {
  id: string
  name: string
  muscle_group: string | null
  is_custom: boolean
}

export const exercisesApi = {
  list: () => api<ApiExercise[]>('/exercises/'),

  create: (name: string, muscleGroup?: string) =>
    api<ApiExercise>('/exercises/', {
      method: 'POST',
      body: JSON.stringify({ name, muscle_group: muscleGroup ?? null }),
    }),
}
