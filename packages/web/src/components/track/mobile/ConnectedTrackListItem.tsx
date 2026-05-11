import { memo, useCallback, useMemo } from 'react'

import { useCurrentUserId, useTrack, useUser } from '@audius/common/api'
import { ID, RepostSource } from '@audius/common/models'
import {
  gatedContentActions,
  gatedContentSelectors,
  tracksSocialActions
} from '@audius/common/store'
import { Genre } from '@audius/common/utils'
import { IconButton, IconKebabHorizontal } from '@audius/harmony'
import { connect, useDispatch } from 'react-redux'
import { Dispatch } from 'redux'

import { useModalState } from 'common/hooks/useModalState'
import Menu from 'components/menu/Menu'
import { OwnProps as TrackMenuProps } from 'components/menu/TrackMenu'
import TrackListItem, {
  TrackItemAction,
  TrackListItemProps
} from 'components/track/mobile/TrackListItem'
import { useRequiresAccountOnClick } from 'hooks/useRequiresAccount'
import { AppState } from 'store/types'
import { push } from 'utils/navigation'

const { setLockedContentId } = gatedContentActions

const { getGatedContentStatusMap } = gatedContentSelectors

const { repostTrack, undoRepostTrack } = tracksSocialActions

type OwnProps = TrackListItemProps
type StateProps = ReturnType<typeof mapStateToProps>
type DispatchProps = ReturnType<typeof mapDispatchToProps>

type ConnectedTrackListItemProps = OwnProps & StateProps & DispatchProps

const ConnectedTrackListItem = (props: ConnectedTrackListItemProps) => {
  const {
    ddexApp,
    hasStreamAccess,
    isUnlisted,
    isLocked,
    isReposted,
    isSaved,
    trackId
  } = props
  const { data: currentUserId } = useCurrentUserId()
  const { data: partialTrack } = useTrack(trackId, {
    select: (track) => {
      return {
        ownerId: track?.owner_id,
        genre: track?.genre
      }
    }
  })
  const { ownerId, genre } = partialTrack ?? {}
  const { data: user } = useUser(ownerId)
  const dispatch = useDispatch()
  const [, setLockedContentVisibility] = useModalState('LockedContent')
  const openLockedContentModal = useCallback(() => {
    dispatch(setLockedContentId({ id: trackId }))
    setLockedContentVisibility(true)
  }, [dispatch, trackId, setLockedContentVisibility])

  const isOwner = user?.user_id === currentUserId
  const overflowMenu = useMemo<Omit<TrackMenuProps, 'children'>>(
    () => ({
      extraMenuItems: [],
      handle: user?.handle ?? '',
      includeAddToPlaylist: !isUnlisted || isOwner,
      includeAddToAlbum: isOwner && !ddexApp,
      includeArtistPick: false,
      includeDelete: false,
      includeEdit: false,
      includeFavorite: !isLocked && !isUnlisted && hasStreamAccess,
      includeRepost: !isLocked && !isUnlisted && hasStreamAccess,
      includeShare: false,
      includeTrackPage: true,
      includeAlbumPage: true,
      includePlayNext: false,
      includeAddToQueue: false,
      isDeleted: props.isDeleted,
      isFavorited: isSaved,
      isOwner,
      isOwnerDeactivated: user?.is_deactivated,
      isReposted,
      isUnlisted,
      trackId,
      trackTitle: props.trackTitle,
      genre: genre as Genre,
      trackPermalink: props.permalink,
      ddexApp,
      type: 'track'
    }),
    [
      ddexApp,
      genre,
      hasStreamAccess,
      isLocked,
      isOwner,
      isReposted,
      isSaved,
      isUnlisted,
      props.isDeleted,
      props.permalink,
      props.trackTitle,
      trackId,
      user?.handle,
      user?.is_deactivated
    ]
  )

  const renderOverflowMenu = useCallback(
    () => (
      <Menu menu={overflowMenu}>
        {(ref, triggerPopup) => (
          <IconButton
            ref={ref}
            aria-label='more actions'
            icon={IconKebabHorizontal}
            color='subdued'
            size='m'
            onClick={(e) => {
              e.stopPropagation()
              triggerPopup()
            }}
          />
        )}
      </Menu>
    ),
    [overflowMenu]
  )

  const onClickGatedUnlockPill = useRequiresAccountOnClick(() => {
    if (trackId && !hasStreamAccess) {
      openLockedContentModal()
    }
  }, [trackId, hasStreamAccess, openLockedContentModal])

  return (
    <TrackListItem
      {...props}
      renderOverflow={renderOverflowMenu}
      onClickGatedUnlockPill={onClickGatedUnlockPill}
      trackItemAction={TrackItemAction.Overflow}
    />
  )
}

function mapStateToProps(state: AppState, ownProps: OwnProps) {
  const id = ownProps.trackId
  return {
    gatedContentStatus: id ? getGatedContentStatusMap(state)[id] : undefined
  }
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    goToRoute: (route: string) => dispatch(push(route)),
    repostTrack: (trackId: ID) =>
      dispatch(repostTrack(trackId, RepostSource.TRACK_LIST)),
    unrepostTrack: (trackId: ID) =>
      dispatch(undoRepostTrack(trackId, RepostSource.TRACK_LIST))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(memo(ConnectedTrackListItem))
