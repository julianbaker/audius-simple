import { GetUserLibraryTracksTypeEnum } from '@audius/sdk'

import type { Dayjs } from '~/utils/dayjs'

import { UID, ID, Collection, LineupTrack } from '../../../models'

export const LibraryCategory = GetUserLibraryTracksTypeEnum
export type LibraryCategoryType =
  | typeof LibraryCategory.All
  | typeof LibraryCategory.Favorite
  | typeof LibraryCategory.Repost

export function isLibraryCategory(value: string): value is LibraryCategoryType {
  return [
    LibraryCategory.All,
    LibraryCategory.Favorite,
    LibraryCategory.Repost
  ].includes(value as LibraryCategoryType)
}
export interface LibraryPageState {
  local: {
    track: {
      favorites: {
        added: { [id: number]: UID }
        removed: { [id: number]: UID }
      }
      reposts: {
        added: { [id: number]: UID }
        removed: { [id: number]: UID }
      }
    }
    album: {
      favorites: {
        added: ID[]
        removed: ID[]
      }
      reposts: {
        added: ID[]
        removed: ID[]
      }
    }
    playlist: {
      favorites: {
        added: ID[]
        removed: ID[]
      }
      reposts: {
        added: ID[]
        removed: ID[]
      }
    }
  }
  tracksCategory: LibraryCategoryType
  collectionsCategory: LibraryCategoryType
}

export enum LibraryPageTabs {
  TRACKS = 'Tracks',
  ALBUMS = 'Albums',
  PLAYLISTS = 'Playlists'
}

export type LibraryPageTrack = LineupTrack & { dateSaved: string }

export type TrackRecord = LibraryPageTrack & {
  key: string
  name: string
  artist: string
  handle: string
  date: Dayjs
  time: number
  plays: number | undefined
}

export type LibraryPageCollection = Collection & {
  ownerHandle: string
}
