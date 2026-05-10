import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  selectIsAccountComplete,
  useCurrentAccountUser,
  useCurrentUserId,
  useCurrentWeb3Account,
  useManagedAccounts
} from '@audius/common/api'
import { useAccountSwitcher } from '@audius/common/hooks'
import { UserMetadata } from '@audius/common/models'
import {
  Box,
  BottomSheet,
  IconButton,
  IconCaretDown,
  Popup,
  useMedia
} from '@audius/harmony'

import { AccountListContent } from './AccountListContent'

const messages = {
  ariaLabel: 'Switch account',
  toggleLabel: 'Open Account Switcher'
}

type AccountSwitcherProps = {
  onVisibilityChange?: (isVisible: boolean) => void
}

export const AccountSwitcher = ({
  onVisibilityChange
}: AccountSwitcherProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const { data: isAccountComplete = false } = useCurrentAccountUser({
    select: selectIsAccountComplete
  })
  const [checkedAccess, setCheckedAccess] = useState(false)

  const { data: currentWeb3User } = useCurrentWeb3Account({
    enabled: isAccountComplete
  })
  const { data: currentUserId } = useCurrentUserId()

  const { switchAccount, switchToWeb3User } = useAccountSwitcher()

  const onAccountSelected = useCallback(
    (user: UserMetadata) => {
      switchAccount(user)
    },
    [switchAccount]
  )

  const web3UserId = currentWeb3User?.user_id ?? null

  const {
    data: managedAccounts = [],
    isSuccess: isManagedAccountsSuccess,
    isPending: isManagedAccountsPending
  } = useManagedAccounts(web3UserId)

  const parentElementRef = useRef<HTMLDivElement>(null)
  const onClickExpander = useCallback(
    () => setIsExpanded((expanded) => !expanded),
    []
  )

  const accounts = useMemo(() => {
    return managedAccounts.filter(({ grant }) => grant.is_approved)
  }, [managedAccounts])

  const isVisible = Boolean(
    currentWeb3User && currentUserId && accounts.length > 0
  )
  const isLoadingAccounts = Boolean(
    currentWeb3User && currentUserId && isManagedAccountsPending
  )

  // Notify parent of visibility changes
  useEffect(() => {
    onVisibilityChange?.(isVisible)
    return () => {
      onVisibilityChange?.(false)
    }
  }, [isVisible, onVisibilityChange])

  // Reset to the web3User if we detect that the current user is no longer in
  // the managed accounts list
  useEffect(() => {
    if (
      !currentUserId ||
      !currentWeb3User ||
      !isManagedAccountsSuccess ||
      checkedAccess
    ) {
      return
    }
    // Check this only once per mount
    setCheckedAccess(true)
    if (
      currentUserId !== currentWeb3User.user_id &&
      !accounts.some(({ user: { user_id } }) => user_id === currentUserId)
    ) {
      switchToWeb3User()
    }
  }, [
    accounts,
    checkedAccess,
    currentUserId,
    currentWeb3User,
    isManagedAccountsSuccess,
    switchToWeb3User
  ])

  const { isMobile } = useMedia()
  const closeSwitcher = useCallback(() => setIsExpanded(false), [])

  // Memoize so the list child doesn't see a new callback reference on every
  // parent render — keeps row click handlers stable while the sheet animates.
  const handleAccountSelectedAndClose = useCallback(
    (user: UserMetadata) => {
      onAccountSelected(user)
      closeSwitcher()
    },
    [onAccountSelected, closeSwitcher]
  )

  if (!isVisible && !isLoadingAccounts) return null

  return (
    <Box ref={parentElementRef}>
      <IconButton
        color='default'
        // 2xs is the desktop nav size. On mobile (≤480px) bump to 's' so the
        // hit area is finger-friendly.
        size={isMobile ? 's' : '2xs'}
        aria-label={messages.toggleLabel}
        icon={IconCaretDown}
        disabled={isLoadingAccounts}
        onClick={isVisible ? onClickExpander : undefined}
      />
      {isMobile ? (
        <BottomSheet
          isOpen={isExpanded}
          onClose={closeSwitcher}
          ariaLabel={messages.ariaLabel}
        >
          <AccountListContent
            managerAccount={currentWeb3User!}
            currentUserId={currentUserId!}
            onAccountSelected={handleAccountSelectedAndClose}
            accounts={accounts}
            fullWidth
          />
        </BottomSheet>
      ) : (
        <Popup
          checkIfClickInside={(target: EventTarget) => {
            if (target instanceof Element && parentElementRef.current) {
              return parentElementRef.current.contains(target)
            }
            return false
          }}
          anchorRef={parentElementRef}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          dismissOnMouseLeave={false}
          isVisible={isExpanded}
          onClose={closeSwitcher}
          css={{ overflow: 'hidden' }}
        >
          <AccountListContent
            managerAccount={currentWeb3User!}
            currentUserId={currentUserId!}
            onAccountSelected={onAccountSelected}
            accounts={accounts}
          />
        </Popup>
      )}
    </Box>
  )
}
