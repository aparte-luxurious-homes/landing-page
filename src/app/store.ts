import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist'; // Import persistReducer
import rootReducer from './rootReducer';
import { authApi } from '../api/authApi';
import { propertiesApi } from '../api/propertiesApi';
import { paymentsApi } from '../api/paymentApi';
import { profileApi } from '../api/profileApi';
import { chatApi } from '../api/chatApi';
import { bookingApi } from '../api/booking';
import { bookingsApi } from '../api/bookingsApi';
import { transactionsApi } from '../api/transactionsApi';
import { reviewApi } from '../api/reviewApi';
import { notificationApi } from '../api/notificationApi';
import { disputeApi } from '../api/disputeApi';
import storage from 'redux-persist/lib/storage';
import propertyReducer from '../features/property/propertySlice';

const persistConfig = {
  key: 'root',
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: {
    // Replace rootReducer with persistedReducer
    root: persistedReducer,
    property: propertyReducer,
    [authApi.reducerPath]: authApi.reducer,
    [propertiesApi.reducerPath]: propertiesApi.reducer,
    [paymentsApi.reducerPath]: paymentsApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [bookingApi.reducerPath]: bookingApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [bookingsApi.reducerPath]: bookingsApi.reducer,
    [transactionsApi.reducerPath]: transactionsApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [disputeApi.reducerPath]: disputeApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializability check for redux-persist
    })
      .concat(authApi.middleware)
      .concat(propertiesApi.middleware)
      .concat(paymentsApi.middleware)
      .concat(profileApi.middleware)
      .concat(bookingApi.middleware)
      .concat(chatApi.middleware)
      .concat(bookingsApi.middleware)
      .concat(transactionsApi.middleware)
      .concat(reviewApi.middleware)
      .concat(notificationApi.middleware)
      .concat(disputeApi.middleware),
});

export const persistor = persistStore(store);

// Infer RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
