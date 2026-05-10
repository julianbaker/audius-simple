import { getExploreInfo } from 'ssr/metaTags'

import SearchExplorePage from './components/desktop/SearchExplorePage'

const exploreInfo = getExploreInfo()
const messages = {
  title: exploreInfo.title,
  pageTitle: 'Explore featured content on Audius',
  description: exploreInfo.description
}

export const ExplorePage = () => {
  return (
    <SearchExplorePage
      title={messages.title}
      pageTitle={messages.pageTitle}
      description={messages.description}
    />
  )
}
