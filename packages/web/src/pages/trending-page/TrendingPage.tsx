import { RefObject } from 'react'

import TrendingPageContent from './components/desktop/TrendingPageContent'

type TrendingPageProps = {
  containerRef: RefObject<HTMLDivElement>
}

const TrendingPage = ({ containerRef }: TrendingPageProps) => {
  return <TrendingPageContent containerRef={containerRef} />
}

export default TrendingPage
