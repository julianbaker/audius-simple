import { RefObject } from 'react'

import FeedPageContent from './components/desktop/FeedPageContent'

type FeedPageProps = {
  containerRef: RefObject<HTMLDivElement>
}

const FeedPage = ({ containerRef }: FeedPageProps) => {
  return <FeedPageContent containerRef={containerRef} />
}

export default FeedPage
