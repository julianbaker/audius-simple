import { OptionalId } from '@audius/sdk'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { SearchResults, searchResultsFromSDK } from '~/adapters/search'
import { useQueryContext } from '~/api/tan-query/utils'
import { ID } from '~/models'

import { QUERY_KEYS } from '../queryKeys'
import { QueryKey, QueryOptions } from '../types'
import { useCurrentUserId } from '../users/account/useCurrentUserId'

const DEFAULT_LIMIT = 3

type UseSearchAutocompleteArgs = {
  query: string
  limit?: number
}

export const getSearchAutocompleteQueryKey = (
  currentUserId: ID | null | undefined,
  { query, limit = DEFAULT_LIMIT }: UseSearchAutocompleteArgs
) =>
  [
    QUERY_KEYS.search,
    currentUserId,
    query,
    { limit }
  ] as unknown as QueryKey<SearchResults>

export const useSearchAutocomplete = (
  { query, limit = DEFAULT_LIMIT }: UseSearchAutocompleteArgs,
  options?: QueryOptions
) => {
  const { audiusSdk } = useQueryContext()
  const { data: currentUserId } = useCurrentUserId()
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: getSearchAutocompleteQueryKey(currentUserId, { query, limit }),
    queryFn: async () => {
      const sdk = await audiusSdk()
      const { data } = await sdk.search.searchAutocomplete({
        userId: OptionalId.parse(currentUserId),
        query,
        limit,
        includePurchaseable: false
      })
      return searchResultsFromSDK(data, queryClient)
    },
    ...options,
    enabled: options?.enabled !== false && query.length > 0
  })
}
