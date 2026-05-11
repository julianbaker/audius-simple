import { useRef } from 'react'

import { useCurrentUserId, useUser } from '@audius/common/api'
import { useIsManagedAccount } from '@audius/common/hooks'
import { ID, statusIsNotFinalized } from '@audius/common/models'
import { chatSelectors } from '@audius/common/store'
import { formatCount } from '@audius/common/utils'
import {
  Button,
  Flex,
  FollowButton,
  IconMessage,
  IconMessageLocked,
  IconPencil,
  IconShare,
  Skeleton,
  Text
} from '@audius/harmony'
import { useDispatch, useSelector } from 'react-redux'

import { ArtistRecommendationsPopup } from 'components/artist-recommendations/ArtistRecommendationsPopup'
import ProfilePicture from 'components/profile-picture/ProfilePicture'
import FollowsYouBadge from 'components/user-badges/FollowsYouBadge'
import {
  setUsers,
  setVisibility as setUserListVisibility
} from 'store/application/ui/userListModal/slice'
import {
  UserListEntityType,
  UserListType
} from 'store/application/ui/userListModal/types'

import { EditableName } from './EditableName'
import styles from './ProfilePageHeader.module.css'

const { getChatPermissionsStatus } = chatSelectors

const messages = {
  edit: 'Edit Profile',
  share: 'Share',
  message: 'Send Message',
  more: 'More Options',
  shareProfile: 'Share Profile',
  blockMessages: 'Block Messages',
  unblockMessages: 'Unblock Messages',
  muteComments: 'Mute Comments',
  unmuteComments: 'Unmute Comments',
  tracks: 'Tracks',
  followers: 'Followers',
  following: 'Following',
  playlists: 'Playlists',
  artist: 'Artist',
  label: 'Label'
}

/**
 * Inline account-type pill, styled to match the FollowsYouBadge that
 * sits next to it. Avoids the hardcoded SVG artwork (which had its own
 * fill + shadow + size baked in) and lets the badge inherit the
 * surrounding spacing/typography tokens.
 */
const AccountTypeBadge = ({ label }: { label: string }) => (
  <Flex
    alignItems='center'
    justifyContent='center'
    borderRadius='s'
    ph='s'
    pv='xs'
    border='strong'
  >
    <Text variant='label' size='xs' strength='strong' color='subdued'>
      {label}
    </Text>
  </Flex>
)

export type ProfileMode = 'visitor' | 'owner' | 'editing'

type ProfilePageHeaderProps = {
  // Identity
  userId: ID
  name: string
  handle: string
  isArtist: boolean
  isLabel?: boolean
  isDeactivated?: boolean
  loading?: boolean
  verified?: boolean
  profilePictureSizes: any
  hasProfilePicture: boolean
  updatedProfilePicture?: string
  updateName: (name: string) => void

  // Stats
  trackCount: number
  playlistCount: number
  followerCount: number
  followingCount: number

  // Action handlers
  mode: ProfileMode
  accountUserId?: ID | null
  canCreateChat?: boolean
  isBlocked?: boolean
  isMuted?: boolean
  onEdit?: () => void
  onShare?: () => void
  onFollow?: () => void
  onUnfollow?: () => void
  onMessage?: () => void
  onBlock?: () => void
  onUnblock?: () => void
  onMute?: () => void
  areArtistRecommendationsVisible?: boolean
  onCloseArtistRecommendations?: () => void
}

/**
 * Single-row profile header replacing the previous lockup-on-cover
 * (desktop) and stacked-on-cover-strip (mobile) patterns. PFP straddles
 * the cover/content boundary via negative margin so the bottom anchors
 * on the clean content surface — no text-on-image legibility hacks.
 *
 * Edit flow is now in a modal (no inline Mask). The edit button just
 * dispatches `onEdit`; the consumer mounts `ProfileEditModal` separately.
 */
