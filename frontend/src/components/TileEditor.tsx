import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'motion/react'
import { Save, Trash2, ArrowLeft } from 'lucide-react'
import * as Icons from 'lucide-react'
import { useTilesStore } from '@/stores/tilesStore'
import { useAppStore } from '@/stores/appStore'
import type { Tile, ActionType } from '@/types'

// Available icons for selection
const iconOptions = [
  'Terminal',
  'Code',
  'Folder',
  'Globe',
  'Bot',
  'Settings',
  'Plus',
  'FileText',
  'Database',
  'Cloud',
  'GitBranch',
  'Package',
  'Cpu',
  'Monitor',
  'Smartphone',
  'Mail',
  'Calendar',
  'Image',
  'Music',
  'Video',
  'Download',
  'Upload',
]

const actionTypes: { value: ActionType; label: string }[] = [
  { value: 'app', label: 'Anwendung' },
  { value: 'folder', label: 'Ordner' },
  { value: 'url', label: 'URL' },
  { value: 'powershell', label: 'PowerShell' },
]

export function TileEditor() {
  const { tiles, addTile, updateTile, removeTile } = useTilesStore()
  const { view, editingTileId, setView, setEditingTileId } = useAppStore()
  const firstInputRef = useRef<HTMLInputElement>(null)

  const isEditing = view === 'editTile' && editingTileId
  const existingTile = isEditing ? tiles.find((t) => t.id === editingTileId) : null

  const [form, setForm] = useState({
    name: '',
    icon: 'Terminal',
    action: 'app' as ActionType,
    target: '',
    hasSubMenu: false,
  })

  // Load existing tile data when editing
  useEffect(() => {
    if (existingTile) {
      setForm({
        name: existingTile.name,
        icon: existingTile.icon,
        action: existingTile.action,
        target: existingTile.target,
        hasSubMenu: existingTile.hasSubMenu || false,
      })
    }
  }, [existingTile])

  // Focus first input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      firstInputRef.current?.focus()
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setView('tiles')
    setEditingTileId(null)
  }

  // Handle ESC key to close
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      handleClose()
    }
  }, [])

  const handleSave = () => {
    if (!form.name.trim() || !form.target.trim()) return

    if (isEditing && editingTileId) {
      updateTile(editingTileId, {
        name: form.name,
        icon: form.icon,
        action: form.action,
        target: form.target,
        hasSubMenu: form.hasSubMenu,
        subMenuType: form.hasSubMenu ? 'recent-folders' : undefined,
      })
    } else {
      const newTile: Tile = {
        id: `tile-${Date.now()}`,
        name: form.name,
        icon: form.icon,
        action: form.action,
        target: form.target,
        hasSubMenu: form.hasSubMenu,
        subMenuType: form.hasSubMenu ? 'recent-folders' : undefined,
        order: tiles.length,
        enabled: true,
      }
      addTile(newTile)
    }

    handleClose()
  }

  const handleDelete = () => {
    if (isEditing && editingTileId) {
      removeTile(editingTileId)
      handleClose()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.15 }}
      className="absolute inset-0 bg-[var(--bg-primary)] z-20 flex flex-col overflow-y-auto"
      onKeyDown={handleKeyDown}
    >
      {/* Header */}
      <div
        className="flex items-center border-b border-[var(--border-muted)]"
        style={{ gap: '12px', padding: '16px' }}
      >
        <button
          onClick={handleClose}
          className="rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          style={{ padding: '6px' }}
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-base font-semibold text-[var(--text-primary)]">
          {isEditing ? 'Kachel bearbeiten' : 'Neue Kachel'}
        </h2>
      </div>

      {/* Form Content */}
      <div className="flex flex-col" style={{ padding: '16px', gap: '16px' }}>
        {/* Name */}
        <div>
          <label
            className="block text-xs font-medium text-[var(--text-secondary)]"
            style={{ marginBottom: '6px' }}
          >
            Name
          </label>
          <input
            ref={firstInputRef}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="z.B. VS Code"
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50"
            style={{ padding: '10px' }}
          />
        </div>

        {/* Icon Selection */}
        <div>
          <label
            className="block text-xs font-medium text-[var(--text-secondary)]"
            style={{ marginBottom: '6px' }}
          >
            Icon
          </label>
          <div className="flex flex-wrap" style={{ gap: '6px' }}>
            {iconOptions.map((icon) => {
              const Icon = Icons[icon as keyof typeof Icons] as React.ComponentType<{
                size?: number
                className?: string
              }>
              return (
                <button
                  key={icon}
                  onClick={() => setForm({ ...form, icon })}
                  className={`rounded-lg transition-colors ${
                    form.icon === icon
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                  }`}
                  style={{ padding: '8px' }}
                >
                  {Icon && <Icon size={16} />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Action Type */}
        <div>
          <label
            className="block text-xs font-medium text-[var(--text-secondary)]"
            style={{ marginBottom: '6px' }}
          >
            Aktionstyp
          </label>
          <select
            value={form.action}
            onChange={(e) => setForm({ ...form, action: e.target.value as ActionType })}
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50"
            style={{ padding: '10px' }}
          >
            {actionTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Target */}
        <div>
          <label
            className="block text-xs font-medium text-[var(--text-secondary)]"
            style={{ marginBottom: '6px' }}
          >
            Ziel (Befehl, Pfad oder URL)
          </label>
          <input
            value={form.target}
            onChange={(e) => setForm({ ...form, target: e.target.value })}
            placeholder={
              form.action === 'app'
                ? 'z.B. code oder wt.exe'
                : form.action === 'url'
                ? 'https://...'
                : form.action === 'powershell'
                ? 'z.B. claude'
                : 'C:\\...'
            }
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50"
            style={{ padding: '10px' }}
          />
        </div>

        {/* SubMenu Toggle */}
        <div className="flex items-center" style={{ gap: '12px' }}>
          <input
            type="checkbox"
            id="hasSubMenu"
            checked={form.hasSubMenu}
            onChange={(e) => setForm({ ...form, hasSubMenu: e.target.checked })}
            className="rounded border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]/50"
            style={{ width: '16px', height: '16px' }}
          />
          <label htmlFor="hasSubMenu" className="text-sm text-[var(--text-primary)]">
            Untermenü mit zuletzt verwendeten Ordnern anzeigen
          </label>
        </div>

        {/* Actions - now part of the form flow */}
        <div className="flex" style={{ gap: '8px', marginTop: '8px' }}>
          {isEditing && (
            <button
              onClick={handleDelete}
              className="flex items-center justify-center bg-[var(--color-error)]/20 text-[var(--color-error)] rounded-lg hover:bg-[var(--color-error)]/30 transition-colors text-sm"
              style={{ gap: '6px', padding: '8px 12px' }}
            >
              <Trash2 size={14} />
              Löschen
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!form.name.trim() || !form.target.trim()}
            className="flex-1 flex items-center justify-center bg-[var(--color-accent)] text-white rounded-lg hover:bg-[var(--color-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            style={{ gap: '6px', padding: '10px 16px' }}
          >
            <Save size={14} />
            Speichern
          </button>
        </div>
      </div>
    </motion.div>
  )
}
