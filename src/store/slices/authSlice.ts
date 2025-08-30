import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { authAPI, userAPI } from '../../services/api';
import { 
  getAccessToken, 
  getRefreshToken, 
  getUserData, 
  setAccessToken, 
  setRefreshToken, 
  setUserData, 
  clearAuthCookies 
} from '../../lib/cookies';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
}

interface UserListItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  is_active: boolean;
  created_at: string;
}

interface UsersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: UserListItem[];
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  // User management state
  users: UserListItem[];
  usersLoading: boolean;
  usersError: string | null;
  totalUsers: number;
  createUserLoading: boolean;
  updateUserLoading: boolean;
  deleteUserLoading: boolean;
}

const initialState: AuthState = {
  user: getUserData(),
  accessToken: getAccessToken() || null,
  refreshToken: getRefreshToken() || null,
  isLoading: false,
  error: null,
  // User management state
  users: [],
  usersLoading: false,
  usersError: null,
  totalUsers: 0,
  createUserLoading: false,
  updateUserLoading: false,
  deleteUserLoading: false,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      const { access, refresh, user } = response.data;
      setAccessToken(access);
      setRefreshToken(refresh);
      setUserData(user);
      return { accessToken: access, refreshToken: refresh, user };
    } catch (error: any) {
      // Try to get detailed error message from API response
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.response?.data?.detail ||
                          error.message || 
                          'Login failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
      clearAuthCookies();
      return null;
    } catch (error: any) {
      clearAuthCookies();
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getProfile();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get profile');
    }
  }
);

// User management async thunks
export const fetchUsers = createAsyncThunk(
  'auth/fetchUsers',
  async (params: { page?: number; page_size?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await userAPI.getUsers(params);
      const data = response.data;
      
      // Handle both paginated and simple array responses
      if (Array.isArray(data)) {
        // Simple array response
        return {
          count: data.length,
          next: null,
          previous: null,
          results: data
        } as UsersResponse;
      } else {
        // Paginated response
        return data as UsersResponse;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.response?.data?.detail ||
                          error.message || 
                          'Failed to fetch users';
      return rejectWithValue(errorMessage);
    }
  }
);

export const createUser = createAsyncThunk(
  'auth/createUser',
  async (userData: {
    name: string;
    email: string;
    role: string;
    password?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await userAPI.createUser(userData);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.response?.data?.detail ||
                          error.message || 
                          'Failed to create user';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateUser = createAsyncThunk(
  'auth/updateUser',
  async ({ id, userData }: {
    id: string;
    userData: {
      name?: string;
      email?: string;
      role?: string;
      password?: string;
      confirm_password?: string;
    };
  }, { rejectWithValue }) => {
    try {
      const response = await userAPI.updateUser(id, userData);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.response?.data?.detail ||
                          error.message || 
                          'Failed to update user';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'auth/deleteUser',
  async (id: string, { rejectWithValue }) => {
    try {
      await userAPI.deleteUser(id);
      return id;
    } catch (error: any) {
      // Handle specific error cases
      if (error.response?.data?.error === "Superusers cannot be deleted.") {
        return rejectWithValue("Superusers cannot be deleted. Please contact an administrator.");
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.response?.data?.detail ||
                          error.message || 
                          'Failed to delete user';
      return rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    clearUsersError: (state) => {
      state.usersError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      })
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.usersLoading = true;
        state.usersError = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload.results;
        state.totalUsers = action.payload.count;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.usersError = action.payload as string;
      })
      // Create User
      .addCase(createUser.pending, (state) => {
        state.createUserLoading = true;
      })
      .addCase(createUser.fulfilled, (state) => {
        state.createUserLoading = false;
      })
      .addCase(createUser.rejected, (state) => {
        state.createUserLoading = false;
      })
      // Update User
      .addCase(updateUser.pending, (state) => {
        state.updateUserLoading = true;
      })
      .addCase(updateUser.fulfilled, (state) => {
        state.updateUserLoading = false;
      })
      .addCase(updateUser.rejected, (state) => {
        state.updateUserLoading = false;
      })
      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.deleteUserLoading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.deleteUserLoading = false;
        // Remove the deleted user from the list
        state.users = state.users.filter(user => user.id !== action.payload);
        state.totalUsers -= 1;
      })
      .addCase(deleteUser.rejected, (state) => {
        state.deleteUserLoading = false;
      });
  },
});

export const { clearError, setUser, clearUsersError } = authSlice.actions;
export default authSlice.reducer;
