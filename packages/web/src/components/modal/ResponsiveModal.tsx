import { ReactNode } from 'react'

import {
  Button,
  BottomSheet,
  Flex,
  IconComponent,
  Modal,
  ModalContent,
  ModalContentText,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Text
} from '@audius/harmony'

import { useIsMobile } from 'hooks/useIsMobile'

/**
 * Shape of the `confirmation` variant — when set, ResponsiveModal renders
 * a fixed confirmation layout (title → description → cancel/confirm row)
 * and ignores `children`. Pulls together what was previously hand-rolled
 * across ~10 confirmation modals plus 2 ActionDrawer-based ones, so every
 * Audius confirmation now shares one implementation.
 */
export type ResponsiveModalConfirmation = {
  /** Body of the confirmation. Usually a sentence or short paragraph. */
  description: ReactNode
  /** Primary action label, e.g. "Delete", "Release Now". */
  confirmText: string
  /** Secondary action label. Default: "Cancel". */
  cancelText?: string
  /** Called when the user clicks the confirm button. */
  onConfirm: () => void
  /**
   * Called when the user clicks cancel. If omitted, falls back to
   * `onClose`. (Backdrop tap / ESC / drawer drag-down also call `onClose`.)
   */
  onCancel?: () => void
  /**
   * Styles the confirm button as destructive (danger color). Use for
   * deletes, removes, unfollows, etc.
   */
  isDestructive?: boolean
  /**
   * Loading state on the confirm button. While true, the button shows a
   * spinner and is non-interactive; cancel is also disabled.
   */
  isConfirming?: boolean
  /**
   * Text shown on the confirm button while `isConfirming` is true.
   * Default: keeps `confirmText` and shows the spinner alongside.
   */
  confirmingText?: string
}

export type ResponsiveModalProps = {
  className?: string
  // Core props
  isOpen: boolean
  onClose: () => void
  onClosed?: () => void
  /**
   * Content for the modal body. Required for the default (open-ended)
   * variant; ignored when `confirmation` is set.
   */
  children?: ReactNode

  // Content props
  title?: string
  Icon?: IconComponent
  subtitle?: string

  // Layout props
  size?: 's' | 'm' | 'l' | 'xl'
  isFullscreen?: boolean // Only applies to mobile drawer

  // Behavior props
  showDismissButton?: boolean
  dismissOnClickOutside?: boolean
  zIndex?: number

  // Optional overrides
  renderAsDrawer?: boolean // Force drawer on desktop
  renderAsModal?: boolean // Force modal on mobile

  /**
   * Render a standard confirmation layout (title, description, cancel /
   * confirm buttons) instead of free-form children. When set, `children`
   * is ignored. See `ResponsiveModalConfirmation` for the prop shape.
   */
  confirmation?: ResponsiveModalConfirmation
}

const DEFAULT_CANCEL_TEXT = 'Cancel'

/**
 * A responsive modal component that automatically renders as a drawer on mobile
 * and a modal on desktop. It provides a unified API for both experiences.
 *
 * Two variants:
 *
 *   - **Open-ended (default):** caller supplies `children` for the body.
 *   - **Confirmation:** pass `confirmation={{ … }}` for a fixed
 *     title / description / cancel-confirm layout. Replaces the
 *     hand-rolled confirmation modal pattern across the codebase.
 *
 * @example
 * ```tsx
 * <ResponsiveModal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="Delete Playlist?"
 *   confirmation={{
 *     description: 'This cannot be undone.',
 *     confirmText: 'Delete',
 *     onConfirm: handleDelete,
 *     isDestructive: true
 *   }}
 * />
 * ```
 */
