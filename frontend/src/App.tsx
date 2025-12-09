import { useEffect } from 'react'
import { AnimatePresence } from 'motion/react'
import { useAppStore } from '@/stores/appStore'
import { useTilesStore } from '@/stores/tilesStore'
import { useWailsEvents } from '@/hooks/useWailsEvents'
import { useTheme } from '@/hooks/useTheme'
import { LauncherPanel } from '@/components/LauncherPanel'

export default function App() {
  const isOpen = useAppStore((state) => state.isOpen)
  const loadTiles = useTilesStore((state) => state.loadTiles)

  // Load tiles from Go backend on mount
  useEffect(() => {
    loadTiles()
  }, [loadTiles])

  // Initialize Wails events listener
  useWailsEvents()

  // Initialize theme
  useTheme()

  return (
    <div className="h-screen w-screen overflow-hidden bg-transparent">
      <AnimatePresence>
        {isOpen && <LauncherPanel />}
      </AnimatePresence>
    </div>
  )
}
