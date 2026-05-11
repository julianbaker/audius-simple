import { RefObject } from 'react'

import RemixesPageContent from './components/desktop/RemixesPage'

type RemixesPageProps = {
  containerRef: RefObject<HTMLDivElement>
}

// Single-implementation remixes page. The desktop content tree is already
// responsive (Page shell + container queries) so the previously parallel
// mobile variant is no longer needed.
const RemixesPage = ({ containerRef }: RemixesPageProps) => {
  return <RemixesPageContent containerRef={containerRef} />
}

export default RemixesPage
