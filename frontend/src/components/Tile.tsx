import { motion } from 'motion/react'
import * as Icons from 'lucide-react'
import type { Tile as TileType } from '@/types'

interface TileProps {
  tile: TileType
  index: number
  isSelected: boolean
  onClick: () => void
  onContextMenu?: () => void
  onFocus?: () => void
}

export function Tile({ tile, index, isSelected, onClick, onContextMenu, onFocus }: TileProps) {
  // Dynamic icon lookup from lucide-react
  const IconComponent = Icons[tile.icon as keyof typeof Icons] as React.ComponentType<{
    className?: string
    size?: number
  }>

  return (
    <motion.button
      data-tile-index={index}
      tabIndex={0}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      onFocus={onFocus}
      onContextMenu={(e) => {
        e.preventDefault()
        if (onContextMenu) {
          onContextMenu()
        }
      }}
      disabled={!tile.enabled}
      className={`
        relative flex flex-col items-center justify-center
        rounded-xl
        transition-colors duration-150
        ${
          isSelected
            ? 'bg-[var(--color-accent)] text-white ring-2 ring-[var(--color-accent)] ring-offset-2 ring-offset-[var(--bg-primary)]'
            : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
        }
        ${!tile.enabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]
      `}
      style={{
        width: '72px',
        height: '72px',
        gap: '6px',
        ...(tile.color ? { backgroundColor: tile.color } : {}),
      }}
    >
      {/* Quick access number badge */}
      {index < 9 && (
        <span
          className={`absolute font-medium ${isSelected ? 'text-white/70' : 'text-[var(--text-tertiary)]'}`}
          style={{ top: '4px', right: '6px', fontSize: '10px' }}
        >
          {index + 1}
        </span>
      )}

      {/* Icon */}
      {IconComponent && (
        <IconComponent
          size={22}
          className={isSelected ? 'text-white' : 'text-[var(--text-primary)]'}
        />
      )}

      {/* Label */}
      <span className="text-[11px] font-medium truncate w-full text-center px-1">
        {tile.name}
      </span>

      {/* SubMenu indicator */}
      {tile.hasSubMenu && (
        <span className="absolute" style={{ bottom: '4px', right: '4px' }}>
          <Icons.ChevronRight
            size={10}
            className={isSelected ? 'text-white/70' : 'text-[var(--text-tertiary)]'}
          />
        </span>
      )}
    </motion.button>
  )
}
