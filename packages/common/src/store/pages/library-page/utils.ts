import { LibraryCategoryType, LibraryPageTabs } from './types'

export const calculateNewLibraryCategories = ({
  chosenCategory
}: {
  currentTab: LibraryPageTabs
  chosenCategory: LibraryCategoryType
  prevTracksCategory: unknown
}) => {
  return {
    collectionsCategory: chosenCategory,
    tracksCategory: chosenCategory
  }
}
