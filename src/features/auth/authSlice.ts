import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { RootState } from '../../app/store';
import { saveToken, getToken, removeToken } from '../../utils/secureStorage';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  userRole: string | null;
  userId: string | null;
  email: string | null;
  phone: string | null;
}

const initialState: AuthState = {
  token: getToken(), // Initialize with secure storage
  isAuthenticated: !!getToken(),
  userId: null,
  userRole: null,
  email: null,
  phone: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthUser: (
      state,
      action: PayloadAction<{ id: string,token: string; role: string }>
    ) => {
      const { token, role, id } = action.payload;
      state.token = token;
      state.isAuthenticated = true;
      state.userId = id;
      state.userRole = role;
      saveToken(token); // Save encrypted token
    },
    setUserId: (state, action: PayloadAction<string>) => {
      state.userId = action.payload;
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

export const { setAuthUser, logout, setRole, setEmail, setPhone } =
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
