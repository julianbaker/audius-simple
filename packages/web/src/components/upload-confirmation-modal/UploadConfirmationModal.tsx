import { useCallback } from 'react'

import { useUploadConfirmationModal } from '@audius/common/store'
import { IconCloudUpload } from '@audius/harmony'

import ResponsiveModal from 'components/modal/ResponsiveModal'

const messages = {
  title: 'Confirm Upload',
  publicDescription:
    'Ready to begin uploading? Your followers will be notified once your upload is complete.',
  hiddenDescription: 'Ready to begin uploading?',
  cancel: 'Go Back',
  upload: 'Upload'
}

export const UploadConfirmationModal = () => {
  const { data, isOpen, onClose } = useUploadConfirmationModal()
  const { confirmCallback, hasPublicTracks } = data

  const handleConfirm = useCallback(() => {
    confirmCallback()
    onClose()
  }, [confirmCallback, onClose])

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={messages.title}
      Icon={IconCloudUpload}
      size='s'
      confirmation={{
        description: hasPublicTracks
          ? messages.publicDescription
          : messages.hiddenDescription,
        confirmText: messages.upload,
        cancelText: messages.cancel,
        onConfirm: handleConfirm
      }}
    />
  )
}
