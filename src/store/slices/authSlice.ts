import { createSlice } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  role: string | null;
}

const initialState: AuthState = {
  token: null,
  isAuthenticated: false,
  role: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.role = null;
    },
    setToken: (state, action) => {
      state.token = action.payload.token;
      state.role = action.payload.role;
      state.isAuthenticated = true;
    },
  },
});

export const { logout, setToken } = authSlice.actions;
export const authReducer = authSlice.reducer; 