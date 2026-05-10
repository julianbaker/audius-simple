import { forwardRef } from 'react'

import {
  PopupMenuItem,
  PopupMenuProps,
  ResponsivePopupMenu
} from '@audius/harmony'

import { useMainContentRef } from 'pages/MainContentContext'
import appZIndex from 'utils/zIndex'

import CollectionMenu, {
  OwnProps as CollectionMenuProps
} from './CollectionMenu'
import TrackMenu, { OwnProps as TrackMenuProps } from './TrackMenu'
import UserMenu, { OwnProps as UserMenuProps } from './UserMenu'

type MenuOptionType =
  | Omit<UserMenuProps, 'children'>
  | Omit<CollectionMenuProps, 'children'>
  | Omit<TrackMenuProps, 'children'>

type MenuProps = {
  children: PopupMenuProps['renderTrigger']
  menu: MenuOptionType
} & Omit<PopupMenuProps, 'renderTrigger' | 'items'>

/**
 * Wrapper around `ResponsivePopupMenu` that builds the items list from a
 * `menu` descriptor (track/collection/user) and forwards the standard
 * PopupMenu options. Anchored popup on desktop, bottom-sheet on mobile
 * (≤480px) — same trigger, same items, viewport-appropriate surface.
 */
const Menu = forwardRef<HTMLDivElement, MenuProps>((props, ref) => {
  const { menu, onClose, zIndex: popupZIndexProp, children, ...other } = props
  const mainContentRef = useMainContentRef()
  const popupZIndex = popupZIndexProp ?? appZIndex.PROFILE_EDITABLE_COMPONENTS

  const renderMenu = (items: PopupMenuItem[]) => (
    <ResponsivePopupMenu
      items={items}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      ref={ref}
      renderTrigger={children}
      zIndex={popupZIndex}
      containerRef={mainContentRef}
      portalLocation={mainContentRef.current}
      {...other}
    />
  )

  if (menu.type === 'user') {
    return <UserMenu {...menu}>{renderMenu}</UserMenu>
  } else if (menu.type === 'album' || menu.type === 'playlist') {
    return (
      <CollectionMenu onClose={onClose} {...menu}>
        {renderMenu}
      </CollectionMenu>
    )
  } else if (menu.type === 'track') {
    return <TrackMenu {...menu}>{renderMenu}</TrackMenu>
  } else if (menu.type === 'notification') {
  }
  return null
})

export default Menu
