import { create } from 'zustand'
import type { Tile, RecentItem } from '@/types'
import {
  GetTiles,
  SaveTiles,
  AddTile as AddTileApi,
  UpdateTile as UpdateTileApi,
  RemoveTile as RemoveTileApi,
  AddRecentItem as AddRecentItemApi,
  ClearRecentItems as ClearRecentItemsApi,
} from '../../wailsjs/go/main/App'
import { config } from '../../wailsjs/go/models'

interface TilesStore {
  tiles: Tile[]
  isLoading: boolean

  loadTiles: () => Promise<void>
  addTile: (tile: Tile) => Promise<void>
  updateTile: (id: string, updates: Partial<Tile>) => Promise<void>
  removeTile: (id: string) => Promise<void>
  reorderTiles: (fromIndex: number, toIndex: number) => Promise<void>

  addRecentItem: (tileId: string, item: { path: string; name: string }) => Promise<void>
  getRecentForTile: (tileId: string) => RecentItem[]
  clearRecent: (tileId?: string) => Promise<void>
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
    subMenuItems: tile.subMenuItems?.map(
      (item) =>
        new config.RecentItem({
          path: item.path,
          name: item.name,
          timestamp: item.timestamp,
        })
    ),
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
    subMenuItems: t.subMenuItems?.map((item) => ({
      path: item.path,
      name: item.name,
      timestamp: item.timestamp,
    })) || [],
    order: t.order,
    enabled: t.enabled,
    color: t.color,
  }
}

export const useTilesStore = create<TilesStore>((set, get) => ({
  tiles: [],
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

  // Recent items are now persisted per tile via the backend
  addRecentItem: async (tileId, item) => {
    const newItem = new config.RecentItem({
      path: item.path,
      name: item.name,
      timestamp: new Date().toISOString(),
    })

    try {
      await AddRecentItemApi(tileId, newItem)
      // Optimistically update local state
      set((state) => ({
        tiles: state.tiles.map((t) =>
          t.id === tileId
            ? {
                ...t,
                subMenuItems: [
                  { path: item.path, name: item.name, timestamp: newItem.timestamp },
                  ...(t.subMenuItems || []).filter((i) => i.path !== item.path),
                ].slice(0, 5),
              }
            : t
        ),
      }))
    } catch (err) {
      console.error('Failed to add recent item:', err)
      // Reload tiles to get fresh state
      get().loadTiles()
    }
  },

  getRecentForTile: (tileId) => {
    const tile = get().tiles.find((t) => t.id === tileId)
    return tile?.subMenuItems || []
  },

  clearRecent: async (tileId) => {
    try {
      await ClearRecentItemsApi(tileId || '')
      if (tileId) {
        set((state) => ({
          tiles: state.tiles.map((t) =>
            t.id === tileId ? { ...t, subMenuItems: [] } : t
          ),
        }))
      } else {
        set((state) => ({
          tiles: state.tiles.map((t) => ({ ...t, subMenuItems: [] })),
        }))
      }
    } catch (err) {
      console.error('Failed to clear recent items:', err)
    }
  },
}))
