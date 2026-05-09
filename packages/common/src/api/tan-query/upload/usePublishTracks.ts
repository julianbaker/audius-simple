import { HashId, Id, type UploadResponse } from '@audius/sdk'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { trackMetadataForUploadToSdk } from '~/adapters'
import {
  Name,
  Feature,
  isContentUnsupportedCryptoGated,
  stripUnsupportedCryptoGatedConditions
} from '~/models'
import { ProgressStatus, uploadActions } from '~/store'
import type { TrackMetadataForUpload } from '~/store'

import { getTracksBatcher } from '../batchers/getTracksBatcher'
import { QUERY_KEYS } from '../queryKeys'
import { useCurrentAccountUser } from '../users/account/accountSelectors'
import { useCurrentAccount } from '../users/account/useCurrentAccount'
import { getUserQueryKey } from '../users/useUser'
import { useQueryContext, type QueryContextType } from '../utils'

import { mutationOptions } from './mutationOptions'
import { publishStems } from './usePublishStems'

const { updateProgress } = uploadActions

type PublishTracksContext = Pick<
  QueryContextType,
  'audiusSdk' | 'analytics' | 'dispatch' | 'reportToSentry'
> & {
  userId: number
  kind?: 'tracks' | 'album' | 'playlist'
}

type PublishTracksParams = {
  clientId: string
  metadata: TrackMetadataForUpload
  audioUploadResponse: UploadResponse
  imageUploadResponse: UploadResponse
  stemsUploadResponses?: UploadResponse[]
}[]

export const publishTracks = async (
  context: PublishTracksContext,
  params: PublishTracksParams
) => {
  const {
    userId,
    kind,
    audiusSdk,
    dispatch,
    reportToSentry,
    analytics: { make, track }
  } = context

  if (!context.userId) {
    throw new Error('User ID and wallet are required to publish tracks')
  }

  const sdk = await audiusSdk()

  return await Promise.all(
    params.map(async (param) => {
      const snakeMetadata = stripUnsupportedCryptoGateMetadata(param.metadata)

      const trackId = await sdk.tracks.generateTrackId()
      const camelMetadata = trackMetadataForUploadToSdk({
        ...snakeMetadata,
        track_id: trackId
      })

      const publishParentTrack = async () => {
        try {
          const res = await sdk.tracks.publishTrack({
            userId: Id.parse(userId),
            metadata: camelMetadata as Parameters<
              typeof sdk.tracks.publishTrack
            >[0]['metadata'],
            audioUploadResponse: param.audioUploadResponse,
            imageUploadResponse: param.imageUploadResponse
          })
          dispatch(
            updateProgress({
              clientId: param.clientId,
              stemIndex: null,
              key: 'audio',
              progress: { status: ProgressStatus.COMPLETE }
            })
          )

          dispatch(
            updateProgress({
              clientId: param.clientId,
              stemIndex: null,
              key: 'image',
              progress: { status: ProgressStatus.COMPLETE }
            })
          )

          // Track success analytics for this individual track
          const analyticsKind =
            (kind ?? 'tracks') === 'tracks'
              ? params.length > 1
                ? 'multi_track'
                : 'single_track'
              : kind === 'album'
                ? 'album'
                : 'playlist'
          track(
            make({
              eventName: Name.TRACK_UPLOAD_SUCCESS,
              endpoint: '',
              kind: analyticsKind
            })
          )
          return { result: res, error: null }
        } catch (e) {
          dispatch(
            updateProgress({
              clientId: param.clientId,
              stemIndex: null,
              key: 'audio',
              progress: { status: ProgressStatus.ERROR }
            })
          )
          reportToSentry({
            error: e as Error,
            name: 'Upload: Track Publish',
            feature: Feature.Upload
          })
          console.error('Error publishing track:', e)
          return { result: null, error: e as Error }
        }
      }

      const [trackResult, stemsResults] = await Promise.all([
        publishParentTrack(),
        publishStems(context, {
          clientId: param.clientId,
          parentMetadata: param.metadata,
          stems:
            param.metadata.stems
              ?.map((stem, index) => {
                const audioUploadResponse = param.stemsUploadResponses?.[index]

                // This should never be the case, but being defensive
                if (!audioUploadResponse) return null
                return {
                  metadata: stem,
                  audioUploadResponse
                }
              })
              .filter(
                (stem): stem is NonNullable<typeof stem> => stem !== null
              ) ?? [],
          parentTrackId: trackId
        })
      ])

      return {
        clientId: param.clientId,
        trackId: trackResult.result?.trackId ?? null,
        stems: stemsResults,
        error: trackResult.error
      }
    })
  )
}

const getPublishTracksOptions = (context: PublishTracksContext) =>
  mutationOptions({
    mutationFn: async (params: PublishTracksParams) =>
      publishTracks(context, params)
  })

export const usePublishTracks = (
  options?: Partial<ReturnType<typeof getPublishTracksOptions>> & {
    kind?: 'tracks' | 'album' | 'playlist'
  }
) => {
  const queryContext = useQueryContext()
  const queryClient = useQueryClient()
  const { data: account } = useCurrentAccount()
  const { data: accountUser } = useCurrentAccountUser()
  const userId = account?.userId ?? undefined
  const kind = options?.kind ?? 'tracks'

  return useMutation({
    ...options,
    ...getPublishTracksOptions({
      ...queryContext,
      userId: userId!,
      kind
    }),
    onSuccess: async (data) => {
      const sdk = await queryContext.audiusSdk()
      const batchGetTracks = getTracksBatcher({
        sdk,
        currentUserId: userId,
        queryClient,
        dispatch: queryContext.dispatch
      })
      // Prefetch the published tracks into the cache
      await Promise.all(
        data
          .filter((res) => !res.error && res.trackId)
          .map((res) => batchGetTracks.fetch(HashId.parse(res.trackId!)))
      )

      // Invalidate the user's data to update track count
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

export function stripUnsupportedCryptoGateMetadata<
  T extends TrackMetadataForUpload
>(track: T): T {
  const hadUnsupportedStreamGate = isContentUnsupportedCryptoGated(
    track.stream_conditions
  )
  const hadUnsupportedDownloadGate = isContentUnsupportedCryptoGated(
    track.download_conditions
  )

  return {
    ...track,
    is_stream_gated:
      !!stripUnsupportedCryptoGatedConditions(track.stream_conditions),
    stream_conditions: stripUnsupportedCryptoGatedConditions(
      track.stream_conditions
    ),
    ...(hadUnsupportedStreamGate ? { preview_start_seconds: null } : {}),
    is_download_gated:
      !!stripUnsupportedCryptoGatedConditions(track.download_conditions),
    download_conditions: stripUnsupportedCryptoGatedConditions(
      track.download_conditions
    ),
    ...(hadUnsupportedDownloadGate
      ? { is_downloadable: false, is_original_available: false }
      : {})
  }
}
