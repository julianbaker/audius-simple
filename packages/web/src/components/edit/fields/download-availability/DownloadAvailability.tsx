import { useCallback } from 'react'

import {
  AccessConditions,
  DownloadTrackAvailabilityType,
  isContentFollowGated
} from '@audius/common/models'
import { Nullable } from '@audius/common/utils'
import {
  Box,
  Flex,
  IconUserFollowing,
  IconVisibilityPublic,
  Text,
  TextLink,
  IconError,
  SegmentedControl,
  Option,
  Hint,
  Divider
} from '@audius/harmony'
import { useFormikContext } from 'formik'

import { MenuFormCallbackStatus } from 'components/data-entry/ContextualMenu'
import { useTrackField } from 'components/edit-track/hooks'

import { STREAM_CONDITIONS } from '../types'

const getMessages = (props: DownloadAvailabilityProps) => ({
  downloadAvailability: 'Download Availability',
  customize: 'Decide who can download your files.',
  public: 'Public',
  followers: 'Followers',
  callout: {
    followersOnly: `You're ${
      props.isUpload ? 'uploading' : 'editing'
    } a Followers Only track. By default, users who unlock your track will be able to download your available files. If you'd like to sell your files, set your track to Public or Hidden in the`,
    priceAndAudience: 'Price & Audience Settings'
  }
})

type DownloadAvailabilityProps = {
  isUpload: boolean
  value: DownloadTrackAvailabilityType
  setValue: (value: DownloadTrackAvailabilityType) => void
}

export const DownloadAvailability = (props: DownloadAvailabilityProps) => {
  const { value, setValue } = props
  const messages = getMessages(props)

  const { submitForm, setStatus } = useFormikContext()
  const [{ value: streamConditions }] =
    useTrackField<Nullable<AccessConditions>>(STREAM_CONDITIONS)
  const isFollowGated = isContentFollowGated(streamConditions)
  const shouldRenderCallout = isFollowGated

  const getCalloutMessage = useCallback(() => {
    if (isFollowGated) {
      return messages.callout.followersOnly
    }
    return ''
  }, [isFollowGated, messages.callout.followersOnly])

  const handleCalloutClick = useCallback(() => {
    setStatus(MenuFormCallbackStatus.OPEN_ACCESS_AND_SALE)
    submitForm()
  }, [setStatus, submitForm])

  const options: Option<DownloadTrackAvailabilityType>[] = [
    {
      key: DownloadTrackAvailabilityType.PUBLIC,
      text: messages.public,
      icon: <IconVisibilityPublic size='s' color='default' />
    },
    {
      key: DownloadTrackAvailabilityType.FOLLOWERS,
      text: messages.followers,
      icon: <IconUserFollowing size='s' color='default' />
    }
  ]

  const handleOptionSelect = useCallback(
    (option: DownloadTrackAvailabilityType) => {
      setValue(option)
    },
    [setValue]
  )

  const textCss = shouldRenderCallout
    ? {
        opacity: 0.5
      }
    : {}

  return (
    <>
      <Flex direction='column'>
        <Text variant='title' size='l' css={textCss}>
          {messages.downloadAvailability}
        </Text>
        <Box mt='s'>
          <Text variant='body' css={textCss}>
            {messages.customize}
          </Text>
        </Box>
      </Flex>
      {shouldRenderCallout ? (
        <Hint icon={IconError}>
          {getCalloutMessage()}{' '}
          <TextLink onClick={handleCalloutClick} variant='visible'>
            {messages.callout.priceAndAudience}
          </TextLink>
        </Hint>
      ) : (
        <>
          <SegmentedControl
            onSelectOption={handleOptionSelect}
            selected={value}
            options={options}
            // Matches 0.18s entry animation
            forceRefreshAfterMs={180}
          />
        </>
      )}
      <Divider />
    </>
  )
}
