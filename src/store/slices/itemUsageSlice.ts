import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { inventoryAPI } from '../../services/api';
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

// Item usage record interface
export interface ItemUsageRecord {
  id: number;
  itemid: number;
  item_name: string;
  itemused: number;
  item_waste: number;
  taken_items: number;
  taken_by: string;
  comment: string;
  date: string;
  created_at: string;
  updated_at: string;
}

// Create item usage record interface
export interface CreateItemUsageRecordData {
  itemid: number;
  taken_items: number;
  itemused: number;
  item_waste: number;
  taken_by: string;
  comment: string;
}

// Update item usage record interface
export interface UpdateItemUsageRecordData {
  itemid?: number;
  taken_items?: number;
  itemused?: number;
  item_waste?: number;
  taken_by?: string;
  comment?: string;
}

// Item usage state interface
export interface ItemUsageState {
  records: ItemUsageRecord[];
  loading: boolean;
  error: string | null;
  createLoading: boolean;
  createError: string | null;
  updateLoading: boolean;
  updateError: string | null;
  deleteLoading: boolean;
  deleteError: string | null;
  selectedRecord: ItemUsageRecord | null;
}

// Initial state
const initialState: ItemUsageState = {
  records: [],
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
  updateLoading: false,
  updateError: null,
  deleteLoading: false,
  deleteError: null,
  selectedRecord: null,
};

// Async thunks
export const fetchItemUsageRecords = createAsyncThunk(
  'itemUsage/fetchItemUsageRecords',
  async (_, { rejectWithValue, getState }) => {
    try {
      const response = await inventoryAPI.getItemUsageRecords();
      let records = Array.isArray(response.data) ? response.data : response.data.results || response.data;
      
      // Get the state to access inventory items
      const state = getState() as any;
      const inventoryItems = state.inventory?.items || [];
      
      // Ensure each record has the item_name field
      records = records.map((record: any) => {
        if (!record.item_name && record.itemid) {
          const item = inventoryItems.find((item: any) => item.id === record.itemid);
          return {
            ...record,
            item_name: item ? item.item_name : 'Unknown Item'
          };
        }
        return record;
      });
      
      return records;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to fetch item usage records'));
    }
  }
);

export const createItemUsageRecord = createAsyncThunk(
  'itemUsage/createItemUsageRecord',
  async (recordData: CreateItemUsageRecordData, { rejectWithValue, getState }) => {
    try {
      const response = await inventoryAPI.createItemUsageRecord(recordData);
      
      // Get the state to access inventory items
      const state = getState() as any;
      const inventoryItems = state.inventory?.items || [];
      
      // Find the item name from inventory items
      const item = inventoryItems.find((item: any) => item.id === recordData.itemid);
      const itemName = item ? item.item_name : 'Unknown Item';
      
      // Add the item_name to the response data
      const responseData = {
        ...response.data,
        item_name: itemName
      };
      
      return responseData;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to create item usage record'));
    }
  }
);

export const updateItemUsageRecord = createAsyncThunk(
  'itemUsage/updateItemUsageRecord',
  async ({ recordId, recordData }: { recordId: string; recordData: UpdateItemUsageRecordData }, { rejectWithValue, getState }) => {
    try {
      console.log('API call - Updating item usage record with data:', recordData);
      const response = await inventoryAPI.updateItemUsageRecord(recordId, recordData);
      
      // Get the state to access inventory items
      const state = getState() as any;
      const inventoryItems = state.inventory?.items || [];
      
      // Find the item name from inventory items
      const item = inventoryItems.find((item: any) => item.id === recordData.itemid);
      const itemName = item ? item.item_name : 'Unknown Item';
      
      // Add the item_name to the response data
      const responseData = {
        ...response.data,
        item_name: itemName
      };
      
      return responseData;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to update item usage record'));
    }
  }
);

export const deleteItemUsageRecord = createAsyncThunk(
  'itemUsage/deleteItemUsageRecord',
  async (recordId: string, { rejectWithValue }) => {
    try {
      await inventoryAPI.deleteItemUsageRecord(recordId);
      return recordId;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to delete item usage record'));
    }
  }
);

// Item usage slice
const itemUsageSlice = createSlice({
  name: 'itemUsage',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },
    setSelectedRecord: (state, action: PayloadAction<ItemUsageRecord | null>) => {
      state.selectedRecord = action.payload;
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
    // Fetch item usage records
    builder
      .addCase(fetchItemUsageRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchItemUsageRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
        state.error = null;
      })
      .addCase(fetchItemUsageRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create item usage record
    builder
      .addCase(createItemUsageRecord.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createItemUsageRecord.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createError = null;
        // Add the new record to the list
        state.records.unshift(action.payload);
      })
      .addCase(createItemUsageRecord.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload as string;
      });

    // Update item usage record
    builder
      .addCase(updateItemUsageRecord.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateItemUsageRecord.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateError = null;
        // Update the record in the list
        const index = state.records.findIndex(record => record.id === action.payload.id);
        if (index !== -1) {
          state.records[index] = action.payload;
        }
        // Update selected record if it's the same
        if (state.selectedRecord && state.selectedRecord.id === action.payload.id) {
          state.selectedRecord = action.payload;
        }
      })
      .addCase(updateItemUsageRecord.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload as string;
      });

    // Delete item usage record
    builder
      .addCase(deleteItemUsageRecord.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteItemUsageRecord.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = null;
        // Remove the record from the list
        state.records = state.records.filter(record => record.id.toString() !== action.payload);
        // Clear selected record if it was deleted
        if (state.selectedRecord && state.selectedRecord.id.toString() === action.payload) {
          state.selectedRecord = null;
        }
      })
      .addCase(deleteItemUsageRecord.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload as string;
      });
  },
});

export const {
  clearErrors,
  setSelectedRecord,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
} = itemUsageSlice.actions;

export default itemUsageSlice.reducer;
