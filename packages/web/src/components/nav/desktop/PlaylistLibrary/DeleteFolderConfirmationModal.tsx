import { useCallback } from 'react'

import { useCurrentAccount, useUpdatePlaylistLibrary } from '@audius/common/api'
import { Name } from '@audius/common/models'
import { playlistLibraryHelpers } from '@audius/common/store'
import { Flex, IconTrash, Text } from '@audius/harmony'

import { useRecord, make } from 'common/store/analytics/actions'
import ResponsiveModal from 'components/modal/ResponsiveModal'

const { removePlaylistFolderInLibrary } = playlistLibraryHelpers

const messages = {
  title: 'Delete Folder',
  header: 'Are you sure you want to delete this folder?',
  description: 'Any playlists inside will be moved out before the folder is deleted.',
  confirm: 'Delete Folder',
  cancel: 'Cancel'
}

type DeleteFolderConfirmationModalProps = {
  visible: boolean
  onCancel: () => void
  onDelete?: () => void
  folderId: string
}

export const DeleteFolderConfirmationModal = (
  props: DeleteFolderConfirmationModalProps
) => {
  const { folderId, visible, onCancel, onDelete } = props
  const { data: accountData } = useCurrentAccount({
    select: (account) => ({
      playlistLibrary: account?.playlistLibrary,
      folder: account?.playlistLibrary?.contents.find(
        (item) => item.type === 'folder' && item.id === folderId
      )
    })
  })
  const { playlistLibrary, folder } = accountData ?? {}
  const record = useRecord()
  const { mutate: updatePlaylistLibrary } = useUpdatePlaylistLibrary()

  const handleDelete = useCallback(() => {
    if (!playlistLibrary || !folder) return
    const newLibrary = removePlaylistFolderInLibrary(playlistLibrary, folderId)
    updatePlaylistLibrary(newLibrary)

    record(make(Name.FOLDER_DELETE, {}))
    onDelete?.()
  }, [
    folder,
    folderId,
    onDelete,
    playlistLibrary,
    record,
    updatePlaylistLibrary
  ])

  return (
    <ResponsiveModal
      isOpen={visible}
      onClose={onCancel}
      title={messages.title}
      Icon={IconTrash}
      size='s'
      confirmation={{
        description: (
          <Flex column gap='m'>
            <Text variant='title' size='m'>
              {messages.header}
            </Text>
            <Text variant='body' size='m'>
              {messages.description}
            </Text>
          </Flex>
        ),
        confirmText: messages.confirm,
        cancelText: messages.cancel,
        onConfirm: handleDelete,
        isDestructive: true
      }}
    />
  )
}
