import { useState } from 'react'
import { ActiveSet, useSessionStore } from '../store/session'

interface SetRowProps {
  exerciseId: string
  setIndex: number
  set: ActiveSet
  setNumber: number
}

const EFFORT_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: 'Fácil',
  2: 'Ok',
  3: 'Difícil',
  4: 'Máximo',
}

const EFFORT_ACTIVE: Record<1 | 2 | 3 | 4, string> = {
  1: 'bg-sky-500 text-white border-sky-500',
  2: 'bg-emerald-500 text-black border-emerald-500',
  3: 'bg-amber-500 text-black border-amber-500',
  4: 'bg-red-500 text-white border-red-500',
}

export function SetRow({ exerciseId, setIndex, set, setNumber }: SetRowProps) {
  const { updateSet, toggleDone } = useSessionStore()
  const [obsOpen, setObsOpen] = useState(false)

  const inputClass = (prefilled: boolean) =>
    `w-full text-center bg-zinc-800 border rounded-lg px-1 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors ${
      prefilled ? 'border-zinc-700 text-zinc-400' : 'border-zinc-600 text-white'
    }`

  function handleNumeric(field: 'weight' | 'reps', raw: string) {
    updateSet(exerciseId, setIndex, { [field]: raw === '' ? null : Number(raw) })
  }

  function handleEffort(value: 1 | 2 | 3 | 4) {
    updateSet(exerciseId, setIndex, { effort: set.effort === value ? null : value })
  }

  return (
    <div className={set.done ? 'opacity-40' : ''}>
      <div className="flex items-center gap-2 py-1.5">
        <span className="w-5 shrink-0 text-center text-xs text-zinc-600 font-medium">{setNumber}</span>

        <div className="flex-1">
          <input
            type="number"
            inputMode="decimal"
            value={set.weight ?? ''}
            placeholder="—"
            onChange={(e) => handleNumeric('weight', e.target.value)}
            disabled={set.done}
            className={inputClass(set.prefilled && set.weight !== null)}
          />
        </div>

        <div className="flex-1">
          <input
            type="number"
            inputMode="numeric"
            value={set.reps ?? ''}
            placeholder="—"
            onChange={(e) => handleNumeric('reps', e.target.value)}
            disabled={set.done}
            className={inputClass(set.prefilled && set.reps !== null)}
          />
        </div>

        <div className="flex gap-1 shrink-0">
          {([1, 2, 3, 4] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => !set.done && handleEffort(lvl)}
              disabled={set.done}
              title={EFFORT_LABELS[lvl]}
              className={`w-7 h-8 rounded-md text-xs font-bold border transition-colors ${
                set.effort === lvl
                  ? EFFORT_ACTIVE[lvl]
                  : 'bg-zinc-800 text-zinc-500 border-zinc-700 active:border-zinc-500'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <button
          onClick={() => toggleDone(exerciseId, setIndex)}
          className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center border transition-colors ${
            set.done
              ? 'bg-emerald-500 border-emerald-500 text-black'
              : 'border-zinc-700 text-zinc-600 active:border-emerald-500'
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {(obsOpen || set.obs) && (
        <div className="pl-7 pr-1 pb-1.5">
          <input
            type="text"
            value={set.obs}
            onChange={(e) => updateSet(exerciseId, setIndex, { obs: e.target.value })}
            placeholder="Observação..."
            disabled={set.done}
            autoFocus={obsOpen && !set.obs}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
          />
        </div>
      )}

      {!set.done && (
        <div className="pl-7 pb-0.5">
          <button
            onClick={() => setObsOpen((o) => !o)}
            className="text-xs text-zinc-600 active:text-zinc-400 transition-colors"
          >
            {obsOpen || set.obs ? 'ocultar obs' : '+ obs'}
          </button>
        </div>
      )}
    </div>
  )
}
