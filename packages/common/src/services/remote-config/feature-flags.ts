import { Environment } from '../env'

/* FeatureFlags must be lowercase snake case */
export enum FeatureFlags {
  VERIFY_HANDLE_WITH_TIKTOK = 'verify_handle_with_tiktok',
  VERIFY_HANDLE_WITH_TWITTER = 'verify_handle_with_twitter',
  VERIFY_HANDLE_WITH_INSTAGRAM = 'verify_handle_with_instagram',
  FEATURE_FLAG_ACCESS = 'feature_flag_access',
  NETWORK_CUT_ENABLED = 'network_cut_enabled',
  FAST_REFERRAL = 'fast_referral',
  REACT_QUERY_SYNC = 'react_query_sync',
  COLLAPSED_EXPLORE_HEADER = 'collapsed_explore_header',
  QUEUE_NEW_FEATURE_BADGE = 'queue_new_feature_badge'
}

type FlagDefaults = Record<FeatureFlags, boolean>

export const environmentFlagDefaults: Record<
  Environment,
  Partial<FlagDefaults>
> = {
  development: {},
  production: {}
}

/**
 * If optimizely errors, these default values are used.
 */
export const flagDefaults: FlagDefaults = {
  [FeatureFlags.VERIFY_HANDLE_WITH_TIKTOK]: false,
  [FeatureFlags.VERIFY_HANDLE_WITH_TWITTER]: false,
  [FeatureFlags.VERIFY_HANDLE_WITH_INSTAGRAM]: false,
  [FeatureFlags.FEATURE_FLAG_ACCESS]: false,
  [FeatureFlags.NETWORK_CUT_ENABLED]: false,
  [FeatureFlags.FAST_REFERRAL]: false,
  [FeatureFlags.REACT_QUERY_SYNC]: false,
  [FeatureFlags.COLLAPSED_EXPLORE_HEADER]: false,
  [FeatureFlags.QUEUE_NEW_FEATURE_BADGE]: false
}
