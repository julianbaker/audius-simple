import { useCallback, type MouseEvent } from 'react'

import { AccessConditions } from '@audius/common/models'
import { Button, ButtonSize, IconLock } from '@audius/harmony'

const messages = {
  unlocking: 'Unlocking',
  locked: 'Locked',
  unlock: 'Unlock'
}

export const GatedConditionsPill = ({
  className,
  streamConditions,
  unlocking,
  onClick,
  showIcon = true,
  buttonSize = 'small'
}: {
  streamConditions: AccessConditions
  unlocking: boolean
  onClick?: (e: MouseEvent) => void
  showIcon?: boolean
  className?: string
  buttonSize?: ButtonSize
  contentId: number
  contentType: string
}) => {
  const message = unlocking ? messages.unlocking : messages.locked

  const handleClick = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation()
      onClick?.(e)
    },
    [onClick]
  )

  return (
    <Button
      className={className}
      size={buttonSize}
      onClick={handleClick}
      color='blue'
      isLoading={unlocking}
      iconLeft={showIcon ? IconLock : undefined}
      // TODO: Add 'xs' button size in harmony
      css={{ height: '24px' }}
    >
      {message}
    </Button>
  )
}
