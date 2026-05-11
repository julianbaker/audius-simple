import { useCallback, useEffect } from 'react'

import { Name, Status } from '@audius/common/models'
import {
  deactivateAccountActions,
  deactivateAccountSelectors
} from '@audius/common/store'
import { Button, Flex } from '@audius/harmony'
import { useDispatch, useSelector } from 'react-redux'

import { useModalState } from 'common/hooks/useModalState'
import { make, useRecord } from 'common/store/analytics/actions'
import { Header } from 'components/header/desktop/Header'
import LoadingSpinnerFullPage from 'components/loading-spinner-full-page/LoadingSpinnerFullPage'
import ResponsiveModal from 'components/modal/ResponsiveModal'
import Page from 'components/page/Page'
import { useIsMobile } from 'hooks/useIsMobile'
import { push } from 'utils/navigation'

import styles from './DeactivateAccountPage.module.css'

const { deactivateAccount } = deactivateAccountActions
const { getDeactivateAccountStatus } = deactivateAccountSelectors

const messages = {
  title: 'Delete',
  description: 'Delete your account',
  header: 'Are You Sure You Want To Delete Your Account?',
  listItems: [
    "There's no going back.",
    'This will remove all of your tracks, albums and playlists.',
    'You will not be able to re-register with the same email or handle'
  ],
  confirmTitle: 'Delete Account',
  confirm: 'Are you sure? This cannot be undone.',
  buttonDeactivate: 'Delete',
  buttonSafety: 'Take me back to safety',
  buttonGoBack: 'Go Back',
  errorMessage: 'Something went wrong.',
  errorMessageTryAgain: 'Please try again.'
}

export const DeactivateAccountPage = () => {
  const isMobile = useIsMobile()
  const dispatch = useDispatch()
  const record = useRecord()
  const deactivateAccountStatus = useSelector(getDeactivateAccountStatus)
  const [isConfirmationVisible, setIsConfirmationVisible] = useModalState(
    'DeactivateAccountConfirmation'
  )
  const isDeactivating = deactivateAccountStatus === Status.LOADING
  const isError = deactivateAccountStatus === Status.ERROR

  const openConfirmation = useCallback(() => {
    setIsConfirmationVisible(true)
  }, [setIsConfirmationVisible])

  const closeConfirmation = useCallback(() => {
    if (!isDeactivating) {
      setIsConfirmationVisible(false)
    }
  }, [isDeactivating, setIsConfirmationVisible])

  const onConfirm = useCallback(() => {
    dispatch(deactivateAccount())
  }, [dispatch])

  const goToSafety = useCallback(() => {
    dispatch(push('/'))
  }, [dispatch])

  useEffect(() => {
    record(make(Name.DEACTIVATE_ACCOUNT_PAGE_VIEW, {}))
  }, [record])

  // Error closes the confirmation so the in-page error can show.
  useEffect(() => {
    if (deactivateAccountStatus === Status.ERROR) {
      closeConfirmation()
    }
  }, [deactivateAccountStatus, closeConfirmation])

  return (
    <Page
      title={messages.title}
      description={messages.description}
      header={<Header primary={messages.title} />}
    >
      <div className={styles.tile}>
        <div className={styles.header}>{messages.header}</div>
        <ul className={styles.list}>
          {messages.listItems.map((message, i) => (
            <li key={i}>{message}</li>
          ))}
        </ul>
        {isDeactivating && isMobile ? <LoadingSpinnerFullPage /> : null}
        {isError ? (
          <div className={styles.error}>
            <span className={styles.errorMessage}>{messages.errorMessage}</span>{' '}
            <span className={styles.errorMessage}>
              {messages.errorMessageTryAgain}
            </span>
          </div>
        ) : null}
        <Flex gap='l'>
          <Button
            variant='destructive'
            isLoading={isDeactivating}
            onClick={openConfirmation}
            fullWidth={isMobile}
          >
            {messages.buttonDeactivate}
          </Button>
          <Button
            variant='secondary'
            isLoading={isDeactivating}
            onClick={goToSafety}
            fullWidth={isMobile}
          >
            {messages.buttonSafety}
          </Button>
        </Flex>
      </div>
      <ResponsiveModal
        isOpen={isConfirmationVisible}
        onClose={closeConfirmation}
        title={messages.confirmTitle}
        size='s'
        confirmation={{
          description: messages.confirm,
          confirmText: messages.buttonDeactivate,
          cancelText: messages.buttonGoBack,
          onConfirm,
          onCancel: closeConfirmation,
          isDestructive: true,
          isConfirming: isDeactivating
        }}
      />
    </Page>
  )
}
