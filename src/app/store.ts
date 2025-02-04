import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist"; // Import persistReducer
import rootReducer from "./rootReducer"; 
import { authApi } from "../api/authApi";
import { propertiesApi } from "../api/propertiesApi";
import { paymentsApi } from "../api/paymentApi";
import { profileApi } from "../api/profileApi";
import { bookingApi } from "../api/booking";
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
    [paymentsApi.reducerPath]: paymentsApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [bookingApi.reducerPath]: bookingApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializability check for redux-persist
    })
      .concat(authApi.middleware)
      .concat(propertiesApi.middleware)
      .concat(paymentsApi.middleware)
      .concat(profileApi.middleware)
      .concat(bookingApi.middleware),
});

export const persistor = persistStore(store);

// Infer RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
