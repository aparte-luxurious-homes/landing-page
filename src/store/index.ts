import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './slices';
import { authApi } from '~/api/authApi';
import { bookingsApi } from '../api/bookingsApi';
import { transactionsApi } from '../api/transactionsApi';
import { walletsApi } from '../api/walletsApi';

export const store = configureStore({
  reducer: {
    root: rootReducer,
    [authApi.reducerPath]: authApi.reducer,
    [bookingsApi.reducerPath]: bookingsApi.reducer,
    [transactionsApi.reducerPath]: transactionsApi.reducer,
    [walletsApi.reducerPath]: walletsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      bookingsApi.middleware,
      transactionsApi.middleware,
      walletsApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store; 