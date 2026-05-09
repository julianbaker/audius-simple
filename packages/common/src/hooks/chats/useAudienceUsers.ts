import { ChatBlast, ChatBlastAudience, OptionalHashId } from '@audius/sdk'

import {
  useCurrentUserId,
  useFollowers,
  useRemixers,
  useUsers
} from '~/api'
import { UserMetadata } from '~/models'

export const useAudienceUsers = (chat: ChatBlast, limit?: number) => {
  const { data: currentUserId } = useCurrentUserId()

  const { data: followerIds } = useFollowers({
    userId: currentUserId,
    pageSize: limit
  })
  const { data: followers } = useUsers(followerIds)
  const { data: remixers } = useRemixers(
    {
      userId: currentUserId,
      trackId: OptionalHashId.parse(chat.audience_content_id),
      pageSize: limit
    },
    { enabled: chat.audience === ChatBlastAudience.REMIXERS }
  )

  const { data: remixersUsers } = useUsers(remixers)

  let users: UserMetadata[] = []
  switch (chat.audience) {
    case ChatBlastAudience.FOLLOWERS:
      users = followers ?? []
      break
    case ChatBlastAudience.REMIXERS:
      users = remixersUsers ?? []
      break
  }

  return users
}
