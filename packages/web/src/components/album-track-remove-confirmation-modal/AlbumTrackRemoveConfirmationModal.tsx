import { useCallback } from 'react'

import {
  useAlbumTrackRemoveConfirmationModal,
  cacheCollectionsActions
} from '@audius/common/store'
import {
  Button,
  Modal,
  ModalContent,
  ModalContentText,
  ModalHeader,
  ModalTitle,
  ModalFooter
} from '@audius/harmony'
import { useDispatch } from 'react-redux'

const messages = {
  title: 'Remove Track',
  description1: 'Are you sure you want to remove this track from your album?',
  description2:
    'This removes the track from the album listing, but the standalone track remains available wherever it is already published.',
  cancel: 'Cancel',
  release: 'Remove Track From Album'
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
    <Modal isOpen={isOpen} onClose={onClose} size='medium'>
      <ModalHeader>
        <ModalTitle title={messages.title} />
      </ModalHeader>
      <ModalContent css={{ textAlign: 'center' }}>
        <ModalContentText>{messages.description1}</ModalContentText>
        <ModalContentText>{messages.description2}</ModalContentText>
      </ModalContent>
      <ModalFooter>
        <Button fullWidth variant='secondary' onClick={onClose}>
          {messages.cancel}
        </Button>
        <Button variant='destructive' fullWidth onClick={handleConfirm}>
          {messages.release}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
