import { History } from 'history'
import { combineReducers } from 'redux'
import type { Storage } from 'redux-persist'

import account from './account/slice'
import averageColorReducer from './average-color/slice'
import cast from './cast/slice'
import confirmer from './confirmer/reducer'
import { ConfirmerState } from './confirmer/types'
import downloads, { DownloadState } from './downloads/slice'
import gatedContent from './gated-content/slice'
import musicConfettiReducer, {
  MusicConfettiState
} from './music-confetti/slice'
import { HistoryPageState, LibraryPageState } from './pages'
import { chatReducer } from './pages/chat'
import collection from './pages/collection/reducer'
import { CollectionsPageState } from './pages/collection/types'
import {
  deactivateAccountReducer,
  DeactivateAccountState
} from './pages/deactivate-account'
import feedReducer from './pages/feed/reducer'
import { FeedPageState } from './pages/feed/types'
import historyPageReducer from './pages/history-page/reducer'
import { persistedLibraryPageReducer } from './pages/library-page/reducer'
import pickWinners from './pages/pick-winners/slice'
import profileReducer from './pages/profile/reducer'
import { ProfilePageState } from './pages/profile/types'
import remixes from './pages/remixes/slice'
import searchResults from './pages/search-results/reducer'
import { SearchPageState } from './pages/search-results/types'
import settings from './pages/settings/reducer'
import { SettingsPageState } from './pages/settings/types'
import track from './pages/track/reducer'
import { TrackPageState } from './pages/track/types'
import trending from './pages/trending/reducer'
import { TrendingPageState } from './pages/trending/types'
import playback from './playback/slice'
import { PlaybackState } from './playback/types'
import { PlaybackPositionState } from './playback-position'
import playbackPosition from './playback-position/slice'
import reachability from './reachability/reducer'
import { ReachabilityState } from './reachability/types'
import savedCollectionsReducer from './saved-collections/slice'
import searchReducer from './search/slice'
import { SearchState } from './search/types'
import stemsUpload from './stems-upload/slice'
import { ToastState } from './ui'
import addToCollectionReducer, {
  AddToCollectionState
} from './ui/add-to-collection/reducer'
import deletePlaylistConfirmationReducer from './ui/delete-playlist-confirmation-modal/slice'
import { DeletePlaylistConfirmationModalState } from './ui/delete-playlist-confirmation-modal/types'
import duplicateAddConfirmationReducer from './ui/duplicate-add-confirmation-modal/slice'
import { DuplicateAddConfirmationModalState } from './ui/duplicate-add-confirmation-modal/types'
import mobileOverflowModalReducer from './ui/mobile-overflow-menu/slice'
import { MobileOverflowModalState } from './ui/mobile-overflow-menu/types'
import { modalsReducer, ModalsState } from './ui/modals'
import nowPlayingReducer, { NowPlayingState } from './ui/now-playing/slice'
import shareModalReducer from './ui/share-modal/slice'
import { ShareModalState } from './ui/share-modal/types'
import theme, { ThemeState } from './ui/theme/slice'
import toastReducer from './ui/toast/slice'
import { UploadConfirmationModalState } from './ui/upload-confirmation-modal/types'
import upload from './upload/reducer'
import { UploadState } from './upload/types'
import favoritesUserListReducer from './user-list/favorites/reducers'
import followersUserListReducer from './user-list/followers/reducers'
import followingUserListReducer from './user-list/following/reducers'
import mutualsUserListReducer from './user-list/mutuals/reducers'
import notificationsUserListReducer from './user-list/notifications/reducers'
import relatedArtistsListReducer from './user-list/related-artists/reducers'
import remixersUserListReducer from './user-list/remixers/reducers'
import repostsUserListReducer from './user-list/reposts/reducers'
import wallet from './wallet/slice'

/**
 * A function that creates common reducers.
 * @returns an object of all reducers to be used with `combineReducers`
 */
