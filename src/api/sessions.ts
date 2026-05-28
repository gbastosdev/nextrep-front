import { api } from './client'

export interface SessionCompletePayload {
  workout_day_id: string | null
  started_at: string
  executions: {
    exercise_id: string
    order_index: number
    sets: {
      set_number: number
      weight: number | null
      reps: number | null
      perceived_difficulty: number | null
      notes: string | null
    }[]
  }[]
}

export interface ApiSessionSummary {
  id: string
  day_name: string | null
  started_at: string
  finished_at: string | null
  duration_minutes: number | null
  total_sets: number
  exercises_count: number
}

export interface ApiSessionDetailSet {
  id: string
  set_number: number
  weight: number | null
  reps: number | null
  rir: number | null
  perceived_difficulty: number | null
  notes: string | null
  completed_at: string
}

export interface ApiSessionDetailExecution {
  id: string
  exercise_id: string
  exercise_name: string
  muscle_group: string | null
  order_index: number
  sets: ApiSessionDetailSet[]
}

export interface ApiSessionDetail {
  id: string
  day_name: string | null
  started_at: string
  finished_at: string | null
  duration_minutes: number | null
  notes: string | null
  executions: ApiSessionDetailExecution[]
}

export interface PrevSet {
  set_number: number
  weight: number | null
  reps: number | null
  perceived_difficulty: number | null
}

export interface ApiLastSession {
  id: string
  executions: { exercise_id: string; sets: PrevSet[] }[]
}

export const sessionsApi = {
  complete: (payload: SessionCompletePayload) =>
    api<{ id: string }>('/workouts/sessions/complete', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  recent: (limit = 5) =>
    api<ApiSessionSummary[]>(`/workouts/sessions/recent?limit=${limit}`),

  detail: (id: string) =>
    api<ApiSessionDetail>(`/workouts/sessions/${id}/detail`),

  lastForDay: (dayId: string) =>
    api<ApiLastSession | null>(`/workouts/days/${dayId}/last-session`),

  delete: (id: string) =>
    api<void>(`/workouts/sessions/${id}`, { method: 'DELETE' }),
}
