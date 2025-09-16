import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { inventoryAPI } from '../../services/api';

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

// Usage record interface
export interface UsageRecord {
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

// Inventory item interface
export interface InventoryItem {
  id: number;
  item_name: string;
  item_type: string;
  quantity: number;
  new_quantity: number;
  quantity_type: string;
  total_used_items: number;
  total_waste_items: number;
  available_items: number;
  inventory_type: string;
  date: string;
  admin_comment: string;
  created_at: string;
  updated_at: string;
  usage_records?: UsageRecord[];
}

// Create inventory item interface
export interface CreateInventoryItemData {
  item_name: string;
  item_type: string;
  quantity: number;
  new_quantity?: number;
  quantity_type: string;
  inventory_type: string;
  date: string;
  admin_comment?: string;
}

// Update inventory item interface
export interface UpdateInventoryItemData {
  item_name?: string;
  item_type?: string;
  quantity?: number;
  new_quantity?: number;
  quantity_type?: string;
  inventory_type?: string;
  date?: string;
  admin_comment?: string;
}

// Add quantity interface
export interface AddQuantityData {
  additional_quantity: number;
}

// Use items interface
export interface UseItemsData {
  items_to_use: number;
}

// Add waste items interface
export interface AddWasteItemsData {
  items_to_waste: number;
}

// Inventory state interface
export interface InventoryState {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
  createLoading: boolean;
  createError: string | null;
  updateLoading: boolean;
  updateError: string | null;
  deleteLoading: boolean;
  deleteError: string | null;
  addQuantityLoading: boolean;
  addQuantityError: string | null;
  useItemsLoading: boolean;
  useItemsError: string | null;
  addWasteItemsLoading: boolean;
  addWasteItemsError: string | null;
  selectedItem: InventoryItem | null;
  itemDetail: InventoryItem | null;
  itemDetailLoading: boolean;
  itemDetailError: string | null;
}

// Initial state
const initialState: InventoryState = {
  items: [],
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
  updateLoading: false,
  updateError: null,
  deleteLoading: false,
  deleteError: null,
  addQuantityLoading: false,
  addQuantityError: null,
  useItemsLoading: false,
  useItemsError: null,
  addWasteItemsLoading: false,
  addWasteItemsError: null,
  selectedItem: null,
  itemDetail: null,
  itemDetailLoading: false,
  itemDetailError: null,
};

// Async thunks
export const fetchInventoryItems = createAsyncThunk(
  'inventory/fetchInventoryItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.getInventoryItems();
      // Only return the data, not the entire response object
      return Array.isArray(response.data) ? response.data : response.data.results || response.data;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to fetch inventory items'));
    }
  }
);

export const createInventoryItem = createAsyncThunk(
  'inventory/createInventoryItem',
  async (itemData: CreateInventoryItemData, { rejectWithValue }) => {
    try {
      console.log('API call - Creating inventory item with data:', itemData);
      const response = await inventoryAPI.createInventoryItem(itemData);
      // Only return the data, not the entire response object
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to create inventory item'));
    }
  }
);

export const updateInventoryItem = createAsyncThunk(
  'inventory/updateInventoryItem',
  async ({ itemId, itemData }: { itemId: string; itemData: UpdateInventoryItemData }, { rejectWithValue }) => {
    try {
      console.log('API call - Updating inventory item with data:', itemData);
      const response = await inventoryAPI.updateInventoryItem(itemId, itemData);
      // Only return the data, not the entire response object
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to update inventory item'));
    }
  }
);

export const deleteInventoryItem = createAsyncThunk(
  'inventory/deleteInventoryItem',
  async (itemId: string, { rejectWithValue }) => {
    try {
      await inventoryAPI.deleteInventoryItem(itemId);
      return itemId;
    } catch (error: any) {
      const errorData = error.response?.data;
      if (error.response?.status === 404) {
        return rejectWithValue('Inventory item not found');
      }
      return rejectWithValue(handleAsyncError(error, 'Failed to delete inventory item'));
    }
  }
);

export const addQuantityToItem = createAsyncThunk(
  'inventory/addQuantityToItem',
  async ({ itemId, data }: { itemId: string; data: AddQuantityData }, { rejectWithValue }) => {
    try {
      console.log('API call - Adding quantity to item with data:', data);
      const response = await inventoryAPI.addQuantity(itemId, data);
      // Only return the data, not the entire response object
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to add quantity to inventory item'));
    }
  }
);

export const useItemsFromInventory = createAsyncThunk(
  'inventory/useItemsFromInventory',
  async ({ itemId, data }: { itemId: string; data: UseItemsData }, { rejectWithValue }) => {
    try {
      console.log('API call - Using items from inventory with data:', data);
      const response = await inventoryAPI.useItems(itemId, data);
      // Only return the data, not the entire response object
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to use items from inventory'));
    }
  }
);

export const addWasteItemsToInventory = createAsyncThunk(
  'inventory/addWasteItemsToInventory',
  async ({ itemId, data }: { itemId: string; data: AddWasteItemsData }, { rejectWithValue }) => {
    try {
      console.log('API call - Adding waste items to inventory with data:', data);
      const response = await inventoryAPI.addWasteItems(itemId, data);
      // Only return the data, not the entire response object
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to add waste items to inventory'));
    }
  }
);

