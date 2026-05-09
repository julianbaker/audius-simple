import { IntKeys, StringKeys, DoubleKeys, BooleanKeys } from './types'

const ETH_PROVIDER_URLS = process.env.REACT_APP_ETH_PROVIDER_URL || ''
export const DEFAULT_ENTRY_TTL = 1 /* min */ * 60 /* seconds */ * 1000 /* ms */
const DEFAULT_HANDLE_VERIFICATION_TIMEOUT_MILLIS = 5_000

export const remoteConfigIntDefaults: { [key in IntKeys]: number | null } = {
  [IntKeys.IMAGE_QUICK_FETCH_TIMEOUT_MS]: 5000,
  [IntKeys.IMAGE_QUICK_FETCH_PERFORMANCE_BATCH_SIZE]: 20,
  [IntKeys.DASHBOARD_WALLET_BALANCE_POLLING_FREQ_MS]: 5000,
  [IntKeys.NOTIFICATION_POLLING_FREQ_MS]: 60 * 1000,
  [IntKeys.SERVICE_MONITOR_HEALTH_CHECK_SAMPLE_RATE]: 0,
  [IntKeys.SERVICE_MONITOR_REQUEST_SAMPLE_RATE]: 0,
  [IntKeys.INSTAGRAM_HANDLE_CHECK_TIMEOUT]: 4000,
  [IntKeys.AUTOPLAY_LIMIT]: 10,
  [IntKeys.GATED_TRACK_POLL_INTERVAL_MS]: 1000,
  [IntKeys.CACHE_ENTRY_TTL]: DEFAULT_ENTRY_TTL,
  [IntKeys.HANDLE_VERIFICATION_TIMEOUT_MILLIS]:
    DEFAULT_HANDLE_VERIFICATION_TIMEOUT_MILLIS,
  [IntKeys.CHAT_BLAST_TIER_REQUIREMENT]: 1
}

export const remoteConfigStringDefaults: {
  [key in StringKeys]: string | null
} = {
  [StringKeys.AUDIUS_LOGO_VARIANT]: null,
  [StringKeys.AUDIUS_LOGO_VARIANT_CLICK_TARGET]: null,
  [StringKeys.APP_WIDE_NOTICE_TEXT]: null,
  [StringKeys.ETH_PROVIDER_URLS]: ETH_PROVIDER_URLS,
  [StringKeys.CONTENT_BLOCK_LIST]: null,
  [StringKeys.CONTENT_NODE_BLOCK_LIST]: null,
  [StringKeys.INSTAGRAM_API_PROFILE_URL]:
    'https://instagram.com/$USERNAME$/?__a=1',
  // Audius user id
  [StringKeys.TRENDING_PLAYLIST_OMITTED_USER_IDS]: '51',
  [StringKeys.TF]: null,
  [StringKeys.TPF]: null,
  [StringKeys.UTF]: null,
  [StringKeys.TRENDING_EXPERIMENT]: null,
  [StringKeys.PLAYLIST_TRENDING_EXPERIMENT]: null,
  [StringKeys.UNDERGROUND_TRENDING_EXPERIMENT]: null,
  [StringKeys.MIN_APP_VERSION]: '1.0.0'
}

export const remoteConfigDoubleDefaults: {
  [key in DoubleKeys]: number | null
} = {
  [DoubleKeys.SHOW_ARTIST_RECOMMENDATIONS_FALLBACK_PERCENT]: 0.3333,
  [DoubleKeys.SHOW_ARTIST_RECOMMENDATIONS_PERCENT]: 1.0,
  [DoubleKeys.SENTRY_REPLAY_ERROR_SAMPLE_RATE]: 0.0
}
export const remoteConfigBooleanDefaults: {
  [key in BooleanKeys]: boolean | null
} = {
  [BooleanKeys.DISPLAY_INSTAGRAM_VERIFICATION]: true,
  [BooleanKeys.DISPLAY_INSTAGRAM_VERIFICATION_WEB_AND_DESKTOP]: true,
  [BooleanKeys.DISPLAY_TWITTER_VERIFICATION]: true,
  [BooleanKeys.DISPLAY_TWITTER_VERIFICATION_WEB_AND_DESKTOP]: true,
  [BooleanKeys.DISPLAY_TIKTOK_VERIFICATION]: true,
  [BooleanKeys.DISPLAY_TIKTOK_VERIFICATION_WEB_AND_DESKTOP]: true,
  [BooleanKeys.SKIP_ROLLOVER_NODES_SANITY_CHECK]: false
}
