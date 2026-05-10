import { useEffect, useState } from 'react'

import {
  BottomSheet,
  Box,
  Flex,
  IconCaretDown,
  Text,
  useTheme
} from '@audius/harmony'

type MobileFilterButtonTypes = {
  options: { value: string; label?: string }[]
  onClose?: () => void
  onSelect?: (value: string) => void
  selection?: string
  zIndex?: number
}

/**
 * Pill-shaped filter trigger that opens a BottomSheet listing the
 * selectable options. Migrated from ActionDrawer so it shares chrome
 * (drag handle, rounded corners, swipe-to-dismiss) with every other
 * bottom-sheet surface in the app.
 */
export const MobileFilterButton = ({
  options,
  onClose,
  onSelect,
  selection,
  zIndex
}: MobileFilterButtonTypes) => {
  const [isOpen, setIsOpen] = useState(false)
  const { color, spacing, typography } = useTheme()
  const selectedOption = options.find((option) => option.value === selection)
  const selectedLabel = selectedOption?.label ?? selectedOption?.value ?? ''

  useEffect(() => {
    if (selection && onSelect) {
      onSelect(selection)
    }
  }, [selection, onSelect])

  const handleClose = () => {
    setIsOpen(false)
    onClose?.()
  }

  return (
    <Box>
      <Flex
        alignItems='center'
        justifyContent='center'
        border='strong'
        borderRadius='s'
        pt='s'
        pb='s'
        pl='m'
        pr='m'
        mt='m'
        gap='xs'
        onClick={() => setIsOpen((open) => !open)}
      >
        <Text variant='title' strength='weak' size='s'>
          {selectedLabel}
        </Text>
        <IconCaretDown size='s' color='default' />
      </Flex>
      <BottomSheet
        isOpen={isOpen}
        onClose={handleClose}
        ariaLabel='Filter options'
        zIndex={zIndex}
      >
        <Flex column pv='m'>
          {options.map((option) => {
            const label = option.label ?? option.value
            const isSelected = option.value === selection
            return (
              <Flex
                key={option.value}
                role='button'
                tabIndex={0}
                onClick={() => {
                  setIsOpen(false)
                  onSelect?.(option.value)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setIsOpen(false)
                    onSelect?.(option.value)
                  }
                }}
                alignItems='center'
                ph='l'
                css={{
                  minHeight: 48,
                  cursor: 'pointer',
                  color: color.text.default,
                  fontWeight: isSelected
                    ? typography.weight.demiBold
                    : typography.weight.medium,
                  borderRadius: spacing.s,
                  '&:active': { background: color.background.surface2 },
                  '&:focus-visible': {
                    outline:
                      '2px solid var(--harmony-focus, var(--harmony-secondary))',
                    outlineOffset: '2px'
                  }
                }}
              >
                <Text
                  variant='title'
                  size='m'
                  strength={isSelected ? 'strong' : 'default'}
                >
                  {label}
                </Text>
              </Flex>
            )
          })}
        </Flex>
      </BottomSheet>
    </Box>
  )
}
