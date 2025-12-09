import { create } from 'zustand'
import type { Tile, RecentItem } from '@/types'
import {
  GetTiles,
  SaveTiles,
  AddTile as AddTileApi,
  UpdateTile as UpdateTileApi,
  RemoveTile as RemoveTileApi,
} from '../../wailsjs/go/main/App'
import { config } from '../../wailsjs/go/models'

interface TilesStore {
  tiles: Tile[]
  recentItems: RecentItem[]
  isLoading: boolean

  loadTiles: () => Promise<void>
  addTile: (tile: Tile) => Promise<void>
  updateTile: (id: string, updates: Partial<Tile>) => Promise<void>
  removeTile: (id: string) => Promise<void>
  reorderTiles: (fromIndex: number, toIndex: number) => Promise<void>

  addRecentItem: (item: Omit<RecentItem, 'timestamp'>) => void
  getRecentForTile: (tileId: string) => RecentItem[]
  clearRecent: (tileId?: string) => void
}

// Convert frontend Tile to Go config.Tile
function toConfigTile(tile: Tile): config.Tile {
  return new config.Tile({
    id: tile.id,
    name: tile.name,
    icon: tile.icon,
    action: tile.action,
    target: tile.target,
    args: tile.args,
    workDir: tile.workDir,
    hasSubMenu: tile.hasSubMenu ?? false,
    subMenuType: tile.subMenuType,
    order: tile.order,
    enabled: tile.enabled,
    color: tile.color,
  })
}

// Convert Go config.Tile to frontend Tile
function fromConfigTile(t: config.Tile): Tile {
  return {
    id: t.id,
    name: t.name,
    icon: t.icon,
    action: t.action as Tile['action'],
    target: t.target,
    args: t.args,
    workDir: t.workDir,
    hasSubMenu: t.hasSubMenu,
    subMenuType: t.subMenuType as Tile['subMenuType'],
    order: t.order,
    enabled: t.enabled,
    color: t.color,
  }
}

export const useTilesStore = create<TilesStore>((set, get) => ({
  tiles: [],
  recentItems: [],
  isLoading: true,

  loadTiles: async () => {
    try {
      const configTiles = await GetTiles()
      const tiles = (configTiles || []).map(fromConfigTile)
      set({ tiles, isLoading: false })
    } catch (err) {
      console.error('Failed to load tiles:', err)
      set({ tiles: [], isLoading: false })
    }
  },

  addTile: async (tile) => {
    try {
      await AddTileApi(toConfigTile(tile))
      set({ tiles: [...get().tiles, tile] })
    } catch (err) {
      console.error('Failed to add tile:', err)
    }
  },

  updateTile: async (id, updates) => {
    const tiles = get().tiles
    const index = tiles.findIndex((t) => t.id === id)
    if (index !== -1) {
      const updated = { ...tiles[index], ...updates }
      try {
        await UpdateTileApi(id, toConfigTile(updated))
        const newTiles = [...tiles]
        newTiles[index] = updated
        set({ tiles: newTiles })
      } catch (err) {
        console.error('Failed to update tile:', err)
      }
    }
  },

  removeTile: async (id) => {
    try {
      await RemoveTileApi(id)
      set({ tiles: get().tiles.filter((t) => t.id !== id) })
    } catch (err) {
      console.error('Failed to remove tile:', err)
    }
  },

  reorderTiles: async (fromIndex, toIndex) => {
    const tiles = [...get().tiles]
    const [removed] = tiles.splice(fromIndex, 1)
    tiles.splice(toIndex, 0, removed)
    // Update order values
    const reorderedTiles = tiles.map((t, i) => ({ ...t, order: i }))

    try {
      await SaveTiles(reorderedTiles.map(toConfigTile))
      set({ tiles: reorderedTiles })
    } catch (err) {
      console.error('Failed to reorder tiles:', err)
    }
  },

  // Recent items are still stored in memory (could be moved to Go later)
  addRecentItem: (item) =>
    set((state) => {
      const filtered = state.recentItems.filter(
        (r) => !(r.tileId === item.tileId && r.path === item.path)
      )
      const newItem: RecentItem = {
        ...item,
        timestamp: new Date().toISOString(),
      }
      return {
        recentItems: [newItem, ...filtered].slice(0, 50),
      }
    }),

  getRecentForTile: (tileId) => {
    return get()
      .recentItems.filter((r) => r.tileId === tileId)
      .slice(0, 5)
  },

  clearRecent: (tileId) =>
    set((state) => ({
      recentItems: tileId
        ? state.recentItems.filter((r) => r.tileId !== tileId)
        : [],
    })),
}))
