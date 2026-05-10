import { useCallback } from 'react'

import { usePublishConfirmationModal } from '@audius/common/store'
import { IconRocket } from '@audius/harmony'

import ResponsiveModal from 'components/modal/ResponsiveModal'

const getMessages = (contentType: 'track' | 'album' | 'playlist') => ({
  title: 'Confirm Release',
  description: `Are you sure you want to make this ${contentType} public? Your followers will be notified.`,
  cancel: 'Go Back',
  release: 'Release Now'
})

export const PublishConfirmationModal = () => {
  const { data, isOpen, onClose } = usePublishConfirmationModal()
  const { contentType, confirmCallback } = data

  const messages = getMessages(contentType)

  const handleConfirm = useCallback(() => {
    confirmCallback()
    onClose()
  }, [confirmCallback, onClose])

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={messages.title}
      Icon={IconRocket}
      size='s'
      confirmation={{
        description: messages.description,
        confirmText: messages.release,
        cancelText: messages.cancel,
        onConfirm: handleConfirm
      }}
    />
  )
}