export const fetchInventoryItemDetail = createAsyncThunk(
  'inventory/fetchInventoryItemDetail',
  async (itemId: string, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.getInventoryItemById(itemId);
      // Only return the data, not the entire response object
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to fetch inventory item details'));
    }
  }
);

// Inventory slice
const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.addQuantityError = null;
      state.useItemsError = null;
      state.itemDetailError = null;
      state.addWasteItemsError = null;
    },
    setSelectedItem: (state, action: PayloadAction<InventoryItem | null>) => {
      state.selectedItem = action.payload;
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
    clearAddQuantityError: (state) => {
      state.addQuantityError = null;
    },
    clearUseItemsError: (state) => {
      state.useItemsError = null;
    },
    clearItemDetailError: (state) => {
      state.itemDetailError = null;
    },
    clearItemDetail: (state) => {
      state.itemDetail = null;
    },
    clearAddWasteItemsError: (state) => {
      state.addWasteItemsError = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch inventory items
    builder
      .addCase(fetchInventoryItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventoryItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchInventoryItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create inventory item
    builder
      .addCase(createInventoryItem.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createInventoryItem.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createError = null;
        // Add the new item to the list
        state.items.unshift(action.payload);
      })
      .addCase(createInventoryItem.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload as string;
      });

    // Update inventory item
    builder
      .addCase(updateInventoryItem.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateInventoryItem.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateError = null;
        // Update the item in the list
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        // Update selected item if it's the same
        if (state.selectedItem && state.selectedItem.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
        // Update item detail if it's the same
        if (state.itemDetail && state.itemDetail.id === action.payload.id) {
          state.itemDetail = action.payload;
        }
      })
      .addCase(updateInventoryItem.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload as string;
      });

    // Delete inventory item
    builder
      .addCase(deleteInventoryItem.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteInventoryItem.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = null;
        // Remove the item from the list
        state.items = state.items.filter(item => item.id.toString() !== action.payload);
        // Clear selected item if it was deleted
        if (state.selectedItem && state.selectedItem.id.toString() === action.payload) {
          state.selectedItem = null;
        }
        // Clear item detail if it was deleted
        if (state.itemDetail && state.itemDetail.id.toString() === action.payload) {
          state.itemDetail = null;
        }
      })
      .addCase(deleteInventoryItem.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload as string;
      });

    // Add quantity to item
    builder
      .addCase(addQuantityToItem.pending, (state) => {
        state.addQuantityLoading = true;
        state.addQuantityError = null;
      })
      .addCase(addQuantityToItem.fulfilled, (state, action) => {
        state.addQuantityLoading = false;
        state.addQuantityError = null;
        // Update the item in the list
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        // Update selected item if it's the same
        if (state.selectedItem && state.selectedItem.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
        // Update item detail if it's the same
        if (state.itemDetail && state.itemDetail.id === action.payload.id) {
          state.itemDetail = action.payload;
        }
      })
      .addCase(addQuantityToItem.rejected, (state, action) => {
        state.addQuantityLoading = false;
        state.addQuantityError = action.payload as string;
      });

    // Use items from inventory
    builder
      .addCase(useItemsFromInventory.pending, (state) => {
        state.useItemsLoading = true;
        state.useItemsError = null;
      })
      .addCase(useItemsFromInventory.fulfilled, (state, action) => {
        state.useItemsLoading = false;
        state.useItemsError = null;
        // Update the item in the list
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        // Update selected item if it's the same
        if (state.selectedItem && state.selectedItem.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
        // Update item detail if it's the same
        if (state.itemDetail && state.itemDetail.id === action.payload.id) {
          state.itemDetail = action.payload;
        }
      })
      .addCase(useItemsFromInventory.rejected, (state, action) => {
        state.useItemsLoading = false;
        state.useItemsError = action.payload as string;
      });

    // Add waste items to inventory
    builder
      .addCase(addWasteItemsToInventory.pending, (state) => {
        state.addWasteItemsLoading = true;
        state.addWasteItemsError = null;
      })
      .addCase(addWasteItemsToInventory.fulfilled, (state, action) => {
        state.addWasteItemsLoading = false;
        state.addWasteItemsError = null;
        // Update the item in the list
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(addWasteItemsToInventory.rejected, (state, action) => {
        state.addWasteItemsLoading = false;
        state.addWasteItemsError = action.payload as string;
      });

    // Fetch inventory item detail
    builder
      .addCase(fetchInventoryItemDetail.pending, (state) => {
        state.itemDetailLoading = true;
        state.itemDetailError = null;
      })
      .addCase(fetchInventoryItemDetail.fulfilled, (state, action) => {
        state.itemDetailLoading = false;
        state.itemDetail = action.payload;
        state.itemDetailError = null;
      })
      .addCase(fetchInventoryItemDetail.rejected, (state, action) => {
        state.itemDetailLoading = false;
        state.itemDetailError = action.payload as string;
      });
  },
});

export const {
  clearErrors,
  setSelectedItem,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  clearAddQuantityError,
  clearUseItemsError,
  clearItemDetailError,
  clearItemDetail,
  clearAddWasteItemsError,
} = inventorySlice.actions;

export default inventorySlice.reducer;
