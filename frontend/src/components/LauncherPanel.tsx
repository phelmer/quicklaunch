import { motion, AnimatePresence } from 'motion/react'
import { useAppStore } from '@/stores/appStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { SearchBar } from './SearchBar'
import { TileGrid } from './TileGrid'
import { SettingsPanel } from './SettingsPanel'
import { TileEditor } from './TileEditor'

export function LauncherPanel() {
  const { view } = useAppStore()
  const { animation, blur } = useSettingsStore()

  return (
    <motion.div
      className={`
        fixed left-0 top-0 h-full w-[280px]
        bg-[var(--bg-primary)]
        ${blur ? 'bg-opacity-90 backdrop-blur-xl' : 'bg-opacity-100'}
        border-r border-[var(--border-muted)]
        shadow-[var(--shadow-panel)]
        flex flex-col
        overflow-hidden
      `}
      initial={animation ? { x: '-100%', opacity: 0 } : false}
      animate={{ x: 0, opacity: 1 }}
      exit={animation ? { x: '-100%', opacity: 0 } : undefined}
      transition={{
        duration: animation ? 0.25 : 0,
        ease: [0.16, 1, 0.3, 1], // easeOutExpo
      }}
    >
      {/* Drag Handle - for moving window if needed */}
      <div className="wails-drag h-2 w-full shrink-0" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col wails-no-drag overflow-hidden relative" style={{ padding: '16px' }}>
        {/* Default View: Search + Tiles */}
        {view === 'tiles' && (
          <>
            <SearchBar />
            <TileGrid />
          </>
        )}

        {/* Overlay Views */}
        <AnimatePresence>
          {view === 'settings' && <SettingsPanel />}
          {(view === 'addTile' || view === 'editTile') && <TileEditor />}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
