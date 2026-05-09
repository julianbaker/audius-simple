import { ChatPermission, Genre } from '@audius/sdk'

import { FeedFilter } from '~/models/FeedFilter'
import { ID, PlayableType } from '~/models/Identifiers'
import { TimeRange } from '~/models/TimeRange'
import { Nullable } from '~/utils/typeUtils'

import { PlaylistLibraryKind } from './PlaylistLibrary'
import { AccessConditions, TrackAccessType } from './Track'

const ANALYTICS_TRACK_EVENT = 'ANALYTICS/TRACK_EVENT'

type JsonMap = Record<string, unknown>

export type IdentifyTraits = {
  handle?: string
  name?: string
  email?: string
  userId?: ID
  queue_new_feature_badge?: 'on' | 'off'
}

export type AnalyticsEvent = {
  eventName: string
  properties?: JsonMap
  id?: string
  source?: string
}

export enum Name {
  APP_ERROR = 'App Error', // Generic app error
  SESSION_START = 'Session Start',
  // Account creation
  // When the user opens the create account page
  CREATE_ACCOUNT_OPEN = 'Create Account: Open',
  // When the user continues past the email page
  CREATE_ACCOUNT_COMPLETE_EMAIL = 'Create Account: Complete Email',
  // When the user continues past the password page
  CREATE_ACCOUNT_COMPLETE_PASSWORD = 'Create Account: Complete Password',
  // When the user starts integrating with twitter
  CREATE_ACCOUNT_START_TWITTER = 'Create Account: Start Twitter',
  // When the user successfully continues past the "twitter connection page"
  CREATE_ACCOUNT_COMPLETE_TWITTER = 'Create Account: Complete Twitter',
  // When the user closed the twitter oauth modal
  CREATE_ACCOUNT_CLOSED_TWITTER = 'Create Account: Closed Twitter',
  // When the user encounters an error during twitter oauth
  CREATE_ACCOUNT_TWITTER_ERROR = 'Create Account: Twitter Error',
  // When the user starts integrating with instagram
  CREATE_ACCOUNT_START_INSTAGRAM = 'Create Account: Start Instagram',
  // When the user continues past the "instagram connection page"
  CREATE_ACCOUNT_COMPLETE_INSTAGRAM = 'Create Account: Complete Instagram',
  // When the user closed the instagram oauth modal
  CREATE_ACCOUNT_CLOSED_INSTAGRAM = 'Create Account: Closed Instagram',
  // When the user encounters an error during instagram oauth
  CREATE_ACCOUNT_INSTAGRAM_ERROR = 'Create Account: Error Instagram',
  // When the user starts integrating with tiktok
  CREATE_ACCOUNT_START_TIKTOK = 'Create Account: Start TikTok',
  // When the user continues past the "tiktok connection page"
  CREATE_ACCOUNT_COMPLETE_TIKTOK = 'Create Account: Complete TikTok',
  // When the user closes the tiktok oauth modal
  CREATE_ACCOUNT_CLOSED_TIKTOK = 'Create Account: Closed TikTok',
  // Errors encountered during tiktok oauth
  CREATE_ACCOUNT_TIKTOK_ERROR = 'Create Account: TikTok Error',
  // When the user continues past the "profile info page"
  CREATE_ACCOUNT_COMPLETE_PROFILE = 'Create Account: Complete Profile',
  // When the user uploads a profile photo in signup
  CREATE_ACCOUNT_UPLOAD_PROFILE_PHOTO = 'Create Account: Upload Profile Photo',
  // When the user has an error uploading their profile photo
  CREATE_ACCOUNT_UPLOAD_PROFILE_PHOTO_ERROR = 'Create Account: Upload Profile Photo Error',
  // When the user uploads a cover photo in signup
  CREATE_ACCOUNT_UPLOAD_COVER_PHOTO = 'Create Account: Upload Cover Photo',
  // When the user has an error uploading their cover photo
  CREATE_ACCOUNT_UPLOAD_COVER_PHOTO_ERROR = 'Create Account: Upload Cover Photo Error',
  // When the user selects a genre
  CREATE_ACCOUNT_SELECT_GENRE = 'Create Account: Select Genre',
  // When the user clicks follow on a specific user on the follow artists page
  CREATE_ACCOUNT_FOLLOW_ARTIST = 'Create Account: Follow Artist',
  // When the user clicks to preview a song from an artist on the follow artists page
  CREATE_ACCOUNT_ARTIST_PREVIEWED = 'Create Account: Artist Previewed',
  // When the user continues past the follow page
  CREATE_ACCOUNT_COMPLETE_FOLLOW = 'Create Account: Complete Follow',
  // When the user continues past the loading page
  CREATE_ACCOUNT_COMPLETE_CREATING = 'Create Account: Complete Creating',
  // When the user creates a guest account
  CREATE_ACCOUNT_COMPLETE_GUEST_CREATING = 'Create Account: Complete Guest Creating',
  // When the user completes a guest profile for a full user
  CREATE_ACCOUNT_COMPLETE_GUEST_PROFILE = 'Create Account: Complete Guest Profile',
  // When the user continues past the entire signup modal
  CREATE_ACCOUNT_FINISH = 'Create Account: Finish',
  // When the user gets rate limited during signup auth
  CREATE_ACCOUNT_RATE_LIMIT = 'Create Account: Rate Limit',
  // When the user gets blocked by AAO during the signup path
  CREATE_ACCOUNT_BLOCKED = 'Create Account: Blocked',
  // When the welcome modal gets shown to the user
  CREATE_ACCOUNT_WELCOME_MODAL = 'Create Account: Welcome Modal',
  // When the user clicks the "Upload Track" CTA in the welcome modal
  CREATE_ACCOUNT_WELCOME_MODAL_UPLOAD_TRACK = 'Create Account: Welcome Modal Upload Track Clicked',
  // Sign in
  SIGN_IN_START = 'Sign In: Start',
  SIGN_IN_FINISH = 'Sign In: Finish',
  SIGN_IN_WITH_INCOMPLETE_ACCOUNT = 'Sign In: Incomplete Account',
  SIGN_IN_WITH_DEACTIVATED_ACCOUNT = 'Sign In: Deactivated Account',

  // Settings
  SETTINGS_CHANGE_THEME = 'Settings: Change Theme',
  SETTINGS_START_TWITTER_OAUTH = 'Settings: Start Twitter OAuth',
  SETTINGS_COMPLETE_TWITTER_OAUTH = 'Settings: Complete Twitter OAuth',
  SETTINGS_START_INSTAGRAM_OAUTH = 'Settings: Start Instagram OAuth',
  SETTINGS_COMPLETE_INSTAGRAM_OAUTH = 'Settings: Complete Instagram OAuth',
  SETTINGS_START_TIKTOK_OAUTH = 'Settings: Start TikTok OAuth',
  SETTINGS_COMPLETE_TIKTOK_OAUTH = 'Settings: Complete TikTok OAuth',
  SETTINGS_RESEND_ACCOUNT_RECOVERY = 'Settings: Resend Account Recovery',
  SETTINGS_START_CHANGE_PASSWORD = 'Settings: Start Change Password',
  SETTINGS_COMPLETE_CHANGE_PASSWORD = 'Settings: Complete Change Password',
  SETTINGS_LOG_OUT = 'Settings: Log Out',

  // TikTok
  // TODO: deprecate the following 3 metrics in favor of the duped CREATE_ACCOUNT ones
  TIKTOK_START_OAUTH = 'TikTok: Start TikTok OAuth',
  TIKTOK_COMPLETE_OAUTH = 'TikTok: Complete TikTok OAuth',
  TIKTOK_OAUTH_ERROR = 'TikTok: TikTok OAuth Error',

  // Audius OAuth Login Page
  AUDIUS_OAUTH_START = 'Audius Oauth: Open Login (authenticate)',
  AUDIUS_OAUTH_SUBMIT = 'Audius Oauth: Submit Login (authenticate)',
  AUDIUS_OAUTH_COMPLETE = 'Audius Oauth: Login (authenticate) Success',
  AUDIUS_OAUTH_ERROR = 'Audius Oauth: Login (authenticate) Failed',

  // Developer app
  DEVELOPER_APP_CREATE_SUBMIT = 'Developer Apps: Create app submit',
  DEVELOPER_APP_CREATE_SUCCESS = 'Developer Apps: Create app success',
  DEVELOPER_APP_CREATE_ERROR = 'Developer Apps: Create app error',
  DEVELOPER_APP_EDIT_SUBMIT = 'Developer Apps: Edit app submit',
  DEVELOPER_APP_EDIT_SUCCESS = 'Developer Apps: Edit app success',
  DEVELOPER_APP_EDIT_ERROR = 'Developer Apps: Edit app error',
  DEVELOPER_APP_DELETE_SUCCESS = 'Developer Apps: Delete app success',
  DEVELOPER_APP_DELETE_ERROR = 'Developer Apps: Delete app error',

  // Authorized app
  AUTHORIZED_APP_REMOVE_SUCCESS = 'Authorized Apps: Remove app success',
  AUTHORIZED_APP_REMOVE_ERROR = 'Authorized Apps: Remove app error',

  // Visualizer
  VISUALIZER_OPEN = 'Visualizer: Open',
  VISUALIZER_CLOSE = 'Visualizer: Close',

  // Profile completion
  ACCOUNT_HEALTH_METER_FULL = 'Account Health: Meter Full',
  ACCOUNT_HEALTH_UPLOAD_COVER_PHOTO = 'Account Health: Upload Cover Photo',
  ACCOUNT_HEALTH_UPLOAD_PROFILE_PICTURE = 'Account Health: Upload Profile Picture',
  ACCOUNT_HEALTH_DOWNLOAD_DESKTOP = 'Account Health: Download Desktop',
  ACCOUNT_HEALTH_CLICK_APP_CTA_BANNER = 'Account Health: App CTA Banner',

  // TOS
  BANNER_TOS_CLICKED = 'Banner TOS Clicked',

  // Social actions
  SHARE = 'Share',
  SHARE_TO_TWITTER = 'Share to Twitter',
  REPOST = 'Repost',
  UNDO_REPOST = 'Undo Repost',
  FAVORITE = 'Favorite',
  UNFAVORITE = 'Unfavorite',
  ARTIST_PICK_SELECT_TRACK = 'Artist Pick: Select Track',
  FOLLOW = 'Follow',
  UNFOLLOW = 'Unfollow',

  // Playlist creation
  PLAYLIST_ADD = 'Playlist: Add To Playlist',
  PLAYLIST_OPEN_CREATE = 'Playlist: Open Create Playlist',
  PLAYLIST_START_CREATE = 'Playlist: Start Create Playlist',
  PLAYLIST_COMPLETE_CREATE = 'Playlist: Complete Create Playlist',
  PLAYLIST_MAKE_PUBLIC = 'Playlist: Make Public',
  PLAYLIST_OPEN_EDIT_FROM_LIBRARY = 'Playlist: Open Edit Playlist From Sidebar',

  DELETE = 'Delete',

