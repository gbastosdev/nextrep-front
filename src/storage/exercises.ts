import { db } from './db'

export interface ApiExercise {
  id: string
  name: string
  muscle_group: string | null
  is_custom: boolean
}

export const exercisesApi = {
  list: async (): Promise<ApiExercise[]> => {
    return db.exercises.orderBy('name').toArray()
  },

  create: async (name: string, muscleGroup?: string): Promise<ApiExercise> => {
    const exercise: ApiExercise = {
      id: crypto.randomUUID(),
      name,
      muscle_group: muscleGroup ?? null,
      is_custom: true,
    }
    await db.exercises.add(exercise)
    return exercise
  },
}
