import { useEffect } from 'react'
import { EventsOn, EventsOff } from '../../wailsjs/runtime/runtime'
import { useAppStore } from '@/stores/appStore'
import type { AppState } from '@/types'

export function useWailsEvents() {
  const { setOpen, setView, reset } = useAppStore()

  useEffect(() => {
    // Listen for panel show/hide events from Go
    const showHandler = () => {
      setOpen(true)
      reset() // Reset filter and selection when opening
    }

    const hideHandler = () => {
      setOpen(false)
    }

    // Listen for panel show with specific view (e.g., from toast notification)
    const showViewHandler = (view: string) => {
      setOpen(true)
      if (view === 'settings' || view === 'tiles' || view === 'addTile' || view === 'editTile') {
        setView(view as AppState['view'])
      }
    }

    EventsOn('panel:show', showHandler)
    EventsOn('panel:hide', hideHandler)
    EventsOn('panel:show:view', showViewHandler)

    return () => {
      EventsOff('panel:show')
      EventsOff('panel:hide')
      EventsOff('panel:show:view')
    }
  }, [setOpen, setView, reset])
}