  // Folders
  FOLDER_OPEN_CREATE = 'Folder: Open Create Playlist Folder',
  FOLDER_SUBMIT_CREATE = 'Folder: Submit Create Playlist Folder',
  FOLDER_CANCEL_CREATE = 'Folder: Cancel Create Playlist Folder',
  FOLDER_OPEN_EDIT = 'Folder: Open Edit Playlist Folder',
  FOLDER_SUBMIT_EDIT = 'Folder: Submit Edit Playlist Folder',
  FOLDER_DELETE = 'Folder: Delete Playlist Folder',
  FOLDER_CANCEL_EDIT = 'Folder: Cancel Edit Playlist Folder',

  // Embed
  EMBED_OPEN = 'Embed: Open modal',
  EMBED_COPY = 'Embed: Copy',

  // Upload funnel / conversion
  TRACK_UPLOAD_OPEN = 'Track Upload: Open',
  TRACK_UPLOAD_START_UPLOADING = 'Track Upload: Start Upload',
  TRACK_UPLOAD_TRACK_UPLOADING = 'Track Upload: Track Uploading',
  // Note that upload is considered complete if it is explicitly rejected
  // by the node receiving the file (HTTP 403).
  TRACK_UPLOAD_COMPLETE_UPLOAD = 'Track Upload: Complete Upload',
  TRACK_UPLOAD_COPY_LINK = 'Track Upload: Copy Link',
  TRACK_UPLOAD_SHARE_WITH_FANS = 'Track Upload: Share with your fans',
  TRACK_UPLOAD_VIEW_TRACK_PAGE = 'Track Upload: View Track page',
  TWEET_FIRST_UPLOAD = 'Tweet First Upload',

  // Upload success tracking
  TRACK_UPLOAD_SUCCESS = 'Track Upload: Success',
  TRACK_UPLOAD_FAILURE = 'Track Upload: Failure',
  TRACK_UPLOAD_REJECTED = 'Track Upload: Rejected',

  // Gated Track Uploads
  TRACK_UPLOAD_FOLLOW_GATED = 'Track Upload: Follow Gated',
  // Download-Only Gated Track Uploads
  TRACK_UPLOAD_FOLLOW_GATED_DOWNLOAD = 'Track Upload: Follow Gated Download',

  // Track Downloads
  TRACK_DOWNLOAD_CLICKED_DOWNLOAD_ALL = 'Track Download: Clicked Download All',
  TRACK_DOWNLOAD_SUCCESSFUL_DOWNLOAD_ALL = 'Track Download: Successfull Download All',
  TRACK_DOWNLOAD_FAILED_DOWNLOAD_ALL = 'Track Download: Failed Download All',
  TRACK_DOWNLOAD_CLICKED_DOWNLOAD_SINGLE = 'Track Download: Clicked Download Single',
  TRACK_DOWNLOAD_SUCCESSFUL_DOWNLOAD_SINGLE = 'Track Download: Successfull Download Single',
  TRACK_DOWNLOAD_FAILED_DOWNLOAD_SINGLE = 'Track Download: Failed Download Single',

  // Track Edits
  TRACK_EDIT_ACCESS_CHANGED = 'Track Edit: Access Changed',
  TRACK_EDIT_BPM_CHANGED = 'Track Edit: BPM Changed',
  TRACK_EDIT_MUSICAL_KEY_CHANGED = 'Track Edit: Musical Key Changed',

  // Collection Edits
  COLLECTION_EDIT_ACCESS_CHANGED = 'Collection Edit: Access Changed',
  COLLECTION_EDIT = 'Collection Edit: General Edits',

  // Gated Track Listen
  LISTEN_GATED = 'Listen: Gated',

  // Unlocked Gated Tracks
  FOLLOW_GATED_TRACK_UNLOCKED = 'Follow Gated: Track Unlocked',
  // Unlocked Download-Only Gated Tracks
  FOLLOW_GATED_DOWNLOAD_TRACK_UNLOCKED = 'Follow Gated: Download Track Unlocked',

  // Trending
  TRENDING_CHANGE_VIEW = 'Trending: Change view',

  // Feed
  FEED_CHANGE_VIEW = 'Feed: Change view',

  // Notifications
  NOTIFICATIONS_OPEN = 'Notifications: Open',
  /** Mobile: push open; also used in web dev to seed Amplitude event properties */
  NOTIFICATIONS_OPEN_PUSH_NOTIFICATION = 'Notifications: Open Push Notification',
  NOTIFICATIONS_CLICK_TILE = 'Notifications: Clicked Tile',
  NOTIFICATIONS_CLICK_MILESTONE_TWITTER_SHARE = 'Notifications: Clicked Milestone Twitter Share',
  NOTIFICATIONS_CLICK_REMIX_CREATE_TWITTER_SHARE = 'Notifications: Clicked Remix Create Twitter Share',
  NOTIFICATIONS_CLICK_REMIX_COSIGN_TWITTER_SHARE = 'Notifications: Clicked Remix Co-Sign Twitter Share',
  NOTIFICATIONS_CLICK_DETHRONED_TWITTER_SHARE = 'Notifications: Clicked Dethroned Twitter Share',
  NOTIFICATIONS_CLICK_TRENDING_TRACK_TWITTER_SHARE = 'Notifications: Clicked Trending Track Twitter Share',
  NOTIFICATIONS_CLICK_TRENDING_UNDERGROUND_TWITTER_SHARE = 'Notifications: Clicked Trending Underground Twitter Share',
  NOTIFICATIONS_CLICK_TASTEMAKER_TWITTER_SHARE = 'Notifications: Clicked Tastemaker Twitter Share',
  NOTIFICATIONS_CLICK_ADD_TRACK_TO_PLAYLIST_TWITTER_SHARE = 'Notifications: Clicked Add Track to Playlist Twitter Share',
  NOTIFICATIONS_TOGGLE_SETTINGS = 'Notifications: Toggle Setting',
  BROWSER_NOTIFICATION_SETTINGS = 'Browser Push Notification',

  // Profile page
  PROFILE_PAGE_TAB_CLICK = 'Profile Page: Tab Click',
  PROFILE_PAGE_SORT = 'Profile Page: Sort',
  PROFILE_PAGE_CLICK_INSTAGRAM = 'Profile Page: Go To Instagram',
  PROFILE_PAGE_CLICK_TWITTER = 'Profile Page: Go To Twitter',
  PROFILE_PAGE_CLICK_TIKTOK = 'Profile Page: Go To TikTok',
  PROFILE_PAGE_CLICK_WEBSITE = 'ProfilePage: Go To Website',
  PROFILE_PAGE_SHOWN_ARTIST_RECOMMENDATIONS = 'ProfilePage: Shown Artist Recommendations',

  // Track page
  TRACK_PAGE_DOWNLOAD = 'Track Page: Download',
  TRACK_PAGE_PLAY_MORE = 'Track Page: Play More By This Artist',

  // Playback
  PLAYBACK_PLAY = 'Playback: Play',
  PLAYBACK_PAUSE = 'Playback: Pause',
  PLAYLIST_PLAY = 'Playlist: Play',
  // Playback performance metrics
  BUFFERING_TIME = 'Buffering Time',

  // Play Queue
  PLAY_QUEUE_OPEN = 'Play Queue: Open',
  PLAY_QUEUE_CLOSE = 'Play Queue: Close',
  PLAY_QUEUE_ADD_TRACK = 'Play Queue: Add Track',
  PLAY_QUEUE_REMOVE_TRACK = 'Play Queue: Remove Track',
  PLAY_QUEUE_REORDER_TRACK = 'Play Queue: Reorder Track',
  PLAY_QUEUE_PLAY_TRACK = 'Play Queue: Play Track',
  PLAY_QUEUE_CLEAR = 'Play Queue: Clear',

  // Navigation
  PAGE_VIEW = 'Page View',
  ON_FIRST_PAGE = 'nav-on-first-page',
  NOT_ON_FIRST_PAGE = 'nav-not-on-first-page',
  LINK_CLICKING = 'Link Click',
  TAG_CLICKING = 'Tag Click',

  // Modals
  MODAL_OPENED = 'Modal Opened',
  MODAL_CLOSED = 'Modal Closed',

  // Search
  SEARCH_SEARCH = 'Search: Search',
  SEARCH_TAG_SEARCH = 'Search: Tag Search',
  SEARCH_MORE_RESULTS = 'Search: More Results',
  SEARCH_RESULT_SELECT = 'Search: Result Select',
  SEARCH_TAB_CLICK = 'Search: Tab Click',

  // Explore
  EXPLORE_SECTION_VIEW = 'Explore: Section View',
  EXPLORE_SECTION_CLICK = 'Explore: Section Click',

  // Errors
  ERROR_PAGE = 'Error Page',
  NOT_FOUND_PAGE = 'Not Found Page',

  // System
  WEB_VITALS = 'Web Vitals',
  PERFORMANCE = 'Performance',
  CREATOR_NODE_SELECTION = 'Creator Node Selection',

  // Remixes
  STEM_COMPLETE_UPLOAD = 'Stem: Complete Upload',
  STEM_DELETE = 'Stem: Delete',
  REMIX_NEW_REMIX = 'Remix: New Remix',
  REMIX_COSIGN = 'Remix: CoSign',
  REMIX_COSIGN_INDICATOR = 'Remix: CoSign Indicator',
  REMIX_HIDE = 'Remix: Hide',

  // Service monitoring
  SERVICE_MONITOR_REQUEST = 'Service Monitor: Request',
  SERVICE_MONITOR_HEALTH_CHECK = 'Service Monitor: Status',

  // Playlist library
  PLAYLIST_LIBRARY_REORDER = 'Playlist Library: Reorder',
  PLAYLIST_LIBRARY_MOVE_PLAYLIST_INTO_FOLDER = 'Playlist Library: Move Playlist Into Folder',
  PLAYLIST_LIBRARY_ADD_PLAYLIST_TO_FOLDER = 'Playlist Library: Add Playlist To Folder',
  PLAYLIST_LIBRARY_MOVE_PLAYLIST_OUT_OF_FOLDER = 'Playlist Library: Move Playlist Out of Folder',
  PLAYLIST_LIBRARY_EXPAND_FOLDER = 'Playlist Library: Expand Folder',
  PLAYLIST_LIBRARY_COLLAPSE_FOLDER = 'Playlist Library: Collapse Folder',
  // When a user clicks on a playlist in the library
  PLAYLIST_LIBRARY_CLICKED = 'Playlist Library: Clicked',

  // Deactivate Account
  DEACTIVATE_ACCOUNT_PAGE_VIEW = 'Deactivate Account: Page View',
  DEACTIVATE_ACCOUNT_REQUEST = 'Deactivate Account: Request',
  DEACTIVATE_ACCOUNT_SUCCESS = 'Deactivate Account: Success',
  DEACTIVATE_ACCOUNT_FAILURE = 'Deactivate Account: Failure',

