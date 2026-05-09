import { PropsWithChildren } from 'react'

import {
  Divider,
  Flex,
  IconInfo,
  IconPencil,
  IconVisibilityPublic,
  Text
} from '@audius/harmony'

import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'

import styles from '../OAuthLoginPage.module.css'
import { messages } from '../messages'

type PermissionDetailProps = PropsWithChildren<{}>
const PermissionDetail = ({ children }: PermissionDetailProps) => {
  return (
    <Flex pl='2xl'>
      <Text variant='body' size='s' color='subdued'>
        {children}
      </Text>
    </Flex>
  )
}

export const PermissionsSection = ({
  scope,
  isLoggedIn,
  isLoading,
  userEmail
}: {
  scope: string | string[] | null
  isLoggedIn: boolean
  isLoading: boolean
  userEmail: string | null
}) => {
  return (
    <Flex direction='column' gap='s'>
      <Text variant='body' size='m' color='subdued'>
        {messages.permissionsRequestedHeader}
      </Text>
      <div className={styles.tile}>
        {/* First permission */}
        <Flex direction='column' gap='s'>
          <Flex gap='l' alignItems='center'>
            <Flex css={{ flexShrink: 0 }}>
              {scope === 'write' ? (
                <IconPencil color='default' width={16} height={16} />
              ) : (
                <IconVisibilityPublic color='default' width={16} height={16} />
              )}
            </Flex>
            <Text variant='body' size='m' color='default'>
              {scope === 'write'
                ? messages.writeAccountAccess
                : messages.readOnlyAccountAccess}
            </Text>
          </Flex>
          {scope === 'write' ? (
            <PermissionDetail>{messages.writeAccessGrants}</PermissionDetail>
          ) : null}
          {scope === 'read' ? (
            <PermissionDetail>{messages.readOnlyGrants}</PermissionDetail>
          ) : null}
        </Flex>

        <Flex pv='s'>
          <Divider />
        </Flex>

        {/* Second permission */}
        <Flex direction='column' gap='s'>
          <Flex gap='l' alignItems='center'>
            <Flex css={{ flexShrink: 0 }}>
              <IconInfo width={16} height={16} color='default' />
            </Flex>
            <Text variant='body' size='m' color='default'>
              {messages.yourAccountData}
            </Text>
          </Flex>
          {isLoggedIn ? (
            <PermissionDetail>
              {isLoading ? (
                <LoadingSpinner className={styles.loadingSpinner} />
              ) : userEmail ? (
                `${messages.yourAccountDataAccess}: ${userEmail}`
              ) : (
                messages.yourAccountDataAccessNoEmail
              )}
            </PermissionDetail>
          ) : null}
        </Flex>
      </div>
    </Flex>
  )
}
