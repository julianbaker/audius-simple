import { useCurrentUserId } from '~/api'
import { useTrack } from '~/api/tan-query/tracks/useTrack'
import { DogEarType } from '~/models'
import { ID } from '~/models/Identifiers'
import { isContentFollowGated } from '~/models/Track'
import { Nullable } from '~/utils'

import { useGatedTrackAccess } from './useGatedContent'

export const useTrackDogEar = (trackId: ID, hideUnlocked = false) => {
  const { data: currentUserId } = useCurrentUserId()
  const { data: partialTrack } = useTrack(trackId, {
    select: (track) => {
      return {
        streamConditions: track.stream_conditions,
        isOwner: track.owner_id === currentUserId
      }
    }
  })
  const { streamConditions, isOwner } = partialTrack ?? {}

  const { hasStreamAccess } = useGatedTrackAccess(trackId)

  const hideUnlockedStream = !isOwner && hasStreamAccess && hideUnlocked

  const isFollowGated = isContentFollowGated(streamConditions)

  let dogEarType: Nullable<DogEarType> = null

  if (isFollowGated && !hideUnlockedStream) {
    dogEarType = DogEarType.FOLLOW_GATED
  }

  return dogEarType
}