  // Create User Bank
  CREATE_USER_BANK_REQUEST = 'Create User Bank: Request',
  CREATE_USER_BANK_SUCCESS = 'Create User Bank: Success',
  CREATE_USER_BANK_FAILURE = 'Create User Bank: Failure',

  // Social Proof
  SOCIAL_PROOF_OPEN = 'Social Proof: Open',
  SOCIAL_PROOF_SUCCESS = 'Social Proof: Success',
  SOCIAL_PROOF_ERROR = 'Social Proof: Error',

  // Rate & Review CTA
  RATE_CTA_DISPLAYED = 'Rate CTA: Displayed',
  RATE_CTA_RESPONSE_YES = 'Rate CTA: User Responded Yes',
  RATE_CTA_RESPONSE_NO = 'Rate CTA: User Responded No',

  // Chat
  CREATE_CHAT_SUCCESS = 'Create Chat: Success',
  CREATE_CHAT_FAILURE = 'Create Chat: Failure',
  CHAT_BLAST_CTA_CLICKED = 'Chat Blast: CTA Clicked',
  CREATE_CHAT_BLAST_SUCCESS = 'Chat Blast: Create - Success',
  CREATE_CHAT_BLAST_FAILURE = 'Chat Blast: Create - Failure',
  CHAT_BLAST_MESSAGE_SENT = 'Chat Blast: Message Sent',
  SEND_MESSAGE_SUCCESS = 'Send Message: Success',
  SEND_MESSAGE_FAILURE = 'Send Message: Failure',
  DELETE_CHAT_SUCCESS = 'Delete Chat: Success',
  DELETE_CHAT_FAILURE = 'Delete Chat: Failure',
  BLOCK_USER_SUCCESS = 'Block User: Success',
  BLOCK_USER_FAILURE = 'Block User: Failure',
  CHANGE_INBOX_SETTINGS_SUCCESS = 'Change Inbox Settings: Success',
  CHANGE_INBOX_SETTINGS_FAILURE = 'Change Inbox Settings: Failure',
  SEND_MESSAGE_REACTION_SUCCESS = 'Send Message Reaction: Success',
  SEND_MESSAGE_REACTION_FAILURE = 'Send Message Reaction: Failure',
  MESSAGE_UNFURL_TRACK = 'Message Unfurl: Track',
  MESSAGE_UNFURL_PLAYLIST = 'Message Unfurl: Playlist',
  CHAT_REPORT_USER = 'Report User: Chat',
  CHAT_ENTRY_POINT = 'Chat Entry Point',
  CHAT_WEBSOCKET_ERROR = 'Chat Websocket Error',

  // Repair Signups
  SIGN_UP_REPAIR_START = 'Sign Up Repair: Start',
  SIGN_UP_REPAIR_SUCCESS = 'Sign Up Repair: Success',
  SIGN_UP_REPAIR_FAILURE = 'Sign Up Repair: Failure',

  // Manager Mode
  MANAGER_MODE_SWITCH_ACCOUNT = 'Manager Mode: Switch Account',
  MANAGER_MODE_INVITE_MANAGER = 'Manager Mode: Invite Manager',
  MANAGER_MODE_ACCEPT_INVITE = 'Manager Mode: Accept Invite',
  MANAGER_MODE_CANCEL_INVITE = 'Manager Mode: Cancel Invite',
  MANAGER_MODE_REJECT_INVITE = 'Manager Mode: Reject Invite',
  MANAGER_MODE_REMOVE_MANAGER = 'Manager Mode: Remove Manager',

  // Comments
  COMMENTS_CREATE_COMMENT = 'Comments: Create Comment',
  COMMENTS_UPDATE_COMMENT = 'Comments: Update Comment',
  COMMENTS_DELETE_COMMENT = 'Comments: Delete Comment',
  COMMENTS_REPLY_TO_COMMENT = 'Comments: Reply to Comment',
  COMMENTS_FOCUS_COMMENT_INPUT = 'Comments: Focus Comment Input',
  COMMENTS_CLICK_REPLY_BUTTON = 'Comments: Click Reply Button',
  COMMENTS_LIKE_COMMENT = 'Comments: Like Comment',
  COMMENTS_UNLIKE_COMMENT = 'Comments: Unlike Comment',
  COMMENTS_REPORT_COMMENT = 'Comments: Report Comment',
  COMMENTS_ADD_MENTION = 'Comments: Add Mention',
  COMMENTS_CLICK_MENTION = 'Comments: Click Mention',
  COMMENTS_ADD_TIMESTAMP = 'Comments: Add Timestamp',
  COMMENTS_CLICK_TIMESTAMP = 'Comments: Click Timestamp',
  COMMENTS_ADD_LINK = 'Comments: Add Link',
  COMMENTS_CLICK_LINK = 'Comments: Click Link',
  COMMENTS_NOTIFICATION_OPEN = 'Comments: Notification Open',
  COMMENTS_MUTE_USER = 'Comments: Mute User',
  COMMENTS_UNMUTE_USER = 'Comments: Unmute User',
  COMMENTS_PIN_COMMENT = 'Comments: Pin Comment',
  COMMENTS_UNPIN_COMMENT = 'Comments: Unpin Comment',
  COMMENTS_LOAD_MORE_COMMENTS = 'Comments: Load More Comments',
  COMMENTS_LOAD_NEW_COMMENTS = 'Comments: Load New Comments',
  COMMENTS_SHOW_REPLIES = 'Comments: Show Replies',
  COMMENTS_LOAD_MORE_REPLIES = 'Comments: Load More Replies',
  COMMENTS_HIDE_REPLIES = 'Comments: Hide Replies',
  COMMENTS_APPLY_SORT = 'Comments: Apply Sort',
  COMMENTS_CLICK_COMMENT_STAT = 'Comments: Click Comment Stat',
  COMMENTS_OPEN_COMMENT_OVERFLOW_MENU = 'Comments: Open Comment Overflow Menu',
  COMMENTS_TURN_ON_NOTIFICATIONS_FOR_COMMENT = 'Comments: Turn On Notifications for Comment',
  COMMENTS_TURN_OFF_NOTIFICATIONS_FOR_COMMENT = 'Comments: Turn Off Notifications for Comment',
  COMMENTS_OPEN_TRACK_OVERFLOW_MENU = 'Comments: Open Track Overflow Menu',
  COMMENTS_TURN_ON_NOTIFICATIONS_FOR_TRACK = 'Comments: Turn On Notifications for Track',
  COMMENTS_TURN_OFF_NOTIFICATIONS_FOR_TRACK = 'Comments: Turn Off Notifications for Track',
  COMMENTS_DISABLE_TRACK_COMMENTS = 'Comments: Disable Track Comments',
  COMMENTS_OPEN_COMMENT_DRAWER = 'Comments: Open Comment Drawer',
  COMMENTS_CLOSE_COMMENT_DRAWER = 'Comments: Close Comment Drawer',
  COMMENTS_OPEN_AUTH_MODAL = 'Comments: Open Auth Modal',
  COMMENTS_OPEN_INSTALL_APP_MODAL = 'Comments: Open Install App Modal',

  // Recent Comments
  RECENT_COMMENTS_CLICK = 'Recent Comments: Click',
  COMMENTS_HISTORY_CLICK = 'Comments History: Click',
  COMMENTS_HISTORY_DRAWER_OPEN = 'Comments History: Drawer Open',

  // Track Replace
  TRACK_REPLACE_DOWNLOAD = 'Track Replace: Download',
  TRACK_REPLACE_PREVIEW = 'Track Replace: Preview',
  TRACK_REPLACE_REPLACE = 'Track Replace: Replace',

  // Remix Contests
  REMIX_CONTEST_CREATE = 'Remix Contest: Create',
  REMIX_CONTEST_UPDATE = 'Remix Contest: Update',
  REMIX_CONTEST_DELETE = 'Remix Contest: Delete',
  REMIX_CONTEST_PICK_WINNERS_OPEN = 'Remix Contest: Pick Winners Open',
  REMIX_CONTEST_PICK_WINNERS_FINALIZE = 'Remix Contest: Finalize Winners',

  // Android App Lifecycle
  ANDROID_APP_RESTART_HEARTBEAT = 'Android App: Restart Due to Heartbeat',
  ANDROID_APP_RESTART_STALE = 'Android App: Restart Due to Stale Time',
  ANDROID_APP_RESTART_FORCE_QUIT = 'Android App: Restart Due to Force Quit'
}

type PageView = {
  eventName: Name.PAGE_VIEW
  route: string
}

type AppError = {
  eventName: Name.APP_ERROR
  errorMessage: string
}

// Create Account
export type CreateAccountOpen = {
  eventName: Name.CREATE_ACCOUNT_OPEN
  source:
    | 'nav profile'
    | 'nav button'
    | 'landing page'
    | 'account icon'
    | 'social action'
    | 'sign in page'
    | 'restricted page'
}
type CreateAccountCompleteEmail = {
  eventName: Name.CREATE_ACCOUNT_COMPLETE_EMAIL
  emailAddress: string
}
type CreateAccountCompletePassword = {
  eventName: Name.CREATE_ACCOUNT_COMPLETE_PASSWORD
  emailAddress: string
}
// Twitter Account Creation
type CreateAccountStartTwitter = {
  eventName: Name.CREATE_ACCOUNT_START_TWITTER
  emailAddress?: string
  page?: 'create-email' | 'pick-handle'
}
type CreateAccountCompleteTwitter = {
  eventName: Name.CREATE_ACCOUNT_COMPLETE_TWITTER
  isVerified: boolean
  emailAddress?: string
  handle: string
  page?: 'create-email' | 'pick-handle'
}
type CreateAccountClosedTwitter = {
  eventName: Name.CREATE_ACCOUNT_CLOSED_TWITTER
  emailAddress?: string
  page?: 'create-email' | 'pick-handle'
}
type CreateAccountTwitterError = {
  eventName: Name.CREATE_ACCOUNT_TWITTER_ERROR
  emailAddress?: string
  error?: string
  page?: 'create-email' | 'pick-handle'
}

// Instagram Account Creation
type CreateAccountStartInstagram = {
  eventName: Name.CREATE_ACCOUNT_START_INSTAGRAM
  emailAddress?: string
  page?: string
}
type CreateAccountCompleteInstagram = {
  eventName: Name.CREATE_ACCOUNT_COMPLETE_INSTAGRAM
  isVerified: boolean
  emailAddress?: string
  handle: string
  page?: string
}
type CreateAccountClosedInstagram = {
  eventName: Name.CREATE_ACCOUNT_CLOSED_INSTAGRAM
  emailAddress?: string
  page?: 'create-email' | 'pick-handle'
}
type CreateAccountInstagramError = {
  eventName: Name.CREATE_ACCOUNT_INSTAGRAM_ERROR
  emailAddress?: string
  error?: string
  page?: 'create-email' | 'pick-handle'
}

