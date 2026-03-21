import { useThemeClass } from '../../shared/hooks/use-theme-class'
import type { PropsWithChildren } from 'react'
import { BrowserRouter } from 'react-router-dom'

export function AppProviders({ children }: PropsWithChildren) {
  useThemeClass()

  return <BrowserRouter basename={import.meta.env.BASE_URL}>{children}</BrowserRouter>
}
