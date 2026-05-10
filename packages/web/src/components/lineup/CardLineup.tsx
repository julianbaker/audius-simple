import cn from 'classnames'

import { Draggable } from 'components/dragndrop'
import CategoryHeader from 'components/header/desktop/CategoryHeader'

import styles from './CardLineup.module.css'

export type CardLineupProps = {
  categoryName?: string
  cards: JSX.Element[]
  containerClassName?: string
  cardsClassName?: string
  onMore?: () => void
}

const DesktopCardContainer = ({
  categoryName,
  cards,
  containerClassName,
  cardsClassName,
  onMore
}: CardLineupProps) => {
  return (
    <div className={cn(containerClassName)}>
      {categoryName && (
        <CategoryHeader categoryName={categoryName} onMore={onMore} />
      )}
      <div className={cn(styles.cardsContainer, cardsClassName)}>
        {cards.map((card) => {
          return card.props.link ? (
            <Draggable
              key={`draggable-${card.props.playlistId}`}
              text={card.props.primaryText}
              kind={card.props.isAlbum ? 'album' : 'playlist'}
              id={card.props.playlistId}
              link={card.props.link}
            >
              {card}
            </Draggable>
          ) : (
            card
          )
        })}
      </div>
    </div>
  )
}

// Single responsive container. The DesktopCardContainer's `cardsContainer`
// class already has proper container-query-based grid sizing (see
// LibraryPage.module.css's `library-content` queries), so it adapts to
// narrow viewports without needing a separate mobile branch. The legacy
// MobileCardContainer (flex: 1 items with no flex-basis) was producing
// uneven row layouts whenever useIsMobile flipped true at narrow widths.
const CardLineup = (props: CardLineupProps) => {
  return <DesktopCardContainer {...props} />
}

export default CardLineup
