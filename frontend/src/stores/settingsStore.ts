import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Settings } from '@/types'

interface SettingsStore extends Settings {
  setTheme: (theme: Settings['theme']) => void
  setPosition: (position: Settings['position']) => void
  setHotkey: (hotkey: Settings['hotkey']) => void
  toggleAnimation: () => void
  toggleBlur: () => void
  toggleStartWithWindows: () => void
  setRecentFoldersLimit: (limit: number) => void
  updateSettings: (updates: Partial<Settings>) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      // Default values
      hotkey: { modifiers: ['ctrl'], key: 'space' },
      theme: 'dark',
      position: 'right',
      animation: true,
      blur: true,
      startWithWindows: false,
      recentFoldersLimit: 5,

      // Actions
      setTheme: (theme) => set({ theme }),
      setPosition: (position) => set({ position }),
      setHotkey: (hotkey) => set({ hotkey }),
      toggleAnimation: () => set((s) => ({ animation: !s.animation })),
      toggleBlur: () => set((s) => ({ blur: !s.blur })),
      toggleStartWithWindows: () =>
        set((s) => ({ startWithWindows: !s.startWithWindows })),
      setRecentFoldersLimit: (recentFoldersLimit) => set({ recentFoldersLimit }),
      updateSettings: (updates) => set(updates),
    }),
    { name: 'quicklaunch-settings' }
  )
)
