import { useCallback } from 'react'

import { useDeleteTrack } from '@audius/common/api'
import { useDeleteTrackConfirmationModal } from '@audius/common/store'
import { IconTrash } from '@audius/harmony'

import ResponsiveModal from 'components/modal/ResponsiveModal'

const messages = {
  title: 'Delete Track',
  description: 'Are you sure you want to delete this track?',
  confirm: 'Delete Track',
  cancel: 'Cancel'
}

export const DeleteTrackConfirmationModal = () => {
  const { data, isOpen, onClose } = useDeleteTrackConfirmationModal()
  const { trackId } = data
  const { mutateAsync: deleteTrack } = useDeleteTrack()

  const handleConfirm = useCallback(() => {
    if (!trackId) return
    deleteTrack({ trackId, source: 'delete_track_confirmation_modal' })
    onClose()
  }, [trackId, deleteTrack, onClose])

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={messages.title}
      Icon={IconTrash}
      size='s'
      confirmation={{
        description: messages.description,
        confirmText: messages.confirm,
        cancelText: messages.cancel,
        onConfirm: handleConfirm,
        isDestructive: true
      }}
    />
  )
}
