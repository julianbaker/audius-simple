import { UserMetadata } from '@audius/common/models'
import { CreateGrantRequest, OptionalId } from '@audius/sdk'
import base64url from 'base64url'

import { audiusBackendInstance } from 'services/audius-backend/audius-backend-instance'
import { audiusSdk } from 'services/audius-sdk'
import { identityService } from 'services/audius-sdk/identity'
import { env } from 'services/env'

export const getIsRedirectValid = ({
  parsedRedirectUri,
  redirectUri
}: {
  parsedRedirectUri: 'postmessage' | URL | null
  redirectUri: string | string[] | null
}) => {
  if (redirectUri) {
    if (parsedRedirectUri == null) {
      // This means the redirect uri is not a string (and is thus invalid) or the URI format was invalid
      return false
    }
    if (parsedRedirectUri === 'postmessage') {
      return true
    }
    const { protocol } = parsedRedirectUri
    // Only block schemes that could execute code directly in the browser.
    // All other validation (allowed domains, path, etc.) is enforced server-side
    // via the registered redirect URI list for the OAuth client.
    const dangerousSchemes = ['javascript:', 'data:', 'vbscript:']
    if (dangerousSchemes.includes(protocol)) {
      return false
    }
    return true
  } else {
    return false
  }
}

export const isValidApiKey = (key: string | string[]) => {
  if (Array.isArray(key)) return false
  const normalized = key.toLowerCase().startsWith('0x') ? key.slice(2) : key
  if (normalized.length !== 40) {
    return false
  }
  const hexadecimalRegex = /^[0-9a-fA-F]+$/
  return hexadecimalRegex.test(normalized)
}

const getFormattedAppAddress = ({
  apiKey,
  includePrefix
}: {
  apiKey: string
  includePrefix: boolean
}) => {
  let result
  if (!apiKey.startsWith('0x')) {
    if (includePrefix) {
      result = `0x${apiKey}`
    } else {
      result = apiKey
    }
  } else {
    if (includePrefix) {
      result = apiKey
    } else {
      result = apiKey.slice(2)
    }
  }
  return result.toLowerCase()
}

export const formOAuthResponse = async ({
  account,
  userEmail,
  apiKey,
  onError,
  txSignature
}: {
  account: UserMetadata
  userEmail?: string | null
  apiKey?: string
  onError: () => void
  txSignature?: { message: string; signature: string }
}) => {
  let email: string
  if (!userEmail) {
    try {
      email = await identityService.getUserEmail()
    } catch {
      onError()
      return
    }
  } else {
    email = userEmail
  }

  const profilePicture = account.profile_picture
  const timestamp = Math.round(new Date().getTime() / 1000)
  const userId = OptionalId.parse(account?.user_id)
  const response = {
    userId,
    email,
    name: account?.name,
    handle: account?.handle,
    verified: account?.is_verified,
    profilePicture,
    apiKey,
    ...(txSignature ? { txSignature } : {}),
    sub: userId,
    iat: timestamp
  }
  const header = base64url.encode(
    JSON.stringify({ typ: 'JWT', alg: 'keccak256' })
  )
  const payload = base64url.encode(JSON.stringify(response))

  const message = `${header}.${payload}`
  let signedData: { data: string; signature: string }
  try {
    const sdk = await audiusSdk()
    signedData = await audiusBackendInstance.signAPIRequest({
      sdk,
      input: message
    })
  } catch {
    onError()
    return
  }
  const signature = signedData.signature
  return `${header}.${payload}.${base64url.encode(signature)}`
}

export const exchangeForAuthorizationCode = async ({
  account,
  userEmail,
  apiKey,
  redirectUri,
  codeChallenge,
  codeChallengeMethod,
  scope,
  onError
}: {
  account: UserMetadata
  userEmail: string | null
  apiKey: string
  redirectUri: string
  codeChallenge: string
  codeChallengeMethod: string
  scope: string
  onError: () => void
}): Promise<string | null> => {
  // 1. Build JWT (same as implicit flow — proves user identity to API)
  const jwt = await formOAuthResponse({ account, userEmail, apiKey, onError })
  if (!jwt) return null

  // 2. Exchange JWT + PKCE params for authorization code
  try {
    const res = await fetch(`${env.API_URL}/v1/oauth/authorize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: jwt,
        client_id: apiKey,
        redirect_uri: redirectUri,
        code_challenge: codeChallenge,
        code_challenge_method: codeChallengeMethod,
        scope
      })
    })
    if (!res.ok) {
      onError()
      return null
    }
    const { code } = await res.json()
    return code
  } catch {
    onError()
    return null
  }
}

export const authWrite = async ({ userId, appApiKey }: CreateGrantRequest) => {
  const sdk = await audiusSdk()
  await sdk.grants.createGrant({
    userId,
    appApiKey
  })
}

export const getDeveloperApp = async (address: string) => {
  const sdk = await audiusSdk()
  const developerApp = await sdk.developerApps.getDeveloperApp({ address })
  return developerApp.data
}

export const getIsAppAuthorized = async ({
  userId,
  apiKey
}: {
  userId: string
  apiKey: string
}) => {
  const sdk = await audiusSdk()
  const authorizedApps = await sdk.users.getAuthorizedApps({ id: userId })
  const prefixedAppAddress = getFormattedAppAddress({
    apiKey,
    includePrefix: true
  })
  const foundIndex = authorizedApps.data?.findIndex(
    (a) => a.address.toLowerCase() === prefixedAppAddress
  )
  return foundIndex !== undefined && foundIndex > -1
}
