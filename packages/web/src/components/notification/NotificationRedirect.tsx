import { useEffect } from 'react'

import { useNotificationModal } from '@audius/common/store'
import { route } from '@audius/common/utils'
import { Navigate } from 'react-router'

const { TRENDING_PAGE } = route

/**
 * Redirects `/notifications` to the trending page and opens the shared
 * notification panel. Replaces the old standalone NotificationPage so deep
 * links keep working without a separate mobile-only page.
 */
export const NotificationRedirect = () => {
  const { onOpen } = useNotificationModal()

  useEffect(() => {
    onOpen()
  }, [onOpen])

  return <Navigate to={TRENDING_PAGE} replace />
}
