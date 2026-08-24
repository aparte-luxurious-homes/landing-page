import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist"; // Import persistReducer
import rootReducer from "./rootReducer";
import { authApi } from "../api/authApi";
import { propertiesApi } from "../api/propertiesApi";
import { paymentApi } from "../api/paymentApi";
import { profileApi } from "../api/profileApi";
import { bookingApi } from "../api/booking";
import { bookingsApi } from "../api/bookingsApi";
import { transactionsApi } from "../api/transactionsApi";
import { reviewsApi } from "../api/reviewsApi";
import { disputesApi } from "../api/disputesApi";
import { referralsApi } from "../api/referralsApi";
import { walletsApi } from "../api/walletsApi";
import { verifyApi } from "../api/verifyApi";
import storage from "redux-persist/lib/storage";
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
    [paymentApi.reducerPath]: paymentApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [bookingApi.reducerPath]: bookingApi.reducer,
    [bookingsApi.reducerPath]: bookingsApi.reducer,
    [transactionsApi.reducerPath]: transactionsApi.reducer,
    [reviewsApi.reducerPath]: reviewsApi.reducer,
    [disputesApi.reducerPath]: disputesApi.reducer,
    [referralsApi.reducerPath]: referralsApi.reducer,
    [walletsApi.reducerPath]: walletsApi.reducer,
    [verifyApi.reducerPath]: verifyApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializability check for redux-persist
    })
      .concat(authApi.middleware)
      .concat(propertiesApi.middleware)
      .concat(paymentApi.middleware)
      .concat(profileApi.middleware)
      .concat(bookingApi.middleware)
      .concat(bookingsApi.middleware)
      .concat(transactionsApi.middleware)
      .concat(reviewsApi.middleware)
      .concat(disputesApi.middleware)
      .concat(referralsApi.middleware)
      .concat(walletsApi.middleware)
      .concat(verifyApi.middleware),
});

export const persistor = persistStore(store);

// Infer RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
