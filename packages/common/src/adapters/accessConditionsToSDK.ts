import type { TrackMetadata } from '@audius/sdk'

import {
  AccessConditions,
  isContentFollowGated
} from '~/models'

export const accessConditionsToSDK = (
  input: AccessConditions
): TrackMetadata['downloadConditions'] => {
  if (isContentFollowGated(input)) {
    return {
      followUserId: input.follow_user_id
    }
  } else {
    throw new Error(
      `Unsupported access conditions type: ${JSON.stringify(input)}`
    )
  }
}
