import { DesktopHomePage } from './components/desktop/HomePage'

const messages = {
  title: 'Home',
  pageTitle: 'Your home on Audius',
  description: 'Your personalized home on Audius'
}

// Single entry point — the desktop HomePage adapts to narrow widths via the
// shared Page shell + container queries (matches feed and trending). The
// previous mobile-only HomePage used the legacy MobilePageContainer and its
// own header, which broke the standard adaptive Header pattern.
export const HomePage = () => {
  return (
    <DesktopHomePage
      title={messages.title}
      pageTitle={messages.pageTitle}
      description={messages.description}
    />
  )
}

export default HomePage
