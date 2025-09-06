import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { usersAPI } from '../../services/api';

// Reusable error handling function for async thunks
const handleAsyncError = (error: any, defaultMessage: string) => {
  const errorData = error.response?.data;
  if (errorData) {
    // Handle field-specific validation errors
    if (typeof errorData === 'object' && !Array.isArray(errorData)) {
      const fieldErrors = Object.entries(errorData)
        .map(([field, messages]) => {
          const messageArray = Array.isArray(messages) ? messages : [messages];
          return `${field}: ${messageArray.join(', ')}`;
        })
        .join('; ');
      return fieldErrors;
    }
    // Handle simple error string
    if (typeof errorData === 'string') {
      return errorData;
    }
    // Handle error object with error property
    if (errorData.error) {
      return errorData.error;
    }
  }
  // Fallback error message
  return error.response?.data?.message || 
         error.response?.data?.error || 
         error.response?.data?.detail ||
         error.message || 
         defaultMessage;
};

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

// Create user interface
export interface CreateUserData {
  name: string;
  email: string;
  role: string;
  password: string;
}

// Update user interface
export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: string;
  password?: string;
  password_confirm?: string;
}

// Users response interface
export interface UsersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

// Simple users array response
export type UsersArrayResponse = User[];

// Create user response interface
export interface CreateUserResponse {
  name: string;
  email: string;
  role: string;
  status: string;
}

// Update user response interface
export interface UpdateUserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Users state interface
export interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
  createLoading: boolean;
  createError: string | null;
  updateLoading: boolean;
  updateError: string | null;
  deleteLoading: boolean;
  deleteError: string | null;
  selectedUser: User | null;
}

// Initial state
const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
  updateLoading: false,
  updateError: null,
  deleteLoading: false,
  deleteError: null,
  selectedUser: null,
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await usersAPI.getUsers();
      // Only return the data, not the entire response object
      return Array.isArray(response.data) ? response.data : response.data.results || response.data;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to fetch users'));
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData: CreateUserData, { rejectWithValue }) => {
    try {
      console.log('API call - Creating user with data:', userData);
      const response = await usersAPI.createUser(userData);
      // Only return the data, not the entire response object
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to create user'));
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ userId, userData }: { userId: string; userData: UpdateUserData }, { rejectWithValue }) => {
    try {
      console.log('API call - Updating user with data:', userData);
      const response = await usersAPI.updateUser(userId, userData);
      // Only return the data, not the entire response object
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to update user'));
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      await usersAPI.deleteUser(userId);
      return userId;
    } catch (error: any) {
      const errorData = error.response?.data;
      if (errorData?.error && errorData.error.includes('Superusers cannot be deleted')) {
        return rejectWithValue('Superusers cannot be deleted. Please contact an administrator.');
      }
      return rejectWithValue(handleAsyncError(error, 'Failed to delete user'));
    }
  }
);

// Users slice
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
    clearCreateError: (state) => {
      state.createError = null;
    },
    clearUpdateError: (state) => {
      state.updateError = null;
    },
    clearDeleteError: (state) => {
      state.deleteError = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create user
    builder
      .addCase(createUser.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createError = null;
        // Add the new user to the list
        const newUser: User = {
          id: action.payload.id || Date.now().toString(), // Fallback ID
          name: action.payload.name,
          email: action.payload.email,
          role: action.payload.role,
          status: action.payload.status,
          is_active: true,
          created_at: new Date().toISOString(),
        };
        state.users.unshift(newUser);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload as string;
      });

    // Update user
    builder
      .addCase(updateUser.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateError = null;
        // Update the user in the list
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload as string;
      });

    // Delete user
    builder
      .addCase(deleteUser.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = null;
        // Remove the user from the list
        state.users = state.users.filter(user => user.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload as string;
      });
  },
});

export const {
  clearErrors,
  setSelectedUser,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
} = usersSlice.actions;

export default usersSlice.reducer;
