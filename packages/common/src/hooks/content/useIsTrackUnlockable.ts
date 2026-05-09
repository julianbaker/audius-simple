import { useTrack } from '~/api'
import { isContentFollowGated, ID } from '~/models'

export const useIsTrackUnlockable = (trackId: ID) => {
  const { data: streamConditions } = useTrack(trackId, {
    select: (track) => {
      return track.stream_conditions
    }
  })

  return isContentFollowGated(streamConditions)
}
