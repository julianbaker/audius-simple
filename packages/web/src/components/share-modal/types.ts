import { ShareType } from '@audius/common/store'

export type ShareProps = {
  /** If excluded, will disable rendering of a 'Direct Message' option */
  onShareToDirectMessage?: () => void
  onShareToX: () => void
  onCopyLink: () => void
  isOpen: boolean
  onClose: () => void
  onClosed: () => void
  shareType: ShareType
  isPrivate: boolean
}
