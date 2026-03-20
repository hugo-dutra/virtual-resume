import { create } from 'zustand'

export type AppMode = 'landing' | 'traditional' | 'adventure'

type AppStore = {
  activeMode: AppMode
  audioEnabled: boolean
  activeExperienceId: string | null
  setActiveMode: (mode: AppMode) => void
  toggleAudio: () => void
  openPopup: (experienceId: string) => void
  closePopup: () => void
}

export const useAppStore = create<AppStore>((set) => ({
  activeMode: 'landing',
  audioEnabled: false,
  activeExperienceId: null,
  setActiveMode: (mode) => set({ activeMode: mode }),
  toggleAudio: () => set((state) => ({ audioEnabled: !state.audioEnabled })),
  openPopup: (experienceId) => set({ activeExperienceId: experienceId }),
  closePopup: () => set({ activeExperienceId: null }),
}))
