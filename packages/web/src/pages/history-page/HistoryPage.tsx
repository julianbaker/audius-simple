// Single-implementation history page. The desktop TrackTableLineup
// already adapts to narrow widths by hiding columns down to just
// trackName + trackActions (see `responsivePolicies.historyTracks`), so
// the previously-separate mobile lineup variant is no longer needed.
import { HistoryPage as HistoryPageContent } from './components/HistoryPage'

const messages = {
  title: 'History',
  description: 'View your listening history'
}

const HistoryPage = () => (
  <HistoryPageContent
    title={messages.title}
    description={messages.description}
  />
)

export default HistoryPage
