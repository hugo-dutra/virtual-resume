import { Navigate, Route, Routes } from 'react-router-dom'
import { LandingPage } from '../../modules/landing/landing.page'
import { TraditionalPage } from '../../modules/traditional/traditional.page'
import { AdventurePage } from '../../modules/adventure/adventure.page'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/traditional" element={<TraditionalPage />} />
      <Route path="/adventure" element={<AdventurePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
