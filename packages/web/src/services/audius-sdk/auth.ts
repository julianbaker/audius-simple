import {
  createAuthService,
  createHedgehogSolanaWalletService
} from '@audius/common/services'
import {
  createHedgehogWalletClient,
  type AudiusWalletClient
} from '@audius/sdk'

import { env } from '../env'
import { localStorage } from '../local-storage'

export const getAudiusWalletClient = async (): Promise<AudiusWalletClient> => {
  await authService.hedgehogInstance.waitUntilReady()
  const hedgehogWallet = authService.getWallet()
  if (hedgehogWallet) {
    console.debug(
      '[audiusSdk] Found Hedgehog wallet:',
      hedgehogWallet.getAddressString(),
      'Initializing SDK with Hedgehog...'
    )
  }
  return createHedgehogWalletClient(authService.hedgehogInstance)
}

export const authService = createAuthService({
  localStorage,
  identityServiceEndpoint: env.IDENTITY_SERVICE
})

export const solanaWalletService = createHedgehogSolanaWalletService(
  authService.hedgehogInstance
)
