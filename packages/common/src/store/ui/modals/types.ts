import { Action } from '@reduxjs/toolkit'

import { ModalSource } from '~/models/Analytics'

import { AlbumTrackRemoveConfirmationModalState } from './album-track-remove-confirmation-modal'
import { AnnouncementModalState } from './announcement-modal'
import { ArtistPickModalState } from './artist-pick-modal'
import { ChatBlastModalState } from './create-chat-blast-modal'
import { DeleteTrackConfirmationModalState } from './delete-track-confirmation-modal'
import { DownloadTrackArchiveModalState } from './download-track-archive-modal'
import { EarlyReleaseConfirmationModalState } from './early-release-confirmation-modal'
import { EditAccessConfirmationModalState } from './edit-access-confirmation-modal'
import { FinalizeWinnersConfirmationModalState } from './finalize-winners-confirmation-modal'
import { HideContentConfirmationModalState } from './hide-confirmation-modal'
import { HostRemixContestModalState } from './host-remix-contest-modal'
import { InboxUnavailableModalState } from './inbox-unavailable-modal'
import { LeavingAudiusModalState } from './leaving-audius-modal'
import { PublishConfirmationModalState } from './publish-confirmation-modal'
import { ReplaceTrackConfirmationModalState } from './replace-track-confirmation-modal'
import { ReplaceTrackProgressModalState } from './replace-track-progress-modal'
import { UploadConfirmationModalState } from './upload-confirmation-modal'
import { WaitForDownloadModalState } from './wait-for-download-modal'

export type BaseModalState = {
  isOpen: boolean | 'closing'
}

export type CreateChatModalState = {
  defaultUserList?: 'followers' | 'chats'
  presetMessage?: string
  onCancelAction?: Action
}

export type Modals =
  | 'Share'
  | 'HCaptcha'
  | 'BrowserPushPermissionConfirmation'
  | 'DeactivateAccountConfirmation'
  | 'TrendingGenreSelection'
  | 'TrendingCategory'
  | 'TrendingTimeRange'
  | 'TrendingFilter'
  | 'SocialProof'
  | 'EditFolder'
  | 'EditTrack'
  | 'SignOutConfirmation'
  | 'Overflow'
  | 'AddToCollection'
  | 'DeletePlaylistConfirmation'
  | 'DeleteTrackConfirmation'
  | 'ReplaceTrackConfirmation'
  | 'ReplaceTrackProgress'
  | 'FeatureFlagOverride'
  | 'InboxSettings'
  | 'CommentSettings'
  | 'LockedContent'
  | 'PlaybackRate'
  | 'ProfileActions'
  | 'PublishContentModal'
  | 'LabelAccount'
  | 'DuplicateAddConfirmation'
  | 'CreateChatModal'
  | 'ChatBlastModal'
  | 'InboxUnavailableModal'
  | 'LeavingAudiusModal'
  | 'UploadConfirmation'
  | 'EditAccessConfirmation'
  | 'EarlyReleaseConfirmation'
  | 'PublishConfirmation'
  | 'HideContentConfirmation'
  | 'Welcome'
  | 'WaitForDownloadModal'
  | 'ArtistPick'
  | 'AlbumTrackRemoveConfirmation'
  | 'EditTrackFormOverflowMenu'
  | 'Announcement'
  | 'Notification'
  | 'DownloadTrackArchive'
  | 'HostRemixContest'
  | 'FinalizeWinnersConfirmation'
  | 'VerificationSuccess'
  | 'VerificationError'

export type BasicModalsState = {
  [modal in Modals]: BaseModalState
}

export type StatefulModalsState = {
  CreateChatModal: CreateChatModalState
  ChatBlastModal: ChatBlastModalState
  InboxUnavailableModal: InboxUnavailableModalState
  LeavingAudiusModal: LeavingAudiusModalState
  WaitForDownloadModal: WaitForDownloadModalState
  ArtistPick: ArtistPickModalState
  AlbumTrackRemoveConfirmation: AlbumTrackRemoveConfirmationModalState
  UploadConfirmation: UploadConfirmationModalState
  EditAccessConfirmation: EditAccessConfirmationModalState
  EarlyReleaseConfirmation: EarlyReleaseConfirmationModalState
  PublishConfirmation: PublishConfirmationModalState
  HideContentConfirmation: HideContentConfirmationModalState
  DeleteTrackConfirmation: DeleteTrackConfirmationModalState
  ReplaceTrackConfirmation: ReplaceTrackConfirmationModalState
  ReplaceTrackProgress: ReplaceTrackProgressModalState
  FinalizeWinnersConfirmation: FinalizeWinnersConfirmationModalState
  Announcement: AnnouncementModalState
  Notification: BaseModalState
  DownloadTrackArchive: DownloadTrackArchiveModalState
  HostRemixContest: HostRemixContestModalState
}

export type ModalsState = BasicModalsState & StatefulModalsState

export type TrackModalOpenedActionPayload = {
  name: string
  source: ModalSource
  trackingData?: Record<string, any>
}

export type TrackModalClosedActionPayload = {
  name: string
}
