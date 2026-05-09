import { MouseEvent, useCallback, useState } from 'react'

import { useFileSizes, useStems, useTrack } from '@audius/common/api'
import {
  useDownloadableContentAccess,
  useUploadingStems
} from '@audius/common/hooks'
import { Name, DownloadQuality, ID, StemCategory } from '@audius/common/models'
import {
  useWaitForDownloadModal,
  toastActions,
  useDownloadTrackArchiveModal
} from '@audius/common/store'
import {
  Flex,
  Box,
  Text,
  IconReceive,
  Button,
  IconCaretDown,
  LoadingSpinner,
  Tooltip
} from '@audius/harmony'
import { useDispatch } from 'react-redux'

import { make, useRecord } from 'common/store/analytics/actions'
import { Expandable } from 'components/expandable/Expandable'
import { useIsMobile } from 'hooks/useIsMobile'
import { useRequiresAccountCallback } from 'hooks/useRequiresAccount'

import { DownloadRow } from './DownloadRow'

const { toast } = toastActions

const ORIGINAL_TRACK_INDEX = 1
const STEM_INDEX_OFFSET_WITHOUT_ORIGINAL_TRACK = 1
const STEM_INDEX_OFFSET_WITH_ORIGINAL_TRACK = 2

const messages = {
  title: 'Stems & Downloads',
  followToDownload: 'Must follow artist to download.',
  downloadAll: 'Download All',
  download: 'Download'
}

type DownloadSectionProps = {
  trackId: ID
}

