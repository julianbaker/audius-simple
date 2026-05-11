import { HashId, Id, type UploadResponse } from '@audius/sdk'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mapValues } from 'lodash'
import { useDispatch } from 'react-redux'

import {
  albumMetadataForCreateWithSDK,
  playlistMetadataForCreateWithSDK,
  fileToSdk
} from '~/adapters'
import {
  stripUnsupportedCryptoGatedConditions,
  type FieldVisibility
} from '~/models'
import type { CollectionValues } from '~/schemas'
import {
  type TrackMetadataForUpload,
  libraryPageActions,
  LibraryCategory,
  accountActions
} from '~/store'

import { getCollectionsBatcher } from '../batchers/getCollectionsBatcher'
import { QUERY_KEYS } from '../queryKeys'
import { useCurrentAccountUser } from '../users/account/accountSelectors'
import { useCurrentAccount } from '../users/account/useCurrentAccount'
import { updatePlaylistLibrary } from '../users/account/useUpdatePlaylistLibrary'
import { getUserQueryKey } from '../users/useUser'
import { useQueryContext, type QueryContextType } from '../utils'

import { mutationOptions } from './mutationOptions'
import { publishTracks } from './usePublishTracks'

type PublishCollectionContext = Pick<
  QueryContextType,
  'audiusSdk' | 'analytics' | 'dispatch' | 'reportToSentry'
> & {
  userId: number
}

type PublishCollectionParams = {
  collectionMetadata: CollectionValues
  tracks: {
    clientId: string
    metadata: TrackMetadataForUpload
    audioUploadResponse: UploadResponse
    imageUploadResponse: UploadResponse
  }[]
}

const getPublishCollectionOptions = (context: PublishCollectionContext) =>
  mutationOptions({
    mutationFn: async (params: PublishCollectionParams) => {
      const { audiusSdk, userId } = context
      const sdk = await audiusSdk()
      if (!userId) {
        throw new Error('User ID and wallet are required to publish collection')
      }

      const collectionMetadata = {
        ...params.collectionMetadata,
        stream_conditions: stripUnsupportedCryptoGatedConditions(
          params.collectionMetadata.stream_conditions
        ) as typeof params.collectionMetadata.stream_conditions,
        download_conditions: stripUnsupportedCryptoGatedConditions(
          params.collectionMetadata.download_conditions
        ) as typeof params.collectionMetadata.download_conditions
      }
      collectionMetadata.is_stream_gated =
        !!collectionMetadata.stream_conditions
      collectionMetadata.is_download_gated =
        !!collectionMetadata.download_conditions

      // Combine collection metadata into each track's metadata
      for (const track of params.tracks) {
        track.metadata = combineMetadata(track.metadata, collectionMetadata)
      }

      // Publish all the tracks first
      const publishedTracks = await publishTracks(
        {
          ...context,
          kind: collectionMetadata.is_album ? 'album' : 'playlist'
        },
        params.tracks
      )

      // For collection artwork, use the existing flow (not TUS) to keep things simple for now.
      const { artwork } = collectionMetadata
      const artworkBlob =
        artwork && 'file' in artwork ? (artwork?.file ?? null) : null
      const coverArtFile = artworkBlob
        ? fileToSdk(artworkBlob, 'cover_art')
        : undefined
      if (collectionMetadata.is_album) {
        const metadata = albumMetadataForCreateWithSDK(collectionMetadata)
        metadata.playlistContents = publishedTracks
          .filter((t) => !!t.trackId)
          .map((t) => ({
            timestamp: Math.round(Date.now() / 1000),
            trackId: t.trackId!,
            metadataTimestamp: Math.round(Date.now() / 1000)
          }))
        return await sdk.albums.createAlbum({
          userId: Id.parse(userId),
          imageFile: coverArtFile,
          metadata
        })
      } else {
        const metadata = playlistMetadataForCreateWithSDK(collectionMetadata)
        metadata.playlistContents = publishedTracks
          .filter((t) => !!t.trackId)
          .map((t) => ({
            timestamp: Math.round(Date.now() / 1000),
            trackId: t.trackId!,
            metadataTimestamp: Math.round(Date.now() / 1000)
          }))
        return await sdk.playlists.createPlaylist({
          userId: Id.parse(userId),
          imageFile: coverArtFile,
          metadata
        })
      }
    }
  })

