import { MouseEvent, useCallback, useEffect, useMemo } from 'react'

import {
  useToggleFavoriteTrack,
  useCurrentUserId,
  useTrack,
  useUser
} from '@audius/common/api'
import { useGatedContentAccess } from '@audius/common/hooks'
import {
  ID,
  FavoriteSource,
  ShareSource,
  RepostSource
} from '@audius/common/models'
import {
  gatedContentActions,
  gatedContentSelectors,
  tracksSocialActions,
  shareModalUIActions,
  playbackSelectors,
  CommonState
} from '@audius/common/store'
import { Genre, formatLineupTileDuration } from '@audius/common/utils'
import {
  IconVolumeLevel2 as IconVolume,
  Text,
  Flex,
  IconButton,
  IconKebabHorizontal
} from '@audius/harmony'
import cn from 'classnames'
import { useDispatch, useSelector } from 'react-redux'

import { useModalState } from 'common/hooks/useModalState'
import { Draggable } from 'components/dragndrop'
import { TextLink, UserLink } from 'components/link'
import Menu from 'components/menu/Menu'
import { OwnProps as TrackMenuProps } from 'components/menu/TrackMenu'
import Skeleton from 'components/skeleton/Skeleton'
import { TrackTileProps, TrackTileSize } from 'components/track/types'
import { useIsMobile } from 'hooks/useIsMobile'
import { DragDropKind } from 'store/dragndrop/slice'
import { fullTrackPage } from 'utils/route'
import { useIsDarkMode, useIsMatrix } from 'utils/theme/theme'

import { TrackDogEar } from '../TrackDogEar'
import { TrackTileStats } from '../TrackTileStats'
import { getTrackWithFallback, getUserWithFallback } from '../helpers'
import { messages } from '../trackTileMessages'

import BottomButtons from './BottomButtons'
import styles from './TrackTile.module.css'
import TrackTileArt from './TrackTileArt'

const { setLockedContentId } = gatedContentActions
const { getGatedContentStatusMap } = gatedContentSelectors
const { getTrackId, getPlaying, getBuffering } = playbackSelectors
const { requestOpen: requestOpenShareModal } = shareModalUIActions
const { repostTrack, undoRepostTrack } = tracksSocialActions

type ConnectedTrackTileProps = Omit<
  TrackTileProps,
  | 'title'
  | 'userId'
  | 'genre'
  | 'duration'
  | 'artistName'
  | 'artistHandle'
  | 'repostCount'
  | 'saveCount'
  | 'commentCount'
  | 'followeeReposts'
  | 'followeeSaves'
  | 'hasCurrentUserReposted'
  | 'hasCurrentUserSaved'
  | 'artistIsVerified'
  | 'isPlaying'
> & { dragKind?: DragDropKind }