export const ProfilePageHeader = (props: ProfilePageHeaderProps) => {
  const {
    userId,
    name,
    handle,
    isArtist,
    isLabel,
    isDeactivated,
    loading,
    verified,
    profilePictureSizes,
    hasProfilePicture,
    updatedProfilePicture,
    updateName,
    trackCount,
    playlistCount,
    followerCount,
    followingCount,
    mode,
    canCreateChat,
    onEdit,
    onShare,
    onFollow,
    onUnfollow,
    onMessage,
    areArtistRecommendationsVisible = false,
    onCloseArtistRecommendations
  } = props

  const dispatch = useDispatch()
  const followButtonRef = useRef<HTMLButtonElement>(null)
  const isManagedAccount = useIsManagedAccount()
  const chatPermissionStatus = useSelector(getChatPermissionsStatus)
  const { data: currentUserId } = useCurrentUserId()
  const { data: isFollowing } = useUser(userId, {
    select: (user) => user.does_current_user_follow
  })

  const handleOpenFollowers = () => {
    if (followerCount === 0) return
    dispatch(
      setUsers({
        userListType: UserListType.FOLLOWER,
        entityType: UserListEntityType.USER,
        id: userId
      })
    )
    dispatch(setUserListVisibility(true))
  }

  const handleOpenFollowing = () => {
    if (followingCount === 0) return
    dispatch(
      setUsers({
        userListType: UserListType.FOLLOWING,
        entityType: UserListEntityType.USER,
        id: userId
      })
    )
    dispatch(setUserListVisibility(true))
  }

  // Render-only: the inline stats row. Clickable counts open the
  // existing UserListModal — same modal that was driven from the old
  // StatBanner.
  const renderStats = () => {
    const primaryCount = isArtist ? trackCount : playlistCount
    const primaryLabel = isArtist ? messages.tracks : messages.playlists
    return (
      <Flex
        gap='m'
        alignItems='center'
        className={styles.stats}
        css={{ flexWrap: 'wrap' }}
      >
        {primaryCount > 0 ? (
          <Text variant='body' size='m' color='subdued'>
            <Text color='default' strength='strong'>
              {formatCount(primaryCount)}
            </Text>{' '}
            {primaryLabel}
          </Text>
        ) : null}
        {followerCount > 0 ? (
          <Text
            variant='body'
            size='m'
            color='subdued'
            onClick={handleOpenFollowers}
            css={{
              cursor: 'pointer',
              '&:hover': { color: 'inherit' }
            }}
          >
            <Text color='default' strength='strong'>
              {formatCount(followerCount)}
            </Text>{' '}
            {messages.followers}
          </Text>
        ) : null}
        {followingCount > 0 ? (
          <Text
            variant='body'
            size='m'
            color='subdued'
            onClick={handleOpenFollowing}
            css={{
              cursor: 'pointer',
              '&:hover': { color: 'inherit' }
            }}
          >
            <Text color='default' strength='strong'>
              {formatCount(followingCount)}
            </Text>{' '}
            {messages.following}
          </Text>
        ) : null}
      </Flex>
    )
  }

  const renderActions = () => {
    if (mode === 'owner') {
      return (
        <Flex gap='s' className={styles.actions}>
          {onShare ? (
            <Button
              variant='secondary'
              size='small'
              iconLeft={IconShare}
              onClick={onShare}
              className={styles.shareButton}
            >
              {messages.share}
            </Button>
          ) : null}
          <Button
            variant='secondary'
            size='small'
            iconLeft={IconPencil}
            onClick={onEdit}
          >
            {messages.edit}
          </Button>
        </Flex>
      )
    }
    // Visitor mode: share + message + follow.
    // The previous kebab menu held block/mute/share for non-owner visitors,
    // but in practice only share was ever populated for logged-out visitors,
    // so we surface it directly as its own button instead of hiding it
    // behind an overflow menu with one item.
    return (
      <Flex gap='s' className={styles.actions}>
        {onShare ? (
          <Button
            variant='secondary'
            size='small'
            aria-label={messages.shareProfile}
            iconLeft={IconShare}
            onClick={onShare}
            className={styles.shareButton}
          />
        ) : null}
        {onMessage && !isManagedAccount ? (
          statusIsNotFinalized(chatPermissionStatus) && currentUserId ? (
            <Skeleton w={40} h={32} css={{ flexShrink: 0 }} />
          ) : (
            <Button
              variant='secondary'
              size='small'
              aria-label={messages.message}
              iconLeft={canCreateChat ? IconMessage : IconMessageLocked}
              onClick={onMessage}
            />
          )
        ) : null}
        <FollowButton
          ref={followButtonRef}
          isFollowing={!!isFollowing}
          onFollow={onFollow}
          onUnfollow={onUnfollow}
          fullWidth={false}
        />
        <ArtistRecommendationsPopup
          anchorRef={followButtonRef}
          artistId={userId}
          isVisible={areArtistRecommendationsVisible}
          onClose={onCloseArtistRecommendations ?? (() => {})}
        />
      </Flex>
    )
  }

  return (
    <div className={styles.headerRow}>
      <div className={styles.pfpWrapper}>
        {/* @ts-ignore — legacy ProfilePicture prop shape */}
        <ProfilePicture
          userId={userId}
          updatedProfilePicture={updatedProfilePicture || ''}
          error={false}
          profilePictureSizes={isDeactivated ? null : profilePictureSizes}
          loading={loading}
          editMode={false}
          hasProfilePicture={hasProfilePicture}
        />
      </div>

      <div className={styles.identity}>
        <div className={styles.nameRow}>
          {isDeactivated ? null : (
            <EditableName
              className={styles.name}
              name={name}
              editable={false}
              verified={verified}
              onChange={updateName}
              userId={userId}
            />
          )}
        </div>
        <div className={styles.handleRow}>
          <Text variant='body' size='m' color='subdued'>
            {handle}
          </Text>
          <FollowsYouBadge userId={userId} />
          {/* Account-type badge — same pill treatment as the
              FollowsYouBadge it sits next to so they read as a single
              row of identity metadata. */}
          {isLabel ? (
            <AccountTypeBadge label={messages.label} />
          ) : isArtist ? (
            <AccountTypeBadge label={messages.artist} />
          ) : null}
        </div>
        {!isDeactivated ? renderStats() : null}
      </div>

      {!isDeactivated ? renderActions() : null}
    </div>
  )
}