// TikTok account creation
type CreateAccountStartTikTok = {
  eventName: Name.CREATE_ACCOUNT_START_TIKTOK
  emailAddress?: string
  page?: string
}
type CreateAccountClosedTikTok = {
  eventName: Name.CREATE_ACCOUNT_CLOSED_TIKTOK
  page?: 'create-email' | 'pick-handle'
}
type CreateAccountCompleteTikTok =
  | {
      eventName: Name.CREATE_ACCOUNT_COMPLETE_TIKTOK
      emailAddress: string
      page?: string
    }
  | {
      eventName: Name.CREATE_ACCOUNT_COMPLETE_TIKTOK
      isVerified: boolean
      handle: string
      page?: string
    }
type CreateAccountTikTokError = {
  eventName: Name.CREATE_ACCOUNT_TIKTOK_ERROR
  error?: string
  page?: 'create-email' | 'pick-handle'
}

type CreateAccountUploadProfilePhoto = {
  eventName: Name.CREATE_ACCOUNT_UPLOAD_PROFILE_PHOTO
  emailAddress?: string
  handle?: string
}
type CreateAccountUploadProfilePhotoError = {
  eventName: Name.CREATE_ACCOUNT_UPLOAD_PROFILE_PHOTO_ERROR
  error: string
}
type CreateAccountUploadProfileCover = {
  eventName: Name.CREATE_ACCOUNT_UPLOAD_COVER_PHOTO
  emailAddress?: string
  handle?: string
}
type CreateAccountUploadProfileCoverError = {
  eventName: Name.CREATE_ACCOUNT_UPLOAD_COVER_PHOTO_ERROR
  error: string
}
type CreateAccountCompleteProfile = {
  eventName: Name.CREATE_ACCOUNT_COMPLETE_PROFILE
  emailAddress: string
  handle: string
}
type CreateAccountSelectGenre = {
  eventName: Name.CREATE_ACCOUNT_SELECT_GENRE
  emailAddress?: string
  handle?: string
  genre: Genre
  selectedGenres: Genre[]
}
type CreateAccountFollowArtist = {
  eventName: Name.CREATE_ACCOUNT_FOLLOW_ARTIST
  emailAddress?: string
  handle?: string
  artistID: number
  artistName: string
}

type CreateAccountPreviewArtist = {
  eventName: Name.CREATE_ACCOUNT_ARTIST_PREVIEWED
  artistID: number
  artistName: string
}

type CreateAccountCompleteFollow = {
  eventName: Name.CREATE_ACCOUNT_COMPLETE_FOLLOW
  emailAddress: string
  handle: string
  users: string
  count: number
}
type CreateAccountCompleteCreating = {
  eventName: Name.CREATE_ACCOUNT_COMPLETE_CREATING
  emailAddress: string
  handle: string
}
type CreateAccountWelcomeModal = {
  eventName: Name.CREATE_ACCOUNT_WELCOME_MODAL
  emailAddress: string
  handle: string
}
type CreateAccountWelcomeModalUploadTrack = {
  eventName: Name.CREATE_ACCOUNT_WELCOME_MODAL_UPLOAD_TRACK
  emailAddress: string
  handle: string
}
type CreateAccountOpenFinish = {
  eventName: Name.CREATE_ACCOUNT_FINISH
  emailAddress: string
  handle: string
}

// Sign In
type SignInStart = {
  eventName: Name.SIGN_IN_START
}
type SignInFinish = {
  eventName: Name.SIGN_IN_FINISH
  status: 'success' | 'invalid credentials'
}

type SignInWithIncompleteAccount = {
  eventName: Name.SIGN_IN_WITH_INCOMPLETE_ACCOUNT
  handle: string
}

// Settings
type SettingsChangeTheme = {
  eventName: Name.SETTINGS_CHANGE_THEME
  mode: 'dark' | 'light' | 'matrix' | 'auto'
}
type SettingsStartTwitterOauth = {
  eventName: Name.SETTINGS_START_TWITTER_OAUTH
  handle?: string
}
type SettingsCompleteTwitterOauth = {
  eventName: Name.SETTINGS_COMPLETE_TWITTER_OAUTH
  handle?: string
  screen_name: string
  is_verified: boolean
}
type SettingsStartInstagramOauth = {
  eventName: Name.SETTINGS_START_INSTAGRAM_OAUTH
  handle?: string
}
type SettingsCompleteInstagramOauth = {
  eventName: Name.SETTINGS_COMPLETE_INSTAGRAM_OAUTH
  handle?: string
  username: string
  is_verified: boolean
}
type SettingsStartTikTokOauth = {
  eventName: Name.SETTINGS_START_TIKTOK_OAUTH
  handle?: string
}
type SettingsCompleteTikTokOauth = {
  eventName: Name.SETTINGS_COMPLETE_TIKTOK_OAUTH
  handle?: string
  username: string
  is_verified: boolean
}
type SettingsResetAccountRecovery = {
  eventName: Name.SETTINGS_RESEND_ACCOUNT_RECOVERY
}
type SettingsStartChangePassword = {
  eventName: Name.SETTINGS_START_CHANGE_PASSWORD
}
type SettingsCompleteChangePassword = {
  eventName: Name.SETTINGS_COMPLETE_CHANGE_PASSWORD
  status: 'success' | 'failure'
}
type SettingsLogOut = {
  eventName: Name.SETTINGS_LOG_OUT
}

// TikTok
type TikTokStartOAuth = {
  eventName: Name.TIKTOK_START_OAUTH
}

type TikTokCompleteOAuth = {
  eventName: Name.TIKTOK_COMPLETE_OAUTH
}

type TikTokOAuthError = {
  eventName: Name.TIKTOK_OAUTH_ERROR
  error: string
}

// Error
type ErrorPage = {
  eventName: Name.ERROR_PAGE
  error: string
  name: string
  route?: string
}
type NotFoundPage = {
  eventName: Name.NOT_FOUND_PAGE
}

// Visualizer
type VisualizerOpen = {
  eventName: Name.VISUALIZER_OPEN
}
type VisualizerClose = {
  eventName: Name.VISUALIZER_CLOSE
}

type AccountHealthMeterFull = {
  eventName: Name.ACCOUNT_HEALTH_METER_FULL
}
type AccountHealthUploadCoverPhoto = {
  eventName: Name.ACCOUNT_HEALTH_UPLOAD_COVER_PHOTO
  source: 'original' | 'unsplash' | 'url'
}
type AccountHealthUploadProfilePhoto = {
  eventName: Name.ACCOUNT_HEALTH_UPLOAD_PROFILE_PICTURE
  source: 'original' | 'unsplash' | 'url'
}
type AccountHealthDownloadDesktop = {
  eventName: Name.ACCOUNT_HEALTH_DOWNLOAD_DESKTOP
  source: 'banner' | 'settings'
}

type AccountHealthCTABanner = {
  eventName: Name.ACCOUNT_HEALTH_CLICK_APP_CTA_BANNER
}

// Social
export enum ShareSource {
  TILE = 'tile',
  PAGE = 'page',
  NOW_PLAYING = 'now playing',
  OVERFLOW = 'overflow',
  LEFT_NAV = 'left-nav',
  UPLOAD = 'upload'
}
export enum RepostSource {
  TILE = 'tile',
  PLAYBAR = 'playbar',
  NOW_PLAYING = 'now playing',
  TRACK_PAGE = 'page',
  COLLECTION_PAGE = 'collection page',
  HISTORY_PAGE = 'history page',
  LIBRARY_PAGE = 'library page',
  OVERFLOW = 'overflow',
  TRACK_LIST = 'track list'
}
export enum FavoriteSource {
  TILE = 'tile',
  PLAYBAR = 'playbar',
  NOW_PLAYING = 'now playing',
  TRACK_PAGE = 'page',
  COLLECTION_PAGE = 'collection page',
  HISTORY_PAGE = 'history page',
  LIBRARY_PAGE = 'library page',
  OVERFLOW = 'overflow',
  TRACK_LIST = 'track list',
  SIGN_UP = 'sign up',
  OFFLINE_DOWNLOAD = 'offline download',
  // Favorite triggered by some implicit action, e.g.
  // you had a smart collection and it was favorited so it
  // shows in your left-nav.
  IMPLICIT = 'implicit',
  NAVIGATOR = 'navigator'
}
export enum FollowSource {
  INBOX_UNAVAILABLE_MODAL = 'inbox unavailable modal',
  PROFILE_PAGE = 'profile page',
  TRACK_PAGE = 'track page',
  COLLECTION_PAGE = 'collection page',
  HOVER_TILE = 'hover tile',
  OVERFLOW = 'overflow',
  USER_LIST = 'user list',
  ARTIST_RECOMMENDATIONS_POPUP = 'artist recommendations popup',
  EMPTY_FEED = 'empty feed',
  HOW_TO_UNLOCK_TRACK_PAGE = 'how to unlock track page',
  HOW_TO_UNLOCK_MODAL = 'how to unlock modal',
  SIGN_UP = 'sign up'
}

type Share = {
  eventName: Name.SHARE
  kind: 'profile' | 'album' | 'playlist' | 'track'
  source: ShareSource
  id: string
  url: string
}

export type ShareToTwitter = {
  eventName: Name.SHARE_TO_TWITTER
  kind: 'profile' | 'album' | 'playlist' | 'track'
  source: ShareSource
  id: number
  url: string
}

type Repost = {
  eventName: Name.REPOST
  kind: PlayableType
  source: RepostSource
  id: string
}
type UndoRepost = {
  eventName: Name.UNDO_REPOST
  kind: PlayableType
  source: RepostSource
  id: string
}
type Favorite = {
  eventName: Name.FAVORITE
  kind: PlayableType
  source: FavoriteSource
  id: string
}
type Unfavorite = {
  eventName: Name.UNFAVORITE
  kind: PlayableType
  source: FavoriteSource
  id: string
}
type ArtistPickSelectTrack = {
  eventName: Name.ARTIST_PICK_SELECT_TRACK
  id: string
}
type Follow = {
  eventName: Name.FOLLOW
  id: string
  source: FollowSource
}
type Unfollow = {
  eventName: Name.UNFOLLOW
  id: string
  source: FollowSource
}
type TweetFirstUpload = {
  eventName: Name.TWEET_FIRST_UPLOAD
  handle: string
}

// Playlist
export enum CreatePlaylistSource {
  NAV = 'nav',
  CREATE_PAGE = 'create page',
  FROM_TRACK = 'from track',
  LIBRARY_PAGE = 'library page',
  PROFILE_PAGE = 'profile page'
}

type PlaylistAdd = {
  eventName: Name.PLAYLIST_ADD
  trackId: string
  playlistId: string
}
type PlaylistOpenCreate = {
  eventName: Name.PLAYLIST_OPEN_CREATE
  source: CreatePlaylistSource
}
type PlaylistStartCreate = {
  eventName: Name.PLAYLIST_START_CREATE
  source: CreatePlaylistSource
  artworkSource: 'unsplash' | 'original'
}
type PlaylistCompleteCreate = {
  eventName: Name.PLAYLIST_COMPLETE_CREATE
  source: CreatePlaylistSource
  status: 'success' | 'failure'
}
type PlaylistMakePublic = {
  eventName: Name.PLAYLIST_MAKE_PUBLIC
  id: string
}

