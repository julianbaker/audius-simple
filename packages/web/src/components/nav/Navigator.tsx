import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react'

import { Client } from '@audius/common/models'
import { createKeyboardActivationHandler, useMedia } from '@audius/harmony'
import cn from 'classnames'
import { useLocation } from 'react-router'

import { getClient } from 'utils/clientUtil'

import styles from './Navigator.module.css'
import { LeftNav } from './desktop/LeftNav'
import { NavHeader } from './desktop/NavHeader'
import { NavSidebarContext } from './desktop/NavSidebarContext'

interface OwnProps {
  className?: string
}

const EXPANDED_WIDTH = 240
const COLLAPSED_WIDTH = 64
// px of drag needed to commit to the other state on release
const SNAP_DELTA = 15
const STORAGE_KEY = 'nav-sidebar-collapsed'

const Navigator = ({ className }: OwnProps) => {
  const client = getClient()
  const { isMobile } = useMedia()
  const isElectron = client === Client.ELECTRON
  const location = useLocation()
  // Mobile-web pages that render their own full-bleed hero + back
  // control (contest page) opt out of the global top nav so the hero
  // can own the top of the viewport. Desktop is unaffected.
  const hideMobileNav = isMobile && /\/contest(\/|$)/.test(location.pathname)

  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Swipe-to-close gesture state for the mobile drawer
  const swipeStartX = useRef<number | null>(null)
  const swipeDelta = useRef(0)
  const [swipeOffsetPx, setSwipeOffsetPx] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)

  const handlePanelTouchStart = useCallback((e: React.TouchEvent) => {
    swipeStartX.current = e.touches[0].clientX
    swipeDelta.current = 0
  }, [])

  const handlePanelTouchMove = useCallback((e: React.TouchEvent) => {
    if (swipeStartX.current === null) return
    const delta = e.touches[0].clientX - swipeStartX.current
    // Only react to leftward drags (closing direction)
    if (delta < 0) {
      swipeDelta.current = delta
      setSwipeOffsetPx(delta)
      setIsSwiping(true)
    }
  }, [])

  const handlePanelTouchEnd = useCallback(() => {
    const closed = swipeDelta.current < -60
    swipeStartX.current = null
    swipeDelta.current = 0
    setIsSwiping(false)
    setSwipeOffsetPx(0)
    if (closed) setIsMobileOpen(false)
  }, [])

  const [isCollapsed, setIsCollapsedState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })
  const [isDragging, setIsDragging] = useState(false)

  // Width is always the committed state — no intermediate values during drag.
  // The sidebar stays put while dragging; on release it animates to the new state.
  const navWidth = isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH

  const dragStartX = useRef(0)
  const dragStartCollapsed = useRef(false)
  const previousNavWidth = useRef(navWidth)

  const setIsCollapsed = useCallback((collapsed: boolean) => {
    setIsCollapsedState(collapsed)
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed))
    } catch {}
  }, [])

  // Update app-level nav vars before paint. When nav width changes, use FLIP:
  // commit the new layout width once, then animate a transform back to zero.
  useLayoutEffect(() => {
    const appEl = document.getElementById('webPlayer')
    if (!appEl) return

    if (isMobile) {
      appEl.style.setProperty('--nav-width', '0px')
      appEl.style.setProperty('--nav-width-minus-border', '0px')
      appEl.style.setProperty('--nav-shift', '0px')
      appEl.style.setProperty('--mobile-nav-height', '44px')
      previousNavWidth.current = 0
      return
    }
    appEl.style.setProperty('--mobile-nav-height', '0px')

    const previousWidth = previousNavWidth.current
    const didWidthChange = previousWidth !== navWidth
    const shiftDelta = previousWidth - navWidth

    appEl.style.setProperty('--nav-width', `${navWidth}px`)
    appEl.style.setProperty('--nav-width-minus-border', `${navWidth - 1}px`)

    if (!isMobile && didWidthChange) {
      appEl.style.setProperty('--nav-shift', `${shiftDelta}px`)
      // Flush the starting transform before animating back to zero.
      appEl.getBoundingClientRect()
      appEl.style.setProperty('--nav-shift', '0px')
    } else {
      appEl.style.setProperty('--nav-shift', '0px')
    }

    previousNavWidth.current = navWidth
  }, [isMobile, navWidth])

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      dragStartX.current = e.clientX
      dragStartCollapsed.current = isCollapsed
      setIsDragging(true)
    },
    [isCollapsed]
  )

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed(!isCollapsed)
  }, [isCollapsed, setIsCollapsed])

  const handleResizeHandleKeyDown =
    createKeyboardActivationHandler<HTMLDivElement>({
      onActivate: toggleCollapsed
    })

  useEffect(() => {
    if (!isDragging) return

    const handleMouseUp = (e: MouseEvent) => {
      const delta = e.clientX - dragStartX.current
      const absDelta = Math.abs(delta)
      let commit: boolean
      if (absDelta < SNAP_DELTA) {
        // Treat as a click — toggle the sidebar
        commit = !dragStartCollapsed.current
      } else {
        // was collapsed: stay unless dragged right past threshold
        // was expanded: collapse only if dragged left past threshold
        commit = dragStartCollapsed.current
          ? delta <= SNAP_DELTA
          : delta < -SNAP_DELTA
      }
      setIsCollapsed(commit)
      setIsDragging(false)
    }

    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, setIsCollapsed])

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false)
  }, [location.pathname])

  // Target collapse follows scroll *direction* (down hides, up reveals anywhere).
  // Absolute scrollY only seeds hydration / route entry and clamps full chrome at top.
  useEffect(() => {
    if (!isMobile || hideMobileNav) {
      document.documentElement.style.removeProperty('--mobile-chrome-collapse')
      document.documentElement.style.removeProperty(
        '--mobile-chrome-page-subheader-px'
      )
      document.documentElement.style.removeProperty(
        '--mobile-chrome-header-bottom-bar-px'
      )
      return
    }

    const TOP_THRESHOLD_PX = 8
    const COLLAPSE_SCROLL_RANGE_PX = 172
    const COLLAPSE_PER_PX_DOWN = 0.01
    const REVEAL_PER_PX_UP = 0.01
    const LERP_COLLAPSE_DOWN = 0.55
    const LERP_EXPAND_UP = 0.42
    const SNAP_EPSILON = 0.004

    const smoothstep01 = (x: number) => {
      const s = Math.min(1, Math.max(0, x))
      return s * s * (3 - 2 * s)
    }

    const initialCollapseHint = (y: number) => {
      if (y <= TOP_THRESHOLD_PX) return 0
      const linearT = Math.min(
        1,
        (y - TOP_THRESHOLD_PX) / COLLAPSE_SCROLL_RANGE_PX
      )
      return smoothstep01(linearT)
    }

    type ChromeMeasurements = {
      subHeight: number | null
      barHeight: number | null
    }

    const readMeasurements = (): ChromeMeasurements => {
      const sub = document.querySelector(
        '[data-mobile-chrome-expanded="page-subheader"]'
      )
      const bar = document.querySelector(
        '[data-mobile-chrome-expanded="header-bottom-bar"]'
      )

      return {
        subHeight:
          sub instanceof HTMLElement
            ? Math.max(1, Math.ceil(sub.scrollHeight))
            : null,
        barHeight:
          bar instanceof HTMLElement
            ? Math.max(1, Math.ceil(bar.scrollHeight))
            : null
      }
    }

    const writeMeasurements = ({
      subHeight,
      barHeight
    }: ChromeMeasurements) => {
      if (subHeight !== null) {
        document.documentElement.style.setProperty(
          '--mobile-chrome-page-subheader-px',
          `${subHeight}px`
        )
      } else {
        document.documentElement.style.removeProperty(
          '--mobile-chrome-page-subheader-px'
        )
      }

      if (barHeight !== null) {
        document.documentElement.style.setProperty(
          '--mobile-chrome-header-bottom-bar-px',
          `${barHeight}px`
        )
      } else {
        document.documentElement.style.removeProperty(
          '--mobile-chrome-header-bottom-bar-px'
        )
      }
    }

    let measureReadRaf: number | null = null
    let measureWriteRaf: number | null = null
    let attachRaf: number | null = null

    const scheduleMeasurements = () => {
      if (measureReadRaf !== null) return
      measureReadRaf = requestAnimationFrame(() => {
        measureReadRaf = null
        const measurements = readMeasurements()
        if (measureWriteRaf !== null) {
          cancelAnimationFrame(measureWriteRaf)
        }
        measureWriteRaf = requestAnimationFrame(() => {
          measureWriteRaf = null
          writeMeasurements(measurements)
        })
      })
    }

    const resizeObserver = new ResizeObserver(scheduleMeasurements)

    const attachObservers = () => {
      resizeObserver.disconnect()
      document
        .querySelectorAll('[data-mobile-chrome-expanded]')
        .forEach((el) => {
          resizeObserver.observe(el)
        })
      scheduleMeasurements()
    }

    const scheduleAttachObservers = () => {
      if (attachRaf !== null) return
      attachRaf = requestAnimationFrame(() => {
        attachRaf = null
        attachObservers()
      })
    }

    const mutationObserver = new MutationObserver(scheduleAttachObservers)

    let lastScrollY = window.scrollY
    let targetCollapse = initialCollapseHint(lastScrollY)
    let shownCollapse = targetCollapse
    let pumpRaf: number | null = null
    let lastCollapseSerialized = ''

    const applyCollapseCss = (t: number) => {
      const serialized = t.toFixed(3)
      if (serialized === lastCollapseSerialized) return
      lastCollapseSerialized = serialized
      document.documentElement.style.setProperty(
        '--mobile-chrome-collapse',
        serialized
      )
    }

    applyCollapseCss(shownCollapse)

    const pump = () => {
      const diff = targetCollapse - shownCollapse
      if (Math.abs(diff) <= SNAP_EPSILON) {
        shownCollapse = targetCollapse
        applyCollapseCss(shownCollapse)
        pumpRaf = null
        return
      }
      const k = diff > 0 ? LERP_COLLAPSE_DOWN : LERP_EXPAND_UP
      shownCollapse += diff * k
      applyCollapseCss(shownCollapse)
      pumpRaf = requestAnimationFrame(pump)
    }

    const kickPump = () => {
      if (pumpRaf === null) {
        pumpRaf = requestAnimationFrame(pump)
      }
    }

    const handleScroll = () => {
      const y = window.scrollY
      const delta = y - lastScrollY
      lastScrollY = y

      if (y <= TOP_THRESHOLD_PX) {
        targetCollapse = 0
      } else if (delta > 0) {
        targetCollapse = Math.min(
          1,
          targetCollapse + delta * COLLAPSE_PER_PX_DOWN
        )
      } else if (delta < 0) {
        targetCollapse = Math.max(0, targetCollapse + delta * REVEAL_PER_PX_UP)
      }

      kickPump()
    }

    scheduleAttachObservers()
    requestAnimationFrame(() => {
      scheduleAttachObservers()
      lastScrollY = window.scrollY
      targetCollapse = initialCollapseHint(lastScrollY)
      kickPump()
    })

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-mobile-chrome-expanded']
    })
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', scheduleAttachObservers, {
      passive: true
    })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', scheduleAttachObservers)
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      if (pumpRaf !== null) {
        cancelAnimationFrame(pumpRaf)
      }
      if (measureReadRaf !== null) {
        cancelAnimationFrame(measureReadRaf)
      }
      if (measureWriteRaf !== null) {
        cancelAnimationFrame(measureWriteRaf)
      }
      if (attachRaf !== null) {
        cancelAnimationFrame(attachRaf)
      }
      document.documentElement.style.removeProperty('--mobile-chrome-collapse')
      document.documentElement.style.removeProperty(
        '--mobile-chrome-page-subheader-px'
      )
      document.documentElement.style.removeProperty(
        '--mobile-chrome-header-bottom-bar-px'
      )
    }
  }, [isMobile, hideMobileNav])

  // Lock body scroll and mark nav open when mobile drawer is open
  useEffect(() => {
    if (!isMobile) return
    document.body.classList.toggle('mobile-nav-open', isMobileOpen)
    document.body.style.overflow = isMobileOpen ? 'hidden' : ''
    return () => {
      document.body.classList.remove('mobile-nav-open')
      document.body.style.overflow = ''
    }
  }, [isMobile, isMobileOpen])

  if (hideMobileNav) return null

  return (
    <NavSidebarContext.Provider
      value={{
        isCollapsed: isMobile ? false : isCollapsed,
        setIsCollapsed,
        isMobileOpen,
        setIsMobileOpen
      }}
    >
      <div
        className={cn(styles.navWrapper, className, {
          [styles.leftNavWrapper]: !isMobile,
          [styles.mobileNavWrapper]: isMobile,
          [styles.isElectron]: isElectron,
          [styles.isDragging]: isDragging
        })}
        style={!isMobile ? { width: navWidth } : undefined}
      >
        {isMobile ? (
          <>
            <div className={styles.mobileAppBar}>
              <NavHeader />
            </div>
            {isMobileOpen ? (
              <div
                className={styles.mobileBackdrop}
                onClick={() => setIsMobileOpen(false)}
                aria-hidden
              />
            ) : null}
            <div
              className={cn(styles.mobilePanel, {
                [styles.mobilePanelOpen]: isMobileOpen,
                [styles.mobilePanelDragging]: isSwiping
              })}
              style={
                isSwiping
                  ? { transform: `translateX(${swipeOffsetPx}px)` }
                  : undefined
              }
              onTouchStart={handlePanelTouchStart}
              onTouchMove={handlePanelTouchMove}
              onTouchEnd={handlePanelTouchEnd}
              onTouchCancel={handlePanelTouchEnd}
            >
              <LeftNav showNavHeader={false} />
            </div>
          </>
        ) : (
          <>
            <LeftNav />
            <div
              className={styles.resizeHandle}
              style={{ cursor: isCollapsed ? 'e-resize' : 'w-resize' }}
              onMouseDown={handleDragStart}
              onKeyDown={handleResizeHandleKeyDown}
              role='button'
              tabIndex={0}
              aria-label={
                isCollapsed
                  ? 'Expand navigation sidebar'
                  : 'Collapse navigation sidebar'
              }
              aria-controls='leftNav'
              aria-expanded={!isCollapsed}
            />
          </>
        )}
      </div>
    </NavSidebarContext.Provider>
  )
}

export default Navigator
