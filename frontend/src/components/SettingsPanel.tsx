import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'motion/react'
import { Moon, Sun, Monitor, Keyboard, FolderOpen, ArrowLeft, Rocket, RefreshCw, Download, Check, AlertCircle } from 'lucide-react'
import { useSettingsStore } from '@/stores/settingsStore'
import { useAppStore } from '@/stores/appStore'
import { useUpdateStore } from '@/stores/updateStore'
import { useTheme } from '@/hooks/useTheme'
import { GetAutoStartEnabled, SetAutoStart, GetCheckForUpdatesOnStartup } from '../../wailsjs/go/main/App'

export function SettingsPanel() {
  const settings = useSettingsStore()
  const { setView } = useAppStore()
  const { theme, setTheme } = useTheme()
  const [autoStart, setAutoStartState] = useState(false)
  const [checkOnStartup, setCheckOnStartup] = useState(true)
  const firstFocusableRef = useRef<HTMLButtonElement>(null)

  // Update store
  const {
    status: updateStatus,
    currentVersion,
    updateInfo,
    error: updateError,
    loadVersion,
    checkForUpdate,
    downloadUpdate,
    restartApp,
    resetError,
  } = useUpdateStore()

  // Load autostart state, version, and check for updates if enabled
  useEffect(() => {
    GetAutoStartEnabled().then(setAutoStartState).catch(console.error)
    loadVersion()

    // Check for updates automatically if setting is enabled
    GetCheckForUpdatesOnStartup().then((enabled) => {
      setCheckOnStartup(enabled)
      if (enabled && updateStatus === 'idle') {
        checkForUpdate()
      }
    }).catch(console.error)
  }, [loadVersion, checkForUpdate, updateStatus])

  // Focus first element on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      firstFocusableRef.current?.focus()
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  // Handle ESC key to close
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      setView('tiles')
    }
  }, [setView])

  const handleClose = () => {
    setView('tiles')
  }

  const handleAutoStartToggle = async () => {
    const newValue = !autoStart
    try {
      await SetAutoStart(newValue)
      setAutoStartState(newValue)
      settings.toggleStartWithWindows()
    } catch (err) {
      console.error('Failed to set autostart:', err)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.15 }}
      className="absolute inset-0 bg-[var(--bg-primary)] z-20 flex flex-col"
      onKeyDown={handleKeyDown}
    >
      {/* Header */}
      <div
        className="flex items-center border-b border-[var(--border-muted)]"
        style={{ gap: '12px', padding: '16px' }}
      >
        <button
          onClick={handleClose}
          className="rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          style={{ padding: '6px' }}
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-base font-semibold text-[var(--text-primary)]">Einstellungen</h2>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto flex flex-col" style={{ padding: '16px', gap: '24px' }}>
        {/* Theme */}
        <div>
          <label
            className="flex items-center text-xs font-medium text-[var(--text-secondary)]"
            style={{ gap: '8px', marginBottom: '8px' }}
          >
            <Moon size={14} /> Design
          </label>
          <div className="flex" style={{ gap: '8px' }}>
            {(['dark', 'light', 'system'] as const).map((t, idx) => (
              <button
                key={t}
                ref={idx === 0 ? firstFocusableRef : undefined}
                onClick={() => setTheme(t)}
                className={`flex-1 flex items-center justify-center rounded-lg text-xs font-medium capitalize transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]
                  ${
                    theme === t
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                  }
                `}
                style={{ gap: '6px', padding: '8px' }}
              >
                {t === 'dark' && <Moon size={12} />}
                {t === 'light' && <Sun size={12} />}
                {t === 'system' && <Monitor size={12} />}
                {t === 'dark' ? 'Dunkel' : t === 'light' ? 'Hell' : 'System'}
              </button>
            ))}
          </div>
        </div>

        {/* Hotkey */}
        <div>
          <label
            className="flex items-center text-xs font-medium text-[var(--text-secondary)]"
            style={{ gap: '8px', marginBottom: '8px' }}
          >
            <Keyboard size={14} /> Tastenkürzel
          </label>
          <div className="bg-[var(--bg-secondary)] rounded-lg" style={{ padding: '12px' }}>
            <span className="text-sm text-[var(--text-primary)] font-mono">
              {settings.hotkey.modifiers.map((m) => m.toUpperCase()).join(' + ')} +{' '}
              {settings.hotkey.key.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-[var(--text-tertiary)]" style={{ marginTop: '4px' }}>
            Kann derzeit nicht geändert werden
          </p>
        </div>

        {/* Recent Folders Limit */}
        <div>
          <label
            className="flex items-center text-xs font-medium text-[var(--text-secondary)]"
            style={{ gap: '8px', marginBottom: '8px' }}
          >
            <FolderOpen size={14} /> Anzahl zuletzt verwendeter Ordner
          </label>
          <select
            value={settings.recentFoldersLimit}
            onChange={(e) => settings.setRecentFoldersLimit(parseInt(e.target.value))}
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50"
            style={{ padding: '10px' }}
          >
            {[3, 5, 10, 15].map((n) => (
              <option key={n} value={n}>
                {n} Ordner
              </option>
            ))}
          </select>
        </div>

        {/* Autostart Toggle */}
        <div className="flex items-center justify-between">
          <label
            className="flex items-center text-xs font-medium text-[var(--text-secondary)]"
            style={{ gap: '8px' }}
          >
            <Rocket size={14} /> Mit Windows starten
          </label>
          <button
            onClick={handleAutoStartToggle}
            className={`relative rounded-full transition-colors ${
              autoStart ? 'bg-[var(--color-accent)]' : 'bg-[var(--bg-tertiary)]'
            }`}
            style={{ width: '44px', height: '24px' }}
          >
            <span
              className="absolute rounded-full bg-white transition-transform"
              style={{
                top: '4px',
                left: '4px',
                width: '16px',
                height: '16px',
                transform: autoStart ? 'translateX(20px)' : 'translateX(0)',
              }}
            />
          </button>
        </div>

        {/* Animation Toggle */}
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-[var(--text-secondary)]">
            Animationen
          </label>
          <button
            onClick={() => settings.toggleAnimation()}
            className={`relative rounded-full transition-colors ${
              settings.animation ? 'bg-[var(--color-accent)]' : 'bg-[var(--bg-tertiary)]'
            }`}
            style={{ width: '44px', height: '24px' }}
          >
            <span
              className="absolute rounded-full bg-white transition-transform"
              style={{
                top: '4px',
                left: '4px',
                width: '16px',
                height: '16px',
                transform: settings.animation ? 'translateX(20px)' : 'translateX(0)',
              }}
            />
          </button>
        </div>

        {/* Blur Toggle */}
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-[var(--text-secondary)]">
            Hintergrundunschärfe
          </label>
          <button
            onClick={() => settings.toggleBlur()}
            className={`relative rounded-full transition-colors ${
              settings.blur ? 'bg-[var(--color-accent)]' : 'bg-[var(--bg-tertiary)]'
            }`}
            style={{ width: '44px', height: '24px' }}
          >
            <span
              className="absolute rounded-full bg-white transition-transform"
              style={{
                top: '4px',
                left: '4px',
                width: '16px',
                height: '16px',
                transform: settings.blur ? 'translateX(20px)' : 'translateX(0)',
              }}
            />
          </button>
        </div>

        {/* Auto Update Check Toggle */}
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-[var(--text-secondary)]">
            Automatisch nach Updates suchen
          </label>
          <button
            onClick={() => setCheckOnStartup(!checkOnStartup)}
            className={`relative rounded-full transition-colors ${
              checkOnStartup ? 'bg-[var(--color-accent)]' : 'bg-[var(--bg-tertiary)]'
            }`}
            style={{ width: '44px', height: '24px' }}
          >
            <span
              className="absolute rounded-full bg-white transition-transform"
              style={{
                top: '4px',
                left: '4px',
                width: '16px',
                height: '16px',
                transform: checkOnStartup ? 'translateX(20px)' : 'translateX(0)',
              }}
            />
          </button>
        </div>

        {/* Update Section */}
        <div id="update-section" className="border-t border-[var(--border-muted)]" style={{ paddingTop: '16px' }}>
          <label
            className="flex items-center text-xs font-medium text-[var(--text-secondary)]"
            style={{ gap: '8px', marginBottom: '12px' }}
          >
            <RefreshCw size={14} /> Updates
          </label>

          {/* Update Status Display */}
          {updateStatus === 'error' && updateError && (
            <div
              className="flex items-center bg-red-500/10 text-red-400 rounded-lg"
              style={{ gap: '8px', padding: '10px', marginBottom: '12px' }}
            >
              <AlertCircle size={14} />
              <span className="text-xs">{updateError}</span>
              <button
                onClick={resetError}
                className="ml-auto text-xs underline hover:no-underline"
              >
                Schließen
              </button>
            </div>
          )}

          {updateStatus === 'available' && updateInfo && (
            <div
              className="bg-[var(--color-accent)]/10 rounded-lg"
              style={{ padding: '12px', marginBottom: '12px' }}
            >
              <p className="text-sm font-medium text-[var(--text-primary)]">
                Update verfügbar: v{updateInfo.latestVersion}
              </p>
              <p className="text-xs text-[var(--text-secondary)]" style={{ marginTop: '4px' }}>
                Aktuelle Version: v{currentVersion}
              </p>
            </div>
          )}

          {updateStatus === 'ready' && (
            <div
              className="flex items-center bg-green-500/10 text-green-400 rounded-lg"
              style={{ gap: '8px', padding: '10px', marginBottom: '12px' }}
            >
              <Check size={14} />
              <span className="text-xs">Update bereit! Neustart erforderlich.</span>
            </div>
          )}

          {/* Update Buttons */}
          <div className="flex" style={{ gap: '8px' }}>
            {updateStatus === 'ready' ? (
              <button
                onClick={restartApp}
                className="flex-1 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors"
                style={{ gap: '6px', padding: '10px' }}
              >
                <RefreshCw size={12} />
                Neu starten
              </button>
            ) : updateStatus === 'available' ? (
              <button
                onClick={downloadUpdate}
                className="flex-1 flex items-center justify-center bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-lg text-xs font-medium transition-colors"
                style={{ gap: '6px', padding: '10px' }}
              >
                <Download size={12} />
                Update herunterladen
              </button>
            ) : updateStatus === 'downloading' ? (
              <button
                disabled
                className="flex-1 flex items-center justify-center bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg text-xs font-medium opacity-50"
                style={{ gap: '6px', padding: '10px' }}
              >
                <RefreshCw size={12} className="animate-spin" />
                Lädt herunter...
              </button>
            ) : (
              <button
                onClick={checkForUpdate}
                disabled={updateStatus === 'checking'}
                className="flex-1 flex items-center justify-center bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                style={{ gap: '6px', padding: '10px' }}
              >
                <RefreshCw size={12} className={updateStatus === 'checking' ? 'animate-spin' : ''} />
                {updateStatus === 'checking' ? 'Prüfe...' : 'Nach Updates suchen'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[var(--border-muted)]" style={{ padding: '16px' }}>
        <p className="text-xs text-[var(--text-tertiary)] text-center">
          QuickLaunch v{currentVersion}
        </p>
      </div>
    </motion.div>
  )
}
