import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { isNullOrUndefined, Nullable } from '~/utils/typeUtils'

import { StringWei } from '../../models/Wallet'

type WalletState = {
  balance: Nullable<StringWei>
  balanceLoading: boolean
  balanceLoadDidFail: Nullable<boolean>
  totalBalance: Nullable<StringWei>
  totalBalanceLoadDidFail: Nullable<boolean>
  localBalanceDidChange: boolean
  freezeBalanceUntil: Nullable<number>
}

const initialState: WalletState = {
  balance: null,
  balanceLoading: true,
  balanceLoadDidFail: false,
  totalBalance: null,
  totalBalanceLoadDidFail: false,
  localBalanceDidChange: false,
  freezeBalanceUntil: null
}

const slice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setBalance: (
      state,
      {
        payload: { balance, totalBalance }
      }: PayloadAction<{ balance: StringWei; totalBalance?: StringWei }>
    ) => {
      state.balance = balance
      state.balanceLoading = false
      state.balanceLoadDidFail = false
      if (!isNullOrUndefined(totalBalance)) {
        state.totalBalance = totalBalance
        state.totalBalanceLoadDidFail = false
      }
      state.localBalanceDidChange = false
    },
    setBalanceError: (
      state,
      {
        payload: { balanceLoadDidFail, totalBalanceLoadDidFail }
      }: PayloadAction<{
        balanceLoadDidFail?: boolean
        totalBalanceLoadDidFail?: boolean
      }>
    ) => {
      if (balanceLoadDidFail != null) {
        state.balanceLoadDidFail = balanceLoadDidFail
      }
      if (totalBalanceLoadDidFail != null) {
        state.totalBalanceLoadDidFail = totalBalanceLoadDidFail
      }
    }
    // Balance is kept for internal account state only.
  }
})

export default slice.reducer
export const actions = slice.actions
