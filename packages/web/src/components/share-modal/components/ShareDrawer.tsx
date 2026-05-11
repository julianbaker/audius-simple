import { useCallback } from 'react'

import {
  BottomSheet,
  Flex,
  IconLink,
  IconShare,
  IconX,
  Text,
  useTheme
} from '@audius/harmony'

import { messages } from '../messages'
import { ShareProps } from '../types'

const ICON_SIZE = 26

type ShareDrawerProps = ShareProps

type ActionRowProps = {
  icon: React.ReactNode
  label: string
  onClick: () => void
}

const ActionRow = ({ icon, label, onClick }: ActionRowProps) => {
  const { color, spacing, typography } = useTheme()
  return (
    <Flex
      role='button'
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      alignItems='center'
      gap='m'
      ph='l'
      css={{
        minHeight: 56,
        cursor: 'pointer',
        color: color.secondary.secondary,
        fontWeight: typography.weight.demiBold,
        borderRadius: spacing.s,
        '&:active': { background: color.background.surface2 },
        '&:focus-visible': {
          outline: '2px solid var(--harmony-focus, var(--harmony-secondary))',
          outlineOffset: '2px'
        },
        // The brand icons in the share menu are colored to match the
        // text via the secondary color token.
        '& svg path': { fill: color.secondary.secondary }
      }}
    >
      {icon}
      <Text variant='body' size='l' strength='strong' color='accent'>
        {label}
      </Text>
    </Flex>
  )
}

/**
 * Mobile share sheet. Lifted from ActionDrawer to BottomSheet so it
 * shares chrome (drag handle, rounded corners, slide-up, drag-down-to-
 * dismiss) with the rest of the app's bottom-sheet surfaces.
 */
export const ShareDrawer = ({
  onShareToX,
  onCopyLink,
  isOpen,
  onClose,
  shareType
}: ShareDrawerProps) => {
  const buildHeader = useCallback(
    () => (
      <Flex alignItems='center' justifyContent='center' gap='s' ph='m' pv='m'>
        <IconShare size='m' color='default' />
        <Text variant='heading' size='s' color='default'>
          {messages.modalTitle(shareType)}
        </Text>
      </Flex>
    ),
    [shareType]
  )

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel={messages.modalTitle(shareType)}
      header={buildHeader()}
    >
      <Flex column gap='xs' pv='m'>
        <ActionRow
          icon={<IconX height={ICON_SIZE} width={ICON_SIZE} />}
          label={messages.x}
          onClick={() => {
            onShareToX()
            onClose()
          }}
        />
        <ActionRow
          icon={<IconLink height={ICON_SIZE} width={ICON_SIZE} />}
          label={messages.copyLink}
          onClick={() => {
            onCopyLink()
            onClose()
          }}
        />
      </Flex>
    </BottomSheet>
  )
}