type PlaylistOpenEditFromLibrary = {
  eventName: Name.PLAYLIST_OPEN_EDIT_FROM_LIBRARY
}

type Delete = {
  eventName: Name.DELETE
  kind: PlayableType
  id: string
}

// Folder

type FolderOpenCreate = {
  eventName: Name.FOLDER_OPEN_CREATE
}

type FolderSubmitCreate = {
  eventName: Name.FOLDER_SUBMIT_CREATE
}

type FolderCancelCreate = {
  eventName: Name.FOLDER_CANCEL_CREATE
}

type FolderOpenEdit = {
  eventName: Name.FOLDER_OPEN_EDIT
}

type FolderSubmitEdit = {
  eventName: Name.FOLDER_SUBMIT_EDIT
}

type FolderDelete = {
  eventName: Name.FOLDER_DELETE
}

type FolderCancelEdit = {
  eventName: Name.FOLDER_CANCEL_EDIT
}

// Embed
type EmbedOpen = {
  eventName: Name.EMBED_OPEN
  kind: PlayableType
  id: string
}
type EmbedCopy = {
  eventName: Name.EMBED_COPY
  kind: PlayableType
  id: string
  size: 'card' | 'compact' | 'tiny'
}

// Track Upload
type TrackUploadOpen = {
  eventName: Name.TRACK_UPLOAD_OPEN
  source: 'nav' | 'profile' | 'signup' | 'library' | 'dashboard'
}
type TrackUploadStartUploading = {
  eventName: Name.TRACK_UPLOAD_START_UPLOADING
  count: number
  kind: 'single_track' | 'multi_track' | 'album' | 'playlist'
}
type TrackUploadTrackUploading = {
  eventName: Name.TRACK_UPLOAD_TRACK_UPLOADING
  artworkSource: 'unsplash' | 'original'
  downloadable: 'yes' | 'no' | 'follow'
  trackId: number
  size: number
  fileType: string
  name: string
  genre: string
  mood?: string
}
type TrackUploadCompleteUpload = {
  eventName: Name.TRACK_UPLOAD_COMPLETE_UPLOAD
  count: number
  kind: 'single_track' | 'multi_track' | 'album' | 'playlist'
}

type TrackUploadSuccess = {
  eventName: Name.TRACK_UPLOAD_SUCCESS
  kind: 'single_track' | 'multi_track' | 'album' | 'playlist'
}

type TrackUploadFailure = {
  eventName: Name.TRACK_UPLOAD_FAILURE
  kind: 'single_track' | 'multi_track' | 'album' | 'playlist'
  error?: string
}

type TrackUploadRejected = {
  eventName: Name.TRACK_UPLOAD_REJECTED
  kind: 'single_track' | 'multi_track' | 'album' | 'playlist'
  error?: string
}

type TrackUploadCopyLink = {
  eventName: Name.TRACK_UPLOAD_COPY_LINK
  uploadType: string
  url: string
}
type TrackUploadShareWithFans = {
  eventName: Name.TRACK_UPLOAD_SHARE_WITH_FANS
  uploadType: string
  text: string
}
type TrackUploadViewTrackPage = {
  eventName: Name.TRACK_UPLOAD_VIEW_TRACK_PAGE
  uploadType: string
}

type TrackUploadFollowGated = {
  eventName: Name.TRACK_UPLOAD_FOLLOW_GATED
  kind: 'tracks'
  downloadable: boolean
  lossless: boolean
}

type TrackUploadFollowGatedDownload = {
  eventName: Name.TRACK_UPLOAD_FOLLOW_GATED_DOWNLOAD
  kind: 'tracks'
  downloadable: boolean
  lossless: boolean
}

// Track Downloads
type TrackDownloadClickedDownloadAll = {
  eventName: Name.TRACK_DOWNLOAD_CLICKED_DOWNLOAD_ALL
  parentTrackId: ID
  stemTrackIds: ID[]
  device: 'web' | 'native'
}

type TrackDownloadSuccessfulDownloadAll = {
  eventName: Name.TRACK_DOWNLOAD_SUCCESSFUL_DOWNLOAD_ALL
  device?: 'web' | 'native'
}

type TrackDownloadFailedDownloadAll = {
  eventName: Name.TRACK_DOWNLOAD_FAILED_DOWNLOAD_ALL
  device?: 'web' | 'native'
}

type TrackDownloadClickedDownloadSingle = {
  eventName: Name.TRACK_DOWNLOAD_CLICKED_DOWNLOAD_SINGLE
  trackId: ID
  device: 'web' | 'native'
}

type TrackDownloadSuccessfulDownloadSingle = {
  eventName: Name.TRACK_DOWNLOAD_SUCCESSFUL_DOWNLOAD_SINGLE
  device: 'web' | 'native'
}

type TrackDownloadFailedDownloadSingle = {
  eventName: Name.TRACK_DOWNLOAD_FAILED_DOWNLOAD_SINGLE
  device: 'web' | 'native'
}

// Track Edits
type TrackEditAccessChanged = {
  eventName: Name.TRACK_EDIT_ACCESS_CHANGED
  id: number
  from: TrackAccessType
  to: TrackAccessType
}

type TrackEditBpmChanged = {
  eventName: Name.TRACK_EDIT_BPM_CHANGED
  id: number
  from: number
  to: number
}

type TrackEditMusicalKeyChanged = {
  eventName: Name.TRACK_EDIT_MUSICAL_KEY_CHANGED
  id: number
  from: string
  to: string
}

// Collection Edits
type CollectionEditAccessChanged = {
  eventName: Name.COLLECTION_EDIT_ACCESS_CHANGED
  id: number
  from: Nullable<AccessConditions>
  to: Nullable<AccessConditions>
}

type CollectionEdit = {
  eventName: Name.COLLECTION_EDIT
  id: number
  from: TrackAccessType
  to: TrackAccessType
}

type FollowGatedTrackUnlocked = {
  eventName: Name.FOLLOW_GATED_TRACK_UNLOCKED
  trackId: number
}

type FollowGatedDownloadTrackUnlocked = {
  eventName: Name.FOLLOW_GATED_DOWNLOAD_TRACK_UNLOCKED
  trackId: number
}

// Trending
type TrendingChangeView = {
  eventName: Name.TRENDING_CHANGE_VIEW
  timeframe: TimeRange
  genre: string
}

// Feed
type FeedChangeView = {
  eventName: Name.FEED_CHANGE_VIEW
  view: FeedFilter
}

// Notifications
type NotificationsOpen = {
  eventName: Name.NOTIFICATIONS_OPEN
  source: 'button' | 'push notifications'
}
type NotificationsOpenPushNotification = {
  eventName: Name.NOTIFICATIONS_OPEN_PUSH_NOTIFICATION
  title?: string
  body?: string
  notificationCampaignId?: string
}
type NotificationsClickTile = {
  eventName: Name.NOTIFICATIONS_CLICK_TILE
  kind: string
  link_to: string
  /** Internal campaign id when kind is announcement */
  notificationCampaignId?: string
}
type NotificationsClickMilestone = {
  eventName: Name.NOTIFICATIONS_CLICK_MILESTONE_TWITTER_SHARE
  milestone: string
}
type NotificationsClickRemixCreate = {
  eventName: Name.NOTIFICATIONS_CLICK_REMIX_CREATE_TWITTER_SHARE
  text: string
}
type NotificationsClickRemixCosign = {
  eventName: Name.NOTIFICATIONS_CLICK_REMIX_COSIGN_TWITTER_SHARE
  text: string
}
type NotificationsClickDethroned = {
  eventName: Name.NOTIFICATIONS_CLICK_DETHRONED_TWITTER_SHARE
  text: string
}
type NotificationsClickAddTrackToPlaylist = {
  eventName: Name.NOTIFICATIONS_CLICK_ADD_TRACK_TO_PLAYLIST_TWITTER_SHARE
  text: string
}
type NotificationsClickTrendingTrack = {
  eventName: Name.NOTIFICATIONS_CLICK_TRENDING_TRACK_TWITTER_SHARE
  text: string
}
type NotificationsClickTrendingUnderground = {
  eventName: Name.NOTIFICATIONS_CLICK_TRENDING_UNDERGROUND_TWITTER_SHARE
  text: string
}
type NotificationsClickTastemaker = {
  eventName: Name.NOTIFICATIONS_CLICK_TASTEMAKER_TWITTER_SHARE
  text: string
}
type NotificationsToggleSettings = {
  eventName: Name.NOTIFICATIONS_TOGGLE_SETTINGS
  settings: string
  enabled: boolean
}

// Profile
type ProfilePageTabClick = {
  eventName: Name.PROFILE_PAGE_TAB_CLICK
  tab: 'tracks' | 'albums' | 'reposts' | 'playlists'
}
type ProfilePageSort = {
  eventName: Name.PROFILE_PAGE_SORT
  sort: 'recent' | 'popular'
}
type ProfilePageClickInstagram = {
  eventName: Name.PROFILE_PAGE_CLICK_INSTAGRAM
  handle: string
  instagramHandle: string
}
type ProfilePageClickTwitter = {
  eventName: Name.PROFILE_PAGE_CLICK_TWITTER
  handle: string
  twitterHandle: string
}
type ProfilePageClickTikTok = {
  eventName: Name.PROFILE_PAGE_CLICK_TIKTOK
  handle: string
  tikTokHandle: string
}
type ProfilePageClickWebsite = {
  eventName: Name.PROFILE_PAGE_CLICK_WEBSITE
  handle: string
  website: string
}
type ProfilePageShownArtistRecommendations = {
  eventName: Name.PROFILE_PAGE_SHOWN_ARTIST_RECOMMENDATIONS
  userId: number
}

// Track Page
type TrackPageDownload = {
  eventName: Name.TRACK_PAGE_DOWNLOAD
  id: ID
  category?: string
  parent_track_id?: ID
}
type TrackPagePlayMore = {
  eventName: Name.TRACK_PAGE_PLAY_MORE
  id: ID
}

// Playback
export enum PlaybackSource {
  PLAYBAR = 'playbar',
  NOW_PLAYING = 'now playing',
  PLAYLIST_PAGE = 'playlist page',
  TRACK_PAGE = 'track page',
  TRACK_TILE = 'track tile',
  TRACK_TILE_LINEUP = 'track tile lineup',
  PLAYLIST_TRACK = 'playlist page track list',
  PLAYLIST_TILE_TRACK = 'playlist track tile',
  PLAYLIST_TILE_TRACK_LINEUP = 'playlist track tile lineup',
  HISTORY_PAGE = 'history page',
  LIBRARY_PAGE = 'library page',
  PASSIVE = 'passive',
  EMBED_PLAYER = 'embed player',
  CHAT_TRACK = 'chat_track',
  CHAT_PLAYLIST_TRACK = 'chat_playlist_track',
  SEARCH_PAGE = 'search page',
  EXCLUSIVE_TRACKS_PAGE = 'exclusive tracks page'
}

