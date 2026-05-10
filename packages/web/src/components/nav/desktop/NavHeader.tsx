import { MouseEvent, ReactNode } from 'react'

import {
  selectIsAccountComplete,
  useCurrentAccountUser,
  useHasAccount
} from '@audius/common/api'
import { route } from '@audius/common/utils'
import {
  Flex,
  IconAudiusLogo,
  IconAudiusLogoHorizontalNew,
  IconSettings,
  useMedia
} from '@audius/harmony'
import { Link, useLocation } from 'react-router'

import { RestrictionType, useRequiresAccountFn } from 'hooks/useRequiresAccount'

import { NavHeaderButton } from './NavHeaderButton'
import { useNavSidebar } from './NavSidebarContext'
import { NotificationsButton } from './NotificationsButton'

const { HOME_PAGE, SETTINGS_PAGE } = route
const EXPANDED_HEADER_WIDTH = 240
const COLLAPSED_HEADER_WIDTH = 64

const messages = {
  homeLink: 'Go to Home',
  settingsLabel: 'Go to Settings'
}

type RestrictedLinkProps = {
  to: string
  restriction?: RestrictionType
  children: ReactNode
}

export const canAccess = (
  restriction: RestrictionType,
  hasAccount: boolean,
  isAccountComplete: boolean
): boolean => {
  if (restriction === 'none') return true
  if (restriction === 'guest') return hasAccount
  return isAccountComplete
}

const RestrictedLink = ({
  to,
  restriction = 'none',
  children
}: RestrictedLinkProps) => {
  const { requiresAccount } = useRequiresAccountFn(undefined, restriction)
  const hasAccount = useHasAccount()
  const { data: isAccountComplete = false } = useCurrentAccountUser({
    select: selectIsAccountComplete
  })

  const handleClick = (e: MouseEvent) => {
    if (restriction === 'none') return

    const canAccessRoute = canAccess(restriction, hasAccount, isAccountComplete)
    if (!canAccessRoute) {
      e.preventDefault()
      requiresAccount()
    }
  }

  return (
    <Link to={to} onClick={handleClick}>
      {children}
    </Link>
  )
}

export const NavHeader = () => {
  const { isCollapsed, isMobileOpen, setIsMobileOpen } = useNavSidebar()
  const { isMobile } = useMedia()
  const { pathname } = useLocation()

  // Mobile: compact persistent nav bar — [hamburger/X] [Logo] [Settings] [Bell]
  if (isMobile) {
    return (
      <Flex
        alignItems='center'
        borderBottom='default'
        justifyContent='space-between'
        ph='m'
        flex={0}
        css={{
          height: 44,
          flexShrink: 0,
          backdropFilter: 'var(--frosted-surface-backdrop-filter, blur(10px))',
          WebkitBackdropFilter:
            'var(--frosted-surface-backdrop-filter, blur(10px))',
          background:
            'var(--frosted-surface-background, color-mix(in srgb, var(--frosted-surface-background-color, var(--harmony-n-25)) var(--frosted-surface-opacity, 65%), transparent))'
        }}
      >
        <Flex alignItems='center' gap='s'>
          <button
            aria-label={isMobileOpen ? 'Close navigation' : 'Open navigation'}
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              color: 'var(--harmony-n-400)'
            }}
          >
            {isMobileOpen ? (
              <svg
                width='20'
                height='20'
                viewBox='0 0 20 20'
                fill='none'
                aria-hidden
              >
                <path
                  d='M4 4L16 16M16 4L4 16'
                  stroke='currentColor'
                  strokeWidth='1.75'
                  strokeLinecap='round'
                />
              </svg>
            ) : (
              <svg
                width='20'
                height='20'
                viewBox='0 0 20 20'
                fill='none'
                aria-hidden
              >
                <path
                  d='M2 5H18M2 10H18M2 15H18'
                  stroke='currentColor'
                  strokeWidth='1.75'
                  strokeLinecap='round'
                />
              </svg>
            )}
          </button>
          <Link to={HOME_PAGE} aria-label={messages.homeLink}>
            <IconAudiusLogoHorizontalNew color='subdued' size='m' width='auto' />
          </Link>
        </Flex>
        <Flex justifyContent='center' alignItems='center'>
          <RestrictedLink to={SETTINGS_PAGE} restriction='account'>
            <NavHeaderButton
              icon={IconSettings}
              aria-label={messages.settingsLabel}
              isActive={pathname === SETTINGS_PAGE}
            />
          </RestrictedLink>
          <NotificationsButton />
        </Flex>
      </Flex>
    )
  }

  if (isCollapsed) {
    return (
      <Flex
        direction='column'
        borderBottom='default'
        flex={0}
        css={{ minHeight: 58, width: COLLAPSED_HEADER_WIDTH, flexShrink: 0 }}
      >
        {/* Row 1: actions (settings + bell) */}
        <Flex
          alignItems='center'
          justifyContent='center'
          gap='xs'
          css={{ height: 26, paddingTop: 4 }}
        >
          <RestrictedLink to={SETTINGS_PAGE} restriction='account'>
            <NavHeaderButton
              icon={IconSettings}
              aria-label={messages.settingsLabel}
              isActive={pathname === SETTINGS_PAGE}
              size='m'
            />
          </RestrictedLink>
          <NotificationsButton size='m' />
        </Flex>
        {/* Row 2: Audius triangle logo */}
        <Flex alignItems='center' justifyContent='center' css={{ height: 32 }}>
          <Link to={HOME_PAGE} aria-label={messages.homeLink}>
            <IconAudiusLogo color='subdued' size='m' />
          </Link>
        </Flex>
      </Flex>
    )
  }

  return (
    <Flex
      alignItems='center'
      borderBottom='default'
      justifyContent='space-between'
      pv='l'
      ph='m'
      flex={0}
      css={{ minHeight: 58, width: EXPANDED_HEADER_WIDTH, flexShrink: 0 }}
    >
      <Link to={HOME_PAGE} aria-label={messages.homeLink}>
        <IconAudiusLogoHorizontalNew color='subdued' size='m' width='auto' />
      </Link>
      <Flex justifyContent='center' alignItems='center'>
        <RestrictedLink to={SETTINGS_PAGE} restriction='account'>
          <NavHeaderButton
            icon={IconSettings}
            aria-label={messages.settingsLabel}
            isActive={pathname === SETTINGS_PAGE}
          />
        </RestrictedLink>
        <NotificationsButton />
      </Flex>
    </Flex>
  )
}
