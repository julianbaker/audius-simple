import { ComponentType, lazy, Suspense } from 'react'

import { Modals as ModalTypes } from '@audius/common/store'

import FirstUploadModal from 'components/first-upload-modal/FirstUploadModal'
import { PasswordResetModal } from 'components/password-reset/PasswordResetModal'
import UnfollowConfirmationModal from 'components/unfollow-confirmation-modal/UnfollowConfirmationModal'
import { UnsavedChangesDialog } from 'components/unsaved-changes-dialog/UnsavedChangesDialog'
import { UserListModal } from 'components/user-list-modal/UserListModal'
import { useEnvironment } from 'hooks/useEnvironment'

import AppModal from './AppModal'

// Dev-only modals: lazy-loaded behind an isProduction gate so they never
// ship in prod bundles. The components themselves self-gate via dev-mode
// hotkey state once mounted.
const ConfirmerPreview = lazy(
  () => import('components/confirmer-preview/ConfirmerPreview')
)
const FeatureFlagOverrideModal = lazy(() =>
  import('components/feature-flag-override-modal').then((m) => ({
    default: m.FeatureFlagOverrideModal
  }))
)

// All modals registered with the common modal slice are state-gated by
// AppModal (it returns null when the modal's `isOpen` is false), so
// lazy-loading their implementations is a pure bundle win — the chunk
// is only fetched when the user actually opens the modal.

