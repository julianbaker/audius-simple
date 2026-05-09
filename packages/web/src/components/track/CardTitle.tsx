import { AccessConditions } from '@audius/common/models'
import { Nullable } from '@audius/common/utils'
import { Text, IconUserFollowing, Flex } from '@audius/harmony'

const messages = {
  trackTitle: 'TRACK',
  podcastTitle: 'PODCAST',
  remixTitle: 'REMIX',
  hiddenTrackTooltip: 'Anyone with a link to this page will be able to see it',
  followersOnly: 'FOLLOWERS ONLY',
  remixContest: 'REMIX CONTEST'
}

type CardTitleProps = {
  className?: string
  isUnlisted: boolean
  isScheduledRelease: boolean
  isRemix: boolean
  isStreamGated: boolean
  isPodcast: boolean
  streamConditions: Nullable<AccessConditions>
  isRemixContest: boolean
}

export const CardTitle = ({
  className,
  isRemix,
  isStreamGated,
  isPodcast,
  isRemixContest
}: CardTitleProps) => {
  let content

  if (isRemixContest) {
    content = (
      <Text variant='label' color='subdued'>
        {messages.remixContest}
      </Text>
    )
  } else if (isStreamGated) {
    content = (
      <Flex gap='s' alignItems='center' justifyContent='center'>
        <IconUserFollowing size='s' color='subdued' />
        <Text variant='label' color='subdued'>
          {messages.followersOnly}
        </Text>
      </Flex>
    )
  } else {
    content = (
      <Text variant='label' color='subdued'>
        {isRemix
          ? messages.remixTitle
          : isPodcast
            ? messages.podcastTitle
            : messages.trackTitle}
      </Text>
    )
  }

  return (
    <Text variant='title' strength='weak' className={className}>
      {content}
    </Text>
  )
}
