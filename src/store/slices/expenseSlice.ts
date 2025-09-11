import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { expenseAPI } from '../../services/api';

// Types
export interface ReceiptDocument {
  id: number;
  expense_title: string;
  document_type_display: string;
  file_url: string;
  receipt_number: string;
  document_type: string;
  file: string;
  file_name: string;
  file_size: number;
  description: string;
  uploaded_at: string;
  expense: number;
}

export interface Expense {
  id: number;
  category_name: string;
  vendor_name: string;
  expense_type_display: string;
  payment_method_display: string;
  receipt_documents: ReceiptDocument[];
  title: string;
  description: string;
  amount: string;
  expense_type: string;
  expense_date: string;
  payment_method: string;
  due_balance_to_vendor: string;
  notes: string;
  created_at: string;
  updated_at: string;
  category: number;
  vendor: number;
}

export interface CreateExpenseData {
  title: string;
  description: string;
  amount: string;
  category: number;
  vendor: number;
  expense_date: string;
  payment_method: string;
  due_balance_to_vendor: string;
  notes: string;
}

export interface UpdateExpenseData {
  title?: string;
  description?: string;
  amount?: string;
  category?: number;
  vendor?: number;
  expense_date?: string;
  payment_method?: string;
  due_balance_to_vendor?: string;
  notes?: string;
}

export interface ExpenseState {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  createLoading: boolean;
  createError: string | null;
  updateLoading: boolean;
  updateError: string | null;
  deleteLoading: boolean;
  deleteError: string | null;
}

const initialState: ExpenseState = {
  expenses: [],
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
  updateLoading: false,
  updateError: null,
  deleteLoading: false,
  deleteError: null,
};

// Async thunks
export const fetchExpenses = createAsyncThunk(
  'expenses/fetchExpenses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await expenseAPI.getExpenses();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch expenses'
      );
    }
  }
);

export const createExpense = createAsyncThunk(
  'expenses/createExpense',
  async (expenseData: CreateExpenseData, { rejectWithValue }) => {
    try {
      const response = await expenseAPI.createExpense(expenseData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || 'Failed to create expense'
      );
    }
  }
);

export const updateExpense = createAsyncThunk(
  'expenses/updateExpense',
  async (
    { id, expenseData }: { id: number; expenseData: UpdateExpenseData },
    { rejectWithValue }
  ) => {
    try {
      const response = await expenseAPI.updateExpense(id, expenseData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || 'Failed to update expense'
      );
    }
  }
);

export const deleteExpense = createAsyncThunk(
  'expenses/deleteExpense',
  async (id: number, { rejectWithValue }) => {
    try {
      await expenseAPI.deleteExpense(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || 'Failed to delete expense'
      );
    }
  }
);

const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
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
    // Fetch expenses
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action: PayloadAction<Expense[]>) => {
        state.loading = false;
        state.expenses = action.payload;
        state.error = null;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create expense
    builder
      .addCase(createExpense.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createExpense.fulfilled, (state, action: PayloadAction<Expense>) => {
        state.createLoading = false;
        state.expenses.unshift(action.payload);
        state.createError = null;
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload as string;
      });

    // Update expense
    builder
      .addCase(updateExpense.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateExpense.fulfilled, (state, action: PayloadAction<Expense>) => {
        state.updateLoading = false;
        const index = state.expenses.findIndex(expense => expense.id === action.payload.id);
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
        state.updateError = null;
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload as string;
      });

    // Delete expense
    builder
      .addCase(deleteExpense.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteExpense.fulfilled, (state, action: PayloadAction<number>) => {
        state.deleteLoading = false;
        state.expenses = state.expenses.filter(expense => expense.id !== action.payload);
        state.deleteError = null;
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload as string;
      });
  },
});

export const {
  clearErrors,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
} = expenseSlice.actions;

export default expenseSlice.reducer;
