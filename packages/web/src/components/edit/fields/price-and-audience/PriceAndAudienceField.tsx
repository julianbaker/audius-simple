import { useCallback, useMemo, useState } from 'react'

import { useCurrentUserId } from '@audius/common/api'
import { priceAndAudienceMessages } from '@audius/common/messages'
import {
  isContentFollowGated,
  StreamTrackAvailabilityType,
  FollowGatedConditions,
  AccessConditions
} from '@audius/common/models'
import { CollectionValues } from '@audius/common/schemas'
import {
  EditCollectionValues,
  useEditAccessConfirmationModal
} from '@audius/common/store'
import { getUsersMayLoseAccess, Nullable } from '@audius/common/utils'
import {
  IconVisibilityHidden as IconHidden,
  IconUserFollowing
} from '@audius/harmony'
import { useField, useFormikContext } from 'formik'
import { get, isEmpty, set } from 'lodash'
import { toFormikValidationSchema } from 'zod-formik-adapter'

import {
  ContextualMenu,
  SelectedValue,
  SelectedValueProps
} from 'components/data-entry/ContextualMenu'
import { useTrackField } from 'components/edit-track/hooks'
import {
  SingleTrackEditValues,
  TrackEditFormValues
} from 'components/edit-track/types'
import { defaultFieldVisibility } from 'pages/track-page/utils'

import { REMIX_OF } from '../RemixSettingsField'
import { getCombinedDefaultGatedConditionValues } from '../helpers'
import {
  AccessAndSaleFormValues,
  DOWNLOAD_CONDITIONS,
  FIELD_VISIBILITY,
  GateKeeper,
  IS_DOWNLOADABLE,
  IS_DOWNLOAD_GATED,
  IS_PRIVATE,
  IS_SCHEDULED_RELEASE,
  IS_STREAM_GATED,
  IS_UNLISTED,
  LAST_GATE_KEEPER,
  PREVIEW,
  STREAM_AVAILABILITY_TYPE,
  STREAM_CONDITIONS
} from '../types'

import styles from './PriceAndAudienceField.module.css'
import { PriceAndAudienceMenuFields } from './PriceAndAudienceMenuFields'
import { priceAndAudienceSchema } from './priceAndAudienceSchema'

const messages = {
  ...priceAndAudienceMessages,
  fieldVisibility: {
    genre: 'Show Genre',
    mood: 'Show Mood',
    tags: 'Show Tags',
    share: 'Show Share Button',
    play_count: 'Show Play Count',
    remixes: 'Show Remixes'
  },
  ownersOf: 'Owners Of'
}

type PriceAndAudienceFieldProps = {
  isUpload?: boolean
  isAlbum?: boolean
  trackLength?: number
  forceOpen?: boolean
  setForceOpen?: (value: boolean) => void
  isPublishDisabled?: boolean
}

