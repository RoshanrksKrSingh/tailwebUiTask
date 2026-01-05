import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import assignmentReducer from './assignmentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    assignments: assignmentReducer,
  },
});