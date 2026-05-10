import {
  useRef,
  useCallback,
  useEffect,
  useState,
  RefObject,
  TouchEvent
} from 'react'
import { createPortal } from 'react-dom'

import {
  useMarkNotificationsAsViewed,
  useNotifications
} from '@audius/common/api'
import { Nullable } from '@audius/common/utils'
import {
  Scrollbar,
  IconNotificationOn as IconNotification,
  IconClose,
  IconButton,
  Popup,
  Flex,
  Text,
  LoadingSpinner,
  useMedia,
  useTheme
} from '@audius/harmony'
import InfiniteScroll from 'react-infinite-scroller'
import { useSelector } from 'react-redux'

import { getIsOpen as getIsUserListOpen } from 'store/application/ui/userListModal/selectors'
import zIndex from 'utils/zIndex'

import { EmptyNotifications } from './EmptyNotifications'
import { Notification } from './Notification'
import sheetStyles from './NotificationSheet.module.css'

const messages = {
  title: 'Notifications',
  closeLabel: 'Close notifications'
}

type NotificationPanelProps = {
  /**
   * Optional anchor for the desktop popup. When omitted (e.g. opened from a
   * bottom-bar button), the panel falls back to a non-anchored bottom sheet
   * on mobile.
   */
  anchorRef?: RefObject<HTMLButtonElement | null>
  isOpen: boolean
  onClose: () => void
}

const desktopScrollbarId = 'notificationsPanelScroll'

const getDesktopScrollParent = () => {
  const scrollbarElement = window.document.getElementById(desktopScrollbarId)
  return scrollbarElement || null
}

// The threshold of distance from the bottom of the scroll container in the
// notification panel before requesting `loadMore` for more notifications
const SCROLL_THRESHOLD = 1000

/**
 * The notification panel displays the list of notifications. Adapts to
 * viewport: a popup anchored to the bell on desktop, a bottom-sheet drawer
 * on mobile.
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

  const handleCheckClickInside = useCallback(
    (target: EventTarget) => {
      if (isUserListOpen) return true
      if (target instanceof Element) {
        return !!(
          panelRef.current?.contains(target) ||
          anchorRef?.current?.contains(target)
        )
      }
      return false
    },
    [anchorRef, isUserListOpen]
  )

  useEffect(() => {
    if (isOpen) {
      markAsViewed()
    }
  }, [isOpen, markAsViewed])

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
      <DesktopNotificationsContent panelRef={panelRef} />
    </Popup>
  )
}

/**
 * Desktop: panel anchored to the bell. Uses Harmony's Scrollbar for the
 * styled scroll affordance, with a fixed maxHeight so the popup doesn't grow
 * past the viewport.
 */
const DesktopNotificationsContent = ({
  panelRef
}: {
  panelRef: RefObject<HTMLDivElement | null>
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
    if (!isFetchingNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, isFetchingNextPage])

  const userHasNoNotifications =
    (!isPending || isError) && notifications.length === 0

  return (
    <Flex backgroundColor='default' column borderRadius='m' w={428} ref={panelRef}>
      <Flex
        inline
        justifyContent='center'
        alignItems='center'
        backgroundColor='accent'
        borderBottom='default'
        borderTopLeftRadius='m'
        borderTopRightRadius='m'
        p='s'
        gap='s'
      >
        <IconNotification color='white' size='xl' />
        <Text
          variant='label'
          size='xl'
          strength='strong'
          color='white'
          lineHeight='single'
        >
          {messages.title}
        </Text>
      </Flex>

      <Scrollbar
        css={{ maxHeight: 'calc(100vh - 333px)' }}
        id={desktopScrollbarId}
      >
        <InfiniteScroll
          loadMore={handleLoadMore}
          hasMore={hasNextPage}
          initialLoad={isPending}
          useWindow={false}
          threshold={SCROLL_THRESHOLD}
          loader={
            <LoadingSpinner
              key='loading-spinner'
              size='xl'
              alignSelf='center'
              mv='xl'
            />
          }
          getScrollParent={getDesktopScrollParent}
          css={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.s,
            padding: spacing.l,
            paddingTop: spacing.xl,
            listStyleType: 'none'
          }}
          element='ul'
        >
          {userHasNoNotifications ? (
            <EmptyNotifications />
          ) : (
            notifications.map((notification) => (
              <Notification
                key={notification.id}
                notification={notification}
              />
            ))
          )}
        </InfiniteScroll>
      </Scrollbar>
    </Flex>
  )
}

/**
 * Mobile: bottom-sheet drawer. Slides up from the bottom of the viewport
 * with a drag handle, rounded top corners, and drag-down-to-dismiss. Uses
 * native scrolling on a plain div so InfiniteScroll's `useWindow={false}` /
 * `getScrollParent` machinery works reliably without a custom scrollbar
 * wrapper getting in the way.
 */
