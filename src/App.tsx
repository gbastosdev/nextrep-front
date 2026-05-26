import { HashRouter as BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PlansPage } from './pages/PlansPage'
import { PlanDetailPage } from './pages/PlanDetailPage'
import { WorkoutPage } from './pages/WorkoutPage'

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-950 flex justify-center">
        <div className="w-full max-w-[430px]">
          <Routes>
            <Route path="/" element={<Navigate to="/plans" replace />} />
            <Route path="/plans" element={<PlansPage />} />
            <Route path="/plans/:id" element={<PlanDetailPage />} />
            <Route path="/workout/:dayId" element={<WorkoutPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}
