import { queryCurrentUserId, queryTrack } from '@audius/common/api'
import { Name } from '@audius/common/models'
import { tracksSocialActions, getContext, getSDK } from '@audius/common/store'
import { call, put, takeEvery } from 'typed-redux-saga'

import { make } from 'common/store/analytics/actions'
import { waitForWrite } from 'utils/sagaHelpers'

function* recordListen(action: { trackId: number }) {
  const { trackId } = action
  const audiusBackendInstance = yield* getContext('audiusBackendInstance')

  yield* call(waitForWrite)
  const sdk = yield* getSDK()
  const userId = yield* call(queryCurrentUserId)
  const track = yield* queryTrack(trackId)
  if (!userId || !track) return

  if (userId === track.owner_id && (track.listenCount ?? 0) > 10) {
    return
  }

  yield* call(audiusBackendInstance.recordTrackListen, { userId, trackId, sdk })

  if (track.is_stream_gated) {
    yield* put(make(Name.LISTEN_GATED, { trackId }))
  }
}

export function* watchRecordListen() {
  yield* takeEvery(tracksSocialActions.recordListen, recordListen)
}
