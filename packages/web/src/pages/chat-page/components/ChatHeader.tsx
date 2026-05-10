import { forwardRef, useCallback } from 'react'

import {
  chatActions,
  chatSelectors,
  CommonState,
  useCreateChatModal
} from '@audius/common/store'
import {
  IconCompose,
  IconSettings,
  IconButton,
  Flex,
  Text,
  IconMessages,
  IconCheck,
  IconKebabHorizontal,
  PopupMenu,
  useMedia
} from '@audius/harmony'
import { useDispatch, useSelector } from 'react-redux'

import { useModalState } from 'common/hooks/useModalState'
import { Frosted } from 'components/frosted/Frosted'

import { ChatBlastHeader } from './ChatBlastHeader'
import { UserChatHeader } from './UserChatHeader'

const messages = {
  header: 'Messages',
  inboxOptions: 'Inbox Options',
  inboxSettings: 'Inbox Settings',
  compose: 'Compose',
  markAllAsRead: 'Mark All as Read'
}

const CHAT_HEADER_PADDING_PX = 20
const CHAT_HEADER_PADDING_MOBILE_PX = 12
const CHAT_LIST_WIDTH_PX = 400

type ChatHeaderProps = {
  currentChatId?: string
  isNarrowLayout?: boolean
  scrollBarWidth?: number
  headerContainerRef?: React.RefObject<HTMLDivElement | null>
}

export const ChatHeader = forwardRef<HTMLDivElement, ChatHeaderProps>(
  ({ currentChatId, isNarrowLayout }, ref) => {
    const dispatch = useDispatch()
    const { isMobile } = useMedia()
    const { onOpen: openCreateChatModal } = useCreateChatModal()
    const [, setInboxSettingsVisible] = useModalState('InboxSettings')
    const chat = useSelector((state: CommonState) =>
      chatSelectors.getChat(state, currentChatId ?? '')
    )
    const unreadMessagesCount = useSelector(
      chatSelectors.getUnreadMessagesCount
    )
    const hasUnread = unreadMessagesCount > 0
    const isBlast = chat?.is_blast

    const handleComposeClicked = useCallback(() => {
      openCreateChatModal()
    }, [openCreateChatModal])

    const handleSettingsClicked = useCallback(() => {
      setInboxSettingsVisible(true)
    }, [setInboxSettingsVisible])

    const handleMarkAllAsReadClicked = useCallback(() => {
      dispatch(chatActions.markAllChatsAsRead())
    }, [dispatch])

    const inboxMenuItems = [
      {
        text: messages.inboxSettings,
        icon: <IconSettings />,
        onClick: handleSettingsClicked
      },
      ...(hasUnread
        ? [
            {
              text: messages.markAllAsRead,
              icon: <IconCheck />,
              onClick: handleMarkAllAsReadClicked
            }
          ]
        : [])
    ]

    const headerContent = (
      <Flex
        pv={isMobile ? 's' : 'l'}
        ph={isMobile ? '0' : 'l'}
        alignItems='center'
        gap='m'
        w='100%'
      >
        <IconMessages size={isMobile ? 'l' : '2xl'} color='heading' />
        <Text
          variant='heading'
          strength='default'
          size={isMobile ? 's' : 'l'}
          color='heading'
        >
          {messages.header}
        </Text>
        <Flex
          gap='m'
          alignItems='center'
          justifyContent='flex-end'
          css={{ marginLeft: 'auto', flexShrink: 0 }}
        >
          <IconButton
            aria-label={messages.compose}
            icon={IconCompose}
            size='m'
            onClick={handleComposeClicked}
          />
          <PopupMenu
            items={inboxMenuItems}
            transformOrigin={{ horizontal: 'left', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            renderTrigger={(ref, trigger) => (
              <IconButton
                ref={ref}
                aria-label={messages.inboxOptions}
                icon={IconKebabHorizontal}
                size='m'
                onClick={() => trigger()}
              />
            )}
          />
        </Flex>
      </Flex>
    )

    // At narrow widths, drop the fixed 112px height and let the header size
    // to its content like the standard adaptive Header does. The
    // --chat-header-height var still drives the page-internal layout
    // calculations, but a smaller value matches the compact mobile header.
    const narrow = isNarrowLayout || isMobile
    const headerHeight = narrow ? 64 : 112

    return (
      <Frosted
        w='100%'
        h={headerHeight}
        contentPaddingInline='0px'
        borderBottom='default'
        css={{ '--chat-header-height': `${headerHeight}px` } as any}
      >
        <Flex
          ref={ref}
          w='100%'
          h={headerHeight}
          ph={isMobile ? CHAT_HEADER_PADDING_MOBILE_PX : CHAT_HEADER_PADDING_PX}
          css={{ minWidth: 0, borderRadius: 0 }}
        >
          <Flex
            w={narrow ? '100%' : CHAT_LIST_WIDTH_PX}
            css={{ flexShrink: 0 }}
          >
            {headerContent}
          </Flex>
          {narrow ? null : (
            <Flex p='l' flex={1} alignItems='center' css={{ minWidth: 0 }}>
              {chat ? (
                isBlast ? (
                  <ChatBlastHeader chat={chat} />
                ) : (
                  <UserChatHeader chatId={chat.chat_id} />
                )
              ) : null}
            </Flex>
          )}
        </Flex>
      </Frosted>
    )
  }
)