export const PriceAndAudienceField = (props: PriceAndAudienceFieldProps) => {
  const {
    isUpload,
    isAlbum,
    forceOpen,
    setForceOpen,
    isPublishDisabled = false
  } = props

  const [isConfirmationCancelled, setIsConfirmationCancelled] = useState(false)

  const isHiddenFieldName = isAlbum ? IS_PRIVATE : IS_UNLISTED

  const [{ value: index }] = useField('trackMetadatasIndex')

  // For edit flows we need to track initial stream conditions from the parent form (not from inside contextual menu)
  // So we take this from the parent form and pass it down to the menu fields
  const { initialValues: parentFormInitialValues } = useFormikContext<
    EditCollectionValues | CollectionValues | TrackEditFormValues
  >()
  const parentFormInitialStreamConditions =
    'stream_conditions' in parentFormInitialValues
      ? (parentFormInitialValues.stream_conditions as AccessConditions)
      : 'trackMetadatas' in parentFormInitialValues
        ? parentFormInitialValues.trackMetadatas[index].stream_conditions
        : undefined

  // Fields from the outer form
  const [{ value: isUnlisted }, , { setValue: setIsUnlistedValue }] =
    useTrackField<boolean>(isHiddenFieldName)
  const [{ value: isScheduledRelease }, ,] =
    useTrackField<SingleTrackEditValues[typeof IS_SCHEDULED_RELEASE]>(
      IS_SCHEDULED_RELEASE
    )
  const [{ value: isStreamGated }, , { setValue: setIsStreamGated }] =
    useTrackField<SingleTrackEditValues[typeof IS_STREAM_GATED]>(
      IS_STREAM_GATED
    )
  const [
    { value: savedStreamConditions },
    ,
    { setValue: setStreamConditionsValue }
  ] =
    useTrackField<SingleTrackEditValues[typeof STREAM_CONDITIONS]>(
      STREAM_CONDITIONS
    )

  const [{ value: fieldVisibility }, , { setValue: setFieldVisibilityValue }] =
    useTrackField<SingleTrackEditValues[typeof FIELD_VISIBILITY]>(
      FIELD_VISIBILITY
    )
  const [{ value: remixOfValue }] =
    useTrackField<SingleTrackEditValues[typeof REMIX_OF]>(REMIX_OF)

  const [{ value: preview }, , { setValue: setPreviewValue }] =
    useTrackField<SingleTrackEditValues[typeof PREVIEW]>(PREVIEW)

  const [{ value: isDownloadGated }, , { setValue: setIsDownloadGated }] =
    useTrackField<SingleTrackEditValues[typeof IS_DOWNLOAD_GATED]>(
      IS_DOWNLOAD_GATED
    )
  const [
    { value: downloadConditions },
    ,
    { setValue: setDownloadConditionsValue }
  ] =
    useTrackField<SingleTrackEditValues[typeof DOWNLOAD_CONDITIONS]>(
      DOWNLOAD_CONDITIONS
    )
  const [{ value: isDownloadable }, , { setValue: setIsDownloadable }] =
    useTrackField<boolean>(IS_DOWNLOADABLE)
  const [{ value: lastGateKeeper }, , { setValue: setLastGateKeeper }] =
    useTrackField<GateKeeper>(LAST_GATE_KEEPER)

  const isRemix = !isEmpty(remixOfValue?.tracks)

  /**
   * Stream conditions from inside the modal.
   * Upon submit, these values along with the selected access option will
   * determine the final stream conditions that get saved to the track.
   */
  const { data: accountUserId } = useCurrentUserId()
  const tempStreamConditions = useMemo(
    () =>
      ({
        ...getCombinedDefaultGatedConditionValues(accountUserId),
        ...savedStreamConditions
      }) as Nullable<AccessConditions>,
    [accountUserId, savedStreamConditions]
  )

  const { onOpen: onOpenEditAccessConfirmationModal } =
    useEditAccessConfirmationModal()

  const isFollowGated = isContentFollowGated(savedStreamConditions)

  const initialValues = useMemo(() => {
    const initialValues = {}
    set(initialValues, isHiddenFieldName, isUnlisted)
    set(initialValues, IS_STREAM_GATED, isStreamGated)
    set(initialValues, STREAM_CONDITIONS, tempStreamConditions)
    set(initialValues, IS_DOWNLOAD_GATED, isDownloadGated)
    set(initialValues, DOWNLOAD_CONDITIONS, downloadConditions)
    set(initialValues, IS_DOWNLOADABLE, isDownloadable)
    set(initialValues, LAST_GATE_KEEPER, lastGateKeeper ?? {})

    let availabilityType = StreamTrackAvailabilityType.FREE

    if (isFollowGated) {
      availabilityType = StreamTrackAvailabilityType.FOLLOW_GATED
    }
    set(initialValues, STREAM_AVAILABILITY_TYPE, availabilityType)
    set(initialValues, FIELD_VISIBILITY, fieldVisibility)
    set(initialValues, PREVIEW, preview ?? 0)
    return initialValues as AccessAndSaleFormValues
  }, [
    isHiddenFieldName,
    isUnlisted,
    isStreamGated,
    tempStreamConditions,
    isDownloadGated,
    downloadConditions,
    isDownloadable,
    lastGateKeeper,
    isFollowGated,
    fieldVisibility,
    preview
  ])

  const handleSubmit = useCallback(
    (values: AccessAndSaleFormValues) => {
      const availabilityType = get(values, STREAM_AVAILABILITY_TYPE)
      const fieldVisibility = get(values, FIELD_VISIBILITY)
      const streamConditions = get(values, STREAM_CONDITIONS)
      const lastGateKeeper = get(values, LAST_GATE_KEEPER)

      setFieldVisibilityValue({
        ...defaultFieldVisibility,
        remixes: fieldVisibility?.remixes ?? defaultFieldVisibility.remixes
      })
      setIsStreamGated(false)
      setStreamConditionsValue(null)
      setPreviewValue(undefined)

      // For gated options, extract the correct stream conditions based on the selected availability type
      switch (availabilityType) {
        case StreamTrackAvailabilityType.FOLLOW_GATED: {
          const { follow_user_id } = streamConditions as FollowGatedConditions
          if (follow_user_id) {
            setStreamConditionsValue({ follow_user_id })
            setDownloadConditionsValue({ follow_user_id })
            setIsStreamGated(true)
            setIsDownloadGated(true)
          }
          setLastGateKeeper({
            ...lastGateKeeper,
            access: 'accessAndSale'
          })
          break
        }
        case StreamTrackAvailabilityType.HIDDEN: {
          setFieldVisibilityValue({
            ...(fieldVisibility ?? undefined),
            remixes: fieldVisibility?.remixes ?? defaultFieldVisibility.remixes
          })
          setIsUnlistedValue(true)
          if (lastGateKeeper.access === 'accessAndSale') {
            setIsDownloadGated(false)
            setDownloadConditionsValue(null)
          }
          if (lastGateKeeper.downloadable === 'accessAndSale') {
            setIsDownloadable(false)
          }
          break
        }
        case StreamTrackAvailabilityType.PUBLIC: {
          setIsUnlistedValue(false)
          if (lastGateKeeper.access === 'accessAndSale') {
            setIsDownloadGated(false)
            setDownloadConditionsValue(null)
          }
          if (lastGateKeeper.downloadable === 'accessAndSale') {
            setIsDownloadable(false)
          }
          break
        }
      }
    },
    [
      setFieldVisibilityValue,
      setIsUnlistedValue,
      setIsStreamGated,
      setStreamConditionsValue,
      setPreviewValue,
      setIsDownloadGated,
      setDownloadConditionsValue,
      setIsDownloadable,
      setLastGateKeeper
    ]
  )

  const renderValue = useCallback(() => {
    let selectedValues: (SelectedValueProps | string)[] = []

    if (isContentFollowGated(savedStreamConditions)) {
      selectedValues = [
        { label: messages.followersOnly, icon: IconUserFollowing }
      ]
    } else {
      selectedValues = [{ label: messages.free }]
    }

    return (
      <div className={styles.value}>
        {selectedValues.map((value) => {
          const valueProps =
            typeof value === 'string' ? { label: value } : value
          return (
            <SelectedValue
              key={
                'data-testid' in valueProps
                  ? valueProps['data-testid']
                  : valueProps.label
              }
              {...valueProps}
            />
          )
        })}
      </div>
    )
  }, [savedStreamConditions])

  return (
    <ContextualMenu
      label={messages.title}
      description={messages.accessDescription}
      icon={<IconHidden />}
      initialValues={initialValues}
      onSubmit={(values) => {
        const availabilityType = get(values, STREAM_AVAILABILITY_TYPE)
        const usersMayLoseAccess = getUsersMayLoseAccess({
          availability: availabilityType,
          initialStreamConditions: parentFormInitialStreamConditions
        })

        if (!isUpload && usersMayLoseAccess) {
          onOpenEditAccessConfirmationModal({
            confirmCallback: () => handleSubmit(values),
            cancelCallback: () => {
              setIsConfirmationCancelled(true)
            }
          })
        } else {
          handleSubmit(values)
        }
      }}
      renderValue={renderValue}
      validationSchema={toFormikValidationSchema(priceAndAudienceSchema())}
      menuFields={
        <PriceAndAudienceMenuFields
          isRemix={isRemix}
          isUpload={isUpload}
          isAlbum={isAlbum}
          streamConditions={tempStreamConditions}
          isScheduledRelease={isScheduledRelease}
          isInitiallyUnlisted={isUnlisted}
          isPublishDisabled={isPublishDisabled}
        />
      }
      forceOpen={isConfirmationCancelled || forceOpen}
      setForceOpen={
        isConfirmationCancelled ? setIsConfirmationCancelled : setForceOpen
      }
    />
  )
}
