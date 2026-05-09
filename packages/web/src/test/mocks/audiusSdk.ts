import {
  AudiusWalletClient,
  ClaimableTokensClient,
  createSdkWithServices,
  StorageNodeSelectorService
} from '@audius/sdk'

export const audiusSdk = () => {
  return createSdkWithServices({
    appName: 'test',
    environment: 'development',
    services: {
      claimableTokensClient: (() => {}) as unknown as ClaimableTokensClient,
      storageNodeSelector: (() => {}) as unknown as StorageNodeSelectorService,
      audiusWalletClient: {
        signMessage: () => {},
        getAddresses: async () => ['0x0000000000000000000000000000000000000000']
      } as unknown as AudiusWalletClient
    }
  })
}
