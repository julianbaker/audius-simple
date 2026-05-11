import { useMemo } from 'react'

import { ChatBlastAudience } from '@audius/sdk'

import { useCurrentAccountUser, useRemixersCount } from '~/api'

export const useFirstAvailableBlastAudience = () => {
  const { data: user } = useCurrentAccountUser()

  const { data: remixersCount } = useRemixersCount()

  const firstAvailableAudience = useMemo(() => {
    if (user?.follower_count) return ChatBlastAudience.FOLLOWERS
    if (remixersCount) return ChatBlastAudience.REMIXERS
    return null
  }, [user?.follower_count, remixersCount])

  return firstAvailableAudience
}
