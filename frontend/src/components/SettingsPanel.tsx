import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'motion/react'
import { Moon, Sun, Monitor, Keyboard, FolderOpen, ArrowLeft, Rocket } from 'lucide-react'
import { useSettingsStore } from '@/stores/settingsStore'
import { useAppStore } from '@/stores/appStore'
import { useTheme } from '@/hooks/useTheme'
import { GetAutoStartEnabled, SetAutoStart } from '../../wailsjs/go/main/App'

export function SettingsPanel() {
  const settings = useSettingsStore()
  const { setView } = useAppStore()
  const { theme, setTheme } = useTheme()
  const [autoStart, setAutoStartState] = useState(false)
  const firstFocusableRef = useRef<HTMLButtonElement>(null)

  // Load autostart state from backend
  useEffect(() => {
    GetAutoStartEnabled().then(setAutoStartState).catch(console.error)
  }, [])

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
      </div>

      {/* Footer */}
      <div className="border-t border-[var(--border-muted)]" style={{ padding: '16px' }}>
        <p className="text-xs text-[var(--text-tertiary)] text-center">
          QuickLaunch v1.0.0
        </p>
      </div>
    </motion.div>
  )
}