type PlaybackPlay = {
  eventName: Name.PLAYBACK_PLAY
  id?: string
  isPreview?: boolean
  source: PlaybackSource
  collectionId?: string
}
type PlaybackPause = {
  eventName: Name.PLAYBACK_PAUSE
  id?: string
  source: PlaybackSource
}

type PlaylistPlay = {
  eventName: Name.PLAYLIST_PLAY
  id: string
  source: PlaybackSource
  isAlbum?: boolean
  trackCount?: number
  isPreview?: boolean
}

type BufferingTime = {
  eventName: Name.BUFFERING_TIME
  duration: number
}

// Play Queue
type PlayQueueOpen = {
  eventName: Name.PLAY_QUEUE_OPEN
  source: 'queue'
  queueLength?: number
}
type PlayQueueClose = {
  eventName: Name.PLAY_QUEUE_CLOSE
  source: 'queue'
}
type PlayQueueAddTrack = {
  eventName: Name.PLAY_QUEUE_ADD_TRACK
  source: 'queue'
  trackId: string
  from?: 'overflow menu' | 'queue'
}
type PlayQueueRemoveTrack = {
  eventName: Name.PLAY_QUEUE_REMOVE_TRACK
  source: 'queue'
  trackId: string
  position: number
}
type PlayQueueReorderTrack = {
  eventName: Name.PLAY_QUEUE_REORDER_TRACK
  source: 'queue'
  trackId: string
  fromPosition: number
  toPosition: number
}
type PlayQueuePlayTrack = {
  eventName: Name.PLAY_QUEUE_PLAY_TRACK
  source: 'queue'
  trackId: string
  position: number
}
type PlayQueueClear = {
  eventName: Name.PLAY_QUEUE_CLEAR
  source: 'queue'
  queueLength: number
}

// Linking
type LinkClicking = {
  eventName: Name.LINK_CLICKING
  url: string
  source: 'profile page' | 'track page' | 'collection page' | 'left nav'
}
type TagClicking = {
  eventName: Name.TAG_CLICKING
  tag: string
  source: 'profile page' | 'track page' | 'collection page'
}

export enum ModalSource {
  TrackTile = 'track tile',
  CollectionTile = 'collection tile',
  TrackDetails = 'track details',
  CollectionDetails = 'collection details',
  NowPlaying = 'now playing',
  PlayBar = 'play bar',
  DirectMessageTrackTile = 'track tile - direct message',
  DirectMessageCollectionTile = 'collection tile - direct message',
  LineUpTrackTile = 'track tile - lineup',
  LineUpCollectionTile = 'collection tile - lineup',
  TrackListItem = 'track list item',
  OverflowMenu = 'overflow menu',
  TrackLibrary = 'track library',
  Comment = 'comment',
  // Should never be used, but helps with type-checking
  Unknown = 'unknown'
}

// Modals
type ModalOpened = {
  eventName: Name.MODAL_OPENED
  source: ModalSource
  name: string
} & Record<string, any> // For passing state values

type ModalClosed = {
  eventName: Name.MODAL_CLOSED
  name: string
}

export type SearchSource =
  | 'autocomplete'
  | 'search results page'
  | 'more results page'

// Search
type SearchTerm = {
  eventName: Name.SEARCH_SEARCH
  term: string
  source: SearchSource
}

type SearchTag = {
  eventName: Name.SEARCH_TAG_SEARCH
  tag: string
  source: SearchSource
}

type SearchMoreResults = {
  eventName: Name.SEARCH_MORE_RESULTS
  term: string
  source: SearchSource
}

type SearchResultSelect = {
  eventName: Name.SEARCH_RESULT_SELECT
  term: string
  source: SearchSource
  id: ID
  kind: 'track' | 'profile' | 'playlist' | 'album'
}

// Explore
export type ExploreSectionName =
  | 'Recommended Tracks'
  | 'Recently Played'
  | 'Quick Search'
  | 'Featured Playlists'
  | 'Featured Remix Contests'
  | 'Underground Trending Tracks'
  | 'Artist Spotlight'
  | 'Label Spotlight'
  | 'Active Discussions'
  | 'Downloads Available'
  | 'Mood Grid'
  | 'Most Shared'
  | 'Top Albums This Month'
  | 'New Album Releases'
  | 'Feeling Lucky'
  | 'Recent Searches'

type ExploreSectionView = {
  eventName: Name.EXPLORE_SECTION_VIEW
  section: ExploreSectionName
  source: 'web' | 'mobile'
}

type ExploreSectionClick = {
  eventName: Name.EXPLORE_SECTION_CLICK
  section: ExploreSectionName
  source: 'web' | 'mobile'
  id?: ID
  kind?: 'track' | 'profile' | 'playlist' | 'album' | 'mood' | 'preset'
  link?: string
}

type ListenGated = {
  eventName: Name.LISTEN_GATED
  trackId: string
}

type OnFirstPage = {
  eventName: Name.ON_FIRST_PAGE
}

type NotOnFirstPage = {
  eventName: Name.NOT_ON_FIRST_PAGE
}

type BrowserNotificationSetting = {
  eventName: Name.BROWSER_NOTIFICATION_SETTINGS
  provider: 'safari' | 'gcm'
  enabled: boolean
}

type WebVitals = {
  eventName: Name.WEB_VITALS
  metric: string
  value: number
  route: string
}
type Performance = {
  eventName: Name.PERFORMANCE
  metric: string
  value: number
}

type StemCompleteUpload = {
  eventName: Name.STEM_COMPLETE_UPLOAD
  id: number
  parent_track_id: number
  category: string
}

type StemDelete = {
  eventName: Name.STEM_DELETE
  id: number
  parent_track_id: number
}

type RemixNewRemix = {
  eventName: Name.REMIX_NEW_REMIX
  id: number
  handle: string
  title: string
  parent_track_id: number
  parent_track_title: string
  parent_track_user_handle: string
}

type RemixCosign = {
  eventName: Name.REMIX_COSIGN
  id: number
  handle: string
  action: 'reposted' | 'favorited'
  original_track_id: number
  original_track_title: string
}

type RemixCosignIndicator = {
  eventName: Name.REMIX_COSIGN_INDICATOR
  id: number
  handle: string
  action: 'reposted' | 'favorited'
  original_track_id: number
  original_track_title: string
}

type RemixHide = {
  eventName: Name.REMIX_HIDE
  id: number
  handle: string
}

type PlaylistLibraryReorder = {
  eventName: Name.PLAYLIST_LIBRARY_REORDER
  // Whether or not the reorder contains newly created temp playlists
  containsTemporaryPlaylists: boolean
  kind: PlaylistLibraryKind
}

type PlaylistLibraryClicked = {
  eventName: Name.PLAYLIST_LIBRARY_CLICKED
  playlistId: ID
  hasUpdate: boolean
}

type PlaylistLibraryMovePlaylistIntoFolder = {
  eventName: Name.PLAYLIST_LIBRARY_MOVE_PLAYLIST_INTO_FOLDER
}

type PlaylistLibraryAddPlaylistToFolder = {
  eventName: Name.PLAYLIST_LIBRARY_ADD_PLAYLIST_TO_FOLDER
}

type PlaylistLibraryMovePlaylistOutOfFolder = {
  eventName: Name.PLAYLIST_LIBRARY_MOVE_PLAYLIST_OUT_OF_FOLDER
}

type PlaylistLibraryExpandFolder = {
  eventName: Name.PLAYLIST_LIBRARY_EXPAND_FOLDER
}

type PlaylistLibraryCollapseFolder = {
  eventName: Name.PLAYLIST_LIBRARY_COLLAPSE_FOLDER
}

type DeactivateAccountPageView = {
  eventName: Name.DEACTIVATE_ACCOUNT_PAGE_VIEW
}
type DeactivateAccountRequest = {
  eventName: Name.DEACTIVATE_ACCOUNT_REQUEST
}
type DeactivateAccountSuccess = {
  eventName: Name.DEACTIVATE_ACCOUNT_SUCCESS
}
type DeactivateAccountFailure = {
  eventName: Name.DEACTIVATE_ACCOUNT_FAILURE
}

type CreateUserBankRequest = {
  eventName: Name.CREATE_USER_BANK_REQUEST
  userId: ID
}

type CreateUserBankSuccess = {
  eventName: Name.CREATE_USER_BANK_SUCCESS
  mint: string
  recipientEthAddress: string
}

type CreateUserBankFailure = {
  eventName: Name.CREATE_USER_BANK_FAILURE
  mint: string
  recipientEthAddress: string
  errorCode: string
  errorMessage: string
}

type SocialProofOpen = {
  eventName: Name.SOCIAL_PROOF_OPEN
  kind: 'instagram' | 'twitter' | 'tiktok'
  handle?: string
}

type SocialProofSuccess = {
  eventName: Name.SOCIAL_PROOF_SUCCESS
  kind: 'instagram' | 'twitter' | 'tiktok'
  handle?: string
  screenName: string
}

type SocialProofError = {
  eventName: Name.SOCIAL_PROOF_ERROR
  kind: 'instagram' | 'twitter' | 'tiktok'
  handle?: string
  error: string
}

type AudiusOauthStart = {
  eventName: Name.AUDIUS_OAUTH_START
  redirectUriParam: string | string[]
  originParam: string | string[] | undefined | null
  appId: string | string[] // App name or API Key
  responseMode: string | string[] | undefined | null
  scope: string | string[]
}

type AudiusOauthSubmit = {
  eventName: Name.AUDIUS_OAUTH_SUBMIT
  appId: string | string[]
  scope: string | string[]
  alreadySignedIn: boolean
}

type AudiusOauthComplete = {
  eventName: Name.AUDIUS_OAUTH_COMPLETE
  appId: string | string[]
  scope: string | string[]
  alreadyAuthorized?: boolean
}

type AudiusOauthError = {
  eventName: Name.AUDIUS_OAUTH_ERROR
  appId: string | string[]
  scope: string | string[]
  isUserError: boolean
  error: string
}

type DeveloperAppCreateSubmit = {
  eventName: Name.DEVELOPER_APP_CREATE_SUBMIT
  name?: string
  description?: string
}

type DeveloperAppCreateSuccess = {
  eventName: Name.DEVELOPER_APP_CREATE_SUCCESS
  name: string
  apiKey: string
}

type DeveloperAppCreateError = {
  eventName: Name.DEVELOPER_APP_CREATE_ERROR
  error?: string
}

type DeveloperAppEditSubmit = {
  eventName: Name.DEVELOPER_APP_EDIT_SUBMIT
  name?: string
  description?: string
}

type DeveloperAppEditSuccess = {
  eventName: Name.DEVELOPER_APP_EDIT_SUCCESS
  name: string
  apiKey: string
}

type DeveloperAppEditError = {
  eventName: Name.DEVELOPER_APP_EDIT_ERROR
  error?: string
}

type DeveloperAppDeleteSuccess = {
  eventName: Name.DEVELOPER_APP_DELETE_SUCCESS
  name?: string
  apiKey?: string
}

