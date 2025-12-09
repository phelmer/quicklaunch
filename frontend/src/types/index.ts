// Action types for tiles
export type ActionType = 'app' | 'folder' | 'url' | 'powershell'

// SubMenu types
export type SubMenuType = 'recent-folders' | 'custom'

// Tile configuration
export interface Tile {
  id: string
  name: string
  icon: string // Lucide icon name
  action: ActionType
  target: string // Command, path, or URL
  args?: string[]
  workDir?: string
  hasSubMenu?: boolean
  subMenuType?: SubMenuType
  order: number
  enabled: boolean
  color?: string
}

// Recent item for submenus
export interface RecentItem {
  tileId: string
  path: string
  name: string
  timestamp: string
}

// SubMenu item
export interface SubMenuItem {
  id: string
  label: string
  icon?: string
  path?: string
  action: () => void
}

// App state
export interface AppState {
  isOpen: boolean
  selectedTileIndex: number
  isSubMenuOpen: boolean
  selectedSubMenuIndex: number
  filterText: string
  view: 'tiles' | 'settings' | 'addTile' | 'editTile'
  editingTileId: string | null
}

// Settings
export interface Settings {
  hotkey: {
    modifiers: string[]
    key: string
  }
  theme: 'dark' | 'light' | 'system'
  position: 'left' | 'right'
  animation: boolean
  blur: boolean
  startWithWindows: boolean
  recentFoldersLimit: number
}

// Theme type
export type Theme = 'dark' | 'light'
