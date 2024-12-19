import { configureStore } from "@reduxjs/toolkit";
import { persistStore } from "redux-persist";
import rootReducer from "./rootReducer";
import { authApi } from "../api/authApi";

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializability check for redux-persist
    }).concat(authApi.middleware),
});

export const persistor = persistStore(store);

// Infer RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;