import { memo, ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'

import {
  getProfileRepostsQueryKey,
  getProfileTracksQueryKey,
  useMutedUsers,
  useProfileReposts,
  useProfileTracks,
  useUserHasRemixContest
} from '@audius/common/api'
import { useMuteUser } from '@audius/common/context'
import { commentsMessages } from '@audius/common/messages'
import { Status } from '@audius/common/models'
import { ProfilePageTabs } from '@audius/common/store'
import { route } from '@audius/common/utils'
import {
  Box,
  Button,
  Divider,
  Flex,
  Hint,
  IconAlbum,
  IconNote,
  IconPlaylists,
  IconQuestionCircle,
  IconRepost as IconReposts,
  IconSort,
  IconTrophy,
  PopupMenu,
  Text
} from '@audius/harmony'
import { Id } from '@audius/sdk'

import { ConfirmationModal } from 'components/confirmation-modal'
import CoverPhoto from 'components/cover-photo/CoverPhoto'
import { TrackLineup } from 'components/lineup/TrackLineup'
import { LineupVariant } from 'components/lineup/types'
import NavBanner from 'components/nav-banner/NavBanner'
import { FlushPageContainer } from 'components/page/FlushPageContainer'
import Page from 'components/page/Page'
import { Tab, TabList } from 'components/tabs'
import UploadChip from 'components/upload/UploadChip'
import { useIsContainerNarrow } from 'hooks/useIsContainerNarrow'
import { BlockUserConfirmationModal } from 'pages/chat-page/components/BlockUserConfirmationModal'
import { UnblockUserConfirmationModal } from 'pages/chat-page/components/UnblockUserConfirmationModal'
import { usePreventOffscreenFocus } from 'pages/profile-page/usePreventOffscreenFocus'
import { useProfilePage } from 'pages/profile-page/useProfilePage'
import { getUserPageContext } from 'ssr/metaTags'

import { DeactivatedProfileTombstone } from './DeactivatedProfileTombstone'
import { ProfileBio } from './ProfileBio'
import { ProfileEditModal } from './ProfileEditModal'
import styles from './ProfilePage.module.css'
import { ProfilePageHeader } from './ProfilePageHeader'
import { ProfileSidebar } from './ProfileSidebar'
import { AlbumsTab } from './desktop/AlbumsTab'
import { ContestsTab } from './desktop/ContestsTab'
import { EmptyTab } from './desktop/EmptyTab'
import { PlaylistsTab } from './desktop/PlaylistsTab'

const { profilePage } = route

type ProfilePageProps = {
  containerRef: RefObject<HTMLDivElement>
}

/**
 * Unified profile page — replaces the previous desktop/mobile fork.
 *
 * Layout shape (everything lives inside the page's `@container page`
 * context provided by FlushPageContainer):
 *
 *   ┌────────── Cover Photo ──────────┐
 *   │                                  │
 *   ┌──────────────────────────────────┐
 *   │  PFP   Name + handle + stats   ⋯  │   ← ProfilePageHeader (single row)
 *   ├──────────────────────────────────┤
 *   │  Bio · social · location          │   ← ProfileBio ("About" block)
 *   ├──────────────────────────────────┤
 *   │  Tabs                  [sort ▾]   │   ← NavBanner
 *   ├──────────────────────────────────┤
 *   │  Lineup content       │ Sidebar   │   ← Body + discovery widgets
 *   └──────────────────────────────────┘
 *
 * Container queries handle:
 *  - PFP straddle / size (see ProfilePageHeader.module.css)
 *  - Sidebar collapse below 1024px (see ProfilePage.module.css)
 *  - Action button wrapping at narrow widths
 *
 * Edit flow lives in `<ProfileEditModal>` — opens on the Edit button.
 * No more in-place `<Mask>` overlay or full-screen replacement.
 */
const ProfilePage = ({ containerRef }: ProfilePageProps) => {
  const profileFocusRootRef = useRef<HTMLDivElement>(null)
  const tabContainerRef = useRef<HTMLDivElement>(null)
  usePreventOffscreenFocus(profileFocusRootRef)

  const {
    profile,
    status,
    accountUserId,
    isArtist,
    isOwner,
    userId,
    handle,
    verified,
    created,
    name,
    bio,
    location,
    twitterHandle,
    instagramHandle,
    tikTokHandle,
    twitterVerified,
    instagramVerified,
    tikTokVerified,
    website,
    hasProfilePicture,
    mode,
    activeTab,
    dropdownDisabled,
    profilePictureSizes,
    updatedCoverPhoto,
    updatedProfilePicture,
    tracksLineupOrder,
    handleLower,
    editMode,
    areArtistRecommendationsVisible,
    showBlockUserConfirmationModal,
    showUnblockUserConfirmationModal,
    showMuteUserConfirmationModal,
    hasMadeEdit,
    isBlocked,
    canCreateChat,
    changeTab,
    onSortByRecent,
    onSortByPopular,
    onFollow,
    onUnfollow,
    onShare,
    onEdit,
    onSave,
    onCancel,
    updateProfilePicture,
    updateName,
    updateBio,
    updateLocation,
    updateTwitterHandle,
    updateInstagramHandle,
    updateTikTokHandle,
    updateWebsite,
    updateCoverPhoto,
    didChangeTabsFrom,
    onCloseArtistRecommendations,
    onMessage,
    onBlock,
    onUnblock,
    onMute,
    onCloseBlockUserConfirmationModal,
    onCloseUnblockUserConfirmationModal,
    onCloseMuteUserConfirmationModal
  } = useProfilePage()
  const isDeactivated = !!profile?.is_deactivated

  // --- Lineups -----------------------------------------------------------
  const tracksArgs = useMemo(
    () => ({ handle: handleLower ?? '', sort: tracksLineupOrder }),
    [handleLower, tracksLineupOrder]
  )
  const artistTracksQuery = useProfileTracks(tracksArgs, {
    enabled: !!handleLower
  })
  const tracksQuerySource = useMemo(
    () => ({
      queryKey: [...getProfileTracksQueryKey(tracksArgs)] as unknown[]
    }),
    [tracksArgs]
  )

  const repostsArgs = useMemo(
    () => ({ handle: handleLower ?? '' }),
    [handleLower]
  )
  const userRepostsQuery = useProfileReposts(repostsArgs, {
    enabled: !!handleLower
  })
  const repostsQuerySource = useMemo(
    () => ({
      queryKey: [...getProfileRepostsQueryKey(repostsArgs)] as unknown[]
    }),
    [repostsArgs]
  )

  const profileBasePath = profilePage(handle)

  // --- Tabs --------------------------------------------------------------
  // Hide tabs whose underlying lineup is empty. The default tab always
  // shows (Tracks for artists, Reposts for users) so the page always has
  // a valid landing surface — even an empty default still renders its
  // EmptyTab body, which is the right "nothing here yet" treatment.
  const { hasContest: profileHasContest } = useUserHasRemixContest(
    isArtist ? userId : null
  )
  const showContestsTab = profileHasContest
  const showAlbumsTab = (profile?.album_count ?? 0) > 0
  const showPlaylistsTab = (profile?.playlist_count ?? 0) > 0
  const showRepostsTab = (profile?.repost_count ?? 0) > 0
  const visibleTabCount = isArtist
    ? 1 +
      Number(showAlbumsTab) +
      Number(showPlaylistsTab) +
      Number(showRepostsTab) +
      Number(showContestsTab)
    : 1 + Number(showPlaylistsTab)
  const shouldHideTabText = useIsContainerNarrow(
    tabContainerRef,
    visibleTabCount <= 2 ? 260 : visibleTabCount === 3 ? 352 : 480
  )

  const defaultTab = isArtist ? ProfilePageTabs.TRACKS : ProfilePageTabs.REPOSTS
  const rawTab = activeTab ?? defaultTab
  // Fall back to default when the current tab has been hidden because it
  // is empty. Same pattern as the existing contests-tab fallback.
  const tabIsHidden =
    (rawTab === ProfilePageTabs.CONTESTS && !showContestsTab) ||
    (rawTab === ProfilePageTabs.ALBUMS && !showAlbumsTab) ||
    (rawTab === ProfilePageTabs.PLAYLISTS && !showPlaylistsTab) ||
    (rawTab === ProfilePageTabs.REPOSTS && !showRepostsTab && isArtist)
  const currentTab = tabIsHidden ? defaultTab : rawTab

  const tabs = profile ? (
    isArtist ? (
      <TabList onTabClick={(key) => didChangeTabsFrom('', key)}>
        <Tab
          to={`${profileBasePath}/tracks`}
          icon={<IconNote />}
          hideText={shouldHideTabText}
        >
          {ProfilePageTabs.TRACKS}
        </Tab>
        {showAlbumsTab ? (
          <Tab
            to={`${profileBasePath}/albums`}
            icon={<IconAlbum />}
            hideText={shouldHideTabText}
          >
            {ProfilePageTabs.ALBUMS}
          </Tab>
        ) : null}
        {showPlaylistsTab ? (
          <Tab
            to={`${profileBasePath}/playlists`}
            icon={<IconPlaylists />}
            hideText={shouldHideTabText}
          >
            {ProfilePageTabs.PLAYLISTS}
          </Tab>
        ) : null}
        {showRepostsTab ? (
          <Tab
            to={`${profileBasePath}/reposts`}
            icon={<IconReposts />}
            hideText={shouldHideTabText}
          >
            {ProfilePageTabs.REPOSTS}
          </Tab>
        ) : null}
        {showContestsTab ? (
          <Tab
            to={`${profileBasePath}/contests`}
            icon={<IconTrophy />}
            hideText={shouldHideTabText}
          >
            {ProfilePageTabs.CONTESTS}
          </Tab>
        ) : null}
      </TabList>
    ) : (
      <TabList onTabClick={(key) => didChangeTabsFrom('', key)}>
        <Tab
          to={`${profileBasePath}/reposts`}
          icon={<IconReposts />}
          hideText={shouldHideTabText}
        >
          {ProfilePageTabs.REPOSTS}
        </Tab>
        {showPlaylistsTab ? (
          <Tab
            to={`${profileBasePath}/playlists`}
            icon={<IconPlaylists />}
            hideText={shouldHideTabText}
          >
            {ProfilePageTabs.PLAYLISTS}
          </Tab>
        ) : null}
      </TabList>
    )
  ) : null

  // Sort button — rendered inline in the Tracks lineup's leading
  // delineator (below the featured/artist-pick track) so it sits with
  // the divider that separates the pick from the rest of the lineup,
  // logically tied to the items it actually sorts.
  const sortButton =
    !dropdownDisabled && (onSortByRecent || onSortByPopular) ? (
      <PopupMenu
        items={
          [
            onSortByRecent
              ? { text: 'Sort by Recent', onClick: onSortByRecent }
              : null,
            onSortByPopular
              ? { text: 'Sort by Popular', onClick: onSortByPopular }
              : null
          ].filter(Boolean) as { text: string; onClick: () => void }[]
        }
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        renderTrigger={(ref, triggerPopup) => (
          <Button
            ref={ref as any}
            size='small'
            variant='secondary'
            iconLeft={IconSort}
            aria-label='Toggle Sort Mode'
            onClick={() => triggerPopup()}
          />
        )}
      />
    ) : null

  // Divider + sort on a single horizontal line. The Divider grows to
  // fill the row; the sort button sits at its right edge, vertically
  // centered on the divider line.
  const sortDelineator = sortButton ? (
    <Flex alignItems='center' gap='m' w='100%'>
      <Flex css={{ flex: 1 }}>
        <Divider css={{ width: '100%' }} />
      </Flex>
      {sortButton}
    </Flex>
  ) : undefined

  const renderArtistTab = () => {
    if (!profile) return null
    const tracksEmpty =
      artistTracksQuery.isSuccess && artistTracksQuery.trackIds.length === 0
    const repostsEmpty =
      (userRepostsQuery.isSuccess && userRepostsQuery.trackIds.length === 0) ||
      profile.repost_count === 0
    const trackUploadChip = isOwner ? (
      <UploadChip type='track' variant='tile' source='profile' />
    ) : null

    if (currentTab === ProfilePageTabs.ALBUMS) {
      return <AlbumsTab isOwner={isOwner} profile={profile} userId={userId} />
    }
    if (currentTab === ProfilePageTabs.PLAYLISTS) {
      return (
        <PlaylistsTab isOwner={isOwner} profile={profile} userId={userId} />
      )
    }
    if (currentTab === ProfilePageTabs.CONTESTS) {
      return <ContestsTab isOwner={isOwner} profile={profile} />
    }
    if (currentTab === ProfilePageTabs.REPOSTS) {
      return status === Status.SUCCESS ? (
        repostsEmpty ? (
          <EmptyTab
            isOwner={isOwner}
            name={profile.name}
            text='reposted anything'
          />
        ) : (
          <TrackLineup
            trackIds={userRepostsQuery.trackIds}
            source='PROFILE_FEED'
            querySource={repostsQuerySource}
            isPending={userRepostsQuery.isPending}
            isFetching={userRepostsQuery.isFetching}
            isError={userRepostsQuery.isError}
            hasNextPage={userRepostsQuery.hasNextPage}
            loadNextPage={userRepostsQuery.loadNextPage}
            variant={LineupVariant.CONDENSED}
            scrollParent={containerRef?.current ?? null}
          />
        )
      ) : null
    }
    return status === Status.SUCCESS ? (
      tracksEmpty ? (
        <>
          {trackUploadChip}
          <EmptyTab
            isOwner={isOwner}
            name={profile.name}
            text='uploaded any tracks'
          />
        </>
      ) : (
        <>
          {trackUploadChip}
          <TrackLineup
            trackIds={artistTracksQuery.trackIds}
            source='PROFILE_TRACKS'
            querySource={tracksQuerySource}
            isPending={artistTracksQuery.isPending}
            isFetching={artistTracksQuery.isFetching}
            isError={artistTracksQuery.isError}
            hasNextPage={artistTracksQuery.hasNextPage}
            loadNextPage={artistTracksQuery.loadNextPage}
            variant={LineupVariant.GRID}
            leadingElementId={profile.artist_pick_track_id ?? undefined}
            leadingElementDelineator={sortDelineator}
            showArtistPick
            scrollParent={containerRef?.current ?? null}
          />
        </>
      )
    ) : null
  }

  const renderUserTab = () => {
    if (!profile) return null
    const userRepostsEmpty =
      (userRepostsQuery.isSuccess && userRepostsQuery.trackIds.length === 0) ||
      profile.repost_count === 0

    if (currentTab === ProfilePageTabs.PLAYLISTS) {
      return (
        <PlaylistsTab isOwner={isOwner} profile={profile} userId={userId} />
      )
    }
    return userRepostsEmpty ? (
      <EmptyTab
        isOwner={isOwner}
        name={profile.name}
        text='reposted anything'
      />
    ) : (
      <TrackLineup
        trackIds={userRepostsQuery.trackIds}
        source='PROFILE_FEED'
        querySource={repostsQuerySource}
        isPending={userRepostsQuery.isPending}
        isFetching={userRepostsQuery.isFetching}
        isError={userRepostsQuery.isError}
        hasNextPage={userRepostsQuery.hasNextPage}
        loadNextPage={userRepostsQuery.loadNextPage}
        variant={LineupVariant.CONDENSED}
        maxEntries={profile.repost_count}
        scrollParent={containerRef?.current ?? null}
      />
    )
  }

  const body = profile ? (isArtist ? renderArtistTab() : renderUserTab()) : null

  const {
    title = '',
    description = '',
    canonicalUrl = '',
    structuredData
  } = getUserPageContext({ handle, userName: name, bio })

  // --- Mute confirmation modal (preserved from desktop) -------------------
  const muteUserConfirmationBody = (
    <Flex gap='l' direction='column'>
      <Text color='default' textAlign='left'>
        {commentsMessages.popups.muteUser.body(name)}
      </Text>
      <Hint icon={IconQuestionCircle} css={{ textAlign: 'left' }}>
        {commentsMessages.popups.muteUser.hint}
      </Hint>
    </Flex>
  ) as ReactNode

  const unMuteUserConfirmationBody = (
    <Flex gap='l' direction='column'>
      <Text color='default' textAlign='left'>
        {commentsMessages.popups.unmuteUser.body(name)}
      </Text>
      <Hint icon={IconQuestionCircle} css={{ textAlign: 'left' }}>
        {commentsMessages.popups.unmuteUser.hint}
      </Hint>
    </Flex>
  ) as ReactNode

  const [muteUser] = useMuteUser()
  const { data: mutedUsers } = useMutedUsers()
  const isMutedFromRequest =
    mutedUsers?.some((user) => user.user_id === userId) ?? false
  const [isMutedState, setIsMuted] = useState(isMutedFromRequest)
  useEffect(() => {
    setIsMuted(isMutedFromRequest)
  }, [isMutedFromRequest])

  return (
    <Page
      title={title}
      description={description}
      canonicalUrl={canonicalUrl}
      structuredData={structuredData}
      entityType='user'
      hashId={profile?.user_id ? Id.parse(profile.user_id) : undefined}
      variant='flush'
      scrollableSearch
      fromOpacity={1}
    >
      <Box ref={profileFocusRootRef} w='100%'>
        {profile && !isDeactivated ? (
          <>
            {/* Upper surface — cover + identity + bio share one
                surface1 background so they read as a unified header
                block. Full-bleed; inner content is constrained by the
                nested FlushPageContainer. */}
            <div className={styles.topSurface}>
              <div className={styles.coverWrapper}>
                <CoverPhoto
                  userId={userId}
                  updatedCoverPhoto={
                    updatedCoverPhoto ? updatedCoverPhoto.url : ''
                  }
                  error={updatedCoverPhoto ? updatedCoverPhoto.error : false}
                  loading={status === Status.LOADING}
                />
              </div>
              <FlushPageContainer>
                <div className={styles.topContent}>
                  <ProfilePageHeader
                    userId={profile.user_id}
                    name={name}
                    handle={handle}
                    isArtist={isArtist}
                    isLabel={profile.profile_type === 'label'}
                    isDeactivated={isDeactivated}
                    loading={status === Status.LOADING}
                    verified={verified}
                    profilePictureSizes={profilePictureSizes}
                    hasProfilePicture={hasProfilePicture}
                    updatedProfilePicture={
                      updatedProfilePicture
                        ? updatedProfilePicture.url
                        : undefined
                    }
                    updateName={updateName}
                    trackCount={profile.track_count}
                    playlistCount={profile.playlist_count}
                    followerCount={profile.follower_count}
                    followingCount={profile.followee_count}
                    mode={mode}
                    accountUserId={accountUserId}
                    canCreateChat={canCreateChat}
                    isBlocked={isBlocked}
                    isMuted={isMutedState}
                    onEdit={onEdit}
                    onShare={onShare}
                    onFollow={onFollow}
                    onUnfollow={onUnfollow}
                    onMessage={onMessage}
                    onBlock={onBlock}
                    onUnblock={onUnblock}
                    onMute={onMute}
                    areArtistRecommendationsVisible={
                      areArtistRecommendationsVisible
                    }
                    onCloseArtistRecommendations={onCloseArtistRecommendations}
                  />

                  {/* "About" block — bio + social + location + member-since */}
                  <ProfileBio
                    handle={handle}
                    bio={bio}
                    location={location}
                    website={website}
                    created={created}
                    twitterHandle={twitterHandle}
                    instagramHandle={instagramHandle}
                    tikTokHandle={tikTokHandle}
                  />
                </div>
              </FlushPageContainer>
            </div>

            {/* Sticky bar — sits OUTSIDE topSurface so the sticky
                scope is the entire page below the cover. */}
            <div className={styles.stickyHeader}>
              <FlushPageContainer>
                <div className={styles.stickyRow}>
                  <div ref={tabContainerRef} className={styles.stickyTabs}>
                    <NavBanner
                      tabs={tabs}
                      dropdownDisabled={dropdownDisabled}
                      onChange={changeTab}
                      activeTab={activeTab}
                      isArtist={false}
                    />
                  </div>
                </div>
              </FlushPageContainer>
            </div>

            {/* Content surface — lineup/sidebar row sits on the
                default page background, pulled visually away from the
                upper surface above. */}
            <FlushPageContainer>
              <div className={styles.body}>
                {/* Main content row: lineup body + (wide-only) sidebar.
                    Sort is rendered inline with the featured-track
                    divider inside TrackLineup (see sortDelineator). */}
                <div className={styles.contentRow}>
                  <div className={styles.lineup}>{body}</div>
                  <aside className={styles.sidebar}>
                    {userId ? (
                      <ProfileSidebar userId={userId} isArtist={isArtist} />
                    ) : null}
                  </aside>
                </div>
              </div>
            </FlushPageContainer>
          </>
        ) : status === Status.SUCCESS && isDeactivated ? (
          <FlushPageContainer>
            <div className={styles.body}>
              <DeactivatedProfileTombstone />
            </div>
          </FlushPageContainer>
        ) : null}
      </Box>

      {/* Edit profile modal */}
      {profile ? (
        <ProfileEditModal
          isOpen={editMode}
          onClose={onCancel}
          hasMadeEdit={hasMadeEdit}
          userId={userId}
          hasProfilePicture={hasProfilePicture}
          updatedProfilePictureUrl={
            updatedProfilePicture ? updatedProfilePicture.url : undefined
          }
          updatedCoverPhotoUrl={
            updatedCoverPhoto ? updatedCoverPhoto.url : undefined
          }
          name={name}
          bio={bio}
          location={location}
          xHandle={twitterHandle}
          instagramHandle={instagramHandle}
          tikTokHandle={tikTokHandle}
          twitterVerified={!!twitterVerified}
          instagramVerified={!!instagramVerified}
          tikTokVerified={!!tikTokVerified}
          website={website}
          onUpdateName={updateName}
          onUpdateBio={updateBio}
          onUpdateLocation={updateLocation}
          onUpdateXHandle={updateTwitterHandle}
          onUpdateInstagramHandle={updateInstagramHandle}
          onUpdateTikTokHandle={updateTikTokHandle}
          onUpdateWebsite={updateWebsite}
          onUpdateProfilePicture={updateProfilePicture}
          onUpdateCoverPhoto={updateCoverPhoto}
          onSave={onSave}
          onCancel={onCancel}
        />
      ) : null}

      {/* Block / unblock / mute confirmation modals */}
      {profile ? (
        <>
          <BlockUserConfirmationModal
            user={profile}
            isVisible={showBlockUserConfirmationModal}
            onClose={onCloseBlockUserConfirmationModal}
          />
          <UnblockUserConfirmationModal
            user={profile}
            isVisible={showUnblockUserConfirmationModal}
            onClose={onCloseUnblockUserConfirmationModal}
          />
          <ConfirmationModal
            onClose={onCloseMuteUserConfirmationModal}
            isOpen={showMuteUserConfirmationModal}
            messages={
              isMutedState
                ? {
                    header: commentsMessages.popups.unmuteUser.title,
                    description: unMuteUserConfirmationBody,
                    confirm: commentsMessages.popups.unmuteUser.confirm
                  }
                : {
                    header: commentsMessages.popups.muteUser.title,
                    description: muteUserConfirmationBody,
                    confirm: commentsMessages.popups.muteUser.confirm
                  }
            }
            onConfirm={() => {
              if (userId) {
                muteUser({
                  mutedUserId: userId,
                  isMuted: isMutedState
                })
                setIsMuted(!isMutedState)
              }
            }}
          />
        </>
      ) : null}
    </Page>
  )
}

export default memo(ProfilePage)
