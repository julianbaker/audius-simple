import { RefObject, useCallback, useEffect, useRef, useState } from 'react'

type Args = {
  /** Sheet element used to size the dismiss threshold against. */
  sheetRef: RefObject<HTMLElement | null>
  /** The drag region (handle / header) — gesture always engages here. */
  dragRegionRef: RefObject<HTMLElement | null>
  /**
   * Inner scroll container — the gesture engages from here only while
   * scrollTop === 0. Required for iOS-style pull-to-dismiss; without it,
   * dismiss only works from the drag region.
   */
  scrollRef?: RefObject<HTMLElement | null>
  /**
   * Whether the sheet is currently open / mounted. The effect re-runs
   * when this flips true so listeners get attached to the actual DOM
   * elements (refs aren't a useEffect dependency on their own).
   */
  enabled: boolean
  /** Minimum downward distance (px) to commit the dismiss on release. */
  minDismissPx?: number
  /** Fraction of the sheet's own height that also commits a dismiss. */
  dismissHeightRatio?: number
  /** Called once a release commits to dismissal. */
  onDismiss: () => void
}

// Pixels of movement required before we engage the drag. Below this, the
// touch is treated as a tap and click handlers on interactive children
// (notification rows, links, the close button) fire normally without us
// fighting them. The browser already cancels click events when movement
// exceeds its own threshold, so this just keeps our state machine clean.
const ENGAGE_THRESHOLD_PX = 6
// Explicit opt-out for any element that should never start a drag (e.g.
// the close button if it ever lives inside a gesture target).
const NO_DRAG_SELECTOR = '[data-no-drag]'

/**
 * iOS-style drag-down-to-dismiss for a bottom sheet.
 *
 * Listens to native touch events with `{ passive: false }` so we can
 * `preventDefault()` and take over from the browser's native scroll
 * handling — pointer events alone don't work because iOS Safari cancels
 * them once it commits to a scroll gesture.
 *
 *   - Touch starts in the scroll area while scrollTop > 0: do nothing
 *     (browser scrolls the list).
 *   - Touch starts in the scroll area at scrollTop === 0: engages on the
 *     first downward move; we preventDefault to stop native scroll, then
 *     translate the sheet with the finger. If the finger reverses past
 *     the start, the offset clamps to 0 (sheet stays open).
 *   - Touch starts in the drag region: always engages.
 *   - Release past `minDismissPx` or `dismissHeightRatio` of the sheet
 *     height: dismiss. Otherwise snap back.
 *
 * Mouse / trackpad on desktop falls through to pointer events on the
 * same surfaces (handled inline by the component for the close button
 * etc.), but the primary surface for this gesture is touch.
 */
