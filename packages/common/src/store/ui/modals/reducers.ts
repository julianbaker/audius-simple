import { Action, combineReducers, Reducer } from '@reduxjs/toolkit'

import { albumTrackRemoveConfirmationModalReducer } from './album-track-remove-confirmation-modal'
import { announcementModalReducer } from './announcement-modal'
import { artistPickModalReducer } from './artist-pick-modal'
import { chatBlastModalReducer } from './create-chat-blast-modal'
import { createChatModalReducer } from './create-chat-modal'
import { deleteTrackConfirmationModalReducer } from './delete-track-confirmation-modal'
import { downloadTrackArchiveModalReducer } from './download-track-archive-modal'
import { earlyReleaseConfirmationModalReducer } from './early-release-confirmation-modal'
import { editAccessConfirmationModalReducer } from './edit-access-confirmation-modal'
import { finalizeWinnersConfirmationModalReducer } from './finalize-winners-confirmation-modal'
import { hideContentConfirmationModalReducer } from './hide-confirmation-modal'
import { hostRemixContestModalReducer } from './host-remix-contest-modal'
import { inboxUnavailableModalReducer } from './inbox-unavailable-modal'
import { leavingAudiusModalReducer } from './leaving-audius-modal'
import { notificationModalReducer } from './notification-modal'
import parentReducer, { initialState } from './parentSlice'
import { publishConfirmationModalReducer } from './publish-confirmation-modal'
import { replaceTrackConfirmationModalReducer } from './replace-track-confirmation-modal'
import { replaceTrackProgressModalReducer } from './replace-track-progress-modal'
import { BaseModalState, Modals, ModalsState } from './types'
import { uploadConfirmationModalReducer } from './upload-confirmation-modal'
import { waitForDownloadModalReducer } from './wait-for-download-modal'

/**
 * Create a bunch of reducers that do nothing, so that the state is maintained and not lost through the child reducers
 */
const noOpReducers = Object.keys(initialState).reduce(
  (prev, curr) => {
    return {
      ...prev,
      [curr]: (s: BaseModalState = { isOpen: false }) => s
    }
  },
  {} as Record<Modals, Reducer<BaseModalState>>
)

/**
 * Combine all the child reducers to build the entire parent slice state
 */
const combinedReducers = combineReducers({
  ...noOpReducers,
  CreateChatModal: createChatModalReducer,
  ChatBlastModal: chatBlastModalReducer,
  InboxUnavailableModal: inboxUnavailableModalReducer,
  LeavingAudiusModal: leavingAudiusModalReducer,
  WaitForDownloadModal: waitForDownloadModalReducer,
  ArtistPick: artistPickModalReducer,
  AlbumTrackRemoveConfirmation: albumTrackRemoveConfirmationModalReducer,
  UploadConfirmation: uploadConfirmationModalReducer,
  EditAccessConfirmation: editAccessConfirmationModalReducer,
  EarlyReleaseConfirmation: earlyReleaseConfirmationModalReducer,
  DeleteTrackConfirmation: deleteTrackConfirmationModalReducer,
  ReplaceTrackConfirmation: replaceTrackConfirmationModalReducer,
  ReplaceTrackProgress: replaceTrackProgressModalReducer,
  PublishConfirmation: publishConfirmationModalReducer,
  HideContentConfirmation: hideContentConfirmationModalReducer,
  Announcement: announcementModalReducer,
  Notification: notificationModalReducer,
  DownloadTrackArchive: downloadTrackArchiveModalReducer,
  HostRemixContest: hostRemixContestModalReducer,
  FinalizeWinnersConfirmation: finalizeWinnersConfirmationModalReducer
})

/**
 * Return a reducer that processes child slices, then parent slice.
 * This maintains backwards compatibility between modals created without createModal
 */
export const rootModalReducer = (state: ModalsState, action: Action) => {
  const firstState = combinedReducers(state, action)
  return parentReducer(firstState, action)
}
