import { motion } from 'motion/react'
import { Folder, Clock, FolderOpen } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { useTilesStore } from '@/stores/tilesStore'
import {
  ExecuteActionWithPath,
  OpenFolderDialog,
  HidePanel,
} from '../../wailsjs/go/main/App'

interface SubMenuProps {
  tileId: string
  onClose: () => void
}

export function SubMenu({ tileId, onClose }: SubMenuProps) {
  const { selectedSubMenuIndex } = useAppStore()
  const { tiles, recentItems, addRecentItem } = useTilesStore()

  const tile = tiles.find((t) => t.id === tileId)
  if (!tile) return null

  // Get recent folders for this tile
  const recentFolders = recentItems
    .filter((r) => r.tileId === tileId)
    .slice(0, 5)

  const handleSelectFolder = async () => {
    try {
      const path = await OpenFolderDialog()
      if (path) {
        // Add to recent
        const name = path.split(/[\\/]/).pop() || path
        addRecentItem({ tileId, path, name })

        // Execute action
        await ExecuteActionWithPath(tile.action, tile.target, path)
        HidePanel()
        onClose()
      }
    } catch (err) {
      console.error('Error selecting folder:', err)
    }
  }

  const handleRecentFolder = async (path: string, name: string) => {
    try {
      // Move to top of recent
      addRecentItem({ tileId, path, name })

      // Execute action
      await ExecuteActionWithPath(tile.action, tile.target, path)
      HidePanel()
      onClose()
    } catch (err) {
      console.error('Error executing action:', err)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.15 }}
      className="absolute inset-0 bg-[var(--bg-primary)]/98 backdrop-blur-sm z-10 flex flex-col"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between border-b border-[var(--border-muted)]"
        style={{ padding: '16px' }}
      >
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          {tile.name} öffnen in...
        </h3>
        <button
          onClick={onClose}
          className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded bg-[var(--bg-secondary)]"
          style={{ padding: '4px 8px' }}
        >
          ESC
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '16px' }}>
        {/* Browse folder option */}
        <button
          onClick={handleSelectFolder}
          className={`w-full flex items-center rounded-lg transition-colors
            ${
              selectedSubMenuIndex === 0
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
            }
          `}
          style={{ gap: '12px', padding: '12px' }}
        >
          <FolderOpen size={18} />
          <span className="text-sm">Ordner auswählen...</span>
        </button>

        {/* Recent folders */}
        {recentFolders.length > 0 && (
          <>
            <div
              className="flex items-center"
              style={{ gap: '8px', marginTop: '16px', marginBottom: '8px', paddingLeft: '4px' }}
            >
              <Clock size={12} className="text-[var(--text-tertiary)]" />
              <span className="text-xs text-[var(--text-tertiary)]">Zuletzt verwendet</span>
            </div>

            <div className="flex flex-col" style={{ gap: '4px' }}>
              {recentFolders.map((item, index) => (
                <button
                  key={`${item.path}-${index}`}
                  onClick={() => handleRecentFolder(item.path, item.name)}
                  className={`w-full flex items-center rounded-lg text-left transition-colors
                    ${
                      selectedSubMenuIndex === index + 1
                        ? 'bg-[var(--color-accent)] text-white'
                        : 'hover:bg-[var(--bg-secondary)] text-[var(--text-primary)]'
                    }
                  `}
                  style={{ gap: '12px', padding: '10px' }}
                >
                  <Folder size={14} className="shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p
                      className={`text-xs truncate ${
                        selectedSubMenuIndex === index + 1
                          ? 'text-white/70'
                          : 'text-[var(--text-tertiary)]'
                      }`}
                    >
                      {item.path}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}
