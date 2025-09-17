import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { expenseCategoryAPI } from '../../services/api';
import { handleAsyncError } from './dialysisSlice';

// Reusable error handling function for async thunks
// const handleAsyncError = (error: any, defaultMessage: string) => {
//   const errorData = error.response?.data;
//   if (errorData) {
//     // Handle field-specific validation errors
//     if (typeof errorData === 'object' && !Array.isArray(errorData)) {
//       const fieldErrors = Object.entries(errorData)
//         .map(([field, messages]) => {
//           const messageArray = Array.isArray(messages) ? messages : [messages];
//           return `${field}: ${messageArray.join(', ')}`;
//         })
//         .join('; ');
//       return fieldErrors;
//     }
//     // Handle simple error string
//     if (typeof errorData === 'string') {
//       return errorData;
//     }
//     // Handle error object with error property
//     if (errorData.error) {
//       return errorData.error;
//     }
//   }
//   // Fallback error message
//   return error.response?.data?.message || 
//          error.response?.data?.error || 
//          error.response?.data?.detail ||
//          error.message || 
//          defaultMessage;
// };

// Expense Category interface
export interface ExpenseCategory {
  id: number;
  name: string;
  description: string;
  category_type: string;
  is_active: boolean;
  created_at: string;
}

// Create expense category interface
export interface CreateExpenseCategoryData {
  name: string;
  description: string;
  category_type: string;
}

// Update expense category interface
export interface UpdateExpenseCategoryData {
  name: string;
  description: string;
  category_type: string;
}

// Expense Categories response interface (array response)
export type ExpenseCategoriesArrayResponse = ExpenseCategory[];

// Create expense category response interface
export interface CreateExpenseCategoryResponse {
  id: number;
  name: string;
  description: string;
  category_type: string;
  is_active: boolean;
  created_at: string;
}

// Update expense category response interface
export interface UpdateExpenseCategoryResponse {
  id: number;
  name: string;
  description: string;
  category_type: string;
  is_active: boolean;
  created_at: string;
}

// Expense Categories state interface
export interface ExpenseCategoriesState {
  expenseCategories: ExpenseCategory[];
  loading: boolean;
  error: string | null;
  createLoading: boolean;
  createError: string | null;
  updateLoading: boolean;
  updateError: string | null;
  deleteLoading: boolean;
  deleteError: string | null;
  selectedExpenseCategory: ExpenseCategory | null;
}

// Initial state
const initialState: ExpenseCategoriesState = {
  expenseCategories: [],
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
  updateLoading: false,
  updateError: null,
  deleteLoading: false,
  deleteError: null,
  selectedExpenseCategory: null,
};

// Async thunks
export const fetchExpenseCategories = createAsyncThunk(
  'expenseCategories/fetchExpenseCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await expenseCategoryAPI.getExpenseCategories();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to fetch expense categories'));
    }
  }
);

export const createExpenseCategory = createAsyncThunk(
  'expenseCategories/createExpenseCategory',
  async (expenseCategoryData: CreateExpenseCategoryData, { rejectWithValue }) => {
    try {
      console.log('API call - Creating expense category with data:', expenseCategoryData);
      const response = await expenseCategoryAPI.createExpenseCategory(expenseCategoryData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to create expense category'));
    }
  }
);

export const updateExpenseCategory = createAsyncThunk(
  'expenseCategories/updateExpenseCategory',
  async ({ categoryId, expenseCategoryData }: { categoryId: number; expenseCategoryData: UpdateExpenseCategoryData }, { rejectWithValue }) => {
    try {
      console.log('API call - Updating expense category with data:', expenseCategoryData);
      const response = await expenseCategoryAPI.updateExpenseCategory(categoryId, expenseCategoryData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to update expense category'));
    }
  }
);

export const deleteExpenseCategory = createAsyncThunk(
  'expenseCategories/deleteExpenseCategory',
  async (categoryId: number, { rejectWithValue }) => {
    try {
      await expenseCategoryAPI.deleteExpenseCategory(categoryId);
      return categoryId;
    } catch (error: any) {
      const errorData = error.response?.data;
      if (error.response?.status === 404) {
        return rejectWithValue('Expense category not found');
      }
      return rejectWithValue(handleAsyncError(error, 'Failed to delete expense category'));
    }
  }
);

// Expense Categories slice
const expenseCategoriesSlice = createSlice({
  name: 'expenseCategories',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },
    setSelectedExpenseCategory: (state, action: PayloadAction<ExpenseCategory | null>) => {
      state.selectedExpenseCategory = action.payload;
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
    // Fetch expense categories
    builder
      .addCase(fetchExpenseCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenseCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.expenseCategories = action.payload;
        state.error = null;
      })
      .addCase(fetchExpenseCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create expense category
    builder
      .addCase(createExpenseCategory.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createExpenseCategory.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createError = null;
        // Add the new expense category to the list
        state.expenseCategories.unshift(action.payload);
      })
      .addCase(createExpenseCategory.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload as string;
      });

    // Update expense category
    builder
      .addCase(updateExpenseCategory.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateExpenseCategory.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateError = null;
        // Update the expense category in the list
        const index = state.expenseCategories.findIndex(category => category.id === action.payload.id);
        if (index !== -1) {
          state.expenseCategories[index] = action.payload;
        }
        // Update selected expense category if it's the same
        if (state.selectedExpenseCategory?.id === action.payload.id) {
          state.selectedExpenseCategory = action.payload;
        }
      })
      .addCase(updateExpenseCategory.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload as string;
      });

    // Delete expense category
    builder
      .addCase(deleteExpenseCategory.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteExpenseCategory.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = null;
        // Remove the expense category from the list
        state.expenseCategories = state.expenseCategories.filter(category => category.id !== action.payload);
        // Clear selected expense category if it was deleted
        if (state.selectedExpenseCategory?.id === action.payload) {
          state.selectedExpenseCategory = null;
        }
      })
      .addCase(deleteExpenseCategory.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload as string;
      });
  },
});

export const {
  clearErrors,
  setSelectedExpenseCategory,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
} = expenseCategoriesSlice.actions;

export default expenseCategoriesSlice.reducer;
