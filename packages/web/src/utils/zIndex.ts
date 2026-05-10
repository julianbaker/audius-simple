/* eslint-disable @typescript-eslint/no-duplicate-enum-values */

/**
 * Standardize the use of zIndex across the application
 *
 * NOTE: default modal zIndex is 10,000 and the modal bg is 9,999
 */

export enum zIndex {
  // These are still set in css, added here for reference
  // TODO: use these enums

  // Harmony buttons use a zIndex for their icons which can put them above
  // other elements that get promoted to gpu layers
  SVG_BUTTON_ICONS = 1,
  REMIX_CONTEST_COUNT_DOWN = 1,

  GATED_TRACK_TILE_CORNER_TAG = 3,
  // Legacy tabs component from useTabs()
  TAB_ACCENT = 9,
  PROFILE_EDIT_MASK = 10,
  PROFILE_EDITABLE_COMPONENTS = 11,

  // FROSTED_HEADER_BACKGROUND = 10,
  // HEADER_CONTAINER = 13,
  // NAVIGATOR = 14,
  NAVIGATOR_POPUP = 15,
  NAVIGATOR_POPUP_OVERFLOW_POPUP = 16,
  FOLLOW_RECOMMENDATIONS_POPUP = 17,

  // Mobile bottom-sheet drawer (notifications, etc). Portal'd to body so it
  // needs to sit above the persistent nav (z=14) and any in-page chrome,
  // but below modal-level overlays.
  MOBILE_SHEET_BACKDROP = 9990,
  MOBILE_SHEET = 9991,

  UPLOAD_SUBMIT_BAR = 50,

  NAV_BANNER_POPUP = 101,

  FORM_PAGE_FOOTER = 200,

  // Set to 1000 to account for nested modals inside, which take a higher z-index
  EDIT_TRACK_MODAL = 1000,
  CREATE_PLAYLIST_MODAL = 1000,
  EDIT_PLAYLIST_MODAL = 1001,
  IMAGE_SELECTION_POPUP = 1002,

  MUSIC_CONFETTI = 10000,
  MODAL_OVERFLOW_MENU_POPUP = 10008,
  STEMS_AND_DOWNLOADS_FILTER_BUTTON_POPUP = 10005,
  ARTIST_POPOVER_POPUP = 20000,
  PLAY_BAR_POPUP_MENU = 20001,
  FEATURE_FLAG_OVERRIDE_MODAL = 30000,

  TOAST = 1000000001,
  SOMETHING_WRONG_PAGE = 100000000000000000000
}

export default zIndex
