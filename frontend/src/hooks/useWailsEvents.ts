import { useEffect } from 'react'
import { EventsOn, EventsOff } from '../../wailsjs/runtime/runtime'
import { useAppStore } from '@/stores/appStore'

export function useWailsEvents() {
  const { setOpen, reset } = useAppStore()

  useEffect(() => {
    // Listen for panel show/hide events from Go
    const showHandler = () => {
      setOpen(true)
      reset() // Reset filter and selection when opening
    }

    const hideHandler = () => {
      setOpen(false)
    }

    EventsOn('panel:show', showHandler)
    EventsOn('panel:hide', hideHandler)

    return () => {
      EventsOff('panel:show')
      EventsOff('panel:hide')
    }
  }, [setOpen, reset])
}
