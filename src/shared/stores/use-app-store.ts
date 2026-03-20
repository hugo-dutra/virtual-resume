import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type AppMode = 'landing' | 'traditional' | 'adventure'
export type ThemeMode = 'light' | 'dark'

type AppStore = {
  activeMode: AppMode
  theme: ThemeMode
  audioEnabled: boolean
  activeExperienceId: string | null
  setActiveMode: (mode: AppMode) => void
  toggleTheme: () => void
  toggleAudio: () => void
  openPopup: (experienceId: string) => void
  closePopup: () => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      activeMode: 'landing',
      theme: 'light',
      audioEnabled: false,
      activeExperienceId: null,
      setActiveMode: (mode) => set({ activeMode: mode }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      toggleAudio: () => set((state) => ({ audioEnabled: !state.audioEnabled })),
      openPopup: (experienceId) => set({ activeExperienceId: experienceId }),
      closePopup: () => set({ activeExperienceId: null }),
    }),
    {
      name: 'curriculo-virtual-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        audioEnabled: state.audioEnabled,
      }),
    },
  ),
)
