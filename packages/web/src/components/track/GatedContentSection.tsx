import { useUsers } from '@audius/common/api'
import {
  AccessConditions,
  FollowSource,
  ID,
  isContentFollowGated,
  ModalSource
} from '@audius/common/models'
import {
  gatedContentSelectors,
  usersSocialActions as socialActions
} from '@audius/common/store'
import { removeNullable } from '@audius/common/utils'
import {
  Button,
  Flex,
  IconUserFollow,
  IconUserFollowing,
  Text
} from '@audius/harmony'
import cn from 'classnames'
import { useDispatch, useSelector } from 'react-redux'

import { useModalState } from 'common/hooks/useModalState'
import { UserLink } from 'components/link'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import { useRequiresAccountCallback } from 'hooks/useRequiresAccount'

import { LockedStatusBadge } from '../locked-status-badge'

import styles from './GiantTrackTile.module.css'

const { getGatedContentStatusMap } = gatedContentSelectors

type GatedContentType = 'track' | 'album'

const getMessages = (contentType: GatedContentType) => ({
  howToUnlock: 'how to unlock',
  unlocking: 'unlocking',
  unlocked: 'unlocked',
  followersOnly: 'FOLLOWERS ONLY',
  followArtist: 'Follow Artist',
  ownFollowGated: 'Users can unlock access by following your account!',
  unlockFollowGatedContentPrefix: 'Follow',
  thankYouForFollowing: 'Thank you for following',
  unlockedFollowGatedContentSuffix: `! This ${contentType} is now available.`,
  exclamationMark: '!'
})

type GatedContentSectionProps = {
  isLoading: boolean
  contentId: ID
  contentType?: GatedContentType
  streamConditions: AccessConditions
  hasStreamAccess?: boolean
  isOwner: boolean
  wrapperClassName?: string
  className?: string
  buttonClassName?: string
  ownerId: ID | null
  source?: ModalSource
}

export const GatedContentSection = ({
  isLoading,
  contentId,
  contentType = 'track',
  streamConditions,
  hasStreamAccess,
  isOwner,
  wrapperClassName,
  className,
  buttonClassName
}: GatedContentSectionProps) => {
  const dispatch = useDispatch()
  const gatedContentStatusMap = useSelector(getGatedContentStatusMap)
  const gatedContentStatus = gatedContentStatusMap[contentId] ?? null
  const [lockedContentModalVisibility, setLockedContentModalVisibility] =
    useModalState('LockedContent')

  const isFollowGated = isContentFollowGated(streamConditions)
  const { byId: users } = useUsers(
    [isFollowGated ? streamConditions.follow_user_id : null].filter(
      removeNullable
    )
  )
  const followee = isFollowGated ? users[streamConditions.follow_user_id] : null
  const messages = getMessages(contentType)

  const followSource = lockedContentModalVisibility
    ? FollowSource.HOW_TO_UNLOCK_MODAL
    : FollowSource.HOW_TO_UNLOCK_TRACK_PAGE

  const handleFollow = useRequiresAccountCallback(() => {
    if (!isContentFollowGated(streamConditions)) return
    dispatch(
      socialActions.followUser(
        streamConditions.follow_user_id,
        followSource,
        contentId
      )
    )

    if (lockedContentModalVisibility) {
      setLockedContentModalVisibility(false)
    }
  }, [
    dispatch,
    streamConditions,
    followSource,
    contentId,
    lockedContentModalVisibility,
    setLockedContentModalVisibility
  ])

  if (!streamConditions || !isFollowGated) return null

  const fadeIn = {
    [styles.show]: !isLoading,
    [styles.hide]: isLoading
  }

  if (hasStreamAccess) {
    return (
      <Flex
        className={cn(styles.gatedContentSection, fadeIn, wrapperClassName)}
      >
        <Flex row className={className} w='100%' justifyContent='space-between'>
          <Flex column gap='s'>
            <Flex gap='s'>
              {isOwner ? (
                <IconUserFollowing size='s' color='default' />
              ) : (
                <LockedStatusBadge locked={false} variant='gated' />
              )}
              <Text variant='label' size='l' strength='strong'>
                {isOwner ? messages.followersOnly : messages.unlocked}
              </Text>
            </Flex>
            <Text variant='body' strength='strong'>
              {isOwner ? (
                messages.ownFollowGated
              ) : followee ? (
                <>
                  {messages.thankYouForFollowing}{' '}
                  <UserLink userId={followee.user_id} />
                  {messages.unlockedFollowGatedContentSuffix}
                </>
              ) : null}
            </Text>
          </Flex>
        </Flex>
      </Flex>
    )
  }

  if (gatedContentStatus === 'UNLOCKING') {
    return (
      <Flex
        className={cn(styles.gatedContentSection, fadeIn, wrapperClassName)}
      >
        <div className={className}>
          <Flex
            direction='row'
            className={styles.gatedContentDescriptionContainer}
            alignItems='flex-start'
            gap='s'
          >
            <Text variant='label' size='l' strength='strong'>
              <Flex alignItems='center' gap='s'>
                <LoadingSpinner className={styles.spinner} />
                {messages.unlocking}
              </Flex>
            </Text>
            {followee ? (
              <Text variant='body' strength='strong'>
                {messages.thankYouForFollowing}{' '}
                <UserLink userId={followee.user_id} />
                {messages.exclamationMark}
              </Text>
            ) : null}
          </Flex>
        </div>
      </Flex>
    )
  }

  return (
    <Flex className={cn(styles.gatedContentSection, fadeIn, wrapperClassName)}>
      <Flex
        w='100%'
        direction='row'
        gap='m'
        justifyContent='space-between'
        className={cn(styles.gatedContentSectionLocked, className)}
      >
        <Flex gap='s' direction='column'>
          <Flex alignItems='center' gap='s'>
            <LockedStatusBadge locked variant='gated' />
            <Text variant='label' size='l' strength='strong'>
              {messages.howToUnlock}
            </Text>
          </Flex>
          {followee ? (
            <Text variant='body' strength='strong'>
              {messages.unlockFollowGatedContentPrefix}{' '}
              <UserLink userId={followee.user_id} />
            </Text>
          ) : null}
        </Flex>
        <Flex w='100%' className={buttonClassName}>
          <Button
            variant='primary'
            color='blue'
            onClick={handleFollow}
            iconLeft={IconUserFollow}
            fullWidth
          >
            {messages.followArtist}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  )
}
