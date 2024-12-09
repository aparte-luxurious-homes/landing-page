import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import { authApi } from '../api/authApi';

const rootReducer = combineReducers({
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer, // Include RTK Query's API slice
  });
  
  export default rootReducer;