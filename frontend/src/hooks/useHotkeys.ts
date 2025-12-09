import { useEffect, useCallback } from 'react'
import { useAppStore } from '@/stores/appStore'
import { HidePanel } from '../../wailsjs/go/main/App'
import type { Tile } from '@/types'

interface UseHotkeysProps {
  onExecuteTile: (tileId: string) => void
  filteredTiles: Tile[]
}

/**
 * Minimal hotkey handler for:
 * - Number keys 1-9: Quick access to tiles (only when not in an input)
 * - ESC: Close submenu or hide panel (handled globally)
 *
 * All other navigation (Tab, Arrow keys) is handled by native browser focus.
 */
export function useHotkeys({ onExecuteTile, filteredTiles }: UseHotkeysProps) {
  const { isSubMenuOpen, closeSubMenu, view } = useAppStore()

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't handle hotkeys when typing in an input (except ESC)
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement

      // ESC key handling - works everywhere
      if (e.key === 'Escape') {
        e.preventDefault()
        if (isSubMenuOpen) {
          closeSubMenu()
        } else if (view === 'tiles') {
          HidePanel()
        }
        // Note: ESC in settings/addTile/editTile is handled by those components
        return
      }

      // Number keys 1-9 for quick tile access (only in tiles view and not in input)
      if (!isInput && view === 'tiles' && e.key >= '1' && e.key <= '9' && !isSubMenuOpen) {
        const index = parseInt(e.key) - 1
        if (index < filteredTiles.length) {
          e.preventDefault()
          onExecuteTile(filteredTiles[index].id)
        }
        return
      }
    },
    [isSubMenuOpen, closeSubMenu, view, filteredTiles, onExecuteTile]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
