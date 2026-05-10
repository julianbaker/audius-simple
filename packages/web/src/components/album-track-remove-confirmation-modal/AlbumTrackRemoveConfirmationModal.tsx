import { useCallback } from 'react'

import {
  useAlbumTrackRemoveConfirmationModal,
  cacheCollectionsActions
} from '@audius/common/store'
import { Flex, Text } from '@audius/harmony'
import { useDispatch } from 'react-redux'

import ResponsiveModal from 'components/modal/ResponsiveModal'

const messages = {
  title: 'Remove Track',
  description1: 'Are you sure you want to remove this track from your album?',
  description2:
    'This removes the track from the album listing, but the standalone track remains available wherever it is already published.',
  cancel: 'Cancel',
  confirm: 'Remove Track From Album'
}

export const AlbumTrackRemoveConfirmationModal = () => {
  const {
    isOpen,
    onClose,
    data: { trackId, playlistId, timestamp }
  } = useAlbumTrackRemoveConfirmationModal()

  const dispatch = useDispatch()

  const handleConfirm = useCallback(() => {
    if (trackId && playlistId && timestamp) {
      dispatch(
        cacheCollectionsActions.removeTrackFromPlaylist(
          trackId,
          playlistId,
          timestamp
        )
      )
    }
    onClose()
  }, [dispatch, onClose, playlistId, timestamp, trackId])

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={messages.title}
      size='m'
      confirmation={{
        description: (
          <Flex column gap='m'>
            <Text variant='body' size='m'>
              {messages.description1}
            </Text>
            <Text variant='body' size='m'>
              {messages.description2}
            </Text>
          </Flex>
        ),
        confirmText: messages.confirm,
        cancelText: messages.cancel,
        onConfirm: handleConfirm,
        isDestructive: true
      }}
    />
  )
}
