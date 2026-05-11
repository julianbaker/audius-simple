import { ID } from '@audius/common/models'
import { Flex } from '@audius/harmony'

import { ProfileMutuals } from './desktop/ProfileMutuals'
import { ProfileTopTags } from './desktop/ProfileTopTags'
import { RecentComments } from './desktop/RecentComments'
import { RelatedArtists } from './desktop/RelatedArtists'

type ProfileSidebarProps = {
  userId: ID
  isArtist: boolean
}

/**
 * Discovery sidebar — surfaces context that helps a viewer decide whether
 * to follow this profile (mutual followers, related artists, top tags)
 * plus their recent activity (recent comments).
 *
 * Lifted from the old ProfileLeftNav with the bio / social / location
 * sections stripped out — those moved to the inline `ProfileBio` "About"
 * block above the lineup. What's left here is purely discovery widgets.
 *
 * The parent layout shows / hides this column based on container width
 * (only renders at the widest size; collapses at narrower widths to keep
 * the lineup readable).
 */
export const ProfileSidebar = ({ userId, isArtist }: ProfileSidebarProps) => {
  return (
    <Flex column gap='2xl' css={{ textAlign: 'left' }}>
      <RecentComments userId={userId} />
      <ProfileMutuals />
      <RelatedArtists />
      {isArtist ? <ProfileTopTags /> : null}
    </Flex>
  )
}
