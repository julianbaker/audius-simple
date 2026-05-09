import {
  SquareSizes,
  Track,
  UserMetadata,
  Collection
} from '@audius/common/models'
import { Nullable } from '@audius/common/utils'
import {
  Flex,
  Text,
  IconComponent,
  IconUserFollowing,
  Image
} from '@audius/harmony'
import cn from 'classnames'

import { CollectionDogEar } from 'components/collection'
import { UserLink } from 'components/link'
import { useCollectionCoverArt } from 'hooks/useCollectionCoverArt'
import { useTrackCoverArt } from 'hooks/useTrackCoverArt'

import styles from './LockedContentDetailsTile.module.css'
import { TrackDogEar } from './TrackDogEar'

const messages = {
  followersOnly: 'FOLLOWERS ONLY'
}

type LockedContentDetailsTileProps = {
  metadata: Track | Collection
  owner: UserMetadata
  showLabel?: boolean
  disabled?: boolean
}

export const LockedContentDetailsTile = ({
  metadata,
  owner,
  showLabel = true,
  disabled = false
}: LockedContentDetailsTileProps) => {
  const isAlbum = 'playlist_id' in metadata
  const contentId = isAlbum ? metadata.playlist_id : metadata.track_id
  const title = isAlbum ? metadata.playlist_name : metadata.title

  const { imageUrl: trackArt } = useTrackCoverArt({
    trackId: contentId,
    size: SquareSizes.SIZE_150_BY_150
  })
  const { imageUrl: albumArt } = useCollectionCoverArt({
    collectionId: contentId,
    size: SquareSizes.SIZE_150_BY_150
  })
  const image = isAlbum ? albumArt : trackArt

  const label = `${title} by ${owner.name}`

  const IconComponent: Nullable<IconComponent> = IconUserFollowing
  const message: Nullable<string> = messages.followersOnly

  return (
    <Flex
      alignItems='center'
      gap='l'
      p='l'
      border='strong'
      borderRadius='m'
      backgroundColor='surface1'
      css={{
        position: 'relative'
      }}
    >
      <Image
        className={cn(styles.imageWrapper, styles.image)}
        src={image}
        aria-label={label}
      />
      {isAlbum ? (
        <CollectionDogEar collectionId={contentId} />
      ) : (
        <TrackDogEar trackId={contentId} />
      )}
      <Flex column css={{ overflow: 'hidden' }} gap='s'>
        {showLabel && IconComponent && message ? (
          <Flex gap='s' alignItems='center'>
            <IconComponent size='s' color='special' />
            <Text variant='label' size='s' color='special'>
              {message}
            </Text>
          </Flex>
        ) : null}
        <Flex w='100%' direction='column' gap='xs'>
          <Text ellipses variant='title' size='m'>
            {title}
          </Text>
          <UserLink
            textVariant='body'
            size='m'
            userId={owner.user_id}
            disabled={disabled}
          />
        </Flex>
      </Flex>
    </Flex>
  )
}
