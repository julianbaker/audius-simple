import { useCollection } from '~/api'
import { AccessType } from '~/models/AccessType'
import { ID } from '~/models/Identifiers'
import { Nullable } from '~/utils'

type CollectionAccessType = {
  type: Nullable<AccessType>
  scheduledReleaseDate?: string
  isUnlocked?: boolean
}

export const useCollectionAccessTypeLabel = (
  collectionId: ID
): CollectionAccessType => {
  const { data: collection } = useCollection(collectionId, {
    select: (collection) => ({
      releaseDate: collection?.release_date,
      isPrivate: collection?.is_private
    })
  })

  const releaseDate = collection?.releaseDate
  const isScheduledRelease = releaseDate && new Date(releaseDate) > new Date()
  const isPrivate = collection?.isPrivate

  let type: Nullable<AccessType> = null
  let isUnlocked = false

  if (isScheduledRelease) {
    type = AccessType.SCHEDULED_RELEASE
  } else if (isPrivate) {
    type = AccessType.HIDDEN
  }

  return {
    type,
    isUnlocked,
    scheduledReleaseDate: isScheduledRelease ? releaseDate : undefined
  }
}
