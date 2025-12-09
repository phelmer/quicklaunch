import { useCallback, useEffect } from 'react'
import { AnimatePresence } from 'motion/react'
import { Plus } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { useTilesStore } from '@/stores/tilesStore'
import { useHotkeys } from '@/hooks/useHotkeys'
import { Tile } from './Tile'
import { SubMenu } from './SubMenu'
import {
  ExecuteAction,
  HidePanel,
} from '../../wailsjs/go/main/App'

export function TileGrid() {
  const {
    filterText,
    selectedTileIndex,
    setSelectedTileIndex,
    isSubMenuOpen,
    openSubMenu,
    closeSubMenu,
    view,
    setView,
    setEditingTileId,
  } = useAppStore()

  const { tiles } = useTilesStore()

  // Filter and sort tiles
  const filteredTiles = tiles
    .filter((t) => t.enabled)
    .filter((t) => t.name.toLowerCase().includes(filterText.toLowerCase()))
    .sort((a, b) => a.order - b.order)

  // Handle tile execution
  const handleExecuteTile = useCallback(
    async (tileId: string) => {
      const tile = tiles.find((t) => t.id === tileId)
      if (!tile || !tile.enabled) return

      // Handle tiles with submenus
      if (tile.hasSubMenu) {
        openSubMenu()
        return
      }

      // Execute action
      try {
        await ExecuteAction(tile.action, tile.target)
        HidePanel()
      } catch (err) {
        console.error('Error executing action:', err)
      }
    },
    [tiles, openSubMenu]
  )

  // Setup hotkeys (1-9 quick access, ESC to close submenu)
  useHotkeys({
    onExecuteTile: handleExecuteTile,
    filteredTiles,
  })

  // Handle keyboard navigation within grid (Arrow keys for search field focus)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle when a tile is focused
      const activeElement = document.activeElement as HTMLElement
      if (!activeElement?.hasAttribute('data-tile-index')) return

      const currentIndex = parseInt(activeElement.getAttribute('data-tile-index') || '0')

      if (e.key === 'ArrowUp' && currentIndex < 3) {
        // First row - focus search field
        e.preventDefault()
        const searchInput = document.querySelector<HTMLInputElement>('input[type="text"]')
        searchInput?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Restore focus when returning to tiles view from overlay
  useEffect(() => {
    if (view === 'tiles') {
      // Small delay to allow animation to complete
      const timer = setTimeout(() => {
        const tile = document.querySelector<HTMLButtonElement>(
          `[data-tile-index="${selectedTileIndex}"]`
        )
        tile?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [view, selectedTileIndex])

  // Get currently selected tile for submenu
  const selectedTile = filteredTiles[selectedTileIndex]

  return (
    <div className="relative flex-1">
      {/* Tile Grid */}
      <div className="grid grid-cols-3 justify-items-center" style={{ gap: '12px' }}>
        {filteredTiles.map((tile, index) => (
          <Tile
            key={tile.id}
            tile={tile}
            index={index}
            isSelected={index === selectedTileIndex}
            onClick={() => {
              setSelectedTileIndex(index)
              handleExecuteTile(tile.id)
            }}
            onFocus={() => setSelectedTileIndex(index)}
            onContextMenu={() => {
              setEditingTileId(tile.id)
              setView('editTile')
            }}
          />
        ))}
      </div>

      {/* Empty state - no tiles yet */}
      {filteredTiles.length === 0 && !filterText && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div
            className="rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center"
            style={{ width: '64px', height: '64px', marginBottom: '16px' }}
          >
            <Plus size={32} className="text-[var(--text-tertiary)]" />
          </div>
          <p className="text-sm text-[var(--text-secondary)]" style={{ marginBottom: '8px' }}>
            Noch keine Kacheln vorhanden
          </p>
          <button
            onClick={() => setView('addTile')}
            className="text-sm text-[var(--color-accent)] hover:underline focus:outline-none"
          >
            Erstelle deine erste Kachel
          </button>
        </div>
      )}

      {/* Empty state - no search results */}
      {filteredTiles.length === 0 && filterText && (
        <div className="text-center py-8 text-[var(--text-secondary)]">
          <p className="text-sm">Keine Ergebnisse für "{filterText}"</p>
        </div>
      )}

      {/* SubMenu Overlay */}
      <AnimatePresence>
        {isSubMenuOpen && selectedTile && (
          <SubMenu tileId={selectedTile.id} onClose={closeSubMenu} />
        )}
      </AnimatePresence>
    </div>
  )
}