type DeveloperAppDeleteError = {
  eventName: Name.DEVELOPER_APP_DELETE_ERROR
  name?: string
  apiKey?: string
  error?: string
}

type AuthorizedAppRemoveSuccess = {
  eventName: Name.AUTHORIZED_APP_REMOVE_SUCCESS
  name?: string
  apiKey?: string
}

type AuthorizedAppRemoveError = {
  eventName: Name.AUTHORIZED_APP_REMOVE_ERROR
  name?: string
  apiKey?: string
  error?: string
}

type BannerTOSClicked = {
  eventName: Name.BANNER_TOS_CLICKED
}

type RateCtaDisplayed = {
  eventName: Name.RATE_CTA_DISPLAYED
}

type RateCtaResponseNo = {
  eventName: Name.RATE_CTA_RESPONSE_NO
}

type RateCtaResponseYes = {
  eventName: Name.RATE_CTA_RESPONSE_YES
}

type ChatBlastCTAClicked = {
  eventName: Name.CHAT_BLAST_CTA_CLICKED
}

type CreateChatSuccess = {
  eventName: Name.CREATE_CHAT_SUCCESS
}

type CreateChatFailure = {
  eventName: Name.CREATE_CHAT_FAILURE
}

type CreateChatBlastSuccess = {
  eventName: Name.CREATE_CHAT_BLAST_SUCCESS
  audience: string
  audienceContentType?: string
  audienceContentId?: ID
  sentBy: ID
}

type CreateChatBlastFailure = {
  eventName: Name.CREATE_CHAT_BLAST_FAILURE
  audience: string
  audienceContentType?: string
  audienceContentId?: ID
  sentBy?: ID
}

type ChatBlastMessageSent = {
  eventName: Name.CHAT_BLAST_MESSAGE_SENT
  audience: string
  audienceContentType?: string
  audienceContentId?: ID
}

type SendMessageSuccess = {
  eventName: Name.SEND_MESSAGE_SUCCESS
}

type SendMessageFailure = {
  eventName: Name.SEND_MESSAGE_FAILURE
}

type DeleteChatSuccess = {
  eventName: Name.DELETE_CHAT_SUCCESS
}

type DeleteChatFailure = {
  eventName: Name.DELETE_CHAT_FAILURE
}

type BlockUserSuccess = {
  eventName: Name.BLOCK_USER_SUCCESS
  blockedUserId: ID
}

type BlockUserFailure = {
  eventName: Name.BLOCK_USER_FAILURE
  blockedUserId: ID
}

type ChangeInboxSettingsSuccess = {
  eventName: Name.CHANGE_INBOX_SETTINGS_SUCCESS
  permission?: ChatPermission
  permitList?: ChatPermission[]
}

type ChangeInboxSettingsFailure = {
  eventName: Name.CHANGE_INBOX_SETTINGS_FAILURE
  permission?: ChatPermission
  permitList?: ChatPermission[]
}

type SendMessageReactionSuccess = {
  eventName: Name.SEND_MESSAGE_REACTION_SUCCESS
  reaction: string | null
}

type SendMessageReactionFailure = {
  eventName: Name.SEND_MESSAGE_REACTION_FAILURE
  reaction: string | null
}

type MessageUnfurlTrack = {
  eventName: Name.MESSAGE_UNFURL_TRACK
}

type MessageUnfurlPlaylist = {
  eventName: Name.MESSAGE_UNFURL_PLAYLIST
}

type ChatReportUser = {
  eventName: Name.CHAT_REPORT_USER
  reportedUserId: ID
}

type ChatEntryPoint = {
  eventName: Name.CHAT_ENTRY_POINT
  source: 'banner' | 'navmenu' | 'share' | 'profile'
}

type ChatWebsocketError = {
  eventName: Name.CHAT_WEBSOCKET_ERROR
  code?: string
}

// Manager Mode
type ManagerModeSwitchAccount = {
  eventName: Name.MANAGER_MODE_SWITCH_ACCOUNT
  managedUserId: ID
}

type ManagerModeInviteManager = {
  eventName: Name.MANAGER_MODE_INVITE_MANAGER
  managerId: ID
}

type ManagerModeAcceptInvite = {
  eventName: Name.MANAGER_MODE_ACCEPT_INVITE
  managedUserId: ID
}

type ManagerModeCancelInvite = {
  eventName: Name.MANAGER_MODE_CANCEL_INVITE
  managerId: ID
}

type ManagerModeRejectInvite = {
  eventName: Name.MANAGER_MODE_REJECT_INVITE
  managedUserId: ID
}

type ManagerModeRemoveManager = {
  eventName: Name.MANAGER_MODE_REMOVE_MANAGER
  managerId: ID
}

export type CommentsCreateComment = {
  eventName: Name.COMMENTS_CREATE_COMMENT
  parentCommentId?: ID
  timestamp?: number
  trackId: ID
}

export type CommentsUpdateComment = {
  eventName: Name.COMMENTS_UPDATE_COMMENT
  commentId: ID
}

export type CommentsDeleteComment = {
  eventName: Name.COMMENTS_DELETE_COMMENT
  commentId: ID
}

export type CommentsFocusCommentInput = {
  eventName: Name.COMMENTS_FOCUS_COMMENT_INPUT
  trackId: ID
  source: 'comment_input' | 'comment_preview'
}

export type CommentsClickReplyButton = {
  eventName: Name.COMMENTS_CLICK_REPLY_BUTTON
  commentId: ID
}

export type CommentsLikeComment = {
  eventName: Name.COMMENTS_LIKE_COMMENT
  commentId: ID
}

export type CommentsUnlikeComment = {
  eventName: Name.COMMENTS_UNLIKE_COMMENT
  commentId: ID
}

export type CommentsAddMention = {
  eventName: Name.COMMENTS_ADD_MENTION
  userId: ID
}

export type CommentsClickMention = {
  eventName: Name.COMMENTS_CLICK_MENTION
  commentId: ID
  userId: ID
}

export type CommentsAddTimestamp = {
  eventName: Name.COMMENTS_ADD_TIMESTAMP
  timestamp: number
}

export type CommentsClickTimestamp = {
  eventName: Name.COMMENTS_CLICK_TIMESTAMP
  commentId: ID
  timestamp: number
}

export type CommentsAddLink = {
  eventName: Name.COMMENTS_ADD_LINK
  entityId?: ID
  kind: 'track' | 'collection' | 'user' | 'other'
}

export type CommentsClickLink = {
  eventName: Name.COMMENTS_CLICK_LINK
  commentId: ID
  kind: 'track' | 'collection' | 'user' | 'other'
  entityId?: ID
}

export type CommentsNotificationOpen = {
  eventName: Name.COMMENTS_NOTIFICATION_OPEN
  commentId: ID
  notificationType: 'comment' | 'reaction' | 'thread' | 'mention'
}

export type CommentsReportComment = {
  eventName: Name.COMMENTS_REPORT_COMMENT
  commentId: ID
  commentOwnerId: ID
  isRemoved: boolean
}

export type CommentsMuteUser = {
  eventName: Name.COMMENTS_MUTE_USER
  userId: ID
}

export type CommentsUnmuteUser = {
  eventName: Name.COMMENTS_UNMUTE_USER
  userId: ID
}

export type CommentsPinComment = {
  eventName: Name.COMMENTS_PIN_COMMENT
  trackId: ID
  commentId: ID
}

export type CommentsUnpinComment = {
  eventName: Name.COMMENTS_UNPIN_COMMENT
  trackId: ID
  commentId: ID
}

export type CommentsLoadMoreComments = {
  eventName: Name.COMMENTS_LOAD_MORE_COMMENTS
  trackId: ID
  offset: number
}

export type CommentsLoadNewComments = {
  eventName: Name.COMMENTS_LOAD_NEW_COMMENTS
  trackId: ID
}

export type CommentsShowReplies = {
  eventName: Name.COMMENTS_SHOW_REPLIES
  commentId: ID
  trackId: ID
}

export type CommentsLoadMoreReplies = {
  eventName: Name.COMMENTS_LOAD_MORE_REPLIES
  commentId: ID
  trackId: ID
}

export type CommentsHideReplies = {
  eventName: Name.COMMENTS_HIDE_REPLIES
  commentId: ID
  trackId: ID
}

export type CommentsApplySort = {
  eventName: Name.COMMENTS_APPLY_SORT
  sortType: 'top' | 'newest' | 'timestamp'
}

export type CommentsClickCommentStat = {
  eventName: Name.COMMENTS_CLICK_COMMENT_STAT
  trackId: ID
  source: 'lineup' | 'track_page'
}

export type CommentsOpenCommentOverflowMenu = {
  eventName: Name.COMMENTS_OPEN_COMMENT_OVERFLOW_MENU
  commentId: ID
}

export type CommentsTurnOnNotificationsForComment = {
  eventName: Name.COMMENTS_TURN_ON_NOTIFICATIONS_FOR_COMMENT
  commentId: ID
}

export type CommentsTurnOffNotificationsForComment = {
  eventName: Name.COMMENTS_TURN_OFF_NOTIFICATIONS_FOR_COMMENT
  commentId: ID
}

export type CommentsOpenTrackOverflowMenu = {
  eventName: Name.COMMENTS_OPEN_TRACK_OVERFLOW_MENU
  trackId: ID
}

export type CommentsTurnOnNotificationsForTrack = {
  eventName: Name.COMMENTS_TURN_ON_NOTIFICATIONS_FOR_TRACK
  trackId: ID
}

export type CommentsTurnOffNotificationsForTrack = {
  eventName: Name.COMMENTS_TURN_OFF_NOTIFICATIONS_FOR_TRACK
  trackId: ID
}

export type CommentsDisableTrackComments = {
  eventName: Name.COMMENTS_DISABLE_TRACK_COMMENTS
  trackId: ID
}

type CommentsOpenCommentDrawer = {
  eventName: Name.COMMENTS_OPEN_COMMENT_DRAWER
  trackId: ID
}

type CommentsCloseCommentDrawer = {
  eventName: Name.COMMENTS_CLOSE_COMMENT_DRAWER
  trackId: ID
}

export type CommentsOpenAuthModal = {
  eventName: Name.COMMENTS_OPEN_AUTH_MODAL
  trackId: ID
}

export type CommentsOpenInstallAppModal = {
  eventName: Name.COMMENTS_OPEN_INSTALL_APP_MODAL
  trackId: ID
}

export type CommentsHistoryClick = {
  eventName: Name.COMMENTS_HISTORY_CLICK
  commentId: ID
  userId: ID
}

export type CommentsHistoryDrawerOpen = {
  eventName: Name.COMMENTS_HISTORY_DRAWER_OPEN
  userId: ID | undefined
}

export type RecentCommentsClick = {
  eventName: Name.RECENT_COMMENTS_CLICK
  commentId: ID
  userId: ID
}

export type TrackReplaceDownload = {
  eventName: Name.TRACK_REPLACE_DOWNLOAD
  trackId?: ID
}

export type TrackReplaceReplace = {
  eventName: Name.TRACK_REPLACE_REPLACE
  trackId?: ID
  source: 'upload' | 'edit'
}

