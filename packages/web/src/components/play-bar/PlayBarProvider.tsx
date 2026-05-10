import { useEffect } from 'react'

import { modalsSelectors, playbackSelectors } from '@audius/common/store'
import { useMedia } from '@audius/harmony'
import cn from 'classnames'
import { connect } from 'react-redux'

import NowPlayingDrawer from 'components/now-playing/NowPlayingDrawer'
import { AppState } from 'store/types'

import styles from './PlayBarProvider.module.css'
import DesktopPlayBar from './desktop/PlayBar'
const { getHasTrack } = playbackSelectors
const { getModalVisibility } = modalsSelectors

// Heights of the visible bottom chrome on mobile.
// - Without a track: just the bottom-bar (49px).
// - With a track: bottom-bar + collapsed mini-player (~96px total).
// Page chrome (chat composer, scroll padding) reads --mobile-bottom-chrome
// to position itself just above whatever is currently visible.
const BOTTOM_CHROME_PX_NO_TRACK = 49
const BOTTOM_CHROME_PX_WITH_TRACK = 96

type OwnProps = {
  isMobile: boolean
}

type PlayBarProviderProps = OwnProps & ReturnType<typeof mapStateToProps>

const PlayBarProvider = ({
  hasTrack,
  addToCollectionOpen
}: PlayBarProviderProps) => {
  const { isMobile } = useMedia()

  // Publish the visible mobile bottom-chrome height as a CSS variable on the
  // app root. Chat composer / scroll padding read --mobile-bottom-chrome to
  // sit just above whatever bottom UI is currently shown, so when a track
  // starts playing the composer shifts up and the message list reserves
  // matching scroll padding without any per-page wiring.
  useEffect(() => {
    if (!isMobile) return
    const appEl = document.getElementById('webPlayer')
    if (!appEl) return
    appEl.style.setProperty(
      '--mobile-bottom-chrome',
      `${hasTrack ? BOTTOM_CHROME_PX_WITH_TRACK : BOTTOM_CHROME_PX_NO_TRACK}px`
    )
    return () => {
      appEl.style.removeProperty('--mobile-bottom-chrome')
    }
  }, [hasTrack, isMobile])

  return (
    <div
      className={cn(styles.playBarWrapper, {
        [styles.isMobile]: isMobile
      })}
    >
      {isMobile ? (
        <NowPlayingDrawer
          isPlaying={hasTrack}
          shouldClose={addToCollectionOpen === true}
        />
      ) : (
        <>
          <div className={styles.customHr} />
          <DesktopPlayBar />
        </>
      )}
    </div>
  )
}

function mapStateToProps(state: AppState) {
  return {
    hasTrack: getHasTrack(state),
    addToCollectionOpen: getModalVisibility(state, 'AddToCollection')
  }
}

export default connect(mapStateToProps)(PlayBarProvider)
