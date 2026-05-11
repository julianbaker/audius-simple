import { useContext, useMemo } from 'react'

import { useCollection, useUserByHandle } from '@audius/common/api'
import {
  ShareSource,
  RepostSource,
  FavoriteSource
} from '@audius/common/models'
import {
  cacheCollectionsActions,
  playbackActions,
  playbackSelectors,
  QueueSource,
  shareModalUIActions,
  collectionsSocialActions as socialActions,
  deletePlaylistConfirmationModalUIActions
} from '@audius/common/store'
import { route } from '@audius/common/utils'
import { PopupMenuItem } from '@audius/harmony'
import { connect, useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { Dispatch } from 'redux'

import { ToastContext } from 'components/toast/ToastContext'
import { AppState } from 'store/types'
import { push } from 'utils/navigation'

const { requestOpen: requestOpenShareModal } = shareModalUIActions
const { requestOpen: requestOpenDeletePlaylist } =
  deletePlaylistConfirmationModalUIActions
const { publishPlaylist } = cacheCollectionsActions
const { profilePage, collectionPage } = route

type PlaylistId = number

export type OwnProps = {
  children: (items: PopupMenuItem[]) => JSX.Element
  extraMenuItems?: PopupMenuItem[]
  handle: string
  includeEdit?: boolean
  includeDelete?: boolean
  includeFavorite?: boolean
  includePublish?: boolean
  includeRepost?: boolean
  includeShare?: boolean
  includeVisitPage?: boolean
  includeVisitArtistPage?: boolean
  includePlayNext?: boolean
  includeAddToQueue?: boolean
  isFavorited?: boolean
  isOwner?: boolean
  isPublished?: boolean
  isPublic?: boolean
  isReposted?: boolean
  onClose?: () => void
  onRepost?: () => void
  onShare?: () => void
  playlistId: PlaylistId
  playlistName: string
  ddexApp?: string | null
  type: 'album' | 'playlist'
  permalink: string
}

export type CollectionMenuProps = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>

const messages = {
  playNext: 'Play Next',
  addToQueue: 'Add to Queue',
  willPlayNext: (count: number) =>
    count === 1 ? 'Will play next' : `${count} songs will play next`,
  addedToQueue: (count: number) =>
    count === 1 ? 'Added to queue' : `Added ${count} songs to queue`
}

const CollectionMenu = ({
  handle = '',
  isFavorited = false,
  isReposted = false,
  includeFavorite = true,
  includeVisitPage = true,
  includePlayNext = true,
  includeAddToQueue = true,
  ...props
}: CollectionMenuProps) => {
  const {
    type,
    playlistName,
    ddexApp,
    playlistId,
    isOwner,
    isPublished,
    includeDelete,
    includeEdit,
    includePublish,
    includeShare,
    includeRepost,
    includeVisitArtistPage = true,
    isPublic,
    onShare,
    goToRoute,
    permalink,
    shareCollection,
    deletePlaylist,
    publishPlaylist,
    saveCollection,
    unsaveCollection,
    repostCollection,
    undoRepostCollection,
    onRepost,
    extraMenuItems
  } = props

  const { data: isArtist } = useUserByHandle(
    handle ? handle.toLowerCase() : undefined,
    { select: (user) => user && user.track_count > 0 }
  )

  const dispatch = useDispatch()
  const { toast } = useContext(ToastContext)
  const playbackIndex = useSelector(playbackSelectors.getPlaybackIndex)
  const { data: collectionTrackIds } = useCollection(playlistId, {
    select: (c) => c?.playlist_contents?.track_ids?.map((t) => t.track) ?? []
  })

  const navigate = useNavigate()

  const collectionTracks = useMemo(
    () =>
      (collectionTrackIds ?? []).map((trackId) => ({
        trackId,
        source: QueueSource.COLLECTION_TRACKS
      })),
    [collectionTrackIds]
  )

  const menu = useMemo(() => {
    const routePage = collectionPage
    const shareMenuItem = {
      text: 'Share',
      onClick: () => {
        shareCollection(playlistId)
        onShare?.()
      }
    }

    const typeName = type === 'album' ? 'Album' : 'Playlist'
    const favoriteMenuItem = {
      text: isFavorited ? `Unfavorite ${typeName}` : `Favorite ${typeName}`,
      onClick: () =>
        isFavorited ? unsaveCollection(playlistId) : saveCollection(playlistId)
    }

    const repostMenuItem = {
      text: isReposted ? 'Undo Repost' : 'Repost',
      onClick: () => {
        if (isReposted) {
          undoRepostCollection(playlistId)
        } else {
          repostCollection(playlistId)
          if (onRepost) onRepost()
        }
      }
    }

    const artistPageMenuItem = {
      text: `Visit ${isArtist ? 'Artist' : 'User'} Page`,
      onClick: () => goToRoute(profilePage(handle))
    }

    const playlistPageMenuItem = {
      text: `Visit ${typeName} Page`,
      onClick: () =>
        goToRoute(
          routePage(
            handle,
            playlistName,
            playlistId,
            permalink,
            type === 'album'
          )
        )
    }

    const editCollectionMenuItem = {
      text: `Edit ${typeName}`,
      onClick: () => navigate(`${permalink}/edit`)
    }

    const publishCollectionMenuItem = {
      text: `Publish ${typeName}`,
      onClick: () => publishPlaylist(playlistId)
    }

    const deleteCollectionMenuItem = {
      text: `Delete ${typeName}`,
      onClick: () => deletePlaylist(playlistId),
      destructive: true
    }

    const playCollectionNextMenuItem = {
      text: messages.playNext,
      onClick: () => {
        if (collectionTracks.length === 0) return
        const insertIndex = playbackIndex >= 0 ? playbackIndex + 1 : 0
        dispatch(
          playbackActions.addToQueue({
            tracks: collectionTracks,
            index: insertIndex
          })
        )
        toast(messages.willPlayNext(collectionTracks.length))
      }
    }

    const addCollectionToQueueMenuItem = {
      text: messages.addToQueue,
      onClick: () => {
        if (collectionTracks.length === 0) return
        dispatch(playbackActions.addToQueue({ tracks: collectionTracks }))
        toast(messages.addedToQueue(collectionTracks.length))
      }
    }

    const menu: { items: PopupMenuItem[] } = { items: [] }

    if (
      includePlayNext &&
      collectionTracks.length > 0 &&
      (isPublic || isOwner)
    ) {
      menu.items.push(playCollectionNextMenuItem)
    }
    if (
      includeAddToQueue &&
      collectionTracks.length > 0 &&
      (isPublic || isOwner)
    ) {
      menu.items.push(addCollectionToQueueMenuItem)
    }
    if (includeShare) menu.items.push(shareMenuItem)
    if (!isOwner) {
      if (includeRepost) menu.items.push(repostMenuItem)
      if (includeFavorite) menu.items.push(favoriteMenuItem)
    }
    if (includeVisitPage) {
      menu.items.push(playlistPageMenuItem)
    }
    if (includeVisitArtistPage) {
      menu.items.push(artistPageMenuItem)
    }
    if (extraMenuItems && extraMenuItems.length > 0) {
      menu.items = menu.items.concat(extraMenuItems)
    }
    if (includeEdit && isOwner && !ddexApp) {
      menu.items.push(editCollectionMenuItem)
    }
    if (includePublish && isOwner && !isPublished && type === 'playlist') {
      menu.items.push(publishCollectionMenuItem)
    }
    if (includeDelete && isOwner && !ddexApp && type === 'playlist') {
      menu.items.push(deleteCollectionMenuItem)
    }

    return menu
  }, [
    collectionTracks,
    ddexApp,
    dispatch,
    goToRoute,
    handle,
    includeAddToQueue,
    includeDelete,
    includeEdit,
    includeFavorite,
    includePlayNext,
    includePublish,
    includeRepost,
    includeShare,
    includeVisitArtistPage,
    includeVisitPage,
    isArtist,
    isFavorited,
    isOwner,
    isPublished,
    isPublic,
    isReposted,
    navigate,
    onRepost,
    onShare,
    permalink,
    playbackIndex,
    playlistId,
    playlistName,
    publishPlaylist,
    deletePlaylist,
    repostCollection,
    saveCollection,
    shareCollection,
    toast,
    type,
    undoRepostCollection,
    unsaveCollection,
    extraMenuItems
  ])

  return props.children(menu.items)
}

function mapStateToProps(state: AppState, props: OwnProps) {
  return {}
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    goToRoute: (route: string) => dispatch(push(route)),
    shareCollection: (playlistId: PlaylistId) =>
      dispatch(
        requestOpenShareModal({
          type: 'collection',
          collectionId: playlistId,
          source: ShareSource.OVERFLOW
        })
      ),
    saveCollection: (playlistId: PlaylistId) =>
      dispatch(
        socialActions.saveCollection(playlistId, FavoriteSource.OVERFLOW)
      ),
    deletePlaylist: (playlistId: PlaylistId) =>
      dispatch(requestOpenDeletePlaylist({ playlistId })),
    publishPlaylist: (playlistId: PlaylistId) =>
      dispatch(publishPlaylist(playlistId)),
    unsaveCollection: (playlistId: PlaylistId) =>
      dispatch(
        socialActions.unsaveCollection(playlistId, FavoriteSource.OVERFLOW)
      ),
    repostCollection: (playlistId: PlaylistId) =>
      dispatch(
        socialActions.repostCollection(playlistId, RepostSource.OVERFLOW)
      ),
    undoRepostCollection: (playlistId: PlaylistId) =>
      dispatch(
        socialActions.undoRepostCollection(playlistId, RepostSource.OVERFLOW)
      )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CollectionMenu)
