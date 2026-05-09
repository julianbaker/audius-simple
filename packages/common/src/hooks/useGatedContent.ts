import { useMemo } from 'react'

import { useSelector } from 'react-redux'

import {
  useCollection,
  useCurrentAccount,
  useTrack,
  useUser,
  useUsers
} from '~/api'
import { Collection } from '~/models/Collection'
import { ID } from '~/models/Identifiers'
import {
  AccessConditions,
  Track,
  isContentFollowGated
} from '~/models/Track'
import { gatedContentSelectors } from '~/store/gated-content'
import { isContentPartialTrack } from '~/utils/contentTypeUtils'
import { Nullable, removeNullable } from '~/utils/typeUtils'

const { getLockedContentId } = gatedContentSelectors

export const useGatedTrackAccess = (trackId: ID) => {
  const { data: track } = useTrack(trackId, {
    select: (track) => ({
      is_stream_gated: track?.is_stream_gated,
      is_download_gated: track?.is_download_gated,
      access: track?.access
    })
  })

  const hasStreamAccess = !track?.is_stream_gated || !!track?.access?.stream
  const hasDownloadAccess =
    !track?.is_download_gated || !!track?.access?.download

  return { hasStreamAccess, hasDownloadAccess }
}

export const useGatedCollectionAccess = (collectionId: ID) => {
  const { data: hasStreamAccess } = useCollection(collectionId, {
    select: (collection) => {
      const { is_stream_gated, access } = collection ?? {}
      return !is_stream_gated || !!access?.stream
    }
  })

  return { hasStreamAccess }
}

type PartialTrack = Pick<
  Track,
  | 'track_id'
  | 'is_stream_gated'
  | 'is_download_gated'
  | 'access'
  | 'stream_conditions'
  | 'download_conditions'
  | 'preview_cid'
>

type PartialCollection = Pick<
  Collection,
  'playlist_id' | 'is_stream_gated' | 'access' | 'stream_conditions'
>

export const useGatedContentAccess = (
  content: Nullable<PartialTrack> | Nullable<PartialCollection> | undefined
) => {
  return useMemo(() => {
    if (!content) {
      return {
        isFetchingNFTAccess: false,
        hasStreamAccess: true,
        hasDownloadAccess: true,
        isPreviewable: false
      }
    }

    const isTrack = isContentPartialTrack<PartialTrack>(content)
    const { is_stream_gated: isStreamGated } = content
    const isDownloadGated = isTrack ? content.is_download_gated : undefined

    const { stream, download } = content.access ?? {}

    return {
      isFetchingNFTAccess: false,
      hasStreamAccess: !isStreamGated || !!stream,
      hasDownloadAccess: !isDownloadGated || !!download,
      isPreviewable: false
    }
  }, [content])
}

export const useGatedContentAccessMap = (tracks: Partial<Track>[]) => {
  const result = useMemo(() => {
    const map: {
      [id: ID]: { isFetchingNFTAccess: boolean; hasStreamAccess: boolean }
    } = {}

    tracks.forEach((track) => {
      if (!track.track_id) {
        return
      }

      const trackId = track.track_id

      map[trackId] = {
        isFetchingNFTAccess: false,
        hasStreamAccess: !track.is_stream_gated || !!track.access?.stream
      }
    })

    return map
  }, [tracks])

  return result
}

export const useStreamConditionsEntity = (
  streamConditions: Nullable<AccessConditions>
) => {
  const followUserId = isContentFollowGated(streamConditions)
    ? streamConditions?.follow_user_id
    : null

  const { byId: usersById } = useUsers([followUserId].filter(removeNullable))
  const followee = followUserId ? usersById[followUserId] : null

  return {
    followee,
    token: null
  }
}

export const useLockedContent = () => {
  const id = useSelector(getLockedContentId)
  const { data: track } = useTrack(id)
  const { data: owner } = useUser(track?.owner_id)

  return { id, track, owner }
}

export const useDownloadableContentAccess = ({ trackId }: { trackId: ID }) => {
  const { data: track } = useTrack(trackId, {
    select: (track) => ({
      owner_id: track?.owner_id,
      is_stream_gated: track?.is_stream_gated,
      is_download_gated: track?.is_download_gated,
      access: track?.access,
      download_conditions: track?.download_conditions
    })
  })
  const { data: currentAccount, isPending } = useCurrentAccount()
  const isOwner = track?.owner_id === currentAccount?.userId

  if (isPending) {
    return {
      shouldDisplayDownloadFollowGated: false
    }
  }

  // Only display downloadable-content-specific gated UI if the track is not
  // stream-gated
  const isDownloadGatedOnly =
    !track?.is_stream_gated && !!track?.is_download_gated
  const shouldDisplayDownloadFollowGated =
    isDownloadGatedOnly &&
    isContentFollowGated(track?.download_conditions) &&
    track?.access?.download === false &&
    !isOwner

  return {
    shouldDisplayDownloadFollowGated
  }
}
