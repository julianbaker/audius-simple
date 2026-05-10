import { useCallback } from 'react'

import { useEditAccessConfirmationModal } from '@audius/common/store'

import ResponsiveModal from 'components/modal/ResponsiveModal'

const messages = {
  title: 'Confirm Update',
  description:
    "You're about to change the audience for your content. This update may cause others to lose the ability to listen and share.",
  cancel: 'Cancel',
  confirm: 'Update Audience'
}

export const EditAccessConfirmationModal = () => {
  const { data, isOpen, onClose } = useEditAccessConfirmationModal()
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
        onCancel: handleCancel
      }}
    />
  )
}
