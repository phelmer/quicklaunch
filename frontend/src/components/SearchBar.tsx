import { useRef, useEffect, useCallback } from 'react'
import { Search, X, Settings, Plus } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { HidePanel } from '../../wailsjs/go/main/App'

export function SearchBar() {
  const { filterText, setFilterText, isOpen, setSelectedTileIndex, setView } = useAppStore()
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to ensure the panel is visible
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Handle keyboard navigation from search field
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      // Focus first tile
      setSelectedTileIndex(0)
      const firstTile = document.querySelector<HTMLButtonElement>('[data-tile-index="0"]')
      firstTile?.focus()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      HidePanel()
    }
  }, [setSelectedTileIndex])

  return (
    <div className="flex items-center" style={{ gap: '8px', marginBottom: '16px' }}>
      {/* Search Input */}
      <div className="relative flex-1">
        <Search
          className="absolute top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
          style={{ left: '12px', width: '16px', height: '16px' }}
        />
        <input
          ref={inputRef}
          type="text"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Suchen..."
          className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] text-sm placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)] transition-all duration-150"
          style={{ paddingLeft: '40px', paddingRight: filterText ? '40px' : '12px', paddingTop: '10px', paddingBottom: '10px' }}
        />
        {filterText && (
          <button
            onClick={() => setFilterText('')}
            className="absolute top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            style={{ right: '12px' }}
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        )}
      </div>

      {/* Settings Button */}
      <button
        onClick={() => setView('settings')}
        className="shrink-0 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
        style={{ padding: '10px' }}
        title="Einstellungen"
      >
        <Settings size={18} />
      </button>

      {/* Add Tile Button */}
      <button
        onClick={() => setView('addTile')}
        className="shrink-0 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
        style={{ padding: '10px' }}
        title="Neue Kachel"
      >
        <Plus size={18} />
      </button>
    </div>
  )
}
