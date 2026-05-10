import { useCallback, useContext } from 'react'

import { useCurrentAccountUser, useCollection } from '@audius/common/api'
import {
  cacheCollectionsActions,
  duplicateAddConfirmationModalUISelectors
} from '@audius/common/store'
import { fillString, route } from '@audius/common/utils'
import { capitalize, pick } from 'lodash'
import { useDispatch } from 'react-redux'

import { useModalState } from 'common/hooks/useModalState'
import { useSelector } from 'common/hooks/useSelector'
import ResponsiveModal from 'components/modal/ResponsiveModal'
import { ToastContext } from 'components/toast/ToastContext'
import ToastLinkContent from 'components/toast/mobile/ToastLinkContent'

const { addTrackToPlaylist } = cacheCollectionsActions
const { getPlaylistId, getTrackId } = duplicateAddConfirmationModalUISelectors
const { collectionPage } = route

const messages = {
  title: 'Already Added',
  description: (collectionType: 'album' | 'playlist') =>
    `This is already in your%0 ${collectionType}`,
  cancel: "Don't Add",
  add: 'Add Anyway',
  addedToast: (collectionType: 'album' | 'playlist') =>
    `Added To ${capitalize(collectionType)}!`,
  view: 'View'
}

/**
 * Inverted button hierarchy: the safe action ("Don't Add") is primary,
 * the user's prior intent ("Add Anyway") is secondary. ResponsiveModal's
 * confirmation variant renders confirm on the right (primary) and cancel
 * on the left (secondary), which matches the original UX when we map:
 *
 *   confirmText: "Don't Add"   → onConfirm = onClose
 *   cancelText:  "Add Anyway"  → onCancel  = handleAdd
 *
 * Backdrop tap / ESC still dismiss without adding.
 */
export const DuplicateAddConfirmationModal = () => {
  const dispatch = useDispatch()
  const { toast } = useContext(ToastContext)
  const playlistId = useSelector(getPlaylistId)
  const trackId = useSelector(getTrackId)
  const { data: partialPlaylist } = useCollection(playlistId, {
    select: (collection) =>
      pick(collection, 'is_album', 'playlist_name', 'permalink')
  })
  const { is_album, playlist_name, permalink } = partialPlaylist ?? {}
  const { data: accountHandle } = useCurrentAccountUser({
    select: (data) => data?.handle
  })
  const [isOpen, setIsOpen] = useModalState('DuplicateAddConfirmation')
  const collectionType = is_album ? 'album' : 'playlist'

  const onClose = useCallback(() => {
    setIsOpen(false)
  }, [setIsOpen])

  const handleAdd = useCallback(() => {
    if (trackId && playlistId) {
      dispatch(addTrackToPlaylist(trackId, playlistId))
      if (accountHandle) {
        toast(
          <ToastLinkContent
            text={messages.addedToast(collectionType)}
            linkText={messages.view}
            link={collectionPage(
              accountHandle,
              playlist_name,
              playlistId,
              permalink,
              is_album
            )}
          />
        )
      } else {
        toast(messages.addedToast(collectionType))
      }
    }
    onClose()
  }, [
    trackId,
    playlistId,
    onClose,
    dispatch,
    accountHandle,
    toast,
    collectionType,
    playlist_name,
    permalink,
    is_album
  ])

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={messages.title}
      size='s'
      confirmation={{
        description: fillString(
          messages.description(collectionType),
          playlist_name ? ` "${playlist_name}"` : ''
        ),
        confirmText: messages.cancel, // "Don't Add" — visually primary
        onConfirm: onClose,
        cancelText: messages.add, // "Add Anyway" — visually secondary
        onCancel: handleAdd
      }}
    />
  )
}
