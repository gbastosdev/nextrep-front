import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { PlansPage } from './pages/PlansPage'
import { PlanDetailPage } from './pages/PlanDetailPage'
import { WorkoutPage } from './pages/WorkoutPage'
import { SessionDetailPage } from './pages/SessionDetailPage'
import { LoginPage } from './pages/LoginPage'
import { useAuthStore } from './store/auth'
import { useSessionStore } from './store/session'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  const location = useLocation()
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />
  return <>{children}</>
}

function ActiveWorkoutFAB() {
  const dayId = useSessionStore((s) => s.dayId)
  const dayName = useSessionStore((s) => s.dayName)
  const location = useLocation()
  const navigate = useNavigate()

  if (!dayId || location.pathname.startsWith('/workout')) return null

  return (
    <button
      onClick={() => navigate(`/workout/${dayId}`)}
      className="fixed bottom-6 right-4 z-50 bg-emerald-500 text-black font-bold rounded-2xl px-4 py-3 shadow-lg flex items-center gap-2 active:bg-emerald-400 transition-colors"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-40" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-black" />
      </span>
      <span className="text-sm">{dayName ?? 'Treino ativo'}</span>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

export function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <HashRouter>
        <div className="min-h-screen bg-zinc-950 flex justify-center">
          <div className="w-full max-w-[430px] relative">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<RequireAuth><Navigate to="/plans" replace /></RequireAuth>} />
              <Route path="/plans" element={<RequireAuth><PlansPage /></RequireAuth>} />
              <Route path="/plans/:id" element={<RequireAuth><PlanDetailPage /></RequireAuth>} />
              <Route path="/workout/:dayId" element={<RequireAuth><WorkoutPage /></RequireAuth>} />
              <Route path="/sessions/:id" element={<RequireAuth><SessionDetailPage /></RequireAuth>} />
            </Routes>
            <ActiveWorkoutFAB />
          </div>
        </div>
      </HashRouter>
    </GoogleOAuthProvider>
  )
}
