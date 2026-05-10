import { ChangeEvent, useCallback } from 'react'

import { Flex, RadioGroup, SelectablePill, Text } from '@audius/harmony'
import { capitalize } from 'lodash'

import { Header, HeaderProps } from 'components/header/desktop/Header'

import { filters } from './SearchFilters'
import { categories } from './categories'
import { useSearchCategory, useSearchParams } from './hooks'
import { Category, CategoryKey, CategoryView } from './types'

type SearchHeaderProps = Partial<HeaderProps> & { isNarrow?: boolean }

export const SearchHeader = ({ isNarrow, ...props }: SearchHeaderProps) => {
  const { query } = useSearchParams()
  const [categoryKey, setCategory] = useSearchCategory()
  const searchParams = useSearchParams()
  const genre = searchParams.genre
  const isPodcastGenre = genre === 'Podcasts'

  const handleCategoryChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setCategory(e.target.value as CategoryKey)
    },
    [setCategory]
  )

  const filterKeys: string[] = categories[categoryKey].filters.filter(
    (filter) => {
      if (isPodcastGenre && (filter === 'key' || filter === 'bpm')) return false
      return true
    }
  )

  const secondary = query ? (
    <Flex ml='l' css={{ maxWidth: 200 }}>
      <Text variant='heading' strength='weak' ellipses>
        {query}
      </Text>
    </Flex>
  ) : null

  if (isNarrow) {
    const mobileCategoryKeys = Object.keys(categories).filter(
      (key) => key !== 'all'
    ) as CategoryKey[]

    return (
      <Header
        {...props}
        primary='Search'
        secondary={secondary}
        bottomBar={
          <Flex
            direction='row'
            gap='s'
            css={{
              overflowX: 'auto',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
              paddingBottom: 2
            }}
          >
            {mobileCategoryKeys.map((key) => (
              <SelectablePill
                key={key}
                type='button'
                size='large'
                label={capitalize(key)}
                isSelected={categoryKey === key}
                onClick={() =>
                  setCategory(categoryKey === key ? CategoryView.ALL : key)
                }
              />
            ))}
            {filterKeys.map((filterKey) => {
              const FilterComponent = filters[filterKey as keyof typeof filters]
              return FilterComponent ? (
                <FilterComponent key={filterKey} />
              ) : null
            })}
          </Flex>
        }
      />
    )
  }

  const categoryRadioGroup = (
    <RadioGroup
      direction='row'
      gap='s'
      aria-label='Select search category'
      name='searchcategory'
      value={categoryKey}
      onChange={handleCategoryChange}
    >
      {Object.entries(categories).map(([key, category]) => (
        <SelectablePill
          aria-label={`${key} search category`}
          icon={(category as Category).icon}
          key={key}
          label={capitalize(key)}
          size='large'
          type='radio'
          value={key}
          checked={key === categoryKey}
        />
      ))}
    </RadioGroup>
  )

  return (
    <Header
      {...props}
      primary='Search'
      secondary={secondary}
      bottomBar={
        <Flex direction='row' gap='s' mv={filterKeys.length ? 'm' : undefined}>
          {filterKeys.map((filterKey) => {
            const FilterComponent = filters[filterKey as keyof typeof filters]
            return <FilterComponent key={filterKey} />
          })}
        </Flex>
      }
      rightDecorator={categoryRadioGroup}
    />
  )
}
