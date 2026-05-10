import { useCallback, useContext } from 'react'

import { useDeleteCollection } from '@audius/common/api'
import { deletePlaylistConfirmationModalUISelectors } from '@audius/common/store'
import { route } from '@audius/common/utils'
import { IconTrash } from '@audius/harmony'
import { useDispatch, useSelector } from 'react-redux'

import { useModalState } from 'common/hooks/useModalState'
import { RouterContext } from 'components/animated-switch/RouterContextProvider'
import ResponsiveModal from 'components/modal/ResponsiveModal'
import { push } from 'utils/navigation'

const { TRENDING_PAGE } = route
const { getPlaylistId } = deletePlaylistConfirmationModalUISelectors

const messages = {
  title: 'Delete Playlist',
  description: 'Are you sure you want to delete this playlist?',
  confirm: 'Delete',
  cancel: 'Cancel'
}

const DeletePlaylistConfirmationModal = () => {
  const [isOpen, setIsOpen] = useModalState('DeletePlaylistConfirmation')
  const playlistId = useSelector(getPlaylistId) ?? -1
  const { mutateAsync: deleteCollection } = useDeleteCollection()
  const dispatch = useDispatch()
  const { setStackReset } = useContext(RouterContext)

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [setIsOpen])

  const handleDelete = useCallback(async () => {
    try {
      await deleteCollection({ collectionId: playlistId })
      setStackReset(true)
      dispatch(push(TRENDING_PAGE))
      handleClose()
    } catch (error) {
      console.error('Failed to delete playlist:', error)
    }
  }, [deleteCollection, dispatch, setStackReset, playlistId, handleClose])

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={handleClose}
      title={messages.title}
      Icon={IconTrash}
      size='s'
      confirmation={{
        description: messages.description,
        confirmText: messages.confirm,
        cancelText: messages.cancel,
        onConfirm: handleDelete,
        isDestructive: true
      }}
    />
  )
}

export default DeletePlaylistConfirmationModal
