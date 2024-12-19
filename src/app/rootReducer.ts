import { combineReducers } from '@reduxjs/toolkit';
import { persistedAuthReducer } from '../features/auth/authSlice';
import { authApi } from '../api/authApi';

const rootReducer = combineReducers({
  auth: persistedAuthReducer,
  [authApi.reducerPath]: authApi.reducer, // Include RTK Query's API slice
});
  
  export default rootReducer;