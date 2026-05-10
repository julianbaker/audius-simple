import { useCallback, useEffect, useRef } from 'react'

import { useCanSendMessage } from '@audius/common/hooks'
import { Status } from '@audius/common/models'
import { chatActions, chatSelectors } from '@audius/common/store'
import { useMedia } from '@audius/harmony'
import cn from 'classnames'
import { useDispatch } from 'react-redux'
import { useParams, useLocation, useNavigate } from 'react-router'

import Page from 'components/page/Page'
import { useIsContainerNarrow } from 'hooks/useIsContainerNarrow'
import { useManagedAccountNotAllowedRedirect } from 'hooks/useManagedAccountNotAllowedRedirect'
import { push } from 'utils/navigation'
import { useSelector } from 'utils/reducer'
import { chatPage } from 'utils/route'

import styles from './ChatPage.module.css'
import { ChatComposer } from './components/ChatComposer'
import { ChatHeader } from './components/ChatHeader'
import { ChatList } from './components/ChatList'
import { ChatMessageList } from './components/ChatMessageList'
import { ChatPaneHeader } from './components/ChatPaneHeader'
import { CreateChatPrompt } from './components/CreateChatPrompt'

const { fetchPermissions } = chatActions
const { getChat, getChats, getChatsStatus } = chatSelectors

const messages = {
  messages: 'Messages'
}

// At ≤720px we drop to a single-pane mobile layout: the list takes the full
// area when no chat is selected; the chat takes the full area (with a back
// button) when one is. Above 720px we keep the two-pane experience, with the
// list collapsing to a 96px rail at narrower desktop widths.
const SINGLE_PANE_THRESHOLD_PX = 720
const COMPACT_LIST_THRESHOLD_PX = 1080
const CHATS_PAGE = '/messages'

export const ChatPage = () => {
  useManagedAccountNotAllowedRedirect()
  const params = useParams<{ id?: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const currentChatId = params.id
  const { isMobile } = useMedia()
  const presetMessage = (
    location.state as { presetMessage?: string } | undefined
  )?.presetMessage

  // All hooks must be called before any early returns
  const dispatch = useDispatch()
  const { firstOtherUser, canSendMessage } = useCanSendMessage(currentChatId)
  const chat = useSelector((state) => getChat(state, currentChatId ?? ''))

  const layoutRef = useRef<HTMLDivElement>(null)
  const isCompactList = useIsContainerNarrow(
    layoutRef,
    COMPACT_LIST_THRESHOLD_PX
  )
  const isSinglePane = useIsContainerNarrow(layoutRef, SINGLE_PANE_THRESHOLD_PX)
  // In single-pane mode, the user is either viewing the list or a chat — never
  // both. Above the single-pane threshold we still benefit from the compact
  // list rail at narrower desktop widths (1080–720px).
  const showChatList = !isSinglePane || !currentChatId
  const showChatPane = !isSinglePane || !!currentChatId
  const usePageScrollForChatList = isMobile && !currentChatId
  const messagesRef = useRef<HTMLDivElement>(null)

  const chats = useSelector(getChats)
  const chatsStatus = useSelector(getChatsStatus)
  // Only collapse the sidebar once we know for sure the account has no chats.
  // During LOADING / IDLE we keep the sidebar visible so the skeleton loader
  // still renders and we don't flash a layout shift.
  const hideChatList =
    chatsStatus === Status.SUCCESS && (chats?.length ?? 0) === 0

  const chatListClassName = cn(styles.chatList, {
    [styles.chatListCompact]: isCompactList && !isSinglePane,
    [styles.chatListSinglePane]: isSinglePane
  })

  const handleBackToList = useCallback(() => {
    dispatch(push(CHATS_PAGE))
  }, [dispatch])

  // Navigate to new chats
  // Scroll to bottom if active chat is clicked again
  const handleChatClicked = useCallback(
    (chatId: string) => {
      if (chatId !== currentChatId) {
        dispatch(push(chatPage(chatId)))
      } else {
        messagesRef.current?.scrollTo({
          top: messagesRef.current.scrollHeight,
          behavior: 'smooth'
        })
      }
    },
    [messagesRef, currentChatId, dispatch]
  )

  const handleMessageSent = useCallback(() => {
    // Set a timeout so that the date etc has a chance to render first
    setTimeout(() => {
      messagesRef.current?.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }, 0)
  }, [messagesRef])

  // Replace the preset message in browser history after the first navigation
  useEffect(() => {
    if (presetMessage) {
      navigate(location.pathname, {
        state: { presetMessage: undefined },
        replace: true
      })
    }
  }, [navigate, location.pathname, presetMessage])

  useEffect(() => {
    if (firstOtherUser) {
      dispatch(fetchPermissions({ userIds: [firstOtherUser.user_id] }))
    }
  }, [dispatch, firstOtherUser])

  return (
    <Page
      title={`${firstOtherUser ? firstOtherUser.name + ' •' : ''} ${
        messages.messages
      }`}
      containerClassName={cn(styles.page, {
        [styles.narrowActiveChat]: isCompactList && !!currentChatId,
        [styles.singlePane]: isSinglePane
      })}
      contentClassName={styles.pageContent}
      showSearch={false}
      headerPadding={0}
      headerContentPaddingInline='0px'
      headerContainerClassName={
        usePageScrollForChatList ? undefined : styles.chatPageHeaderContainer
      }
      disableHeaderFrosted
      header={
        // In single-pane mode with a chat open we're in chat-detail view —
        // the per-chat ChatPaneHeader (with back button + the other user's
        // info) is the only header that should show. The "Messages" inbox
        // header is meaningless here and was visually stacking with the
        // pane header.
        isSinglePane && currentChatId ? null : (
          <ChatHeader
            currentChatId={currentChatId}
            isNarrowLayout={isCompactList || isSinglePane}
          />
        )
      }
    >
      <div className={styles.layout} ref={layoutRef}>
        {hideChatList || !showChatList ? null : (
          <div className={chatListClassName}>
            <ChatList
              className={chatListClassName}
              currentChatId={currentChatId}
              isCompact={isCompactList && !isSinglePane}
              useWindowScroll={usePageScrollForChatList}
              onChatClicked={handleChatClicked}
            />
          </div>
        )}
        {showChatPane ? (
          <div
            className={cn(styles.chatArea, {
              [styles.chatAreaNarrow]: isCompactList || isSinglePane
            })}
          >
            {currentChatId ? (
              <>
                {isCompactList || isSinglePane ? (
                  <ChatPaneHeader
                    className={styles.chatPaneHeader}
                    isNarrowLayout
                    chatId={currentChatId}
                    onBack={isSinglePane ? handleBackToList : undefined}
                  />
                ) : null}
                <ChatMessageList
                  ref={messagesRef}
                  className={styles.messageList}
                  chatId={currentChatId}
                />
                {chat?.is_blast || (canSendMessage && chat) ? (
                  <ChatComposer
                    className={styles.composer}
                    chatId={currentChatId}
                    onMessageSent={handleMessageSent}
                    presetMessage={presetMessage}
                  />
                ) : null}
              </>
            ) : (
              <div className={styles.emptyState}>
                <CreateChatPrompt hasChats={!hideChatList} />
              </div>
            )}
          </div>
        ) : null}
      </div>
    </Page>
  )
}
