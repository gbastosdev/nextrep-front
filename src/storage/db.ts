import Dexie, { type Table } from 'dexie'

export interface DbPlan {
  id: string
  name: string
  created_at: string
}

export interface DbDay {
  id: string
  plan_id: string
  name: string
  order_index: number
}

export interface DbDayExercise {
  id: string
  day_id: string
  exercise_id: string
  order_index: number
}

export interface DbExercise {
  id: string
  name: string
  muscle_group: string | null
  is_custom: boolean
}

const DEFAULT_EXERCISES: Omit<DbExercise, 'is_custom'>[] = [
  { id: 'bench', name: 'Bench Press', muscle_group: 'Peitoral' },
  { id: 'incline-press', name: 'Incline Press', muscle_group: 'Peitoral' },
  { id: 'chest-fly', name: 'Chest Fly', muscle_group: 'Peitoral' },
  { id: 'ohp', name: 'OHP', muscle_group: 'Ombros' },
  { id: 'lateral-raise', name: 'Lateral Raise', muscle_group: 'Ombros' },
  { id: 'tricep', name: 'Tricep Pushdown', muscle_group: 'Tríceps' },
  { id: 'skull-crusher', name: 'Skull Crusher', muscle_group: 'Tríceps' },
  { id: 'tbar', name: 'T-Bar Row', muscle_group: 'Costas' },
  { id: 'lat-pulldown', name: 'Lat Pulldown', muscle_group: 'Costas' },
  { id: 'pullup', name: 'Pull-up', muscle_group: 'Costas' },
  { id: 'curl', name: 'Rosca Direta', muscle_group: 'Bíceps' },
  { id: 'hammer-curl', name: 'Rosca Martelo', muscle_group: 'Bíceps' },
  { id: 'squat', name: 'Squat', muscle_group: 'Quadríceps' },
  { id: 'legpress', name: 'Leg Press', muscle_group: 'Quadríceps' },
  { id: 'leg-extension', name: 'Leg Extension', muscle_group: 'Quadríceps' },
  { id: 'rdl', name: 'Romanian Deadlift', muscle_group: 'Isquiotibiais' },
  { id: 'leg-curl', name: 'Leg Curl', muscle_group: 'Isquiotibiais' },
  { id: 'calf-raise', name: 'Calf Raise', muscle_group: 'Panturrilha' },
]

class NextRepDB extends Dexie {
  plans!: Table<DbPlan>
  days!: Table<DbDay>
  day_exercises!: Table<DbDayExercise>
  exercises!: Table<DbExercise>

  constructor() {
    super('nextrep')
    this.version(1).stores({
      plans: 'id, created_at',
      days: 'id, plan_id, order_index',
      day_exercises: 'id, day_id, exercise_id, order_index',
      exercises: 'id, name, is_custom',
    })
    this.on('populate', (tx) => {
      tx.table('exercises').bulkAdd(
        DEFAULT_EXERCISES.map((e) => ({ ...e, is_custom: false })),
      )
    })
  }
}

export const db = new NextRepDB()
