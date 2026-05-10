import { useCallback, useRef, useState } from 'react'

import { useAccountStatus } from '@audius/common/api'
import { Status } from '@audius/common/models'
import { Box, Divider, Flex, Scrollbar, useMedia } from '@audius/harmony'
import { ResizeObserver } from '@juggle/resize-observer'
import cn from 'classnames'
import useMeasure from 'react-use-measure'

import { DragAutoscroller } from 'components/drag-autoscroller/DragAutoscroller'

import { AccountDetails } from './AccountDetails'
import styles from './LeftNav.module.css'
import { LeftNavCTA } from './LeftNavCTA'
import { NavHeader } from './NavHeader'
import { useNavSidebar } from './NavSidebarContext'
import { NowPlayingArtworkTile } from './NowPlayingArtworkTile'
import { RouteNav } from './RouteNav'
import {
  HomeNavItem,
  FeedNavItem,
  TrendingNavItem,
  ExploreNavItem,
  ContestsNavItem,
  LibraryNavItem,
  MessagesNavItem,
  DashboardNavItem,
  UploadNavItem,
  DevToolsNavItem,
  PlaylistsNavItem
} from './nav-items'

export const LEFT_NAV_WIDTH = 240
export const LEFT_NAV_COLLAPSED_WIDTH = 64

type OwnProps = {
  isElectron: boolean
  showNavHeader?: boolean
}

export const LeftNav = (props: OwnProps) => {
  const { isElectron, showNavHeader = true } = props
  const { isCollapsed } = useNavSidebar()
  const { isMobile } = useMedia()
  const { data: accountStatus } = useAccountStatus()
  const [navBodyContainerMeasureRef, navBodyContainerBoundaries] = useMeasure({
    polyfill: ResizeObserver,
    debounce: { scroll: 0, resize: 80 }
  })
  const scrollbarRef = useRef<HTMLElement | null>(null)
  const [dragScrollingDirection, setDragScrollingDirection] = useState<
    'up' | 'down' | undefined
  >(undefined)

  const handleChangeDragScrollingDirection = useCallback(
    (newDirection: 'up' | 'down' | undefined) => {
      setDragScrollingDirection(newDirection)
    },
    []
  )

  const updateScrollTopPosition = useCallback((difference: number) => {
    if (scrollbarRef != null && scrollbarRef.current !== null) {
      scrollbarRef.current.scrollTop =
        scrollbarRef.current.scrollTop + difference
    }
  }, [])

  const navLoaded =
    accountStatus === Status.SUCCESS || accountStatus === Status.ERROR

  // On mobile, fill the drawer (parent panel sets the takeover width).
  // On desktop, snap to expanded/collapsed widths.
  const navWidth = isMobile
    ? '100%'
    : isCollapsed
      ? LEFT_NAV_COLLAPSED_WIDTH
      : LEFT_NAV_WIDTH

  return (
    <Flex
      borderRight={isMobile ? undefined : 'default'}
      as='nav'
      aria-label='Primary navigation'
      id='leftNav'
      direction='column'
      h='100%'
      className={cn({ [styles.mobileScale]: isMobile })}
      css={{
        width: navWidth,
        transition: isMobile ? undefined : 'width 0.2s ease',
        userSelect: 'none',
        overflowX: 'clip',
        overflowY: 'visible',
        flexShrink: 0,
        backdropFilter: 'var(--frosted-surface-backdrop-filter, blur(10px))',
        WebkitBackdropFilter:
          'var(--frosted-surface-backdrop-filter, blur(10px))',
        background:
          'var(--frosted-surface-background, color-mix(in srgb, var(--frosted-surface-background-color, var(--harmony-n-25)) var(--frosted-surface-opacity, 65%), transparent))'
      }}
    >
      {isElectron ? <RouteNav /> : null}
      {showNavHeader ? <NavHeader /> : null}

      <Flex
        direction='column'
        w='100%'
        flex={1}
        ref={navBodyContainerMeasureRef}
        css={{
          boxShadow:
            dragScrollingDirection === 'up'
              ? 'inset 0px 8px 5px -5px var(--tile-shadow-3)'
              : dragScrollingDirection === 'down'
                ? 'inset 0px -8px 5px -5px var(--tile-shadow-3)'
                : undefined,
          overflow: 'hidden',
          opacity: navLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out, box-shadow 0.2s ease'
        }}
      >
        <Scrollbar
          containerRef={(el: HTMLElement) => {
            scrollbarRef.current = el
          }}
          isHidden
          options={{ suppressScrollX: true }}
        >
          <DragAutoscroller
            containerBoundaries={navBodyContainerBoundaries}
            updateScrollTopPosition={updateScrollTopPosition}
            onChangeDragScrollingDirection={handleChangeDragScrollingDirection}
          >
            <AccountDetails />
            <Flex
              direction='column'
              flex='1 1 auto'
              css={{ overflow: 'hidden' }}
            >
              <HomeNavItem />
              <TrendingNavItem />
              <FeedNavItem />
              <ExploreNavItem />
              <ContestsNavItem />
              <LibraryNavItem />
              <MessagesNavItem />
              <DashboardNavItem />
              <UploadNavItem />
              <DevToolsNavItem />
              {!isCollapsed && !isMobile ? (
                <>
                  <Box mv='s'>
                    <Divider />
                  </Box>
                  <PlaylistsNavItem />
                </>
              ) : null}
            </Flex>
          </DragAutoscroller>
        </Scrollbar>
      </Flex>
      {navLoaded && !isMobile ? (
        <Flex
          direction='column'
          alignItems='center'
          gap='s'
          pb={isCollapsed ? 's' : undefined}
        >
          {!isCollapsed ? <LeftNavCTA /> : null}
          <NowPlayingArtworkTile size={isCollapsed ? 56 : undefined} />
          {isCollapsed ? <LeftNavCTA /> : null}
        </Flex>
      ) : null}
    </Flex>
  )
}
