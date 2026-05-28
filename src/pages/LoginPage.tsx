import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { api } from '../api/client'
import { plansApi } from '../api/plans'
import { exercisesApi } from '../api/exercises'
import { useAuthStore } from '../store/auth'
import { db } from '../storage/db'

interface AuthResponse {
  access_token: string
  user_id: string
  email: string
}

async function migrateLocalData() {
  const localPlans = await db.plans.toArray()
  if (localPlans.length === 0) return

  const backendExercises = await exercisesApi.list()

  for (const localPlan of localPlans) {
    const backendPlan = await plansApi.create(localPlan.name)
    const days = await db.days.where('plan_id').equals(localPlan.id).sortBy('order_index')

    for (const localDay of days) {
      const backendDay = await plansApi.addDay(backendPlan.id, localDay.name, localDay.order_index)
      const dayExercises = await db.day_exercises
        .where('day_id')
        .equals(localDay.id)
        .sortBy('order_index')

      for (const de of dayExercises) {
        const localEx = await db.exercises.get(de.exercise_id)
        if (!localEx) continue

        let backendEx = backendExercises.find(
          (e) => e.name.toLowerCase() === localEx.name.toLowerCase(),
        )
        if (!backendEx) {
          backendEx = await exercisesApi.create(localEx.name, localEx.muscle_group ?? undefined)
          backendExercises.push(backendEx)
        }

        await plansApi.addExercise(backendDay.id, backendEx.id, de.order_index)
      }
    }
  }

  await db.plans.clear()
  await db.days.clear()
  await db.day_exercises.clear()
}

export function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [status, setStatus] = useState<'idle' | 'migrating' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSuccess(response: CredentialResponse) {
    if (!response.credential) return
    try {
      const data = await api<AuthResponse>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential: response.credential }),
      })
      setAuth(data.access_token, { id: data.user_id, email: data.email })

      const hasLocalData = (await db.plans.count()) > 0
      if (hasLocalData) {
        setStatus('migrating')
        await migrateLocalData()
      }

      navigate('/plans', { replace: true })
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Erro ao fazer login')
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-black text-white tracking-tight">NextRep</h1>
        <p className="text-zinc-500 mt-2 text-sm">Seu treino, mais rápido.</p>
      </div>

      {status === 'migrating' ? (
        <div className="flex flex-col items-center gap-3 text-zinc-400">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Migrando seus dados...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 w-full">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => {
              setErrorMsg('Falha ao autenticar com o Google')
              setStatus('error')
            }}
            theme="filled_black"
            shape="rectangular"
            size="large"
            width="320"
            text="signin_with"
          />
          {status === 'error' && (
            <p className="text-red-400 text-sm text-center">{errorMsg}</p>
          )}
        </div>
      )}
    </div>
  )
}