const ResponsiveModal = ({
  isOpen,
  onClose,
  onClosed,
  children,
  title,
  Icon,
  subtitle,
  size = 'm',
  isFullscreen,
  dismissOnClickOutside = true,
  showDismissButton,
  zIndex,
  renderAsDrawer,
  renderAsModal,
  className,
  confirmation
}: ResponsiveModalProps) => {
  const isMobile = useIsMobile()
  const shouldRenderAsDrawer = renderAsDrawer ?? (isMobile && !renderAsModal)

  // Map size prop to Modal component's expected values
  const getModalSize = (size: string) => {
    switch (size) {
      case 's':
        return 'small'
      case 'm':
        return 'medium'
      case 'l':
        return 'large'
      case 'xl':
        return 'large'
      default:
        return 'medium'
    }
  }

  // ---- Confirmation variant ----
  if (confirmation) {
    const {
      description,
      confirmText,
      cancelText = DEFAULT_CANCEL_TEXT,
      onConfirm,
      onCancel,
      isDestructive = false,
      isConfirming = false,
      confirmingText
    } = confirmation

    const handleCancel = onCancel ?? onClose
    const confirmLabel =
      isConfirming && confirmingText ? confirmingText : confirmText
    const confirmVariant = isDestructive ? 'destructive' : 'primary'

    if (shouldRenderAsDrawer) {
      const header =
        title || Icon ? (
          <Flex ph='l' pt='s' pb='m' justifyContent='center'>
            <ModalTitle title={title} Icon={Icon} />
          </Flex>
        ) : undefined

      return (
        <BottomSheet
          isOpen={isOpen}
          onClose={handleCancel}
          onClosed={onClosed}
          ariaLabel={title ?? confirmText}
          isFullscreen={isFullscreen}
          zIndex={zIndex}
          header={header}
          hideClose
          dismissOnClickOutside={dismissOnClickOutside}
        >
          <Flex column gap='l' p='l' pt='l'>
            <Text variant='body' size='m' color='default' textAlign='center'>
              {description}
            </Text>
            {subtitle && (
              <Text variant='body' size='s' color='subdued' textAlign='center'>
                {subtitle}
              </Text>
            )}
            <Flex column gap='s'>
              <Button
                variant={confirmVariant}
                onClick={onConfirm}
                fullWidth
                isLoading={isConfirming}
                disabled={isConfirming}
              >
                {confirmLabel}
              </Button>
              <Button
                variant='secondary'
                onClick={handleCancel}
                fullWidth
                disabled={isConfirming}
              >
                {cancelText}
              </Button>
            </Flex>
          </Flex>
        </BottomSheet>
      )
    }

    return (
      <Modal
        isOpen={isOpen}
        onClose={handleCancel}
        onClosed={onClosed}
        size={getModalSize(size === 'm' ? 's' : size)}
        zIndex={zIndex}
        dismissOnClickOutside={dismissOnClickOutside}
        className={className}
      >
        <ModalHeader>
          <ModalTitle title={title} Icon={Icon} />
        </ModalHeader>
        <ModalContent>
          <ModalContentText css={{ textAlign: 'center' }}>
            {description}
          </ModalContentText>
          {subtitle && (
            <Text
              variant='body'
              size='s'
              color='subdued'
              textAlign='center'
              css={{ marginTop: 8 }}
            >
              {subtitle}
            </Text>
          )}
        </ModalContent>
        <ModalFooter>
          <Button
            variant='secondary'
            onClick={handleCancel}
            fullWidth
            disabled={isConfirming}
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            fullWidth
            isLoading={isConfirming}
            disabled={isConfirming}
          >
            {confirmLabel}
          </Button>
        </ModalFooter>
      </Modal>
    )
  }

  // ---- Open-ended variant (existing) ----
  if (shouldRenderAsDrawer) {
    const header =
      title || Icon || subtitle ? (
        <Flex column ph='l' pt='s' pb='l' gap='s' alignItems='center'>
          {(title || Icon) && <ModalTitle title={title} Icon={Icon} />}
          {subtitle && (
            <Text variant='body' size='s' color='subdued'>
              {subtitle}
            </Text>
          )}
        </Flex>
      ) : undefined

    return (
      <BottomSheet
        isOpen={isOpen}
        onClose={onClose}
        onClosed={onClosed}
        ariaLabel={title ?? 'Modal'}
        isFullscreen={isFullscreen}
        zIndex={zIndex}
        header={header}
        hideClose={!showDismissButton}
        dismissOnClickOutside={dismissOnClickOutside}
      >
        <Flex column h='100%' gap='l' className={className}>
          {children}
        </Flex>
      </BottomSheet>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onClosed={onClosed}
      size={getModalSize(size)}
      zIndex={zIndex}
      dismissOnClickOutside={dismissOnClickOutside}
      className={className}
    >
      {(title || Icon || subtitle) && (
        <ModalHeader showDismissButton={showDismissButton}>
          <ModalTitle title={title} Icon={Icon} />
          {subtitle && (
            <Text variant='body' size='s' color='subdued'>
              {subtitle}
            </Text>
          )}
        </ModalHeader>
      )}
      {children}
    </Modal>
  )
}

export default ResponsiveModal
