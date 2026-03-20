import { useEffect } from 'react'
import { useAppStore } from '../stores/use-app-store'

export function useThemeClass() {
  const theme = useAppStore((state) => state.theme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('theme-light', 'theme-dark', 'dark')

    if (theme === 'dark') {
      root.classList.add('theme-dark', 'dark')
      return
    }

    root.classList.add('theme-light')
  }, [theme])
}
