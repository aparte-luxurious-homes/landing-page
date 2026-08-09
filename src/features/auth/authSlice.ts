import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { RootState } from '../../app/store';
import { saveToken, getToken, removeToken } from '../../utils/secureStorage';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  userRole: string | null;
  email: string | null;
  phone: string | null;
}

/**
 * Seed from sessionStorage on the client so a refresh doesn't flash the
 * logged-out UI. getToken() returns null on the server (see secureStorage),
 * which is what makes this module safe to import from a server render.
 *
 * Consequence of client-only auth: server HTML is always the logged-out
 * variant. Anything auth-dependent must therefore be a client component with
 * its own loading state, or it will hydration-mismatch.
 */
const initialToken = getToken();

const initialState: AuthState = {
  token: initialToken,
  isAuthenticated: !!initialToken,
  userRole: null,
  email: null,
  phone: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (
      state,
      action: PayloadAction<{ token: string; role: string }>
    ) => {
      const { token, role } = action.payload;
      state.token = token;
      state.isAuthenticated = true;
      state.userRole = role;
      saveToken(token); // Save encrypted token
    },
    setRole: (state, action: PayloadAction<string>) => {
      state.userRole = action.payload;
    },
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    setPhone: (state, action: PayloadAction<string>) => {
      state.phone = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.userRole = null;
      state.email = null;
      removeToken(); // Remove token from storage
    },
  },
});

export const { setToken, logout, setRole, setEmail, setPhone } =
  authSlice.actions;

// Persist Configuration
const persistConfig = {
  key: 'auth',
  storage,
  whitelist: ['email', 'phone'],
};

export const persistedAuthReducer = persistReducer(
  persistConfig,
  authSlice.reducer
);

// Selectors
export const selectAuth = (state: RootState) => state.root.auth;
export const selectIsAuthenticated = (state: RootState) =>
  state.root.auth.isAuthenticated;
export const selectUserRole = (state: RootState) => state.root.auth.userRole;
export const selectUserEmail = (state: RootState) => state.root.auth.email;
export const selectUserPhone = (state: RootState) => state.root.auth.phone;

export default persistedAuthReducer;
