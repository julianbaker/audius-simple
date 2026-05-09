import { uniq } from 'lodash'

import { CommonState } from '~/store/commonStore'

import { ID } from '../../../models/Identifiers'

import { isLibraryCategory, LibraryCategory, LibraryPageTabs } from './types'

export const getLibrary = (state: CommonState) => state.pages.libraryPage

export const getCollectionsCategory = (state: CommonState) => {
  const category = state.pages.libraryPage.collectionsCategory
  return isLibraryCategory(category) ? category : LibraryCategory.All
}

export const getTracksCategory = (state: CommonState) => {
  const category = state.pages.libraryPage.tracksCategory
  return isLibraryCategory(category) ? category : LibraryCategory.All
}

export const getCategory = (
  state: CommonState,
  props: { currentTab: LibraryPageTabs }
) => {
  if (props.currentTab === LibraryPageTabs.TRACKS) {
    return getTracksCategory(state)
  } else {
    return getCollectionsCategory(state)
  }
}

export const getLocalTrackFavorites = (state: CommonState) =>
  state.pages.libraryPage.local.track.favorites.added
export const getLocalTrackFavorite = (state: CommonState, props: { id: ID }) =>
  state.pages.libraryPage.local.track.favorites.added[props.id]
export const getLocalTrackReposts = (state: CommonState) =>
  state.pages.libraryPage.local.track.reposts.added
export const getLocalTrackRepost = (state: CommonState, props: { id: ID }) =>
  state.pages.libraryPage.local.track.reposts.added[props.id]

export const getLocalAlbumFavorites = (state: CommonState) =>
  state.pages.libraryPage.local.album.favorites.added
export const getLocalAlbumReposts = (state: CommonState) =>
  state.pages.libraryPage.local.album.reposts.added
export const getLocalRemovedAlbumFavorites = (state: CommonState) =>
  state.pages.libraryPage.local.album.favorites.removed
export const getLocalRemovedAlbumReposts = (state: CommonState) =>
  state.pages.libraryPage.local.album.reposts.removed

export const getLocalPlaylistFavorites = (state: CommonState) =>
  state.pages.libraryPage.local.playlist.favorites.added
export const getLocalPlaylistReposts = (state: CommonState) =>
  state.pages.libraryPage.local.playlist.reposts.added
export const getLocalRemovedPlaylistFavorites = (state: CommonState) =>
  state.pages.libraryPage.local.playlist.favorites.removed
export const getLocalRemovedPlaylistReposts = (state: CommonState) =>
  state.pages.libraryPage.local.playlist.favorites.removed

/** Get the tracks in currently selected category that have been added to the library in current session */
export const getSelectedCategoryLocalTrackAdds = (state: CommonState) => {
  const selectedCategory = getCategory(state, {
    currentTab: LibraryPageTabs.TRACKS
  })
  const localFavorites = getLocalTrackFavorites(state)
  const localReposts = getLocalTrackReposts(state)
  let localLibraryAdditions
  if (selectedCategory === LibraryCategory.Favorite) {
    localLibraryAdditions = localFavorites
  } else if (selectedCategory === LibraryCategory.Repost) {
    localLibraryAdditions = localReposts
  } else {
    // Category = ALL
    localLibraryAdditions = {
      ...localReposts,
      ...localFavorites
    }
  }

  return localLibraryAdditions
}

const getSelectedCategoryLocalCollectionUpdates = (
  state: CommonState,
  props: { collectionType: 'album' | 'playlist'; updateType: 'add' | 'remove' }
) => {
  const { collectionType, updateType } = props
  const currentTab =
    collectionType === 'album'
      ? LibraryPageTabs.ALBUMS
      : LibraryPageTabs.PLAYLISTS
  const selectedCategory = getCategory(state, { currentTab })
  let localFavorites: ID[], localReposts: ID[]
  if (updateType === 'add') {
    localFavorites =
      collectionType === 'album'
        ? getLocalAlbumFavorites(state)
        : getLocalPlaylistFavorites(state)
    localReposts =
      collectionType === 'album'
        ? getLocalAlbumReposts(state)
        : getLocalPlaylistReposts(state)
  } else {
    localFavorites =
      collectionType === 'album'
        ? getLocalRemovedAlbumFavorites(state)
        : getLocalRemovedPlaylistFavorites(state)
    localReposts =
      collectionType === 'album'
        ? getLocalRemovedAlbumReposts(state)
        : getLocalRemovedPlaylistReposts(state)
  }

  switch (selectedCategory) {
    case LibraryCategory.Favorite:
      return localFavorites
    case LibraryCategory.Repost:
      return localReposts
    default:
      // Category = ALL
      return uniq([...localReposts, ...localFavorites])
  }
}

export const getSelectedCategoryLocalAlbumAdds = (state: CommonState) => {
  return getSelectedCategoryLocalCollectionUpdates(state, {
    collectionType: 'album',
    updateType: 'add'
  })
}
export const getSelectedCategoryLocalAlbumRemovals = (state: CommonState) => {
  return getSelectedCategoryLocalCollectionUpdates(state, {
    collectionType: 'album',
    updateType: 'remove'
  })
}
export const getSelectedCategoryLocalPlaylistRemovals = (
  state: CommonState
) => {
  return getSelectedCategoryLocalCollectionUpdates(state, {
    collectionType: 'playlist',
    updateType: 'remove'
  })
}
export const getSelectedCategoryLocalPlaylistAdds = (state: CommonState) => {
  return getSelectedCategoryLocalCollectionUpdates(state, {
    collectionType: 'playlist',
    updateType: 'add'
  })
}
