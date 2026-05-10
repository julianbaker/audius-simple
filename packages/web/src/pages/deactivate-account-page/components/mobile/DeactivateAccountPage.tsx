import { useContext, useEffect } from 'react'

import { route } from '@audius/common/utils'

import { useMobileHeader } from 'components/header/mobile/hooks'
import MobilePageContainer from 'components/mobile-page-container/MobilePageContainer'
import ResponsiveModal from 'components/modal/ResponsiveModal'
import NavContext, {
  LeftPreset,
  RightPreset
} from 'components/nav/mobile/NavContext'
import { BASE_URL } from 'utils/route'

import {
  messages,
  DeactivateAccountPageProps
} from '../../DeactivateAccountPage'

const { DEACTIVATE_PAGE } = route

// ActionDrawer's `didSelectRow` callback maps action indices to handlers.
// Preserve the original ordering: 0 = Deactivate (destructive), 1 = Go Back.
const ACTION_DEACTIVATE = 0
const ACTION_GO_BACK = 1

const useMobileNavContext = () => {
  useMobileHeader({ title: messages.title })
  const { setLeft, setRight } = useContext(NavContext)!
  useEffect(() => {
    setLeft(LeftPreset.CLOSE)
    setRight(RightPreset.KEBAB)
  }, [setLeft, setRight])
}

export const DeactivateAccountPageMobile = ({
  children,
  isConfirmationVisible,
  onDrawerSelection,
  closeConfirmation
}: DeactivateAccountPageProps) => {
  useMobileNavContext()
  return (
    <MobilePageContainer
      title={messages.title}
      description={messages.description}
      canonicalUrl={`${BASE_URL}${DEACTIVATE_PAGE}`}
      hasDefaultHeader
    >
      {children}
      <ResponsiveModal
        isOpen={isConfirmationVisible}
        onClose={closeConfirmation}
        title={messages.confirmTitle}
        size='s'
        confirmation={{
          description: messages.confirm,
          confirmText: messages.buttonDeactivate,
          cancelText: messages.buttonGoBack,
          onConfirm: () => onDrawerSelection(ACTION_DEACTIVATE),
          onCancel: () => onDrawerSelection(ACTION_GO_BACK),
          isDestructive: true
        }}
      />
    </MobilePageContainer>
  )
}
