import { useCallback } from 'react'

import { useEarlyReleaseConfirmationModal } from '@audius/common/store'
import { IconRocket } from '@audius/harmony'

import ResponsiveModal from 'components/modal/ResponsiveModal'

const getMessages = (contentType: 'track' | 'album') => ({
  title: 'Confirm Early Release',
  description: `Do you want to release your ${contentType} now? Your followers will be notified.`,
  cancel: 'Cancel',
  confirm: 'Release Now'
})

export const EarlyReleaseConfirmationModal = () => {
  const { data, isOpen, onClose } = useEarlyReleaseConfirmationModal()
  const { contentType, confirmCallback, cancelCallback } = data

  const messages = getMessages(contentType)

  const handleConfirm = useCallback(() => {
    confirmCallback()
    onClose()
  }, [confirmCallback, onClose])

  const handleCancel = useCallback(() => {
    cancelCallback?.()
    onClose()
  }, [cancelCallback, onClose])

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={handleCancel}
      title={messages.title}
      Icon={IconRocket}
      size='s'
      confirmation={{
        description: messages.description,
        confirmText: messages.confirm,
        cancelText: messages.cancel,
        onConfirm: handleConfirm,
        onCancel: handleCancel
      }}
    />
  )
}
