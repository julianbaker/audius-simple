import { useCallback } from 'react'

import { useReplaceTrackConfirmationModal } from '@audius/common/store'
import { Flex, Hint, IconError, Text } from '@audius/harmony'

import ResponsiveModal from 'components/modal/ResponsiveModal'

const messages = {
  title: 'Are You Sure?',
  description: 'Are you sure you want to replace the file for this track?',
  hintText:
    'This change may impact accuracy of comment timestamps. Social metrics such as reposts won’t be affected.',
  cancel: 'Cancel',
  confirm: 'Confirm & Replace'
}

export const ReplaceTrackConfirmationModal = () => {
  const { data, isOpen, onClose } = useReplaceTrackConfirmationModal()
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
        description: (
          <Flex column gap='xl'>
            <Text variant='body' size='m'>
              {messages.description}
            </Text>
            <Hint pv='s' icon={IconError}>
              {messages.hintText}
            </Hint>
          </Flex>
        ),
        confirmText: messages.confirm,
        cancelText: messages.cancel,
        onConfirm: handleConfirm,
        onCancel: handleCancel
      }}
    />
  )
}
