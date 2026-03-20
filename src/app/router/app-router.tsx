import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const LandingPage = lazy(async () => {
  const module = await import('../../modules/landing/landing.page')
  return { default: module.LandingPage }
})

const TraditionalPage = lazy(async () => {
  const module = await import('../../modules/traditional/traditional.page')
  return { default: module.TraditionalPage }
})

const AdventurePage = lazy(async () => {
  const module = await import('../../modules/adventure/adventure.page')
  return { default: module.AdventurePage }
})

type RouteLoaderProps = {
  children: ReactNode
}

function RouteLoader({ children }: RouteLoaderProps) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center px-6">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Carregando modulo...</p>
        </main>
      }
    >
      {children}
    </Suspense>
  )
}

export function AppRouter() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <RouteLoader>
            <LandingPage />
          </RouteLoader>
        }
      />
      <Route
        path="/traditional"
        element={
          <RouteLoader>
            <TraditionalPage />
          </RouteLoader>
        }
      />
      <Route
        path="/adventure"
        element={
          <RouteLoader>
            <AdventurePage />
          </RouteLoader>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
