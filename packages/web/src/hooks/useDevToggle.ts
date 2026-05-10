import { useCallback, useEffect, useState } from 'react'

const CHANGE_EVENT = 'audius:dev-toggle-change'

const read = (key: string, defaultValue: boolean): boolean => {
  if (typeof window === 'undefined') return defaultValue
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return defaultValue
    return raw === 'true'
  } catch {
    return defaultValue
  }
}

/**
 * Boolean toggle persisted to localStorage with cross-component live
 * updates in the same tab via a custom event. Used for /dev-tools
 * toggles where multiple consumers (the toggle itself + a top-level
 * mount in AppProviders) need to react to the same flip without a
 * page reload.
 *
 * Cross-tab sync is handled by the standard `storage` event.
 */
export const useDevToggle = (
  key: string,
  defaultValue: boolean
): [boolean, (next: boolean) => void] => {
  const [value, setValue] = useState<boolean>(() => read(key, defaultValue))

  useEffect(() => {
    const sync = (e: Event) => {
      // Same-tab change via dispatched CustomEvent
      if (e instanceof CustomEvent && e.detail?.key === key) {
        setValue(read(key, defaultValue))
      }
      // Cross-tab change via the native storage event
      if (e instanceof StorageEvent && e.key === key) {
        setValue(read(key, defaultValue))
      }
    }
    window.addEventListener(CHANGE_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [key, defaultValue])

  const set = useCallback(
    (next: boolean) => {
      try {
        window.localStorage.setItem(key, String(next))
      } catch {}
      setValue(next)
      window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { key } }))
    },
    [key]
  )

  return [value, set]
}

/**
 * Storage key for the React Query devtools floating-button toggle.
 * Default OFF so the button doesn't sit in the corner of the app for
 * normal users; can be flipped on from /dev-tools when debugging.
 */
export const REACT_QUERY_DEVTOOLS_KEY = 'audius-react-query-devtools-enabled'
