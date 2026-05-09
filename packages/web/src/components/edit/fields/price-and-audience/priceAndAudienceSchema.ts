import { StreamTrackAvailabilityType } from '@audius/common/models'
import { z } from 'zod'

import { PREVIEW, STREAM_AVAILABILITY_TYPE } from '../types'

const messages = {
  required: 'Required'
}

export const priceAndAudienceSchema = () =>
  z.object({
    [PREVIEW]: z.optional(
      z.nullable(z.number({ invalid_type_error: messages.required }))
    ),
    [STREAM_AVAILABILITY_TYPE]: z.nativeEnum(StreamTrackAvailabilityType)
  })
