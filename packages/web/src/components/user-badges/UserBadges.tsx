import { MouseEvent, ReactElement, useCallback, useMemo } from 'react'

import { BadgeTier, ID } from '@audius/common/models'
import { useTierAndVerifiedForUser } from '@audius/common/store'
import { Nullable } from '@audius/common/utils'
import {
  Box,
  Flex,
  HoverCard,
  IconSize,
  iconSizes,
  IconTokenBronze,
  IconTokenGold,
  IconTokenPlatinum,
  IconTokenSilver,
  IconVerified,
  motion,
  Text
} from '@audius/harmony'
import { Origin } from '@audius/harmony/src/components/popup/types'
import cn from 'classnames'

import styles from './UserBadges.module.css'

const messages = {
  verified: 'Verified'
}

export const audioTierMap: {
  [tier in BadgeTier]: Nullable<ReactElement>
} = {
  none: null,
  bronze: <IconTokenBronze />,
  silver: <IconTokenSilver />,
  gold: <IconTokenGold />,
  platinum: <IconTokenPlatinum />
}

type UserBadgesProps = {
  userId: ID
  size?: IconSize
  className?: string
  inline?: boolean
  anchorOrigin?: Origin
  transformOrigin?: Origin

  // Normally, user badges is not a controlled component and selects
  // badges off of the store. The override allows for it to be used
  // in a controlled context where the desired store state is not available.
  isVerifiedOverride?: boolean
  overrideTier?: BadgeTier

  // Disable hover/click handling when badges are rendered inside a larger
  // interactive surface.
  disableInteraction?: boolean
}

/**
 * A component that renders user badges (verified and audio tier) with appropriate hover cards
 */
const UserBadges = ({
  userId,
  size = 'xs',
  className,
  inline = false,
  isVerifiedOverride,
  disableInteraction = false
}: UserBadgesProps) => {
  const { isVerified } = useTierAndVerifiedForUser(userId)
  const isUserVerified = isVerifiedOverride ?? isVerified
  const hasContent = isUserVerified

  // Create a handler to stop event propagation
  const handleStopPropagation = useCallback((e: MouseEvent) => {
    e.stopPropagation()
  }, [])

  // Wrap the verified badge with a HoverCard
  const verifiedBadge = useMemo(() => {
    if (!isUserVerified) return null

    return (
      <HoverCard
        triggeredBy='both'
        content={
          <Flex alignItems='center' justifyContent='center' gap='s' p='s'>
            <IconVerified size='l' />
            <Text variant='title' size='l'>
              {messages.verified}
            </Text>
          </Flex>
        }
      >
        <Flex
          css={{
            cursor: 'pointer',
            transition: `opacity ${motion.quick}`,
            '&:hover': {
              opacity: 0.6
            }
          }}
        >
          <IconVerified height={iconSizes[size]} width={iconSizes[size]} />
        </Flex>
      </HoverCard>
    )
  }, [isUserVerified, size])

  if (!hasContent) return null

  return (
    <Box
      onClick={disableInteraction ? undefined : handleStopPropagation}
      css={{
        display: 'inline-flex',
        alignSelf: 'center',
        position: 'relative',
        pointerEvents: disableInteraction ? 'none' : 'auto'
      }}
    >
      <span
        className={cn(
          {
            [styles.inlineContainer]: inline,
            [styles.container]: !inline
          },
          className
        )}
      >
        {verifiedBadge}
      </span>
    </Box>
  )
}

export default UserBadges
