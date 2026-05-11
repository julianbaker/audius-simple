import { useCallback } from 'react'

import { Name } from '@audius/common/models'
import { Flex, Text } from '@audius/harmony'

import { make, useRecord } from 'common/store/analytics/actions'
import { UserGeneratedText } from 'components/user-generated-text'

import SocialLink, { Type } from './SocialLink'

type ProfileBioProps = {
  handle: string
  bio: string
  location: string
  website: string
  created: string
  twitterHandle: string
  instagramHandle: string
  tikTokHandle: string
}

/**
 * Compact bio block: paragraph (truncated past 4 lines) + a single
 * inline row of social-link icons + a compact location/joined meta
 * line. Previously this used a see-more / see-less unfurl pattern with
 * the social links rendering as a vertical column of full handles —
 * that layout was designed for a narrow mobile column and looks sparse
 * full-width. Inline icons keep the surface dense and readable at any
 * width.
 */
export const ProfileBio = ({
  handle,
  bio,
  location,
  website,
  created,
  twitterHandle,
  instagramHandle,
  tikTokHandle
}: ProfileBioProps) => {
  const record = useRecord()

  const onClickTwitter = useCallback(() => {
    record(
      make(Name.PROFILE_PAGE_CLICK_TWITTER, {
        handle: handle.replace('@', ''),
        twitterHandle
      })
    )
  }, [record, handle, twitterHandle])
  const onClickInstagram = useCallback(() => {
    record(
      make(Name.PROFILE_PAGE_CLICK_INSTAGRAM, {
        handle: handle.replace('@', ''),
        instagramHandle
      })
    )
  }, [record, handle, instagramHandle])
  const onClickTikTok = useCallback(() => {
    record(
      make(Name.PROFILE_PAGE_CLICK_TIKTOK, {
        handle: handle.replace('@', ''),
        tikTokHandle
      })
    )
  }, [record, handle, tikTokHandle])
  const onClickWebsite = useCallback(() => {
    record(
      make(Name.PROFILE_PAGE_CLICK_WEBSITE, {
        handle: handle.replace('@', ''),
        website
      })
    )
  }, [record, handle, website])

  const hasAnySocial = !!(
    twitterHandle ||
    instagramHandle ||
    tikTokHandle ||
    website
  )
  const hasAnyMeta = !!(location || created)

  // Render nothing if the user has provided no identity content at
  // all — keeps the surface from showing a stray empty block.
  if (!bio && !hasAnySocial && !hasAnyMeta) return null

  return (
    <Flex column gap='s'>
      {bio ? (
        <UserGeneratedText size='s' ellipses linkSource='profile page'>
          {bio}
        </UserGeneratedText>
      ) : null}
      {hasAnySocial || hasAnyMeta ? (
        <Flex gap='l' alignItems='center' css={{ flexWrap: 'wrap' }}>
          {hasAnySocial ? (
            <Flex gap='m' alignItems='center'>
              {twitterHandle ? (
                <SocialLink
                  type={Type.X}
                  link={twitterHandle}
                  onClick={onClickTwitter}
                  iconOnly
                />
              ) : null}
              {instagramHandle ? (
                <SocialLink
                  type={Type.INSTAGRAM}
                  link={instagramHandle}
                  onClick={onClickInstagram}
                  iconOnly
                />
              ) : null}
              {tikTokHandle ? (
                <SocialLink
                  type={Type.TIKTOK}
                  link={tikTokHandle}
                  onClick={onClickTikTok}
                  iconOnly
                />
              ) : null}
              {website ? (
                <SocialLink
                  type={Type.WEBSITE}
                  link={website}
                  onClick={onClickWebsite}
                  iconOnly
                />
              ) : null}
            </Flex>
          ) : null}
          {location ? (
            <Text variant='body' size='s' color='subdued'>
              {location}
            </Text>
          ) : null}
          {created ? (
            <Text variant='body' size='s' color='subdued'>
              Joined {created}
            </Text>
          ) : null}
        </Flex>
      ) : null}
    </Flex>
  )
}
