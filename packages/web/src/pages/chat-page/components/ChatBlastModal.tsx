import { useCurrentAccountUser } from '@audius/common/api'
import {
  useFirstAvailableBlastAudience,
  useRemixersAudience
} from '@audius/common/hooks'
import {
  useChatBlastModal,
  chatActions,
  useCreateChatModal
} from '@audius/common/src/store'
import { formatNumberCommas } from '@audius/common/utils'
import {
  Flex,
  IconTowerBroadcast,
  Modal,
  ModalHeader,
  Text,
  ModalTitle,
  Radio,
  Button,
  RadioGroup,
  ModalFooter,
  IconCaretLeft,
  ModalContent,
  Select
} from '@audius/harmony'
import { ChatBlastAudience } from '@audius/sdk'
import { Formik, useField } from 'formik'
import { useDispatch } from 'react-redux'

const { createChatBlast } = chatActions

const messages = {
  title: 'Target Audience',
  back: 'Back',
  continue: 'Continue',
  followers: {
    label: 'My Followers',
    description: 'Send a bulk message to all of your followers.'
  },
  remixCreators: {
    label: 'Remix Creators',
    description:
      'Send a bulk message to creators who have remixed your tracks.',
    placeholder: 'Tracks with Remixes'
  }
}

const TARGET_AUDIENCE_FIELD = 'target_audience'

type ChatBlastFormValues = {
  target_audience: ChatBlastAudience | null
  remixed_track_id?: number
}

export const ChatBlastModal = () => {
  const dispatch = useDispatch()
  const { isOpen, onClose } = useChatBlastModal()
  const { onOpen: openCreateChatModal, data: createChatModalData } =
    useCreateChatModal()

  const defaultAudience = useFirstAvailableBlastAudience()
  const initialValues: ChatBlastFormValues = {
    target_audience: defaultAudience,
    remixed_track_id: undefined
  }

  const handleSubmit = (values: ChatBlastFormValues) => {
    onClose()
    const audienceContentId = values.remixed_track_id
    const audienceContentType =
      values.target_audience === ChatBlastAudience.REMIXERS
        ? 'track'
        : undefined
    dispatch(
      createChatBlast({
        audience: values.target_audience ?? ChatBlastAudience.FOLLOWERS,
        audienceContentId,
        audienceContentType
      })
    )
  }

  const handleCancel = () => {
    onClose()
    openCreateChatModal(createChatModalData)
  }

  return (
    <Modal size='small' isOpen={isOpen} onClose={onClose}>
      <Formik<ChatBlastFormValues>
        initialValues={initialValues}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ submitForm, isSubmitting }) => (
          <>
            <ModalHeader>
              <ModalTitle
                icon={<IconTowerBroadcast />}
                title={messages.title}
              />
            </ModalHeader>
            <ModalContent>
              <ChatBlastsFields />
            </ModalContent>
            <ModalFooter>
              <Flex w='100%' gap='s'>
                <Button
                  variant='secondary'
                  iconLeft={IconCaretLeft}
                  css={{ flexGrow: 1 }}
                  onClick={handleCancel}
                >
                  {messages.back}
                </Button>
                <Button
                  variant='primary'
                  type='submit'
                  css={{ flexGrow: 1 }}
                  onClick={submitForm}
                  // Empty default audience means there are no users in any audience
                  disabled={!!isSubmitting || !defaultAudience}
                >
                  {messages.continue}
                </Button>
              </Flex>
            </ModalFooter>
          </>
        )}
      </Formik>
    </Modal>
  )
}

const ChatBlastsFields = () => {
  const [field] = useField(TARGET_AUDIENCE_FIELD)

  return (
    <RadioGroup {...field}>
      <Flex direction='column' gap='xl'>
        <FollowersMessageField />
        <RemixCreatorsMessageField />
      </Flex>
    </RadioGroup>
  )
}

const LabelWithCount = (props: {
  label: string
  count?: number
  isSelected: boolean
}) => {
  const { label, count, isSelected } = props

  return (
    <Flex gap='xs'>
      <Text variant='title' size='l'>
        {label}
      </Text>
      {isSelected && count !== undefined ? (
        <Text variant='title' size='l' color='subdued'>
          ({formatNumberCommas(count)})
        </Text>
      ) : null}
    </Flex>
  )
}

const FollowersMessageField = () => {
  const { data: user } = useCurrentAccountUser()
  const [{ value }] = useField(TARGET_AUDIENCE_FIELD)
  const selected = value === ChatBlastAudience.FOLLOWERS
  const isDisabled = user?.follower_count === 0
  return (
    <Flex
      as='label'
      gap='l'
      css={{
        opacity: isDisabled ? 0.5 : 1
      }}
    >
      <Radio value={ChatBlastAudience.FOLLOWERS} disabled={isDisabled} />
      <Flex direction='column' gap='xs' css={{ cursor: 'pointer' }}>
        <LabelWithCount
          label={messages.followers.label}
          count={user?.follower_count}
          isSelected={selected}
        />
        {selected ? (
          <Text size='s'>{messages.followers.description}</Text>
        ) : null}
      </Flex>
    </Flex>
  )
}

const RemixCreatorsMessageField = () => {
  const [{ value: targetAudience }] = useField(TARGET_AUDIENCE_FIELD)
  const [remixedTrackField, , { setValue: setRemixedTrackId }] = useField({
    name: 'remixed_track_id',
    type: 'select'
  })

  const { isDisabled, remixersCount, remixedTracksOptions } =
    useRemixersAudience({
      remixedTrackId: remixedTrackField.value
    })
  const isSelected = targetAudience === ChatBlastAudience.REMIXERS

  return (
    <Flex
      as='label'
      gap='l'
      css={{
        opacity: isDisabled ? 0.5 : 1
      }}
    >
      <Radio value={ChatBlastAudience.REMIXERS} disabled={isDisabled} />
      <Flex direction='column' gap='xs' css={{ cursor: 'pointer' }}>
        <LabelWithCount
          label={messages.remixCreators.label}
          count={remixersCount}
          isSelected={isSelected}
        />
        {isSelected ? (
          <Flex direction='column' gap='l'>
            <Text size='s'>{messages.remixCreators.description}</Text>
            <Select
              {...remixedTrackField}
              options={remixedTracksOptions}
              label={messages.remixCreators.placeholder}
              onChange={setRemixedTrackId}
              clearable
            />
          </Flex>
        ) : null}
      </Flex>
    </Flex>
  )
}
