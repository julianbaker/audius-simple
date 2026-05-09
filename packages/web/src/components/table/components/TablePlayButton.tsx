import {
  IconPlaybackPause as IconPause,
  IconPlaybackPlay as IconPlay,
  useTheme
} from '@audius/harmony'
import cn from 'classnames'

import styles from './TablePlayButton.module.css'

type TablePlayButtonProps = {
  className?: string
  hideDefault?: boolean
  onClick?: (e: any) => void
  paused?: boolean
  playing?: boolean
  isLocked?: boolean
}

export const TablePlayButton = ({
  className,
  hideDefault = true,
  onClick,
  paused,
  playing = false,
  isLocked = false
}: TablePlayButtonProps) => {
  const {
    color: {
      neutral: { n150 },
      primary: { p300 }
    }
  } = useTheme()
  return (
    <div onClick={onClick} className={cn(styles.tablePlayButton, className)}>
      {playing && !paused ? (
        <IconPause className={styles.icon} fill={p300} />
      ) : (
        <IconPlay
          className={cn(styles.icon, {
            [styles.hideDefault]: hideDefault && !playing
          })}
          fill={isLocked ? n150 : p300}
        />
      )}
    </div>
  )
}
