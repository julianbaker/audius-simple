import { ID } from '@audius/common/models'
import { IconUserUnfollow } from '@audius/harmony'

import ResponsiveModal from 'components/modal/ResponsiveModal'

type UnfollowConfirmationModalProps = {
  isOpen: boolean
  onClose: () => void
  unfollowUser: (userId: ID) => void
  userId: ID
}

const messages = {
  title: 'Unfollow',
  description: 'Are you sure you want to unfollow this user?',
  confirm: 'Unfollow',
  cancel: 'Cancel'
}

const UnfollowConfirmationModal = ({
  isOpen,
  onClose,
  userId,
  unfollowUser
}: UnfollowConfirmationModalProps) => {
  const handleConfirm = () => {
    unfollowUser(userId)
    onClose()
  }

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={messages.title}
      Icon={IconUserUnfollow}
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

export default UnfollowConfirmationModal
