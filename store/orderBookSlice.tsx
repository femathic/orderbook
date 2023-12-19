import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface OrderBookState {
  asks: {[key: number]: number};
  bids: {[key: number]: number};
  lastUpdateId: null | string;
}

const initialState: OrderBookState = {
  asks: {},
  bids: {},
  lastUpdateId: null,
}

export const orderBookSlice = createSlice({
  name: 'orderBook',
  initialState,
  reducers: {
    updateOrderBook: (state, action: PayloadAction<OrderBookState>) => {
      state.asks = action.payload.asks
      state.bids = action.payload.bids
      state.lastUpdateId = action.payload.lastUpdateId
    },
  },
})

// Action creators are generated for each case reducer function
export const { updateOrderBook } = orderBookSlice.actions

export default orderBookSlice.reducer