export const DownloadSection = ({ trackId }: DownloadSectionProps) => {
  const dispatch = useDispatch()
  const record = useRecord()
  const isMobile = useIsMobile()
  const { data: partialTrack } = useTrack(trackId, {
    select: (track) => {
      return {
        is_downloadable: track?.is_downloadable,
        access: track?.access
      }
    }
  })
  const { is_downloadable, access } = partialTrack ?? {}

  const { data: stemTracks = [], isSuccess: isStemsSuccess } = useStems(trackId)
  const { uploadingTracks: uploadingStems } = useUploadingStems(trackId)
  const { shouldDisplayDownloadFollowGated } = useDownloadableContentAccess({
    trackId
  })

  // Filter out uploading stems that are already in the stemTracks array
  const filteredUploadingStems = uploadingStems.filter(
    (s) => !stemTracks.find((t) => t.orig_filename === s.name)
  )
  const isUploadingStems = filteredUploadingStems.length > 0

  const downloadQuality = DownloadQuality.ORIGINAL
  const shouldHideDownload =
    !access?.download && !shouldDisplayDownloadFollowGated
  const [expanded, setExpanded] = useState(false)

  const { onOpen: openDownloadTrackArchiveModal } =
    useDownloadTrackArchiveModal()

  const { data: fileSizes } = useFileSizes(
    {
      trackIds: [trackId, ...stemTracks.map((s) => s.track_id)],
      downloadQuality
    },
    { enabled: isStemsSuccess }
  )
  const { onOpen: openWaitForDownloadModal } = useWaitForDownloadModal()

  const onToggleExpand = useCallback(() => setExpanded((val) => !val), [])

  const handleDownload = useRequiresAccountCallback(
    ({ trackIds, parentTrackId }: { trackIds: ID[]; parentTrackId?: ID }) => {
      if (isMobile && shouldDisplayDownloadFollowGated) {
        // On mobile, show a toast instead of a tooltip
        dispatch(toast({ content: messages.followToDownload }))
      } else if (partialTrack && partialTrack.access.download) {
        openWaitForDownloadModal({
          parentTrackId,
          trackIds,
          quality: downloadQuality
        })

        // Track download attempt event
        if (parentTrackId) {
          record(
            make(Name.TRACK_DOWNLOAD_CLICKED_DOWNLOAD_ALL, {
              parentTrackId,
              stemTrackIds: trackIds,
              device: 'web'
            })
          )
        } else {
          record(
            make(Name.TRACK_DOWNLOAD_CLICKED_DOWNLOAD_SINGLE, {
              trackId: trackIds[0],
              device: 'web'
            })
          )
        }
      }
    },
    [
      dispatch,
      downloadQuality,
      isMobile,
      openWaitForDownloadModal,
      record,
      shouldDisplayDownloadFollowGated,
      partialTrack
    ]
  )

  const handleDownloadAll = useRequiresAccountCallback(
    (e: MouseEvent) => {
      e.stopPropagation()
      // Only include parent track in count if it's downloadable
      const parentTrackCount = access?.download ? 1 : 0
      openDownloadTrackArchiveModal({
        trackId,
        fileCount: stemTracks.length + parentTrackCount
      })
    },
    [
      openDownloadTrackArchiveModal,
      trackId,
      stemTracks.length,
      access?.download
    ]
  )

  const hasStems = stemTracks.length > 0 || isUploadingStems
  const downloadButtonText = hasStems ? messages.downloadAll : messages.download

  // No caret / no expandable list when there's a single downloadable track
  // (download original ON, no stems). Tapping the row's download button
  // should be the entire interaction — there's nothing to expand.
  const isSingleTrackDownload = !!is_downloadable && !hasStems

  const handleDownloadButtonClick = useRequiresAccountCallback(
    (e: MouseEvent) => {
      e.stopPropagation()
      if (hasStems) {
        handleDownloadAll(e)
      } else {
        handleDownload({ trackIds: [trackId] })
      }
    },
    [hasStems, handleDownloadAll, handleDownload, trackId]
  )

  const renderDownloadAllButton = () => {
    if (shouldHideDownload) {
      return null
    }

    return (
      <Tooltip
        mount='body'
        placement='left'
        text={messages.followToDownload}
        disabled={!shouldDisplayDownloadFollowGated}
      >
        <Flex onClick={(e) => e.stopPropagation()}>
          <Button
            disabled={shouldDisplayDownloadFollowGated}
            variant='secondary'
            size='small'
            onClick={handleDownloadButtonClick}
          >
            {downloadButtonText}
          </Button>
        </Flex>
      </Tooltip>
    )
  }

  return (
    <Box
      border='default'
      borderRadius='m'
      backgroundColor='white'
      css={{ overflow: 'hidden' }}
    >
      <Flex column>
        <Flex
          gap='m'
          row
          justifyContent='space-between'
          alignItems='center'
          p='l'
          onClick={isSingleTrackDownload ? undefined : onToggleExpand}
          css={{
            cursor: isSingleTrackDownload ? 'default' : 'pointer'
          }}
          role={isSingleTrackDownload ? undefined : 'button'}
          aria-expanded={isSingleTrackDownload ? undefined : expanded}
          aria-controls={isSingleTrackDownload ? undefined : 'download-section'}
        >
          <Flex
            justifyContent='space-between'
            wrap='wrap'
            gap='m'
            css={{ flexGrow: 1 }}
          >
            <Flex row alignItems='center' gap='s'>
              <IconReceive size='l' color='default' />
              <Text variant='label' size='l' strength='strong'>
                {messages.title}
              </Text>
            </Flex>
          </Flex>
          <Flex
            row
            alignItems='center'
            justifyContent='flex-end'
            gap='m'
            role='row'
          >
            {isUploadingStems ? (
              <LoadingSpinner size='xl' />
            ) : (
              renderDownloadAllButton()
            )}
          </Flex>

          {isSingleTrackDownload ? null : (
            <IconCaretDown
              css={{
                transition: 'transform var(--harmony-expressive)',
                transform: expanded ? 'rotate(-180deg)' : undefined
              }}
              size='m'
              color='default'
            />
          )}
        </Flex>
        <Expandable expanded={expanded} id='downloads-section'>
          <Box>
            {is_downloadable ? (
              <DownloadRow
                trackId={trackId}
                parentTrackId={trackId}
                onDownload={handleDownload}
                index={ORIGINAL_TRACK_INDEX}
                hideDownload={shouldHideDownload}
                size={fileSizes?.[trackId]?.[downloadQuality]}
              />
            ) : null}
            {stemTracks.map((stemTrack, i) => (
              <DownloadRow
                trackId={stemTrack.track_id}
                parentTrackId={trackId}
                key={stemTrack.track_id}
                category={stemTrack.stem_of?.category}
                filename={stemTrack.orig_filename ?? undefined}
                onDownload={handleDownload}
                hideDownload={shouldHideDownload}
                size={fileSizes?.[stemTrack.track_id]?.[downloadQuality]}
                index={
                  i +
                  (is_downloadable
                    ? STEM_INDEX_OFFSET_WITH_ORIGINAL_TRACK
                    : STEM_INDEX_OFFSET_WITHOUT_ORIGINAL_TRACK)
                }
              />
            ))}
            {filteredUploadingStems.map((s, i) => (
              <DownloadRow
                key={`uploading-stem-${i}`}
                onDownload={() => {}}
                hideDownload={shouldHideDownload}
                size={s.size}
                index={
                  i +
                  stemTracks.length +
                  (is_downloadable
                    ? STEM_INDEX_OFFSET_WITH_ORIGINAL_TRACK
                    : STEM_INDEX_OFFSET_WITHOUT_ORIGINAL_TRACK)
                }
                category={s.category ?? StemCategory.OTHER}
                filename={s.name}
                isLoading
              />
            ))}
          </Box>
        </Expandable>
      </Flex>
    </Box>
  )
}