export const reducers = (storage: Storage, history?: History) => ({
  account,

  // TODO: Move to common
  // signOn: signOnReducer,
  // backend,
  // confirmer,

  // Config
  reachability,

  savedCollections: savedCollectionsReducer,

  // Playback
  playback,
  playbackPosition,

  // Wallet
  wallet,

  // Cast
  cast,

  // UI
  ui: combineReducers({
    averageColor: averageColorReducer,
    addToCollection: addToCollectionReducer,

    deletePlaylistConfirmationModal: deletePlaylistConfirmationReducer,
    duplicateAddConfirmationModal: duplicateAddConfirmationReducer,
    mobileOverflowModal: mobileOverflowModalReducer,
    modals: modalsReducer,
    musicConfetti: musicConfettiReducer,
    nowPlaying: nowPlayingReducer,
    shareModal: shareModalReducer,
    toast: toastReducer,
    userList: combineReducers({
      followers: followersUserListReducer,
      following: followingUserListReducer,
      reposts: repostsUserListReducer,
      favorites: favoritesUserListReducer,
      mutuals: mutualsUserListReducer,
      notifications: notificationsUserListReducer,
      relatedArtists: relatedArtistsListReducer,
      remixers: remixersUserListReducer
    }),
    theme
  }),

  // Pages
  pages: combineReducers({
    chat: chatReducer,
    collection,
    deactivateAccount: deactivateAccountReducer,
    feed: feedReducer(storage),
    historyPage: historyPageReducer,
    pickWinners,
    profile: profileReducer,

    libraryPage: persistedLibraryPageReducer(storage),
    searchResults,
    track,
    trending: trending(history),
    settings,
    remixes
  }),
  search: searchReducer(storage),
  stemsUpload,

  gatedContent,

  upload,
  confirmer,
  downloads
})

export type CommonState = {
  account: ReturnType<typeof account>
  // TODO: Migrate to common
  // signOn: ReturnType<typeof signOnReducer>

  // TODO: Migrate to common
  // backend: BackendState

  // Config
  reachability: ReachabilityState

  // TODO: Migrate to common
  // confirmer: ConfirmerState

  // TODO: missing types for internally managed api slice state
  api: any
  savedCollections: ReturnType<typeof savedCollectionsReducer>

  // Playback
  playback: PlaybackState
  playbackPosition: PlaybackPositionState

  // Wallet
  wallet: ReturnType<typeof wallet>

  // Cast
  cast: ReturnType<typeof cast>

  ui: {
    averageColor: ReturnType<typeof averageColorReducer>
    addToCollection: AddToCollectionState
    deletePlaylistConfirmationModal: DeletePlaylistConfirmationModalState
    duplicateAddConfirmationModal: DuplicateAddConfirmationModalState
    mobileOverflowModal: MobileOverflowModalState
    modals: ModalsState
    musicConfetti: MusicConfettiState
    nowPlaying: NowPlayingState
    shareModal: ShareModalState
    toast: ToastState
    uploadConfirmationModal: UploadConfirmationModalState
    userList: {
      mutuals: ReturnType<typeof mutualsUserListReducer>
      notifications: ReturnType<typeof notificationsUserListReducer>
      followers: ReturnType<typeof followersUserListReducer>
      following: ReturnType<typeof followingUserListReducer>
      reposts: ReturnType<typeof repostsUserListReducer>
      favorites: ReturnType<typeof favoritesUserListReducer>
      relatedArtists: ReturnType<typeof relatedArtistsListReducer>
      remixers: ReturnType<typeof remixersUserListReducer>
    }
    theme: ThemeState
  }

  pages: {
    chat: ReturnType<typeof chatReducer>
    collection: CollectionsPageState
    deactivateAccount: DeactivateAccountState
    feed: FeedPageState

    historyPage: HistoryPageState
    track: TrackPageState
    pickWinners: ReturnType<typeof pickWinners>
    profile: ProfilePageState
    libraryPage: LibraryPageState
    searchResults: SearchPageState
    settings: SettingsPageState
    trending: TrendingPageState
    remixes: ReturnType<typeof remixes>
  }
  search: SearchState

  stemsUpload: ReturnType<typeof stemsUpload>

  // Gated content
  gatedContent: ReturnType<typeof gatedContent>

  upload: UploadState
  confirmer: ConfirmerState
  downloads: DownloadState
}
