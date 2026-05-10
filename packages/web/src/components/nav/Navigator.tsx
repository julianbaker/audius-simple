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

  // Track scroll direction to hide on scroll-down, reveal on scroll-up
  useEffect(() => {
    if (!isMobile) return
    let lastY = window.scrollY
    const THRESHOLD = 6
    const handleScroll = () => {
      const currentY = window.scrollY
      const delta = currentY - lastY
      lastY = currentY
      if (currentY <= 10 || delta < -THRESHOLD) {
        document.body.classList.remove('mobile-nav-scrolled')
      } else if (delta > THRESHOLD) {
        document.body.classList.add('mobile-nav-scrolled')
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.body.classList.remove('mobile-nav-scrolled')
    }
  }, [isMobile])

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
                [styles.mobilePanelOpen]: isMobileOpen
              })}
            >
              <LeftNav isElectron={isElectron} showNavHeader={false} />
            </div>
          </>
        ) : (
          <>
            <LeftNav isElectron={isElectron} />
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