export type TrackReplacePreview = {
  eventName: Name.TRACK_REPLACE_PREVIEW
  trackId?: ID
  source: 'upload' | 'edit'
}

export type RemixContestCreate = {
  eventName: Name.REMIX_CONTEST_CREATE
  trackId: ID
}

export type RemixContestUpdate = {
  eventName: Name.REMIX_CONTEST_UPDATE
  remixContestId: ID
  trackId: ID
}

export type RemixContestDelete = {
  eventName: Name.REMIX_CONTEST_DELETE
  remixContestId: ID
  trackId: ID
}

export type RemixContestPickWinnersOpen = {
  eventName: Name.REMIX_CONTEST_PICK_WINNERS_OPEN
  remixContestId: ID
  trackId: ID
}

export type RemixContestPickWinnersFinalize = {
  eventName: Name.REMIX_CONTEST_PICK_WINNERS_FINALIZE
  remixContestId: ID
  trackId: ID
}

export type AndroidAppRestartHeartbeat = {
  eventName: Name.ANDROID_APP_RESTART_HEARTBEAT
  timeSinceLastHeartbeat: number
}

export type AndroidAppRestartStale = {
  eventName: Name.ANDROID_APP_RESTART_STALE
  backgroundDuration: number
}

export type AndroidAppRestartForceQuit = {
  eventName: Name.ANDROID_APP_RESTART_FORCE_QUIT
}

export type BaseAnalyticsEvent = { type: typeof ANALYTICS_TRACK_EVENT }

export type AllTrackingEvents =
  | AppError
  | CreateAccountOpen
  | CreateAccountCompleteEmail
  | CreateAccountCompletePassword
  | CreateAccountStartTwitter
  | CreateAccountCompleteTwitter
  | CreateAccountStartInstagram
  | CreateAccountCompleteInstagram
  | CreateAccountStartTikTok
  | CreateAccountClosedTikTok
  | CreateAccountCompleteTikTok
  | CreateAccountCompleteProfile
  | CreateAccountCompleteFollow
  | CreateAccountCompleteCreating
  | CreateAccountOpenFinish
  | CreateAccountClosedTwitter
  | CreateAccountTikTokError
  | CreateAccountTwitterError
  | CreateAccountClosedInstagram
  | CreateAccountInstagramError
  | CreateAccountUploadProfilePhoto
  | CreateAccountUploadProfilePhotoError
  | CreateAccountUploadProfileCover
  | CreateAccountUploadProfileCoverError
  | CreateAccountSelectGenre
  | CreateAccountFollowArtist
  | CreateAccountPreviewArtist
  | CreateAccountWelcomeModal
  | CreateAccountWelcomeModalUploadTrack
  | SignInStart
  | SignInFinish
  | SignInWithIncompleteAccount
  | SettingsChangeTheme
  | SettingsStartTwitterOauth
  | SettingsCompleteTwitterOauth
  | SettingsStartInstagramOauth
  | SettingsCompleteInstagramOauth
  | SettingsStartTikTokOauth
  | SettingsCompleteTikTokOauth
  | SettingsResetAccountRecovery
  | SettingsStartChangePassword
  | SettingsCompleteChangePassword
  | SettingsLogOut
  | TikTokStartOAuth
  | TikTokCompleteOAuth
  | TikTokOAuthError
  | VisualizerOpen
  | VisualizerClose
  | AccountHealthMeterFull
  | AccountHealthUploadCoverPhoto
  | AccountHealthUploadProfilePhoto
  | AccountHealthDownloadDesktop
  | AccountHealthCTABanner
  | Share
  | ShareToTwitter
  | Repost
  | UndoRepost
  | Favorite
  | Unfavorite
  | ArtistPickSelectTrack
  | PlaylistAdd
  | PlaylistOpenCreate
  | PlaylistStartCreate
  | PlaylistCompleteCreate
  | PlaylistMakePublic
  | PlaylistOpenEditFromLibrary
  | Delete
  | EmbedOpen
  | EmbedCopy
  | TrackUploadOpen
  | TrackUploadStartUploading
  | TrackUploadTrackUploading
  | TrackUploadCompleteUpload
  | TrackUploadFollowGated
  | TrackUploadFollowGatedDownload
  | TrackDownloadClickedDownloadAll
  | TrackDownloadSuccessfulDownloadAll
  | TrackDownloadFailedDownloadAll
  | TrackDownloadClickedDownloadSingle
  | TrackDownloadSuccessfulDownloadSingle
  | TrackDownloadFailedDownloadSingle
  | TrackEditAccessChanged
  | TrackEditBpmChanged
  | TrackEditMusicalKeyChanged
  | CollectionEditAccessChanged
  | CollectionEdit
  | TrackUploadSuccess
  | TrackUploadFailure
  | TrackUploadRejected
  | TrackUploadCopyLink
  | TrackUploadShareWithFans
  | TrackUploadViewTrackPage
  | FollowGatedTrackUnlocked
  | FollowGatedDownloadTrackUnlocked
  | TrendingChangeView
  | FeedChangeView
  | NotificationsOpen
  | NotificationsOpenPushNotification
  | NotificationsClickTile
  | NotificationsClickMilestone
  | NotificationsClickRemixCreate
  | NotificationsClickRemixCosign
  | NotificationsClickDethroned
  | NotificationsClickAddTrackToPlaylist
  | NotificationsClickTrendingTrack
  | NotificationsClickTrendingUnderground
  | NotificationsClickTastemaker
  | NotificationsToggleSettings
  | ProfilePageTabClick
  | ProfilePageSort
  | ProfilePageClickInstagram
  | ProfilePageClickTwitter
  | ProfilePageClickTikTok
  | ProfilePageClickWebsite
  | ProfilePageShownArtistRecommendations
  | TrackPageDownload
  | TrackPagePlayMore
  | PlaybackPlay
  | PlaybackPause
  | PlaylistPlay
  | BufferingTime
  | PlayQueueOpen
  | PlayQueueClose
  | PlayQueueAddTrack
  | PlayQueueRemoveTrack
  | PlayQueueReorderTrack
  | PlayQueuePlayTrack
  | PlayQueueClear
  | Follow
  | Unfollow
  | LinkClicking
  | TagClicking
  | ModalOpened
  | ModalClosed
  | SearchTerm
  | SearchTag
  | SearchMoreResults
  | SearchResultSelect
  | ExploreSectionView
  | ExploreSectionClick
  | ListenGated
  | ErrorPage
  | NotFoundPage
  | PageView
  | OnFirstPage
  | NotOnFirstPage
  | BrowserNotificationSetting
  | TweetFirstUpload
  | WebVitals
  | Performance
  | StemCompleteUpload
  | StemDelete
  | RemixNewRemix
  | RemixCosign
  | RemixCosignIndicator
  | RemixHide
  | PlaylistLibraryReorder
  | PlaylistLibraryClicked
  | PlaylistLibraryMovePlaylistIntoFolder
  | PlaylistLibraryAddPlaylistToFolder
  | PlaylistLibraryMovePlaylistOutOfFolder
  | PlaylistLibraryExpandFolder
  | PlaylistLibraryCollapseFolder
  | DeactivateAccountPageView
  | DeactivateAccountRequest
  | DeactivateAccountSuccess
  | DeactivateAccountFailure
  | CreateUserBankRequest
  | CreateUserBankSuccess
  | CreateUserBankFailure
  | SocialProofOpen
  | SocialProofSuccess
  | SocialProofError
  | FolderOpenCreate
  | FolderSubmitCreate
  | FolderCancelCreate
  | FolderOpenEdit
  | FolderSubmitEdit
  | FolderDelete
  | FolderCancelEdit
  | AudiusOauthStart
  | AudiusOauthComplete
  | AudiusOauthSubmit
  | AudiusOauthError
  | BannerTOSClicked
  | RateCtaDisplayed
  | RateCtaResponseNo
  | RateCtaResponseYes
  | ChatBlastCTAClicked
  | ChatBlastMessageSent
  | CreateChatSuccess
  | CreateChatFailure
  | CreateChatBlastSuccess
  | CreateChatBlastFailure
  | SendMessageSuccess
  | SendMessageFailure
  | DeleteChatSuccess
  | DeleteChatFailure
  | BlockUserSuccess
  | BlockUserFailure
  | ChangeInboxSettingsSuccess
  | ChangeInboxSettingsFailure
  | SendMessageReactionSuccess
  | SendMessageReactionFailure
  | MessageUnfurlTrack
  | MessageUnfurlPlaylist
  | ChatReportUser
  | DeveloperAppCreateSubmit
  | DeveloperAppCreateSuccess
  | DeveloperAppCreateError
  | DeveloperAppEditSubmit
  | DeveloperAppEditSuccess
  | DeveloperAppEditError
  | DeveloperAppDeleteSuccess
  | DeveloperAppDeleteError
  | AuthorizedAppRemoveSuccess
  | AuthorizedAppRemoveError
  | ChatEntryPoint
  | ChatWebsocketError
  | ManagerModeSwitchAccount
  | ManagerModeInviteManager
  | ManagerModeAcceptInvite
  | ManagerModeCancelInvite
  | ManagerModeRejectInvite
  | ManagerModeRemoveManager
  | CommentsCreateComment
  | CommentsUpdateComment
  | CommentsDeleteComment
  | CommentsFocusCommentInput
  | CommentsClickReplyButton
  | CommentsLikeComment
  | CommentsUnlikeComment
  | CommentsReportComment
  | CommentsAddMention
  | CommentsClickMention
  | CommentsAddTimestamp
  | CommentsClickTimestamp
  | CommentsAddLink
  | CommentsClickLink
  | CommentsNotificationOpen
  | CommentsMuteUser
  | CommentsUnmuteUser
  | CommentsPinComment
  | CommentsUnpinComment
  | CommentsLoadMoreComments
  | CommentsLoadNewComments
  | CommentsShowReplies
  | CommentsLoadMoreReplies
  | CommentsHideReplies
  | CommentsApplySort
  | CommentsClickCommentStat
  | CommentsOpenCommentOverflowMenu
  | CommentsTurnOffNotificationsForComment
  | CommentsTurnOnNotificationsForComment
  | CommentsOpenTrackOverflowMenu
  | CommentsTurnOnNotificationsForTrack
  | CommentsTurnOffNotificationsForTrack
  | CommentsDisableTrackComments
  | CommentsOpenCommentDrawer
  | CommentsCloseCommentDrawer
  | CommentsOpenAuthModal
  | CommentsOpenInstallAppModal
  | CommentsHistoryClick
  | CommentsHistoryDrawerOpen
  | RecentCommentsClick
  | TrackReplaceDownload
  | TrackReplacePreview
  | TrackReplaceReplace
  | RemixContestCreate
  | RemixContestUpdate
  | RemixContestDelete
  | RemixContestPickWinnersOpen
  | RemixContestPickWinnersFinalize
  | AndroidAppRestartHeartbeat
  | AndroidAppRestartStale
  | AndroidAppRestartForceQuit
