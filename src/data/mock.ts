export interface Exercise {
  id: string
  name: string
  muscleGroup: string
}

export interface SetLog {
  weight: number | null
  reps: number | null
  effort: 1 | 2 | 3 | 4 | null
}

export interface DayExercise {
  exercise: Exercise
  lastSession: SetLog[]
}

export interface WorkoutDay {
  id: string
  name: string
  exercises: DayExercise[]
}

export interface WorkoutPlan {
  id: string
  name: string
  days: WorkoutDay[]
}

export const exerciseLibrary: Exercise[] = [
  { id: 'bench', name: 'Bench Press', muscleGroup: 'Peitoral' },
  { id: 'incline-press', name: 'Incline Press', muscleGroup: 'Peitoral' },
  { id: 'chest-fly', name: 'Chest Fly', muscleGroup: 'Peitoral' },
  { id: 'ohp', name: 'OHP', muscleGroup: 'Ombros' },
  { id: 'lateral-raise', name: 'Lateral Raise', muscleGroup: 'Ombros' },
  { id: 'tricep', name: 'Tricep Pushdown', muscleGroup: 'Tríceps' },
  { id: 'skull-crusher', name: 'Skull Crusher', muscleGroup: 'Tríceps' },
  { id: 'tbar', name: 'T-Bar Row', muscleGroup: 'Costas' },
  { id: 'lat-pulldown', name: 'Lat Pulldown', muscleGroup: 'Costas' },
  { id: 'pullup', name: 'Pull-up', muscleGroup: 'Costas' },
  { id: 'curl', name: 'Rosca Direta', muscleGroup: 'Bíceps' },
  { id: 'hammer-curl', name: 'Rosca Martelo', muscleGroup: 'Bíceps' },
  { id: 'squat', name: 'Squat', muscleGroup: 'Quadríceps' },
  { id: 'legpress', name: 'Leg Press', muscleGroup: 'Quadríceps' },
  { id: 'leg-extension', name: 'Leg Extension', muscleGroup: 'Quadríceps' },
  { id: 'rdl', name: 'Romanian Deadlift', muscleGroup: 'Isquiotibiais' },
  { id: 'leg-curl', name: 'Leg Curl', muscleGroup: 'Isquiotibiais' },
  { id: 'calf-raise', name: 'Calf Raise', muscleGroup: 'Panturrilha' },
]

export const mockPlans: WorkoutPlan[] = [
  {
    id: 'ppl',
    name: 'PPL',
    days: [
      {
        id: 'push',
        name: 'Push',
        exercises: [
          {
            exercise: { id: 'bench', name: 'Bench Press', muscleGroup: 'Peitoral' },
            lastSession: [
              { weight: 80, reps: 8, effort: 2 },
              { weight: 80, reps: 7, effort: 3 },
              { weight: 80, reps: 6, effort: 3 },
            ],
          },
          {
            exercise: { id: 'ohp', name: 'OHP', muscleGroup: 'Ombros' },
            lastSession: [
              { weight: 50, reps: 10, effort: 1 },
              { weight: 50, reps: 9, effort: 2 },
              { weight: 50, reps: 8, effort: 2 },
            ],
          },
          {
            exercise: { id: 'tricep', name: 'Tricep Pushdown', muscleGroup: 'Tríceps' },
            lastSession: [
              { weight: 35, reps: 12, effort: 2 },
              { weight: 35, reps: 11, effort: 3 },
              { weight: 35, reps: 10, effort: 3 },
            ],
          },
        ],
      },
      {
        id: 'pull',
        name: 'Pull',
        exercises: [
          {
            exercise: { id: 'tbar', name: 'T-Bar Row', muscleGroup: 'Costas' },
            lastSession: [
              { weight: 60, reps: 8, effort: 2 },
              { weight: 60, reps: 7, effort: 3 },
              { weight: 60, reps: 7, effort: 3 },
            ],
          },
          {
            exercise: { id: 'pullup', name: 'Pull-up', muscleGroup: 'Costas' },
            lastSession: [
              { weight: null, reps: 8, effort: 2 },
              { weight: null, reps: 7, effort: 3 },
              { weight: null, reps: 6, effort: 4 },
            ],
          },
          {
            exercise: { id: 'curl', name: 'Rosca Direta', muscleGroup: 'Bíceps' },
            lastSession: [
              { weight: 14, reps: 12, effort: 2 },
              { weight: 14, reps: 11, effort: 2 },
              { weight: 14, reps: 10, effort: 3 },
            ],
          },
        ],
      },
      {
        id: 'legs',
        name: 'Legs',
        exercises: [
          {
            exercise: { id: 'squat', name: 'Squat', muscleGroup: 'Quadríceps' },
            lastSession: [
              { weight: 100, reps: 8, effort: 2 },
              { weight: 100, reps: 7, effort: 3 },
              { weight: 100, reps: 6, effort: 4 },
            ],
          },
          {
            exercise: { id: 'legpress', name: 'Leg Press', muscleGroup: 'Quadríceps' },
            lastSession: [
              { weight: 150, reps: 12, effort: 2 },
              { weight: 150, reps: 11, effort: 2 },
              { weight: 150, reps: 10, effort: 3 },
            ],
          },
          {
            exercise: { id: 'rdl', name: 'Romanian Deadlift', muscleGroup: 'Isquiotibiais' },
            lastSession: [
              { weight: 80, reps: 10, effort: 1 },
              { weight: 80, reps: 10, effort: 2 },
              { weight: 80, reps: 9, effort: 2 },
            ],
          },
        ],
      },
    ],
  },
]
