import {
  useCallback,
  useRef,
  useState,
  ComponentProps,
  MouseEvent
} from 'react'

import { useTheme } from '@emotion/react'

import { useMedia } from '../../contexts/MediaContext'
import { Flex } from '../layout/Flex'
import { BottomSheet } from '../sheet'

import { PopupMenu } from './PopupMenu'
import { PopupMenuItem, PopupMenuProps } from './types'

type TriggerProps = Pick<
  ComponentProps<'button'>,
  'aria-controls' | 'aria-haspopup' | 'aria-expanded' | 'id'
>

export type ResponsivePopupMenuProps = Omit<PopupMenuProps, 'renderTrigger'> & {
  /**
   * Identical contract to PopupMenu's `renderTrigger`. The `anchorRef`
   * is only used for desktop positioning; on mobile it's still attached
   * to your trigger element (no harm) but ignored.
   */
  renderTrigger: (
    anchorRef: React.MutableRefObject<any>,
    triggerPopup: (onMouseEnter?: boolean) => void,
    triggerProps: TriggerProps
  ) => React.ReactNode
  /**
   * Optional header rendered above the menu items on the mobile sheet.
   * Defaults to the `title` prop. Pass `null` to hide.
   */
  mobileHeader?: React.ReactNode | null
}

/**
 * Viewport-adaptive menu. Desktop renders Harmony's `PopupMenu` (anchored
 * popover). Mobile (≤480px) renders a `BottomSheet` with the same items
 * laid out as button rows. Consumers don't need to branch — they pass the
 * same `items` and `renderTrigger`, and the menu picks the right surface
 * for the viewport.
 *
 * @example
 * ```tsx
 * <ResponsivePopupMenu
 *   items={[
 *     { text: 'Edit', icon: <IconPencil />, onClick: handleEdit },
 *     { text: 'Delete', icon: <IconTrash />, onClick: handleDelete,
 *       destructive: true }
 *   ]}
 *   title='Track options'
 *   renderTrigger={(ref, open, props) => (
 *     <IconButton ref={ref} icon={IconKebab} onClick={open} {...props} />
 *   )}
 * />
 * ```
 */
export const ResponsivePopupMenu = (props: ResponsivePopupMenuProps) => {
  const { isMobile } = useMedia()

  // Desktop renders the existing PopupMenu unchanged — composable,
  // keyboard-navigable, anchored to the trigger via anchorRef.
  if (!isMobile) {
    return <PopupMenu {...props} />
  }

  // Mobile path: same renderTrigger contract, but `triggerPopup` opens
  // a BottomSheet rather than a Popup. The sheet renders each item as
  // a button row.
  return <MobilePopupMenu {...props} />
}

const MobilePopupMenu = ({
  items,
  onClose,
  renderTrigger,
  title,
  id,
  mobileHeader,
  zIndex
}: ResponsivePopupMenuProps) => {
  const anchorRef = useRef<any>(null)
  const [isOpen, setIsOpen] = useState(false)

  const triggerPopup = useCallback((onMouseEnter?: boolean) => {
    // Match PopupMenu's hover-aware toggle so consumers behave identically.
    if (onMouseEnter) return
    setIsOpen((v) => !v)
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    onClose?.()
  }, [onClose])

  const triggerId = id ? `${id}-trigger` : undefined
  const triggerProps: TriggerProps = {
    'aria-controls': isOpen ? id : undefined,
    'aria-haspopup': true,
    'aria-expanded': isOpen ? ('true' as const) : undefined,
    id: triggerId
  }

  const headerSlot =
    mobileHeader === undefined ? (
      title ? (
        <MobileMenuTitle title={title} />
      ) : null
    ) : (
      mobileHeader
    )

  return (
    <>
      {renderTrigger(anchorRef, triggerPopup, triggerProps)}
      <BottomSheet
        isOpen={isOpen}
        onClose={handleClose}
        ariaLabel={typeof title === 'string' ? title : 'Menu'}
        header={headerSlot}
        zIndex={zIndex}
      >
        <MobileMenuList items={items} onItemClick={handleClose} />
      </BottomSheet>
    </>
  )
}

const MobileMenuTitle = ({ title }: { title: React.ReactNode }) => {
  const { color, typography, spacing } = useTheme()
  return (
    <Flex
      ph='m'
      pv='s'
      css={{
        fontSize: typography.size.m,
        fontWeight: typography.weight.demiBold,
        color: color.text.subdued,
        gap: spacing.s
      }}
    >
      {title}
    </Flex>
  )
}

const MobileMenuList = ({
  items,
  onItemClick
}: {
  items: PopupMenuItem[]
  onItemClick: () => void
}) => {
  const { color, typography, spacing } = useTheme()

  const handleClick = (item: PopupMenuItem) => (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    item.onClick(e)
    onItemClick()
  }

  return (
    <Flex
      as='ul'
      direction='column'
      role='menu'
      css={{
        listStyle: 'none',
        margin: 0,
        padding: spacing.s,
        gap: spacing.unitHalf
      }}
    >
      {items.map((item, i) => (
        <Flex
          as='li'
          key={typeof item.text === 'string' ? item.text : i}
          role='menuitem'
          tabIndex={0}
          onClick={handleClick(item)}
          alignItems='center'
          gap='m'
          ph='m'
          css={{
            minHeight: 48,
            fontSize: typography.size.l,
            fontWeight: typography.weight.demiBold,
            color: item.destructive ? color.status.error : color.text.default,
            cursor: 'pointer',
            borderRadius: spacing.s,
            // Press feedback — native mobile menus subtly tint on touch.
            '&:active': {
              background: color.background.surface2
            },
            '&:focus-visible': {
              outline:
                '2px solid var(--harmony-focus, var(--harmony-secondary))',
              outlineOffset: '2px'
            }
          }}
        >
          {item.icon ? (
            <Flex
              alignItems='center'
              justifyContent='center'
              w='unit6'
              h='unit6'
              css={{
                color: item.destructive
                  ? color.status.error
                  : color.text.default
              }}
            >
              {item.icon}
            </Flex>
          ) : null}
          <Flex direction='column' flex={1}>
            <span>{item.text}</span>
            {item.subtext ? (
              <span
                style={{
                  fontSize: typography.size.s,
                  color: color.text.subdued,
                  fontWeight: typography.weight.medium
                }}
              >
                {item.subtext}
              </span>
            ) : null}
          </Flex>
        </Flex>
      ))}
    </Flex>
  )
}
