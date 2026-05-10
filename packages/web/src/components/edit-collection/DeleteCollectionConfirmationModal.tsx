import { useCallback } from 'react'

import {
  useCurrentAccount,
  useCurrentUserId,
  useDeleteCollection,
  useUser
} from '@audius/common/api'
import { ID } from '@audius/common/models'
import { route } from '@audius/common/utils'
import { IconTrash } from '@audius/harmony'
import { useNavigate } from 'react-router'

import ResponsiveModal from 'components/modal/ResponsiveModal'

const { profilePage } = route

const messages = {
  delete: 'Delete',
  cancel: 'Cancel',
  deleting: 'Deleting',
  title: {
    playlist: 'Playlist',
    album: 'Album'
  },
  description: (entity: string) =>
    `Are you sure you want to delete this ${entity.toLowerCase()}?`
}

type DeleteCollectionConfirmationModalProps = {
  visible: boolean
  onCancel: () => void
  onDelete?: () => void
  collectionId: ID
}

export const DeleteCollectionConfirmationModal = (
  props: DeleteCollectionConfirmationModalProps
) => {
  const navigate = useNavigate()
  const { collectionId, visible, onCancel, onDelete } = props
  const { data: accountCollection } = useCurrentAccount({
    select: (account) => account?.collections?.[collectionId]
  })
  const { is_album } = accountCollection ?? {}
  const { data: currentUserId } = useCurrentUserId()
  const { data: currentUser } = useUser(currentUserId)
  const { mutateAsync: deleteCollection, isPending: isDeleting } =
    useDeleteCollection()

  const handleDelete = useCallback(async () => {
    try {
      await deleteCollection({
        collectionId,
        source: 'delete_collection_confirmation_modal'
      })
      onDelete?.()
      const tab = is_album ? 'albums' : 'playlists'
      navigate(`${profilePage(currentUser?.handle)}/${tab}`, { replace: true })
    } catch (error) {
      console.error('Failed to delete collection:', error)
    }
  }, [
    deleteCollection,
    collectionId,
    onDelete,
    is_album,
    currentUser?.handle,
    navigate
  ])

  const entity = is_album ? messages.title.album : messages.title.playlist
  const title = `${messages.delete} ${entity}`
  const confirmText = `${messages.delete} ${entity}`

  return (
    <ResponsiveModal
      isOpen={visible}
      onClose={onCancel}
      title={title}
      Icon={IconTrash}
      size='s'
      confirmation={{
        description: messages.description(entity),
        confirmText,
        cancelText: messages.cancel,
        onConfirm: handleDelete,
        isDestructive: true,
        isConfirming: isDeleting,
        confirmingText: messages.deleting
      }}
    />
  )
}
