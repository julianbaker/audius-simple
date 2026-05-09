import type { AudiusSdkWithServices } from '@audius/sdk'

import type { AudiusBackend } from '../audius-backend'
import type { Env } from '../env'

type WalletClientConfig = {
  audiusBackendInstance: AudiusBackend
  audiusSdk: () => Promise<AudiusSdkWithServices>
  env: Env
}

/**
 * Placeholder service kept in the app context while user-visible wallet,
 * transfer, and external-wallet functionality is removed from web.
 */
export class WalletClient {
  constructor(_config: WalletClientConfig) {}
}
