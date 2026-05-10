import { useCallback, useEffect } from 'react'

import { notificationsUserListSelectors } from '@audius/common/store'
import {
  Scrollbar,
  IconUser,
  IconUserGroup,
  IconTrophy,
  IconUserFollowing as IconFollowing,
  IconRemix
} from '@audius/harmony'
import { ChatBlastAudience } from '@audius/sdk'
import { useDispatch, useSelector } from 'react-redux'
import { useMatch, useLocation } from 'react-router'

import { FavoritesUserList } from 'components/user-list/lists/FavoritesUserList'
import { FollowingUserList } from 'components/user-list/lists/FollowingUserList'
import { MutualsUserList } from 'components/user-list/lists/MutualsUserList'
import { NotificationsUserList } from 'components/user-list/lists/NotificationsUserList'
import { RelatedArtistsUserList } from 'components/user-list/lists/RelatedArtistsUserList'
import { RemixersUserList } from 'components/user-list/lists/RemixersUserList'
import { RepostsUserList } from 'components/user-list/lists/RepostsUserList'
import { ChatBlastWithAudienceCTA } from 'pages/chat-page/components/ChatBlastWithAudienceCTA'
import {
  getUserListType,
  getIsOpen
} from 'store/application/ui/userListModal/selectors'
import { setVisibility } from 'store/application/ui/userListModal/slice'
import { UserListType } from 'store/application/ui/userListModal/types'

import ResponsiveModal from 'components/modal/ResponsiveModal'

import { FollowersUserList } from '../user-list/lists/FollowersUserList'
const { getPageTitle } = notificationsUserListSelectors

const messages = {
  reposts: 'Reposts',
  favorites: 'Favorites',
  followers: 'Followers',
  following: 'Following',
  relatedArtists: 'Related Artists',
  mutuals: 'Mutuals',
  remixers: 'Remixers'
}

export const UserListModal = () => {
  const dispatch = useDispatch()
  const userListType = useSelector(getUserListType)
  const isOpen = useSelector(getIsOpen)
  const location = useLocation()
  const notificationTitle = useSelector(getPageTitle)

  const onClose = useCallback(() => dispatch(setVisibility(false)), [dispatch])

  // Close the modal when the user navigates to another page
  useEffect(() => {
    if (isOpen) {
      return () => {
        onClose()
      }
    }
  }, [location.pathname, isOpen, onClose])

  const match = useMatch('/messages/:audience_type')
  const isChatBlastPath =
    match?.params?.audience_type &&
    Object.values(ChatBlastAudience).includes(
      match.params.audience_type as ChatBlastAudience
    )

  const getUserList = () => {
    switch (userListType) {
      case UserListType.FAVORITE:
        return {
          component: <FavoritesUserList />,
          title: messages.favorites
        }
      case UserListType.REPOST:
        return {
          component: <RepostsUserList />,
          title: messages.reposts
        }
      case UserListType.FOLLOWER:
        return {
          Icon: IconUser,
          component: <FollowersUserList />,
          title: messages.followers
        }
      case UserListType.FOLLOWING:
        return {
          Icon: IconFollowing,
          component: <FollowingUserList />,
          title: messages.following
        }
      case UserListType.NOTIFICATION:
        return {
          component: <NotificationsUserList />,
          Icon: IconTrophy,
          title: notificationTitle
        }
      case UserListType.MUTUAL_FOLLOWER:
        return {
          component: <MutualsUserList />,
          Icon: IconFollowing,
          title: messages.mutuals
        }
      case UserListType.RELATED_ARTISTS:
        return {
          component: <RelatedArtistsUserList />,
          Icon: IconUserGroup,
          title: messages.relatedArtists
        }
      case UserListType.REMIXER:
        return {
          component: <RemixersUserList />,
          Icon: IconRemix,
          title: messages.remixers
        }
      default:
        return {}
    }
  }

  const { component, title, Icon } = getUserList()

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      Icon={Icon}
      size='m'
    >
      <Scrollbar>{component}</Scrollbar>
      {!isChatBlastPath && userListType === UserListType.FOLLOWER ? (
        <ChatBlastWithAudienceCTA
          audience={ChatBlastAudience.FOLLOWERS}
          onClick={onClose}
        />
      ) : null}
    </ResponsiveModal>
  )
}
