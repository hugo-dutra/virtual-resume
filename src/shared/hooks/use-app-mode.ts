import { useEffect } from 'react'
import type { AppMode } from '../stores/use-app-store'
import { useAppStore } from '../stores/use-app-store'

export function useAppMode(mode: AppMode) {
  const setActiveMode = useAppStore((state) => state.setActiveMode)

  useEffect(() => {
    setActiveMode(mode)
  }, [mode, setActiveMode])
}
