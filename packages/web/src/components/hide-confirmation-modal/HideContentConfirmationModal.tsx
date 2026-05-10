import { useCallback } from 'react'

import { useHideContentConfirmationModal } from '@audius/common/store'

import ResponsiveModal from 'components/modal/ResponsiveModal'

const messages = {
  title: 'Confirm Update',
  description:
    "You're about to change your content from public to hidden. It will be hidden from the public and your followers will lose access.",
  cancel: 'Cancel',
  confirm: 'Make Hidden'
}

export const HideContentConfirmationModal = () => {
  const { data, isOpen, onClose } = useHideContentConfirmationModal()
  const { confirmCallback, cancelCallback } = data

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
      size='s'
      confirmation={{
        description: messages.description,
        confirmText: messages.confirm,
        cancelText: messages.cancel,
        onConfirm: handleConfirm,
        onCancel: handleCancel,
        isDestructive: true
      }}
    />
  )
}
