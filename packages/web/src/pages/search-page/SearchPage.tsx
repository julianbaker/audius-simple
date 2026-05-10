import { useRef } from 'react'

import { SearchCategory } from '@audius/common/api'
import { Flex } from '@audius/harmony'
import { useSearchParams } from 'react-router'

import Page from 'components/page/Page'
import { useIsContainerNarrow } from 'hooks/useIsContainerNarrow'
import { fullSearchResultsPage } from 'utils/route'

import { RecentSearches } from './RecentSearches'
import { SearchCatalogTile } from './SearchCatalogTile'
import { SearchHeader } from './SearchHeader'
import { SearchResults } from './SearchResults'
import { useSearchCategory, useShowSearchResults } from './hooks'

export const SearchPage = () => {
  const [category] = useSearchCategory()
  const [urlSearchParams] = useSearchParams()
  const query = urlSearchParams.get('query')
  const showSearchResults = useShowSearchResults()
  const pageContentRef = useRef<HTMLDivElement>(null)
  const isNarrow = useIsContainerNarrow(pageContentRef, 600)

  const header = <SearchHeader isNarrow={isNarrow} />

  return (
    <Page
      title={query ?? 'Search'}
      description={`Search results for ${query}`}
      canonicalUrl={fullSearchResultsPage(
        category as SearchCategory,
        query ?? ''
      )}
      header={header}
      fullHeight
      showSearch={false}
    >
      <Flex ref={pageContentRef} direction='column' w='100%' h='100%'>
        {!showSearchResults ? (
          <Flex direction='column' alignItems='center' gap='l'>
            <SearchCatalogTile />
            <RecentSearches />
          </Flex>
        ) : (
          <SearchResults />
        )}
      </Flex>
    </Page>
  )
}
