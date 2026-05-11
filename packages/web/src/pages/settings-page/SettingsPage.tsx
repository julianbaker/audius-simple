import { SettingsPage as SettingsPageContent } from './components/desktop/SettingsPage'

// Single-implementation settings page. The desktop SettingsPage uses
// stacked Harmony sections and works at narrow widths; the previously
// mobile-only sub-page navigation pattern (Account / Password / Email /
// Notifications / About as their own pages) is replaced by scrolling
// within the single page. Sub-page route URLs still resolve here — they
// just land on the full settings view.
const SettingsPage = () => {
  return <SettingsPageContent />
}

export default SettingsPage
