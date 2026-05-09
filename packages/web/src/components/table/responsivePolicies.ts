import { ResponsiveColumns } from './responsiveColumns'

const makeHideOrderPolicy = (
  hideOrder: readonly string[],
  alwaysVisibleIds: readonly string[]
): ResponsiveColumns => ({
  hideOrder,
  alwaysVisibleIds
})

export const RESPONSIVE_TABLE_POLICIES = {
  libraryTracks: makeHideOrderPolicy(
    ['dateReleased', 'time', 'dateSaved', 'reposts', 'plays'],
    ['trackName', 'trackActions']
  ),
  collectionPlaylistTracks: makeHideOrderPolicy(
    ['dateAdded', 'time', 'reposts', 'plays'],
    ['trackName', 'trackActions']
  ),
  collectionAlbumTracks: makeHideOrderPolicy(
    ['date', 'time', 'reposts', 'plays'],
    ['playButton', 'trackName', 'trackActions']
  ),
  dashboardTracks: makeHideOrderPolicy(
    ['spacer', 'reposts', 'saves', 'comments', 'plays', 'dateReleased'],
    ['trackName', 'overflowMenu']
  ),
  historyTracks: makeHideOrderPolicy(
    ['dateReleased', 'dateListened', 'time', 'reposts', 'plays'],
    ['trackName', 'trackActions']
  ),
  dashboardAlbums: makeHideOrderPolicy(
    ['spacer', 'reposts', 'saves', 'dateReleased'],
    ['name', 'overflowMenu']
  )
} as const satisfies Record<string, ResponsiveColumns>
