import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type AppMode = 'landing' | 'traditional' | 'adventure'
export type ThemeMode = 'light' | 'dark'

type AppStore = {
  activeMode: AppMode
  theme: ThemeMode
  audioEnabled: boolean
  activeExperienceId: string | null
  hoveredBuildingId: string | null
  setActiveMode: (mode: AppMode) => void
  setHoveredBuildingId: (buildingId: string | null) => void
  toggleTheme: () => void
  toggleAudio: () => void
  openPopup: (experienceId: string) => void
  closePopup: () => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      activeMode: 'landing',
      theme: 'dark',
      audioEnabled: false,
      activeExperienceId: null,
      hoveredBuildingId: null,
      setActiveMode: (mode) => set({ activeMode: mode }),
      setHoveredBuildingId: (buildingId) => set({ hoveredBuildingId: buildingId }),
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
