import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import dialysisReducer from './slices/dialysisSlice';
import usersReducer from './slices/usersSlice';

// Import your reducers here
// import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    // Add your reducers here
    auth: authReducer,
    dialysis: dialysisReducer,
    users: usersReducer,
    // user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'persist/PERSIST',
          'users/fetchUsers/fulfilled',
          'users/createUser/fulfilled',
          'users/updateUser/fulfilled',
        ],
        // Ignore these paths in all actions
        ignoredPaths: ['payload.headers'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