const MobileNotificationSheet = ({
  isOpen,
  onClose
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  const { spacing } = useTheme()
  const sheetRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const {
    notifications,
    fetchNextPage,
    hasNextPage,
    isAllPending: isPending,
    isError,
    isFetchingNextPage
  } = useNotifications()

  const handleLoadMore = useCallback(() => {
    if (!isFetchingNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, isFetchingNextPage])

  const userHasNoNotifications =
    (!isPending || isError) && notifications.length === 0

  const getScrollParent = useCallback(() => scrollContainerRef.current, [])

  // Drag-to-dismiss state. Tracks the vertical offset from the rest position
  // while a finger is held; on release, snaps closed if the swipe exceeded
  // the threshold or the velocity is high enough.
  const dragStartY = useRef<number | null>(null)
  const dragStartScrollTop = useRef(0)
  const lastDragY = useRef(0)
  const lastDragTs = useRef(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  // Lock body scroll while open so background pages don't scroll under the
  // sheet on iOS.
  useEffect(() => {
    if (!isOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [isOpen])

  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    dragStartY.current = e.touches[0].clientY
    dragStartScrollTop.current = scrollContainerRef.current?.scrollTop ?? 0
    lastDragY.current = e.touches[0].clientY
    lastDragTs.current = Date.now()
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (dragStartY.current === null) return
    const currentY = e.touches[0].clientY
    const delta = currentY - dragStartY.current
    // Only track downward drags, and only when the inner list is at the top
    // (otherwise the user is intending to scroll the list, not dismiss).
    if (delta > 0 && dragStartScrollTop.current === 0) {
      setDragOffset(delta)
      setIsDragging(true)
    }
    lastDragY.current = currentY
    lastDragTs.current = Date.now()
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (dragStartY.current === null) return
    const totalDelta = lastDragY.current - dragStartY.current
    // Snap closed if dragged more than a third of the sheet height, or with
    // a clearly downward gesture.
    const sheetHeight = sheetRef.current?.offsetHeight ?? 600
    const shouldClose = totalDelta > sheetHeight / 3 || totalDelta > 120
    setIsDragging(false)
    setDragOffset(0)
    dragStartY.current = null
    if (shouldClose) onClose()
  }, [onClose])

  if (!isOpen) return null

  // Portal to document.body so the sheet escapes the nav drawer's
  // stacking context (Navigator wrapper has z-index: 14, which would
  // contain the sheet despite its higher z-index value).
  const sheet = (
    <>
      <div
        className={sheetStyles.backdrop}
        onClick={onClose}
        aria-hidden
        style={{ zIndex: 99998 }}
      />
      <div
        ref={sheetRef}
        className={sheetStyles.sheet}
        role='dialog'
        aria-label={messages.title}
        style={{
          zIndex: 99999,
          transform: isDragging
            ? `translateY(${dragOffset}px)`
            : undefined,
          transition: isDragging ? 'none' : undefined
        }}
      >
        {/* Drag handle — visual affordance + the swipe-to-dismiss target.
            Listening on the handle (rather than the whole sheet) keeps the
            inner list scroll-gestures uncontested. */}
        <div
          className={sheetStyles.dragHandleArea}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          <div className={sheetStyles.dragHandle} aria-hidden />
        </div>

        <Flex
          inline
          justifyContent='space-between'
          alignItems='center'
          backgroundColor='accent'
          borderBottom='default'
          p='s'
          ph='m'
          gap='s'
          css={{ flexShrink: 0 }}
        >
          <Flex inline alignItems='center' gap='s'>
            <IconNotification color='white' size='l' />
            <Text
              variant='label'
              size='l'
              strength='strong'
              color='white'
              lineHeight='single'
            >
              {messages.title}
            </Text>
          </Flex>
          <IconButton
            icon={IconClose}
            color='white'
            aria-label={messages.closeLabel}
            onClick={onClose}
          />
        </Flex>

        <div ref={scrollContainerRef} className={sheetStyles.scrollArea}>
          <InfiniteScroll
            loadMore={handleLoadMore}
            hasMore={hasNextPage}
            initialLoad={isPending}
            useWindow={false}
            threshold={SCROLL_THRESHOLD}
            loader={
              <LoadingSpinner
                key='loading-spinner'
                size='xl'
                alignSelf='center'
                style={{ margin: '24px auto' }}
              />
            }
            getScrollParent={getScrollParent}
            css={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing.s,
              padding: spacing.l,
              paddingTop: spacing.xl,
              listStyleType: 'none',
              margin: 0
            }}
            element='ul'
          >
            {userHasNoNotifications ? (
              <EmptyNotifications />
            ) : (
              notifications.map((notification) => (
                <Notification
                  key={notification.id}
                  notification={notification}
                />
              ))
            )}
          </InfiniteScroll>
        </div>
      </div>
    </>
  )

  return createPortal(sheet, document.body)
}
