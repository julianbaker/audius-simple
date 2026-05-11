import TrackPageContent from './components/desktop/TrackPage'

// Single-implementation track page. The desktop track tree (GiantTrackTile,
// lineup, comments) is responsive via container queries (see
// `containerType: 'inline-size'` on GiantTrackTile) and works at narrow
// widths. The previously parallel mobile variant is no longer needed.
const TrackPage = () => {
  return <TrackPageContent />
}

export default TrackPage