export const TrackTile = ({
  id,
  index,
  order,
  size,
  ordered,
  trackTileStyles,
  togglePlay,
  isLoading,
  hasLoaded,
  isTrending,
  isActive,
  variant,
  containerClassName,
  isFeed = false,
  source,
  noShimmer,
  dragKind
}: ConnectedTrackTileProps) => {
  const dispatch = useDispatch()
  const isMobile = useIsMobile()

  const { data: track } = useTrack(id)
  const { data: partialUser } = useUser(track?.owner_id, {
    select: (user) => ({
      user_id: user?.user_id,
      handle: user?.handle,
      name: user?.name,
      is_verified: user?.is_verified,
      is_deactivated: user?.is_deactivated,
      artist_pick_track_id: user?.artist_pick_track_id
    })
  })
  const { user_id, handle, name, is_deactivated } =
    getUserWithFallback(partialUser) ?? {}
  const isTrackActive = useSelector(
    (state: CommonState) => getTrackId(state) === id
  )
  const isTrackPlaying = useSelector(
    (state: CommonState) => getTrackId(state) === id && getPlaying(state)
  )
  const isTrackBuffering = useSelector(
    (state: CommonState) => getTrackId(state) === id && getBuffering(state)
  )
  const { data: currentUserId } = useCurrentUserId()
  const darkMode = useIsDarkMode()
  const isMatrixMode = useIsMatrix()

  const handleRepostTrack = useCallback(
    (trackId: ID, isFeed: boolean) => {
      dispatch(repostTrack(trackId, RepostSource.TILE, isFeed))
    },
    [dispatch]
  )

  const handleUnrepostTrack = useCallback(
    (trackId: ID) => {
      dispatch(undoRepostTrack(trackId, RepostSource.TILE))
    },
    [dispatch]
  )

  const trackWithFallback = getTrackWithFallback(track)
  const {
    is_delete,
    is_unlisted,
    is_stream_gated: isStreamGated,
    stream_conditions: streamConditions,
    track_id,
    title,
    genre,
    permalink,
    has_current_user_reposted,
    has_current_user_saved,
    _co_sign,
    duration,
    preview_cid,
    ddex_app: ddexApp
  } = trackWithFallback

  const isOwner = user_id === currentUserId

  const { isFetchingNFTAccess, hasStreamAccess } =
    useGatedContentAccess(trackWithFallback)
  const loading = isLoading || isFetchingNFTAccess

  const toggleRepost = useCallback(
    (trackId: ID) => {
      if (has_current_user_reposted) {
        handleUnrepostTrack(trackId)
      } else {
        handleRepostTrack(trackId, isFeed)
      }
    },
    [has_current_user_reposted, handleUnrepostTrack, handleRepostTrack, isFeed]
  )

  const overflowMenu = useMemo<Omit<TrackMenuProps, 'children'>>(
    () => ({
      extraMenuItems: [],
      handle,
      includeAddToPlaylist: !is_unlisted || isOwner,
      includeAddToAlbum: isOwner && !ddexApp,
      includeArtistPick: isOwner,
      includeEdit: isOwner,
      ddexApp: track?.ddex_app,
      includeFavorite: hasStreamAccess,
      includeRepost: hasStreamAccess,
      includeShare: true,
      includeTrackPage: true,
      isDeleted: is_delete || is_deactivated,
      isFavorited: has_current_user_saved,
      isOwner,
      isReposted: has_current_user_reposted,
      isUnlisted: is_unlisted,
      trackId: track_id,
      trackTitle: title,
      genre: genre as Genre,
      trackPermalink: permalink,
      type: 'track'
    }),
    [
      ddexApp,
      genre,
      handle,
      hasStreamAccess,
      has_current_user_reposted,
      has_current_user_saved,
      isOwner,
      is_delete,
      is_deactivated,
      is_unlisted,
      permalink,
      title,
      track?.ddex_app,
      track_id
    ]
  )

  const renderOverflowMenu = useCallback(() => {
    return (
      <Menu menu={overflowMenu}>
        {(ref, triggerPopup) => (
          <IconButton
            ref={ref}
            aria-label='More'
            icon={IconKebabHorizontal}
            color='subdued'
            size='l'
            onClick={(e) => {
              e.stopPropagation()
              triggerPopup()
            }}
          />
        )}
      </Menu>
    )
  }, [overflowMenu])

  const toggleSaveTrack = useToggleFavoriteTrack({
    trackId: id as number,
    source: FavoriteSource.TILE
  })

  const [, setModalVisibility] = useModalState('LockedContent')
  const gatedTrackStatusMap = useSelector(getGatedContentStatusMap)
  const gatedTrackId = isStreamGated ? id : null
  const gatedTrackStatus = gatedTrackId
    ? gatedTrackStatusMap[gatedTrackId]
    : undefined

  const onToggleRepost = useCallback(() => toggleRepost(id), [toggleRepost, id])

  const onClickShare = useCallback(
    (e?: MouseEvent) => {
      e?.stopPropagation()
      dispatch(
        requestOpenShareModal({
          type: 'track',
          trackId: id,
          source: ShareSource.TILE
        })
      )
    },
    [dispatch, id]
  )

  const noopOverflow = useCallback(() => {}, [])

  const openLockedContentModal = useCallback(() => {
    if (gatedTrackId) {
      dispatch(setLockedContentId({ id: gatedTrackId }))
      setModalVisibility(true)
    }
  }, [gatedTrackId, dispatch, setModalVisibility])

  const onClickPill = useCallback(() => {
    if (gatedTrackId && !hasStreamAccess) {
      openLockedContentModal()
    }
  }, [gatedTrackId, hasStreamAccess, openLockedContentModal])

  useEffect(() => {
    if (!loading) {
      hasLoaded?.(index)
    }
  }, [hasLoaded, index, loading])

  const fadeIn = {
    [styles.show]: !loading,
    [styles.hide]: loading
  }

  const handleClick = useCallback(() => {
    if (loading) return

    if (gatedTrackId && !hasStreamAccess && !preview_cid) {
      openLockedContentModal()
      return
    }

    togglePlay(id)
  }, [
    loading,
    togglePlay,
    id,
    gatedTrackId,
    hasStreamAccess,
    preview_cid,
    openLockedContentModal
  ])

  const handleArtworkClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      handleClick()
    },
    [handleClick]
  )

  const isReadonly = variant === 'readonly'
  const tileOrder =
    order ?? (ordered && index !== undefined ? index + 1 : undefined)
  const artworkActionLabel =
    gatedTrackId && !hasStreamAccess && !preview_cid
      ? `Unlock ${title || 'track'}`
      : `${isTrackPlaying ? 'Pause' : 'Play'} ${title || 'track'}`

  if (is_delete || is_deactivated) return null

  const tileContent = (
    <div
      className={cn(
        styles.container,
        { [styles.readonly]: isReadonly },
        containerClassName
      )}
      css={{ width: '100%', containerType: 'inline-size' }}
    >
      <TrackDogEar trackId={track_id} hideUnlocked />
      <div className={styles.mainContent} onClick={handleClick}>
        <div className={cn(styles.topRight, styles.statText)}>
          <Flex
            gap='s'
            alignItems='center'
            className={cn(styles.duration, fadeIn)}
          >
            <Text size='xs' color='subdued'>
              {duration
                ? formatLineupTileDuration(
                    duration,
                    genre === Genre.Podcasts || genre === Genre.Audiobooks
                  )
                : null}
            </Text>
          </Flex>
        </div>
        <div className={styles.metadata}>
          <button
            type='button'
            className={styles.albumArtButton}
            aria-label={artworkActionLabel}
            disabled={loading}
            onClick={handleArtworkClick}
          >
            <TrackTileArt
              id={track_id}
              isTrack
              isPlaying={isTrackPlaying}
              isBuffering={isTrackBuffering}
              showSkeleton={loading}
              noShimmer={noShimmer}
              coSign={_co_sign}
              label={`${title} by ${name}`}
              artworkIconClassName={styles.artworkIcon}
            />
          </button>
          <Flex
            direction='column'
            justifyContent='center'
            gap='xs'
            pv='xs'
            flex='1 1 0'
            css={{ minWidth: 0, overflow: 'hidden' }}
          >
            <TextLink
              to={permalink}
              textVariant='title'
              isActive={isTrackActive || isActive}
              applyHoverStylesToInnerSvg
              className={styles.trackTitleLink}
              aria-label={`View track: ${title || messages.loading}`}
            >
              <Text ellipses>{title || messages.loading}</Text>
              {isTrackPlaying ? <IconVolume size='m' /> : null}
              {loading ? (
                <Skeleton
                  className={styles.skeleton}
                  height='20px'
                  noShimmer={noShimmer}
                />
              ) : null}
            </TextLink>
            <UserLink
              userId={user_id}
              badgeSize='xs'
              popover={!isMobile}
              css={{ marginTop: '-4px' }}
            >
              {loading ? (
                <>
                  <Text>{messages.loading}</Text>
                  <Skeleton
                    className={styles.skeleton}
                    height='20px'
                    noShimmer={noShimmer}
                  />
                </>
              ) : null}
            </UserLink>
          </Flex>
        </div>
        <TrackTileStats
          trackId={track_id}
          rankIndex={isTrending && tileOrder !== undefined ? index : undefined}
          size={TrackTileSize.SMALL}
          isLoading={loading}
          noShimmer={noShimmer}
        />
        {isReadonly ? null : (
          <BottomButtons
            hasSaved={has_current_user_saved}
            hasReposted={has_current_user_reposted}
            toggleRepost={onToggleRepost}
            toggleSave={toggleSaveTrack}
            onShare={onClickShare}
            onClickOverflow={noopOverflow}
            renderOverflow={renderOverflowMenu}
            onClickGatedUnlockPill={onClickPill}
            isOwner={isOwner}
            readonly={isReadonly}
            isLoading={loading}
            isUnlisted={is_unlisted}
            hasStreamAccess={hasStreamAccess}
            streamConditions={streamConditions}
            gatedTrackStatus={gatedTrackStatus}
            isDarkMode={darkMode}
            isMatrixMode={isMatrixMode}
            isTrack
            contentId={track_id}
            contentType='track'
          />
        )}
      </div>
    </div>
  )

  if (isMobile || isReadonly || isStreamGated) return tileContent

  return (
    <Draggable
      asChild
      text={title}
      kind={dragKind ?? 'track'}
      id={track_id}
      isOwner={isOwner}
      isDisabled={loading}
      link={fullTrackPage(permalink)}
    >
      {tileContent}
    </Draggable>
  )
}
