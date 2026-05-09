import {
  AccessConditions,
  isContentFollowGated,
  StreamTrackAvailabilityType
} from '~/models'

import { Nullable } from './typeUtils'

// Returns whether some users may lose access based on the new audience.
export const getUsersMayLoseAccess = ({
  availability,
  initialStreamConditions
}: {
  availability: StreamTrackAvailabilityType
  initialStreamConditions?: Nullable<AccessConditions>
}) => {
  const isInitiallyFollowGated = isContentFollowGated(initialStreamConditions)

  const stillFollowGated =
    isInitiallyFollowGated &&
    availability === StreamTrackAvailabilityType.FOLLOW_GATED
  const stillSameGate = stillFollowGated

  return (
    !stillSameGate &&
    // why do we have both FREE and PUBLIC types
    // and when is one used over the other?
    ![
      StreamTrackAvailabilityType.FREE,
      StreamTrackAvailabilityType.PUBLIC
    ].includes(availability)
  )
}
