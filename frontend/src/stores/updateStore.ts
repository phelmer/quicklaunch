import { create } from 'zustand'
import {
  GetVersion,
  CheckForUpdate,
  DownloadAndApplyUpdate,
  RestartApp,
} from '../../wailsjs/go/main/App'

export interface UpdateInfo {
  available: boolean
  currentVersion: string
  latestVersion: string
  releaseUrl: string
  releaseNote: string
  assetUrl: string
  assetSize: number
}

export type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'downloading'
  | 'ready'
  | 'error'

interface UpdateStore {
  // State
  status: UpdateStatus
  currentVersion: string
  updateInfo: UpdateInfo | null
  error: string | null

  // Actions
  loadVersion: () => Promise<void>
  checkForUpdate: () => Promise<void>
  downloadUpdate: () => Promise<void>
  restartApp: () => void
  resetError: () => void
}

export const useUpdateStore = create<UpdateStore>((set) => ({
  // Initial state
  status: 'idle',
  currentVersion: 'dev',
  updateInfo: null,
  error: null,

  // Load current version
  loadVersion: async () => {
    try {
      const version = await GetVersion()
      set({ currentVersion: version })
    } catch (err) {
      console.error('Failed to load version:', err)
    }
  },

  // Check for updates
  checkForUpdate: async () => {
    set({ status: 'checking', error: null })
    try {
      const info = await CheckForUpdate()
      if (info.available) {
        set({
          status: 'available',
          updateInfo: {
            available: info.available,
            currentVersion: info.currentVersion,
            latestVersion: info.latestVersion,
            releaseUrl: info.releaseUrl,
            releaseNote: info.releaseNote,
            assetUrl: info.assetUrl,
            assetSize: info.assetSize,
          },
        })
      } else {
        set({
          status: 'idle',
          updateInfo: null,
        })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Update-Prüfung fehlgeschlagen'
      set({ status: 'error', error: message })
    }
  },

  // Download and apply update
  downloadUpdate: async () => {
    set({ status: 'downloading', error: null })
    try {
      await DownloadAndApplyUpdate()
      set({ status: 'ready' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Download fehlgeschlagen'
      set({ status: 'error', error: message })
    }
  },

  // Restart application
  restartApp: () => {
    RestartApp()
  },

  // Reset error state
  resetError: () => {
    set({ status: 'idle', error: null })
  },
}))
