import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import {
  BasicModalsState,
  Modals,
  TrackModalClosedActionPayload,
  TrackModalOpenedActionPayload
} from './types'

export const initialState: BasicModalsState = {
  Share: { isOpen: false },
  HCaptcha: { isOpen: false },
  BrowserPushPermissionConfirmation: { isOpen: false },
  DeactivateAccountConfirmation: { isOpen: false },
  TrendingGenreSelection: { isOpen: false },
  TrendingCategory: { isOpen: false },
  TrendingTimeRange: { isOpen: false },
  TrendingFilter: { isOpen: false },
  SocialProof: { isOpen: false },
  EditFolder: { isOpen: false },
  EditTrack: { isOpen: false },
  SignOutConfirmation: { isOpen: false },
  Overflow: { isOpen: false },
  AddToCollection: { isOpen: false },
  DeletePlaylistConfirmation: { isOpen: false },
  DeleteTrackConfirmation: { isOpen: false },
  DuplicateAddConfirmation: { isOpen: false },
  FeatureFlagOverride: { isOpen: false },
  InboxSettings: { isOpen: false },
  CommentSettings: { isOpen: false },
  LabelAccount: { isOpen: false },
  LockedContent: { isOpen: false },
  PlaybackRate: { isOpen: false },
  ProfileActions: { isOpen: false },
  PublishContentModal: { isOpen: false },
  AlbumTrackRemoveConfirmation: { isOpen: false },
  CreateChatModal: { isOpen: false },
  ChatBlastModal: { isOpen: false },
  LeavingAudiusModal: { isOpen: false },
  InboxUnavailableModal: { isOpen: false },
  UploadConfirmation: { isOpen: false },
  EditAccessConfirmation: { isOpen: false },
  EarlyReleaseConfirmation: { isOpen: false },
  PublishConfirmation: { isOpen: false },
  HideContentConfirmation: { isOpen: false },
  ReplaceTrackConfirmation: { isOpen: false },
  ReplaceTrackProgress: { isOpen: false },
  Welcome: { isOpen: false },
  WaitForDownloadModal: { isOpen: false },
  ArtistPick: { isOpen: false },
  EditTrackFormOverflowMenu: { isOpen: false },
  Announcement: { isOpen: false },
  Notification: { isOpen: false },
  DownloadTrackArchive: { isOpen: false },
  HostRemixContest: { isOpen: false },
  FinalizeWinnersConfirmation: { isOpen: false },
  VerificationSuccess: { isOpen: false },
  VerificationError: { isOpen: false }
}

const slice = createSlice({
  name: 'application/ui/modals',
  initialState,
  reducers: {
    setVisibility: (
      state,
      action: PayloadAction<{
        modal: Modals
        visible: boolean | 'closing'
      }>
    ) => {
      const { modal, visible } = action.payload
      state[modal].isOpen = visible
    },
    trackModalOpened: (
      _state,
      _action: PayloadAction<TrackModalOpenedActionPayload>
    ) => {
      // handled by saga
    },
    trackModalClosed: (
      _state,
      _action: PayloadAction<TrackModalClosedActionPayload>
    ) => {
      // handled by saga
    }
  }
})

export const { setVisibility } = slice.actions

export const actions = slice.actions

export default slice.reducer