const AddToCollectionModal = lazy(
  () => import('components/add-to-collection/desktop/AddToCollectionModal')
)
const AlbumTrackRemoveConfirmationModal = lazy(() =>
  import(
    'components/album-track-remove-confirmation-modal/AlbumTrackRemoveConfirmationModal'
  ).then((m) => ({ default: m.AlbumTrackRemoveConfirmationModal }))
)
const ArtistPickModal = lazy(() =>
  import('components/artist-pick-modal/ArtistPickModal').then((m) => ({
    default: m.ArtistPickModal
  }))
)
const BrowserPushConfirmationModal = lazy(
  () =>
    import(
      'components/browser-push-confirmation-modal/BrowserPushConfirmationModal'
    )
)
const ChatBlastModal = lazy(() =>
  import('pages/chat-page/components/ChatBlastModal').then((m) => ({
    default: m.ChatBlastModal
  }))
)
const CommentSettingsModal = lazy(
  () => import('components/comment-settings-modal/CommentSettingsModal')
)
const CreateChatModal = lazy(
  () => import('pages/chat-page/components/CreateChatModal')
)
const DeletePlaylistConfirmationModal = lazy(
  () =>
    import(
      'components/delete-playlist-confirmation-modal/DeletePlaylistConfirmationModal'
    )
)
const DeleteTrackConfirmationModal = lazy(() =>
  import(
    'components/delete-track-confirmation-modal/DeleteTrackConfirmationModal'
  ).then((m) => ({ default: m.DeleteTrackConfirmationModal }))
)
const DownloadTrackArchiveModal = lazy(() =>
  import(
    'components/download-track-archive-modal/DownloadTrackArchiveModal'
  ).then((m) => ({ default: m.DownloadTrackArchiveModal }))
)
const DuplicateAddConfirmationModal = lazy(() =>
  import('components/duplicate-add-confirmation-modal').then((m) => ({
    default: m.DuplicateAddConfirmationModal
  }))
)
const EarlyReleaseConfirmationModal = lazy(() =>
  import('components/early-release-confirmation-modal').then((m) => ({
    default: m.EarlyReleaseConfirmationModal
  }))
)
const EditAccessConfirmationModal = lazy(() =>
  import('components/edit-access-confirmation-modal').then((m) => ({
    default: m.EditAccessConfirmationModal
  }))
)
const EditFolderModal = lazy(
  () => import('components/edit-folder-modal/EditFolderModal')
)
const FinalizeWinnersConfirmationModal = lazy(() =>
  import(
    'components/finalize-winners-confirmation-modal/FinalizeWinnersConfirmationModal'
  ).then((m) => ({ default: m.FinalizeWinnersConfirmationModal }))
)
const HideContentConfirmationModal = lazy(() =>
  import('components/hide-confirmation-modal').then((m) => ({
    default: m.HideContentConfirmationModal
  }))
)
const HostRemixContestModal = lazy(() =>
  import('components/host-remix-contest-modal/HostRemixContestModal').then(
    (m) => ({ default: m.HostRemixContestModal })
  )
)
const InboxSettingsModal = lazy(
  () => import('components/inbox-settings-modal/InboxSettingsModal')
)
const InboxUnavailableModal = lazy(() =>
  import('components/inbox-unavailable-modal/InboxUnavailableModal').then(
    (m) => ({ default: m.InboxUnavailableModal })
  )
)
const LabelAccountModal = lazy(() =>
  import('components/label-account-modal/LabelAccountModal').then((m) => ({
    default: m.LabelAccountModal
  }))
)
const LeavingAudiusModal = lazy(() =>
  import('components/leaving-audius-modal/LeavingAudiusModal').then((m) => ({
    default: m.LeavingAudiusModal
  }))
)
const LockedContentModal = lazy(() =>
  import('components/locked-content-modal/LockedContentModal').then((m) => ({
    default: m.LockedContentModal
  }))
)
const PublishConfirmationModal = lazy(() =>
  import('components/publish-confirmation-modal/PublishConfirmationModal').then(
    (m) => ({ default: m.PublishConfirmationModal })
  )
)
const ReplaceTrackConfirmationModal = lazy(() =>
  import(
    'components/replace-track-confirmation-modal/ReplaceTrackConfirmationModal'
  ).then((m) => ({ default: m.ReplaceTrackConfirmationModal }))
)
const ReplaceTrackProgressModal = lazy(() =>
  import(
    'components/replace-track-progress-modal/ReplaceTrackProgressModal'
  ).then((m) => ({ default: m.ReplaceTrackProgressModal }))
)
const ShareModal = lazy(() => import('components/share-modal'))
const UploadConfirmationModal = lazy(() =>
  import('components/upload-confirmation-modal').then((m) => ({
    default: m.UploadConfirmationModal
  }))
)
const WelcomeModal = lazy(() =>
  import('components/welcome-modal/WelcomeModal').then((m) => ({
    default: m.WelcomeModal
  }))
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
  ArtistPick: ArtistPickModal,
  DownloadTrackArchive: DownloadTrackArchiveModal
}

const commonModals = Object.entries(commonModalsMap) as [
  ModalTypes,
  ComponentType
][]

const Modals = () => {
  const { isDev } = useEnvironment()

  return (
    <>
      {/* Top-level modals — these subscribe to their own state and
          either render their UI or return null. Eagerly imported because
          (a) they're small or (b) their "is needed?" check requires
          reading state that's already loaded. */}
      <PasswordResetModal />
      <FirstUploadModal />
      <UnsavedChangesDialog />
      {/* Modals registered with the common modal slice — lazy-loaded;
          AppModal returns null until each is opened, so the chunk only
          loads on first open. */}
      {commonModals.map(([modalName, Modal]) => {
        return <AppModal key={modalName} name={modalName} modal={Modal} />
      })}
      {/* User-list (followers/following/reposts/etc.) and unfollow
          confirmation render at every viewport — UserListModal uses
          ResponsiveModal so it becomes a BottomSheet on mobile. */}
      <UserListModal />
      <UnfollowConfirmationModal />
      {/* Dev-only modals, hidden behind isProduction so the chunks never
          ship to production bundles. */}
      {isDev ? (
        <Suspense fallback={null}>
          <ConfirmerPreview />
          <FeatureFlagOverrideModal />
        </Suspense>
      ) : null}
    </>
  )
}

export default Modals
