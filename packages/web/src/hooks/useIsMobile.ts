import { useMedia as useMediaQuery } from 'react-use'

/**
 * Returns true if the current viewport is mobile-sized (≤480px wide).
 *
 * 480px = phones in portrait. Tablets (768px iPad mini portrait) and
 * phones in landscape (~640–926px) get the desktop layout, which we have
 * confirmed handles narrow desktop widths well via container queries and
 * the existing 328px MIN_DESKTOP_CONTENT_WIDTH_PX floor.
 *
 * Implementation note: this calls react-use's useMedia directly rather than
 * Harmony's MediaProvider-backed useMedia hook. That's deliberate — this
 * shim is called from `Root.tsx` and `AppProviders.tsx`, which render
 * BEFORE MediaProvider is mounted (the provider lives inside AppProviders'
 * return). Pulling from context there would throw.
 *
 * SSR consequence: window.matchMedia is unavailable on the server, so
 * react-use's useMedia returns false (its server default), giving the
 * desktop variant in HTML and reconciling to mobile after hydration on
 * narrow viewports. Prefer container queries for layout decisions whenever
 * possible.
 */
export const useIsMobile = () => {
  return useMediaQuery('(max-width: 480px)')
}
