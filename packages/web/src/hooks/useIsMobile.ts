import { useMedia as useMediaQuery } from 'react-use'

/**
 * Returns true if the current viewport is mobile-sized (≤768px wide).
 *
 * Previously this was UA-based (via SsrContext). Now it's viewport-based so
 * a desktop browser narrowed to mobile width behaves identically to a real
 * mobile device.
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
  return useMediaQuery('(max-width: 768px)')
}
