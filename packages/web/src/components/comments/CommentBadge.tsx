import { useCurrentCommentSection } from '@audius/common/context'
import { ID } from '@audius/common/models'
import { Flex, IconComponent, IconStar, Text } from '@audius/harmony'

type BadgeType = 'artist'

const iconMap: Record<BadgeType, IconComponent> = {
  artist: IconStar
}
const messages: Record<BadgeType, string> = {
  artist: 'Artist'
}

type CommentBadgeProps = {
  isArtist: boolean
  commentUserId: ID
}

export const CommentBadge = ({
  commentUserId,
  isArtist
}: CommentBadgeProps) => {
  const { artistId } = useCurrentCommentSection()

  const badgeType = isArtist && commentUserId === artistId ? 'artist' : null

  if (badgeType === null) return null

  const Icon = iconMap[badgeType]

  return (
    <Flex gap='xs' alignItems='center'>
      <Icon color='accent' size='2xs' />
      <Text color='accent' variant='body' size='s'>
        {messages[badgeType]}
      </Text>
    </Flex>
  )
}
