import { ComponentType, lazy } from 'react'

import { Modals as ModalTypes } from '@audius/common/store'

import AddToCollectionModal from 'components/add-to-collection/desktop/AddToCollectionModal'
import { AlbumTrackRemoveConfirmationModal } from 'components/album-track-remove-confirmation-modal/AlbumTrackRemoveConfirmationModal'
import AppCTAModal from 'components/app-cta-modal/AppCTAModal'
import { ArtistPickModal } from 'components/artist-pick-modal/ArtistPickModal'
import BrowserPushConfirmationModal from 'components/browser-push-confirmation-modal/BrowserPushConfirmationModal'
import ConfirmerPreview from 'components/confirmer-preview/ConfirmerPreview'
import DeletePlaylistConfirmationModal from 'components/delete-playlist-confirmation-modal/DeletePlaylistConfirmationModal'
import { DeleteTrackConfirmationModal } from 'components/delete-track-confirmation-modal/DeleteTrackConfirmationModal'
import { DownloadTrackArchiveModal } from 'components/download-track-archive-modal/DownloadTrackArchiveModal'
import { DuplicateAddConfirmationModal } from 'components/duplicate-add-confirmation-modal'
import { EarlyReleaseConfirmationModal } from 'components/early-release-confirmation-modal'
import { EditAccessConfirmationModal } from 'components/edit-access-confirmation-modal'
import EditFolderModal from 'components/edit-folder-modal/EditFolderModal'
import EmbedModal from 'components/embed-modal/EmbedModal'
import { FeatureFlagOverrideModal } from 'components/feature-flag-override-modal'
import { FinalizeWinnersConfirmationModal } from 'components/finalize-winners-confirmation-modal/FinalizeWinnersConfirmationModal'
import FirstUploadModal from 'components/first-upload-modal/FirstUploadModal'
import { HideContentConfirmationModal } from 'components/hide-confirmation-modal'
import { HostRemixContestModal } from 'components/host-remix-contest-modal/HostRemixContestModal'
import { InboxUnavailableModal } from 'components/inbox-unavailable-modal/InboxUnavailableModal'
import { LabelAccountModal } from 'components/label-account-modal/LabelAccountModal'
import { LeavingAudiusModal } from 'components/leaving-audius-modal/LeavingAudiusModal'
import { LockedContentModal } from 'components/locked-content-modal/LockedContentModal'
import { PasswordResetModal } from 'components/password-reset/PasswordResetModal'
import { PublishConfirmationModal } from 'components/publish-confirmation-modal/PublishConfirmationModal'
import { ReplaceTrackConfirmationModal } from 'components/replace-track-confirmation-modal/ReplaceTrackConfirmationModal'
import { ReplaceTrackProgressModal } from 'components/replace-track-progress-modal/ReplaceTrackProgressModal'
import ConnectedMobileOverflowModal from 'components/track-overflow-modal/ConnectedMobileOverflowModal'
import UnfollowConfirmationModal from 'components/unfollow-confirmation-modal/UnfollowConfirmationModal'
import { UnsavedChangesDialog } from 'components/unsaved-changes-dialog/UnsavedChangesDialog'
import { UploadConfirmationModal } from 'components/upload-confirmation-modal'
import { UserListModal } from 'components/user-list-modal/UserListModal'
import { WaitForDownloadModal } from 'components/wait-for-download-modal/WaitForDownloadModal'
import { WelcomeModal } from 'components/welcome-modal/WelcomeModal'
import { useIsMobile } from 'hooks/useIsMobile'
import { ChatBlastModal } from 'pages/chat-page/components/ChatBlastModal'

import AppModal from './AppModal'
const ShareModal = lazy(() => import('components/share-modal'))

const CreateChatModal = lazy(
  () => import('pages/chat-page/components/CreateChatModal')
)

const InboxSettingsModal = lazy(
  () => import('components/inbox-settings-modal/InboxSettingsModal')
)

const CommentSettingsModal = lazy(
  () => import('components/comment-settings-modal/CommentSettingsModal')
)

const commonModalsMap: { [Modal in ModalTypes]?: ComponentType } = {
  Share: ShareModal,
  EditFolder: EditFolderModal,
  AddToCollection: AddToCollectionModal,
  DeletePlaylistConfirmation: DeletePlaylistConfirmationModal,
  DeleteTrackConfirmation: DeleteTrackConfirmationModal,
  HostRemixContest: HostRemixContestModal,
  ReplaceTrackConfirmation: ReplaceTrackConfirmationModal,
  ReplaceTrackProgress: ReplaceTrackProgressModal,
  DuplicateAddConfirmation: DuplicateAddConfirmationModal,
  FinalizeWinnersConfirmation: FinalizeWinnersConfirmationModal,
  UploadConfirmation: UploadConfirmationModal,
  EditAccessConfirmation: EditAccessConfirmationModal,
  EarlyReleaseConfirmation: EarlyReleaseConfirmationModal,
  PublishConfirmation: PublishConfirmationModal,
  HideContentConfirmation: HideContentConfirmationModal,
  AlbumTrackRemoveConfirmation: AlbumTrackRemoveConfirmationModal,
  InboxSettings: InboxSettingsModal,
  CommentSettings: CommentSettingsModal,
  LabelAccount: LabelAccountModal,
  LockedContent: LockedContentModal,
  BrowserPushPermissionConfirmation: BrowserPushConfirmationModal,
  Welcome: WelcomeModal,
  LeavingAudiusModal,
  CreateChatModal,
  ChatBlastModal,
  InboxUnavailableModal,
  WaitForDownloadModal,
  ArtistPick: ArtistPickModal,
  DownloadTrackArchive: DownloadTrackArchiveModal
}

const commonModals = Object.entries(commonModalsMap) as [
  ModalTypes,
  ComponentType
][]

const Modals = () => {
  const isMobile = useIsMobile()

  return (
    <>
      <PasswordResetModal />
      <FirstUploadModal />
      <UnsavedChangesDialog />
      {commonModals.map(([modalName, Modal]) => {
        return <AppModal key={modalName} name={modalName} modal={Modal} />
      })}
      {isMobile ? (
        <>
          <ConnectedMobileOverflowModal />
          <UnfollowConfirmationModal />
        </>
      ) : (
        <>
          <EmbedModal />
          <UserListModal />
          <AppCTAModal />
          {/* dev-mode hot-key modals */}
          <ConfirmerPreview />
          <FeatureFlagOverrideModal />
        </>
      )}
    </>
  )
}

export default Modals
