import { useTrack } from '~/api'
import { ID, isContentFollowGated } from '~/models'
import { Nullable } from '~/utils'

import { LockedStatusVariant } from './types'

export const useTrackLockedStatusVariant = (trackId: ID) => {
  const { data: streamConditions } = useTrack(trackId, {
    select: (track) => track?.stream_conditions
  })

  const isFollowGated = isContentFollowGated(streamConditions)

  let variant: Nullable<LockedStatusVariant> = null
  if (isFollowGated) {
    variant = 'gated'
  }

  return variant
}
