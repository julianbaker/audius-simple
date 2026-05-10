import { ReactNode, useRef } from 'react'
import { createPortal } from 'react-dom'

import { IconClose } from '../../icons'
import { IconButton } from '../button'

import styles from './BottomSheet.module.css'
import {
  useBottomSheetDismiss,
  useSheetA11y
} from './useBottomSheetDismiss'

const DEFAULT_BACKDROP_Z_INDEX = 9990
const DEFAULT_SHEET_Z_INDEX = 9991

export type BottomSheetProps = {
  /** Whether the sheet is visible. Returns null when false. */
  isOpen: boolean
  /** Called when the user dismisses (close button, backdrop, ESC, drag-down). */
  onClose: () => void
  /** Required: announces the sheet to screen readers. */
  ariaLabel: string
  /** Sheet content rendered inside the scrollable area. */
  children: ReactNode
  /**
   * Optional content rendered above the scroll area, inside the drag
   * region (so the gesture engages when dragging the header). Typical
   * use: a title bar + icon.
   */
  header?: ReactNode
  /**
   * Hide the close button. Default: false. Use when content has its own
   * dismiss action and a close button would be redundant.
   */
  hideClose?: boolean
  /** Aria label for the close button. Default: "Close". */
  closeAriaLabel?: string
  /**
   * z-index for the sheet. Backdrop renders one level below. Defaults are
   * sized to sit above app chrome but below toast / system overlays.
   */
  zIndex?: number
  /** Minimum downward drag distance to dismiss. Default: 80px. */
  minDismissPx?: number
  /** Drag distance as a fraction of sheet height that also dismisses. Default: 0.25. */
  dismissHeightRatio?: number
  /**
   * Optional className applied to the inner scrollable container — handy
   * when content needs special padding or background that should scroll
   * with it.
   */
  scrollAreaClassName?: string
}

/**
 * Mobile bottom-sheet drawer. Anchored to the bottom of the viewport,
 * with a drag handle, drag-down to dismiss, ESC, body-scroll lock, and
 * tap-outside on the backdrop. Portaled to body so it escapes any
 * stacking context the consumer may sit inside (sidebars, navigators).
 *
 * Use this when you need full-screen modal-class content on mobile that
 * the user can pull down to close. For desktop popovers / centered
 * modals, pair with Harmony `Popup` / `Modal` and switch on viewport.
 */
export const BottomSheet = ({
  isOpen,
  onClose,
  ariaLabel,
  children,
  header,
  hideClose = false,
  closeAriaLabel = 'Close',
  zIndex = DEFAULT_SHEET_Z_INDEX,
  minDismissPx,
  dismissHeightRatio,
  scrollAreaClassName
}: BottomSheetProps) => {
  const sheetRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const dragRegionRef = useRef<HTMLDivElement>(null)

  useSheetA11y({ isOpen, onClose })

  // Ref objects are stable — pass `enabled: isOpen` so the gesture effect
  // re-runs after open when drag/scroll nodes exist (see hook JSDoc).
  const { offset, isDragging } = useBottomSheetDismiss({
    sheetRef,
    dragRegionRef,
    scrollRef,
    enabled: isOpen,
    minDismissPx,
    dismissHeightRatio,
    onDismiss: onClose
  })

  if (!isOpen) return null

  const sheet = (
    <>
      <div
        className={styles.backdrop}
        onClick={onClose}
        aria-hidden
        style={{ zIndex: zIndex - 1 }}
      />
      <div
        ref={sheetRef}
        className={styles.sheet}
        role='dialog'
        aria-modal='true'
        aria-label={ariaLabel}
        style={{
          zIndex,
          transform: isDragging ? `translateY(${offset}px)` : undefined,
          transition: isDragging ? 'none' : undefined
        }}
      >
        {hideClose ? null : (
          <IconButton
            aria-label={closeAriaLabel}
            icon={IconClose}
            color='subdued'
            size='s'
            onClick={onClose}
            className={styles.closeButton}
            data-no-drag
          />
        )}

        <div ref={dragRegionRef} className={styles.dragRegion}>
          <div className={styles.dragHandleArea}>
            <div className={styles.dragHandle} aria-hidden />
          </div>
          {header}
        </div>
        <div
          ref={scrollRef}
          className={
            scrollAreaClassName
              ? `${styles.scrollArea} ${scrollAreaClassName}`
              : styles.scrollArea
          }
        >
          {children}
        </div>
      </div>
    </>
  )

  return createPortal(sheet, document.body)
}

// Re-export hooks so consumers building variant sheets (e.g. one without
// the standard close button) can compose with the same gesture/a11y
// behavior without rebuilding it.
export { useBottomSheetDismiss, useSheetA11y } from './useBottomSheetDismiss'

// Default z-indices exposed so callers stacking sheets can offset relative
// to them.
export const BOTTOM_SHEET_Z_INDEX = {
  BACKDROP: DEFAULT_BACKDROP_Z_INDEX,
  SHEET: DEFAULT_SHEET_Z_INDEX
}
