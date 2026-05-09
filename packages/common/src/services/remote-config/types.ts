export enum IntKeys {
  /**
   * Duration (in ms) before we consider the fetch of an image against
   * a primary creator node a failure
   * @deprecated
   */
  IMAGE_QUICK_FETCH_TIMEOUT_MS = 'IMAGE_QUICK_FETCH_TIMEOUT_MS',
  /**
   * The size at which a bundle of image loading performance metrics
   * are sent to the analytics sever
   */
  IMAGE_QUICK_FETCH_PERFORMANCE_BATCH_SIZE = 'IMAGE_QUICK_FETCH_PERFORMANCE_BATCH_SIZE',

  /**
   * Frequency (in ms) to poll for user wallet balance on the client dashboard page
   */
  DASHBOARD_WALLET_BALANCE_POLLING_FREQ_MS = 'DASHBOARD_WALLET_BALANCE_POLLING_FREQ_MS',

  /**
   * Frequency (in ms) to poll for notifications from identity service.
   */
  NOTIFICATION_POLLING_FREQ_MS = 'NOTIFICATION_POLLING_FREQ_MS',

  /**
   * Service monitoring health check analytics sample rate (int out of 100). A value of 50
   * means that half of health checks are recorded.
   */
  SERVICE_MONITOR_HEALTH_CHECK_SAMPLE_RATE = 'SERVICE_MONITOR_HEALTH_CHECK_SAMPLE_RATE',

  /**
   * Service monitoring request analytics sample rate (int out of 100). A value of 50
   * means that half of all requests are recorded.
   */
  SERVICE_MONITOR_REQUEST_SAMPLE_RATE = 'SERVICE_MONITOR_REQUEST_SAMPLE_RATE',

  /**
   * Instagram handle taken check timeout
   */
  INSTAGRAM_HANDLE_CHECK_TIMEOUT = 'INSTAGRAM_HANDLE_CHECK_TIMEOUT',

  /**
   * Number of random (recommended) tracks to fetch and add to the autoplay queue
   */
  AUTOPLAY_LIMIT = 'AUTOPLAY_LIMIT',

  /**
   * The interval in milliseconds between polls for gated tracks to check for access
   */
  GATED_TRACK_POLL_INTERVAL_MS = 'GATED_TRACK_POLL_INTERVAL_MS',

  /**
   * Cache entry TTL to determine when a cache value should be overwritten with new instance
   */
  CACHE_ENTRY_TTL = 'CACHE_ENTRY_TTL',

  /**
   * Timeout for handle verification from socials.
   */
  HANDLE_VERIFICATION_TIMEOUT_MILLIS = 'HANDLE_VERIFICATION_TIMEOUT_MILLIS',

  /** User must meet this tier requirement to send chat blasts */
  CHAT_BLAST_TIER_REQUIREMENT = 'CHAT_BLAST_TIER_REQUIREMENT'
}

export enum BooleanKeys {
  /*
   * Boolean to show instagram verification on mobile.
   */
  DISPLAY_INSTAGRAM_VERIFICATION = 'DISPLAY_INSTAGRAM_VERIFICATION',
  /*
   * Boolean to show instagram verification on web + desktop.
   */
  DISPLAY_INSTAGRAM_VERIFICATION_WEB_AND_DESKTOP = 'DISPLAY_INSTAGRAM_VERIFICATION_WEB_AND_DESKTOP',
  /**
   * Boolean to show twitter verification on mobile.
   */
  DISPLAY_TWITTER_VERIFICATION = 'DISPLAY_TWITTER_VERIFICATION',
  /**
   * Boolean to show twitter verification on web + desktop.
   */
  DISPLAY_TWITTER_VERIFICATION_WEB_AND_DESKTOP = 'DISPLAY_TWITTER_VERIFICATION_WEB_AND_DESKTOP',
  /**
   * Boolean to show twitter verification on mobile.
   */
  DISPLAY_TIKTOK_VERIFICATION = 'DISPLAY_TIKTOK_VERIFICATION',
  /**
   * Boolean to show twitter verification on web + desktop.
   */
  DISPLAY_TIKTOK_VERIFICATION_WEB_AND_DESKTOP = 'DISPLAY_TIKTOK_VERIFICATION_WEB_AND_DESKTOP',

  /**
   * Boolean to skip the rollover nodes sanity check.
   */
  SKIP_ROLLOVER_NODES_SANITY_CHECK = 'SKIP_ROLLOVER_NODES_SANITY_CHECK'
}

export enum DoubleKeys {
  /**
   * How often we should show recommendations of top artists as suggested follows
   * if the followed user doesn't have related artists
   */
  SHOW_ARTIST_RECOMMENDATIONS_FALLBACK_PERCENT = 'SHOW_ARTIST_RECOMMENDATIONS_FALLBACK_PERCENT',
  /**
   * How often we should show suggested follows after a user follows another user
   */
  SHOW_ARTIST_RECOMMENDATIONS_PERCENT = 'SHOW_ARTIST_RECOMMENDATIONS_PERCENT',

  /** How many Sentry error recordings we sample. Value ranges from 0.0-1.0 */
  SENTRY_REPLAY_ERROR_SAMPLE_RATE = 'SENTRY_REPLAY_ERROR_SAMPLE_RATE'
}

export enum StringKeys {
  /**
   * Logo variant to display in the top left of the app.
   * `AUDIUS_LOGO_VARIANT_CLICK_TARGET` can be used to customize the
   * url that is navigated to on click.
   */
  AUDIUS_LOGO_VARIANT = 'AUDIUS_LOGO_VARIANT',

  /**
   * Click target for the top left Audius logo in the app.
   */
  AUDIUS_LOGO_VARIANT_CLICK_TARGET = 'AUDIUS_LOGO_VARIANT_CLICK_TARGET',

  /**
   * Custom text for a top of page notice.
   */
  APP_WIDE_NOTICE_TEXT = 'APP_WIDE_NOTICE_TEXT',

  /**
   * Custom eth provider urls to use for talking to main-net contracts
   */
  ETH_PROVIDER_URLS = 'ETH_PROVIDER_URLS',

  /**
   * Blocks content
   */
  CONTENT_BLOCK_LIST = 'CONTENT_BLOCK_LIST',

  /**
   * Blocks content nodes from selection
   */
  CONTENT_NODE_BLOCK_LIST = 'CONTENT_NODE_BLOCK_LIST',

  /**
   * Instagram Profile API url. Must contain $USERNAME$
   */
  INSTAGRAM_API_PROFILE_URL = 'INSTAGRAM_API_PROFILE_URL',

  /**
   * User ids omitted from trending playlists. Comma-separated.
   */
  TRENDING_PLAYLIST_OMITTED_USER_IDS = 'TRENDING_PLAYLIST_OMITTED_USER_IDS',

  /** TF */
  TF = 'TF',
  TPF = 'TPF',
  UTF = 'UTF',

  /** Trending experiment id */
  TRENDING_EXPERIMENT = 'TRENDING_EXPERIMENT',

  /** Underground trending experiment id */
  UNDERGROUND_TRENDING_EXPERIMENT = 'UNDERGROUND_TRENDING_EXPERIMENT',

  /** Playlist trending experiment id */
  PLAYLIST_TRENDING_EXPERIMENT = 'PLAYLIST_TRENDING_EXPERIMENT',

  /** Minimum required version for the app */
  MIN_APP_VERSION = 'MIN_APP_VERSION'
}

export type AllRemoteConfigKeys =
  | IntKeys
  | BooleanKeys
  | DoubleKeys
  | StringKeys