export const useBottomSheetDismiss = ({
  sheetRef,
  dragRegionRef,
  scrollRef,
  enabled,
  minDismissPx = 80,
  dismissHeightRatio = 1 / 4,
  onDismiss
}: Args) => {
  const [offset, setOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  // Stable refs for the latest callback values — the touch listeners are
  // bound once in useEffect and shouldn't re-attach on every render.
  const onDismissRef = useRef(onDismiss)
  const minDismissRef = useRef(minDismissPx)
  const ratioRef = useRef(dismissHeightRatio)
  useEffect(() => {
    onDismissRef.current = onDismiss
    minDismissRef.current = minDismissPx
    ratioRef.current = dismissHeightRatio
  })

  useEffect(() => {
    if (!enabled) return
    const dragRegion = dragRegionRef.current
    const scrollArea = scrollRef?.current
    if (!dragRegion && !scrollArea) return

    let activeTouchId: number | null = null
    let startY = 0
    let lastY = 0
    let engaged = false
    let startedInScroll = false

    const findTouch = (e: TouchEvent) => {
      if (activeTouchId === null) return null
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === activeTouchId) return e.touches[i]
      }
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === activeTouchId) {
          return e.changedTouches[i]
        }
      }
      return null
    }

    const reset = () => {
      activeTouchId = null
      engaged = false
      startedInScroll = false
      setIsDragging(false)
      setOffset(0)
    }

    const handleStart = (e: TouchEvent, fromScroll: boolean) => {
      if (activeTouchId !== null) return
      const touch = e.touches[0]
      if (!touch) return

      const target = e.target as HTMLElement | null
      // Explicit opt-out for elements that should never start a drag. We
      // do NOT bail on generic buttons / links — the engage-threshold
      // distinguishes tap from drag, and the browser cancels click on
      // significant movement, so plain interactive children just work.
      if (target?.closest(NO_DRAG_SELECTOR)) return

      // From the scroll area, only engage when at the top — otherwise
      // the user wants to scroll the list.
      if (fromScroll && (scrollArea?.scrollTop ?? 0) > 0) return

      activeTouchId = touch.identifier
      startY = touch.clientY
      lastY = touch.clientY
      engaged = false
      startedInScroll = fromScroll
    }

    const handleMove = (e: TouchEvent) => {
      const touch = findTouch(e)
      if (!touch) return
      const delta = touch.clientY - startY
      lastY = touch.clientY

      // Below the engage threshold this looks like a tap — let click
      // handlers on interactive children (notification rows, etc.) fire.
      if (!engaged && Math.abs(delta) < ENGAGE_THRESHOLD_PX) return

      if (delta > 0) {
        if (startedInScroll) {
          // Re-check scrollTop: if it's somehow > 0 (rubber-band edge case),
          // bail and let the browser handle it.
          if ((scrollArea?.scrollTop ?? 0) > 0) {
            reset()
            return
          }
          // preventDefault must run before the browser commits to a scroll
          // gesture, which is why this listener is non-passive.
          e.preventDefault()
        }
        engaged = true
        setOffset(delta)
        setIsDragging(true)
      } else {
        // Pulling back up past the start: clamp to 0 so the sheet returns
        // to its open position (doesn't translate above the start).
        if (engaged) {
          setOffset(0)
          setIsDragging(false)
        }
      }
    }

    const handleEnd = (e: TouchEvent) => {
      const touch = findTouch(e)
      if (!touch && activeTouchId !== null) {
        // Touch went away (cancel); use the last known position.
      } else if (touch) {
        lastY = touch.clientY
      }
      const totalDelta = Math.max(0, lastY - startY)
      const sheetHeight = sheetRef.current?.offsetHeight ?? 0
      const shouldDismiss =
        totalDelta > minDismissRef.current ||
        (sheetHeight > 0 && totalDelta > sheetHeight * ratioRef.current)
      reset()
      if (shouldDismiss) onDismissRef.current()
    }

    const onDragStart = (e: TouchEvent) => handleStart(e, false)
    const onScrollStart = (e: TouchEvent) => handleStart(e, true)

    // touchmove must be non-passive so we can preventDefault() from the
    // scroll area to take over from native scrolling.
    const moveOpts: AddEventListenerOptions = { passive: false }
    const startOpts: AddEventListenerOptions = { passive: true }

    dragRegion?.addEventListener('touchstart', onDragStart, startOpts)
    dragRegion?.addEventListener('touchmove', handleMove, moveOpts)
    dragRegion?.addEventListener('touchend', handleEnd)
    dragRegion?.addEventListener('touchcancel', handleEnd)
    scrollArea?.addEventListener('touchstart', onScrollStart, startOpts)
    scrollArea?.addEventListener('touchmove', handleMove, moveOpts)
    scrollArea?.addEventListener('touchend', handleEnd)
    scrollArea?.addEventListener('touchcancel', handleEnd)

    return () => {
      dragRegion?.removeEventListener('touchstart', onDragStart)
      dragRegion?.removeEventListener('touchmove', handleMove)
      dragRegion?.removeEventListener('touchend', handleEnd)
      dragRegion?.removeEventListener('touchcancel', handleEnd)
      scrollArea?.removeEventListener('touchstart', onScrollStart)
      scrollArea?.removeEventListener('touchmove', handleMove)
      scrollArea?.removeEventListener('touchend', handleEnd)
      scrollArea?.removeEventListener('touchcancel', handleEnd)
    }
  }, [enabled, dragRegionRef, scrollRef, sheetRef])

  return { offset, isDragging }
}

/**
 * Lock body scroll while the sheet is open and listen for Escape to close
 * — both standard expectations for a modal-class drawer.
 */
export const useSheetA11y = ({
  isOpen,
  onClose
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKey)
    }
  }, [isOpen, onClose])
}
