import { CollectionsPageType } from '@audius/common/store'

import CollectionPageContent from './components/desktop/CollectionPage'

type CollectionPageProps = {
  type: CollectionsPageType
}

// Single-implementation collection page. The desktop content tree is
// already responsive — the previously parallel mobile variant is no
// longer needed.
const CollectionPage = ({ type }: CollectionPageProps) => {
  return <CollectionPageContent type={type} />
}

export default CollectionPage