export const usePublishCollection = (
  options?: Partial<ReturnType<typeof getPublishCollectionOptions>>
) => {
  const { audiusSdk, analytics, reportToSentry } = useQueryContext()
  const queryClient = useQueryClient()
  const dispatch = useDispatch()
  const { data: account = null } = useCurrentAccount()
  const { data: accountUser } = useCurrentAccountUser()
  const userId = account?.userId ?? undefined

  return useMutation({
    ...options,
    ...getPublishCollectionOptions({
      audiusSdk,
      userId: userId!,
      dispatch,
      analytics,
      reportToSentry
    }),

    onSuccess: async (playlist) => {
      if (!playlist.playlistId) return
      const sdk = await audiusSdk()

      // Prefetch the newly created collection data and prime the cache
      const batchGetCollections = getCollectionsBatcher({
        sdk,
        currentUserId: userId,
        queryClient,
        dispatch
      })
      const collection = await batchGetCollections.fetch(
        HashId.parse(playlist.playlistId)
      )

      // Update the playlist sidebar
      dispatch(
        accountActions.addAccountPlaylist({
          id: collection.playlist_id,
          name: collection.playlist_name,
          is_album: collection.is_album,
          permalink: collection.permalink!,
          user: {
            id: userId!,
            handle: accountUser!.handle
          }
        })
      )

      // Persist the now-updated library to the user's profile + tan-query cache.
      const previousLibrary = account?.playlistLibrary ?? { contents: [] }
      await updatePlaylistLibrary(
        sdk,
        userId,
        {
          ...previousLibrary,
          contents: [
            ...previousLibrary.contents,
            { playlist_id: collection.playlist_id, type: 'playlist' as const }
          ]
        },
        queryClient,
        dispatch
      )

      // Add to library as favorite locally
      dispatch(
        libraryPageActions.addLocalCollection({
          collectionId: collection.playlist_id,
          isAlbum: collection.is_album,
          category: LibraryCategory.Favorite
        })
      )

      // Invalidate user query to update collection count and track count
      queryClient.invalidateQueries({
        queryKey: getUserQueryKey(userId)
      })

      // Invalidate the uploader's profile tracks cache
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.profileTracks, accountUser?.handle]
      })
    }
  })
}

/**
 * Combines the metadata for a track and a collection (playlist or album),
 * taking the metadata from the playlist when the track is missing it.
 */
function combineMetadata(
  trackMetadata: TrackMetadataForUpload,
  collectionMetadata: CollectionValues
) {
  const metadata = trackMetadata

  // @ts-expect-error - Typing is hard here because playlists and albums have different artwork types
  metadata.artwork = collectionMetadata.artwork

  if (!metadata.genre)
    metadata.genre = collectionMetadata.trackDetails?.genre ?? ''
  if (!metadata.mood)
    metadata.mood = collectionMetadata.trackDetails?.mood ?? null
  if (!metadata.release_date) {
    metadata.release_date = collectionMetadata.release_date ?? null
    metadata.is_scheduled_release =
      collectionMetadata.is_scheduled_release ?? false
  }

  if (metadata.tags === null && collectionMetadata.trackDetails?.tags) {
    // Take collection tags
    metadata.tags = collectionMetadata.trackDetails?.tags
  }

  // Set download & hidden status
  metadata.is_downloadable = !!collectionMetadata.is_downloadable

  // Marks child tracks so backend suppresses per-track follower create notifications.
  metadata.is_playlist_upload = true
  metadata.is_unlisted = !!collectionMetadata.is_private
  if (collectionMetadata.is_private && collectionMetadata.field_visibility) {
    // Convert any undefined values to booleans
    const booleanFieldVisibility = mapValues(
      collectionMetadata.field_visibility,
      Boolean
    ) as FieldVisibility
    metadata.field_visibility = booleanFieldVisibility
  }

  return metadata
}
