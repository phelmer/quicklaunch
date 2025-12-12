import { create } from 'zustand'
import {
  GetVersion,
  CheckForUpdate,
  DownloadAndApplyUpdate,
  RestartApp,
  ShowUpdateReadyNotification,
} from '../../wailsjs/go/main/App'
import { useAppStore } from './appStore'

// Simplify error messages for user display
function simplifyErrorMessage(rawMessage: string, fallback: string): string {
  if (!rawMessage) return fallback

  const lower = rawMessage.toLowerCase()

  // Rate limit errors
  if (lower.includes('rate limit') || lower.includes('api rate')) {
    return 'Zu viele Anfragen. Bitte später erneut versuchen.'
  }

  // Network errors
  if (lower.includes('network') || lower.includes('connection') || lower.includes('timeout')) {
    return 'Netzwerkfehler. Bitte Internetverbindung prüfen.'
  }

  // No update available
  if (lower.includes('no update available')) {
    return 'Kein Update verfügbar.'
  }

  // Generic fallback - truncate long messages
  if (rawMessage.length > 50) {
    return fallback
  }

  return rawMessage
}

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
  setUpdateAvailable: (info: UpdateInfo) => void
}

export const useUpdateStore = create<UpdateStore>((set, get) => ({
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
      // Wails returns errors as strings, not Error objects
      const rawMessage = typeof err === 'string' ? err : (err instanceof Error ? err.message : '')
      const message = simplifyErrorMessage(rawMessage, 'Update-Prüfung fehlgeschlagen')
      set({ status: 'error', error: message })
    }
  },

  // Download and apply update
  downloadUpdate: async () => {
    set({ status: 'downloading', error: null })
    try {
      await DownloadAndApplyUpdate()
      set({ status: 'ready' })

      // Show notification only if not in settings view
      const appState = useAppStore.getState()
      const isInSettings = appState.isOpen && appState.view === 'settings'

      if (!isInSettings) {
        const { updateInfo } = get()
        if (updateInfo?.latestVersion) {
          await ShowUpdateReadyNotification(updateInfo.latestVersion)
        }
      }
    } catch (err) {
      // Wails returns errors as strings, not Error objects
      const rawMessage = typeof err === 'string' ? err : (err instanceof Error ? err.message : '')
      const message = simplifyErrorMessage(rawMessage, 'Installation fehlgeschlagen')
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

  // Set update available from backend event
  setUpdateAvailable: (info: UpdateInfo) => {
    set({
      status: 'available',
      updateInfo: info,
      currentVersion: info.currentVersion,
    })
  },
}))
