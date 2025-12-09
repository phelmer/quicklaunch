import { create } from 'zustand'
import type { AppState } from '@/types'

interface AppStore extends AppState {
  setOpen: (open: boolean) => void
  toggle: () => void
  setSelectedTileIndex: (index: number) => void
  setFilterText: (text: string) => void
  openSubMenu: () => void
  closeSubMenu: () => void
  setSelectedSubMenuIndex: (index: number) => void
  setView: (view: AppState['view']) => void
  setEditingTileId: (id: string | null) => void
  reset: () => void
}

const initialState: AppState = {
  isOpen: false,
  selectedTileIndex: 0,
  isSubMenuOpen: false,
  selectedSubMenuIndex: 0,
  filterText: '',
  view: 'tiles',
  editingTileId: null,
}

export const useAppStore = create<AppStore>((set) => ({
  ...initialState,

  setOpen: (isOpen) => set({ isOpen }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setSelectedTileIndex: (selectedTileIndex) => set({ selectedTileIndex }),
  setFilterText: (filterText) => set({ filterText, selectedTileIndex: 0 }),
  openSubMenu: () => set({ isSubMenuOpen: true, selectedSubMenuIndex: 0 }),
  closeSubMenu: () => set({ isSubMenuOpen: false }),
  setSelectedSubMenuIndex: (selectedSubMenuIndex) => set({ selectedSubMenuIndex }),
  setView: (view) => set({ view }),
  setEditingTileId: (editingTileId) => set({ editingTileId }),
  reset: () => set({ ...initialState, isOpen: true }),
}))
