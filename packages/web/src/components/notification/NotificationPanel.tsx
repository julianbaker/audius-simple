import { RefObject, useCallback, useEffect, useRef } from 'react'

import {
  useMarkNotificationsAsViewed,
  useNotifications
} from '@audius/common/api'
import { Nullable } from '@audius/common/utils'
import {
  BottomSheet,
  Flex,
  IconNotificationOn as IconNotification,
  LoadingSpinner,
  Paper,
  Popup,
  Scrollbar,
  Text,
  useMedia,
  useTheme
} from '@audius/harmony'
import InfiniteScroll from 'react-infinite-scroller'
import { useSelector } from 'react-redux'

import { getIsOpen as getIsUserListOpen } from 'store/application/ui/userListModal/selectors'
import zIndex from 'utils/zIndex'

import { EmptyNotifications } from './EmptyNotifications'
import { Notification } from './Notification'

const messages = {
  title: 'Notifications',
  closeLabel: 'Close notifications'
}

const DESKTOP_PANEL_WIDTH_PX = 428
const DESKTOP_SCROLL_ID = 'notificationsPanelScroll'
// react-infinite-scroller uses an element ID to find the scroll parent on
// desktop; the mobile sheet passes a ref-based getScrollParent instead.
const getDesktopScrollParent = () =>
  window.document.getElementById(DESKTOP_SCROLL_ID)

// Distance from the bottom of the scroll container at which we request the
// next page of notifications.
const SCROLL_THRESHOLD = 1000

type NotificationPanelProps = {
  /**
   * Anchor for the desktop popup. Optional because the panel can be opened
   * from the mobile bottom-bar (no anchor needed — the mobile branch
   * renders a full-width sheet).
   */
  anchorRef?: RefObject<HTMLButtonElement | null>
  isOpen: boolean
  onClose: () => void
}

/**
 * Notifications panel. Adapts to viewport: an anchored popup on desktop, a
 * portaled bottom-sheet drawer on mobile. Both surfaces share the same
 * header + scrollable list body (`NotificationsBody`) so styling and
 * loading behavior never diverge.
 */
export const NotificationPanel = ({
  anchorRef,
  isOpen,
  onClose
}: NotificationPanelProps) => {
  const { isMobile } = useMedia()
  const isUserListOpen = useSelector(getIsUserListOpen)
  const { mutate: markAsViewed } = useMarkNotificationsAsViewed()
  const panelRef = useRef<Nullable<HTMLDivElement>>(null)

  useEffect(() => {
    if (isOpen) markAsViewed()
  }, [isOpen, markAsViewed])

  const handleCheckClickInside = useCallback(
    (target: EventTarget) => {
      if (isUserListOpen) return true
      if (!(target instanceof Element)) return false
      return !!(
        panelRef.current?.contains(target) ||
        anchorRef?.current?.contains(target)
      )
    },
    [anchorRef, isUserListOpen]
  )

  if (isMobile) {
    return <MobileNotificationSheet isOpen={isOpen} onClose={onClose} />
  }

  return (
    <Popup
      anchorRef={anchorRef as RefObject<HTMLElement>}
      isVisible={isOpen}
      checkIfClickInside={handleCheckClickInside}
      onClose={onClose}
      transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      shadow='far'
      zIndex={zIndex.NAVIGATOR_POPUP}
    >
      <Paper
        ref={panelRef}
        column
        backgroundColor='surface1'
        borderRadius='m'
        shadow='mid'
        css={{ width: DESKTOP_PANEL_WIDTH_PX, overflow: 'hidden' }}
      >
        <PanelHeader bare={false} />
        <Scrollbar
          css={{ maxHeight: 'calc(100vh - 200px)' }}
          id={DESKTOP_SCROLL_ID}
        >
          <NotificationsList getScrollParent={getDesktopScrollParent} />
        </Scrollbar>
      </Paper>
    </Popup>
  )
}

/**
 * Standard, restrained header — single bar with the bell icon and a
 * heading-style title. Replaces the loud accent-purple bar that didn't
 * match the rest of the app.
 *
 * `bare` skips the background/border (used inside the mobile dragRegion,
 * which paints those itself so the drag handle and header read as a
 * single surface). On mobile the close button is rendered separately
 * (absolute top-right of the sheet) so it doesn't get pushed off-center
 * by the drag handle's whitespace.
 */
const PanelHeader = ({ bare = false }: { bare?: boolean }) => (
  <Flex
    alignItems='center'
    ph='m'
    pv={bare ? 's' : 'm'}
    borderBottom={bare ? undefined : 'default'}
    backgroundColor={bare ? undefined : 'surface1'}
    gap='s'
    css={{ flexShrink: 0 }}
  >
    <IconNotification size='l' color='default' />
    <Text variant='heading' size='s' color='default'>
      {messages.title}
    </Text>
  </Flex>
)

/**
 * Shared scrollable notifications list. Both the desktop popup and the
 * mobile sheet wrap this in their own scroll container.
 *
 * - Desktop passes an explicit `getScrollParent` (the Scrollbar element
 *   has a stable id, easier to look up than walking the DOM).
 * - Mobile omits it; InfiniteScroll auto-detects the nearest scrollable
 *   ancestor when `useWindow={false}` and no override is provided.
 */
const NotificationsList = ({
  getScrollParent
}: {
  getScrollParent?: () => HTMLElement | null
}) => {
  const { spacing } = useTheme()
  const {
    notifications,
    fetchNextPage,
    hasNextPage,
    isAllPending: isPending,
    isError,
    isFetchingNextPage
  } = useNotifications()

  const handleLoadMore = useCallback(() => {
    if (!isFetchingNextPage) fetchNextPage()
  }, [fetchNextPage, isFetchingNextPage])

  const isEmpty = (!isPending || isError) && notifications.length === 0

  return (
    <InfiniteScroll
      loadMore={handleLoadMore}
      hasMore={hasNextPage}
      initialLoad={isPending}
      useWindow={false}
      threshold={SCROLL_THRESHOLD}
      getScrollParent={getScrollParent}
      loader={
        <LoadingSpinner
          key='loading-spinner'
          size='xl'
          alignSelf='center'
          mv='xl'
        />
      }
      css={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.s,
        padding: spacing.l,
        listStyleType: 'none',
        margin: 0
      }}
      element='ul'
    >
      {isEmpty ? (
        <EmptyNotifications />
      ) : (
        notifications.map((notification) => (
          <Notification key={notification.id} notification={notification} />
        ))
      )}
    </InfiniteScroll>
  )
}

/**
 * Mobile bottom-sheet rendering of the notifications panel. Hands the
 * gesture / portal / scroll-area / close-button mechanics to Harmony's
 * `<BottomSheet>` and just provides the header + list content.
 *
 * No explicit getScrollParent — when InfiniteScroll runs with
 * `useWindow={false}` and no scroll parent override, it walks up from
 * the <ul> to find the nearest scrollable ancestor. That's the sheet's
 * internal scroll area.
 */
const MobileNotificationSheet = ({
  isOpen,
  onClose
}: {
  isOpen: boolean
  onClose: () => void
}) => (
  <BottomSheet
    isOpen={isOpen}
    onClose={onClose}
    ariaLabel={messages.title}
    closeAriaLabel={messages.closeLabel}
    header={<PanelHeader bare />}
  >
    <NotificationsList />
  </BottomSheet>
)
