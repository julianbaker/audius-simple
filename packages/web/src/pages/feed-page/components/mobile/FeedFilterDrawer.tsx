import { useCallback } from 'react'

import { FeedFilter } from '@audius/common/models'
import { BottomSheet, Flex, Text, useTheme } from '@audius/harmony'

interface FeedFilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSelectFilter: (filter: FeedFilter) => void
}

const messages = {
  title: 'What do you want to see in your feed?',
  filterAll: 'All Posts',
  filterOriginal: 'Original Posts',
  filterReposts: 'Reposts'
}

const FILTERS: { value: FeedFilter; label: string }[] = [
  { value: FeedFilter.ALL, label: messages.filterAll },
  { value: FeedFilter.ORIGINAL, label: messages.filterOriginal },
  { value: FeedFilter.REPOST, label: messages.filterReposts }
]

const FeedFilterDrawer = ({
  isOpen,
  onSelectFilter,
  onClose
}: FeedFilterDrawerProps) => {
  const { color, spacing } = useTheme()
  const handleSelectFilter = useCallback(
    (filter: FeedFilter) => {
      onSelectFilter(filter)
      onClose()
    },
    [onClose, onSelectFilter]
  )

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel={messages.title}
      header={
        <Flex justifyContent='center' alignItems='center' ph='m' pv='m'>
          <Text variant='heading' size='s' color='default' textAlign='center'>
            {messages.title}
          </Text>
        </Flex>
      }
    >
      <Flex column pv='m'>
        {FILTERS.map(({ value, label }) => (
          <Flex
            key={value}
            role='button'
            tabIndex={0}
            onClick={() => handleSelectFilter(value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleSelectFilter(value)
              }
            }}
            alignItems='center'
            ph='l'
            css={{
              minHeight: 56,
              cursor: 'pointer',
              borderRadius: spacing.s,
              '&:active': { background: color.background.surface2 },
              '&:focus-visible': {
                outline:
                  '2px solid var(--harmony-focus, var(--harmony-secondary))',
                outlineOffset: '2px'
              }
            }}
          >
            <Text variant='title' size='m' strength='strong'>
              {label}
            </Text>
          </Flex>
        ))}
      </Flex>
    </BottomSheet>
  )
}

export default FeedFilterDrawer
