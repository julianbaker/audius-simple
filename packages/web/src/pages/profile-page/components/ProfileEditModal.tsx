import { Button, Flex, IconPencil } from '@audius/harmony'

import CoverPhoto from 'components/cover-photo/CoverPhoto'
import ResponsiveModal from 'components/modal/ResponsiveModal'
// JS module, ProfilePicture is a default export with prop types.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — legacy prop shape
import ProfilePicture from 'components/profile-picture/ProfilePicture'

import EditProfile from './EditProfile'

const messages = {
  title: 'Edit Profile',
  cancel: 'Cancel',
  save: 'Save Changes'
}

type ProfileEditModalProps = {
  isOpen: boolean
  onClose: () => void
  hasMadeEdit: boolean

  // Identity (used to render the live cover + profile picture previews)
  userId: number | null | undefined
  hasProfilePicture: boolean
  updatedProfilePictureUrl?: string
  updatedCoverPhotoUrl?: string

  // Form values
  name: string
  bio: string
  location: string
  xHandle: string
  instagramHandle: string
  tikTokHandle: string
  twitterVerified: boolean
  instagramVerified: boolean
  tikTokVerified: boolean
  website: string

  // Form handlers
  onUpdateName: (name: string) => void
  onUpdateBio: (bio: string) => void
  onUpdateLocation: (location: string) => void
  onUpdateXHandle: (handle: string) => void
  onUpdateInstagramHandle: (handle: string) => void
  onUpdateTikTokHandle: (handle: string) => void
  onUpdateWebsite: (website: string) => void

  // Image upload handlers — accept array-like file inputs (FileList or
  // FileWithPreview[]) and a source tag. Same signatures used by the
  // ImageSelectionButton wired up inside ProfilePicture / CoverPhoto.
  onUpdateProfilePicture: (
    files: any,
    source: 'original' | 'unsplash' | 'url'
  ) => void
  onUpdateCoverPhoto: (
    files: any,
    source: 'original' | 'unsplash' | 'url'
  ) => void

  // Final commit
  onSave: () => void
  onCancel: () => void
}

/**
 * Unified profile edit experience.
 *
 * The image upload sections use the same `CoverPhoto` and
 * `ProfilePicture` components that render on the profile itself, in
 * their edit modes. This guarantees the previews look identical to the
 * live page (circle PFP straddling the cover) and reuses the existing
 * ImageSelectionButton flow rather than re-inventing an "upload stub"
 * with dashed-border placeholders.
 */
export const ProfileEditModal = (props: ProfileEditModalProps) => {
  const {
    isOpen,
    hasMadeEdit,
    userId,
    hasProfilePicture,
    updatedProfilePictureUrl,
    updatedCoverPhotoUrl,
    name,
    bio,
    location,
    xHandle,
    instagramHandle,
    tikTokHandle,
    twitterVerified,
    instagramVerified,
    tikTokVerified,
    website,
    onUpdateName,
    onUpdateBio,
    onUpdateLocation,
    onUpdateXHandle,
    onUpdateInstagramHandle,
    onUpdateTikTokHandle,
    onUpdateWebsite,
    onUpdateProfilePicture,
    onUpdateCoverPhoto,
    onSave,
    onCancel
  } = props

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onCancel}
      title={messages.title}
      Icon={IconPencil}
      size='l'
    >
      <Flex column gap='l' pb='l'>
        {/* Live cover photo preview with the existing edit overlay.
            Click anywhere on the cover to open the image picker. */}
        <Flex
          css={{
            position: 'relative',
            width: '100%',
            // Match the profile-page cover height so the user sees the
            // crop they will actually get.
            height: 200,
            overflow: 'hidden'
          }}
        >
          <CoverPhoto
            userId={userId ?? null}
            updatedCoverPhoto={updatedCoverPhotoUrl}
            edit
            onDrop={async (files, source) => {
              onUpdateCoverPhoto(files, source)
            }}
          />
        </Flex>

        {/* Profile picture preview. The legacy component renders a
            208px circle with an ImageSelectionButton overlay — same
            visual as the live profile, so it's unambiguous what the
            user is editing. We pull it up over the cover (negative
            margin) to mirror the live profile composition. */}
        <Flex
          justifyContent='center'
          css={{
            marginTop: -104,
            zIndex: 1
          }}
        >
          <ProfilePicture
            userId={userId}
            profilePictureSizes={null}
            updatedProfilePicture={updatedProfilePictureUrl || ''}
            url={undefined}
            error={false}
            editMode
            loading={false}
            hasProfilePicture={hasProfilePicture}
            onDrop={async (files: any, source: any) => {
              onUpdateProfilePicture(files, source)
            }}
          />
        </Flex>

        {/* Text fields */}
        <Flex column ph='l'>
          <EditProfile
            name={name}
            bio={bio}
            location={location}
            xHandle={xHandle}
            instagramHandle={instagramHandle}
            tikTokHandle={tikTokHandle}
            twitterVerified={twitterVerified}
            instagramVerified={instagramVerified}
            tikTokVerified={tikTokVerified}
            website={website}
            onUpdateName={onUpdateName}
            onUpdateBio={onUpdateBio}
            onUpdateLocation={onUpdateLocation}
            onUpdateXHandle={onUpdateXHandle}
            onUpdateInstagramHandle={onUpdateInstagramHandle}
            onUpdateTikTokHandle={onUpdateTikTokHandle}
            onUpdateWebsite={onUpdateWebsite}
          />
        </Flex>

        <Flex
          gap='s'
          justifyContent='flex-end'
          ph='l'
          pt='m'
          css={{ borderTop: '1px solid var(--harmony-border-default)' }}
        >
          <Button variant='secondary' onClick={onCancel}>
            {messages.cancel}
          </Button>
          <Button variant='primary' onClick={onSave} disabled={!hasMadeEdit}>
            {messages.save}
          </Button>
        </Flex>
      </Flex>
    </ResponsiveModal>
  )
}
