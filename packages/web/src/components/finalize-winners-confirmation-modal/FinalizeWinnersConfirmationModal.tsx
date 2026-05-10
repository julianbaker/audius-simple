import { useCallback } from 'react'

import { useFinalizeWinnersConfirmationModal } from '@audius/common/store'

import ResponsiveModal from 'components/modal/ResponsiveModal'

const messages = {
  title: 'Confirm Winners?',
  description: 'Are you sure you want to finalize your winners?',
  description2: 'All participants will be notified.',
  cancel: 'Go Back',
  confirm: 'Confirm'
}

export const FinalizeWinnersConfirmationModal = () => {
  const { data, isOpen, onClose } = useFinalizeWinnersConfirmationModal()
  const { confirmCallback, cancelCallback, isInitialSave } = data

  const handleConfirm = useCallback(() => {
    confirmCallback()
    onClose()
  }, [confirmCallback, onClose])

  const handleCancel = useCallback(() => {
    cancelCallback?.()
    onClose()
  }, [cancelCallback, onClose])

  const description = isInitialSave
    ? `${messages.description} ${messages.description2}`
    : messages.description

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={handleCancel}
      title={messages.title}
      size='s'
      confirmation={{
        description,
        confirmText: messages.confirm,
        cancelText: messages.cancel,
        onConfirm: handleConfirm,
        onCancel: handleCancel
      }}
    />
  )
}
