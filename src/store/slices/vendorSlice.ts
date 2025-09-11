import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { vendorAPI } from '../../services/api';

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

// Vendor interface
export interface Vendor {
  id: number;
  vendor_type_display: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  vendor_type: string;
  tax_id: string;
  payment_terms: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  total_expense_amount?: number;
  expense_count?: number;
  expenses?: any[];
}

// Create vendor interface
export interface CreateVendorData {
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  vendor_type: string;
  tax_id: string;
  payment_terms: string;
  is_active: boolean;
}

// Update vendor interface
export interface UpdateVendorData {
  name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  vendor_type?: string;
  tax_id?: string;
  payment_terms?: string;
  is_active?: boolean;
}

// Vendors response interface (array response)
export type VendorsArrayResponse = Vendor[];

// Create vendor response interface
export interface CreateVendorResponse {
  id: number;
  vendor_type_display: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  vendor_type: string;
  tax_id: string;
  payment_terms: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Update vendor response interface
export interface UpdateVendorResponse {
  id: number;
  vendor_type_display: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  vendor_type: string;
  tax_id: string;
  payment_terms: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Vendors state interface
export interface VendorsState {
  vendors: Vendor[];
  loading: boolean;
  error: string | null;
  createLoading: boolean;
  createError: string | null;
  updateLoading: boolean;
  updateError: string | null;
  deleteLoading: boolean;
  deleteError: string | null;
  selectedVendor: Vendor | null;
  vendorDetail: Vendor | null;
  detailLoading: boolean;
  detailError: string | null;
}

// Initial state
const initialState: VendorsState = {
  vendors: [],
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
  updateLoading: false,
  updateError: null,
  deleteLoading: false,
  deleteError: null,
  selectedVendor: null,
  vendorDetail: null,
  detailLoading: false,
  detailError: null,
};

// Async thunks
export const fetchVendors = createAsyncThunk(
  'vendors/fetchVendors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await vendorAPI.getVendors();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to fetch vendors'));
    }
  }
);

export const createVendor = createAsyncThunk(
  'vendors/createVendor',
  async (vendorData: CreateVendorData, { rejectWithValue }) => {
    try {
      console.log('API call - Creating vendor with data:', vendorData);
      const response = await vendorAPI.createVendor(vendorData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to create vendor'));
    }
  }
);

export const updateVendor = createAsyncThunk(
  'vendors/updateVendor',
  async ({ vendorId, vendorData }: { vendorId: number; vendorData: UpdateVendorData }, { rejectWithValue }) => {
    try {
      console.log('API call - Updating vendor with data:', vendorData);
      const response = await vendorAPI.updateVendor(vendorId, vendorData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to update vendor'));
    }
  }
);

export const deleteVendor = createAsyncThunk(
  'vendors/deleteVendor',
  async (vendorId: number, { rejectWithValue }) => {
    try {
      await vendorAPI.deleteVendor(vendorId);
      return vendorId;
    } catch (error: any) {
      const errorData = error.response?.data;
      if (error.response?.status === 404) {
        return rejectWithValue('Vendor not found');
      }
      return rejectWithValue(handleAsyncError(error, 'Failed to delete vendor'));
    }
  }
);

export const fetchVendorDetail = createAsyncThunk(
  'vendors/fetchVendorDetail',
  async (vendorId: number, { rejectWithValue }) => {
    try {
      const response = await vendorAPI.getVendorById(vendorId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to fetch vendor details'));
    }
  }
);

// Vendors slice
const vendorsSlice = createSlice({
  name: 'vendors',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.detailError = null;
    },
    setSelectedVendor: (state, action: PayloadAction<Vendor | null>) => {
      state.selectedVendor = action.payload;
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
    clearDetailError: (state) => {
      state.detailError = null;
    },
    clearVendorDetail: (state) => {
      state.vendorDetail = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch vendors
    builder
      .addCase(fetchVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors = action.payload;
        state.error = null;
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create vendor
    builder
      .addCase(createVendor.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createVendor.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createError = null;
        // Add the new vendor to the list
        state.vendors.unshift(action.payload);
      })
      .addCase(createVendor.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload as string;
      });

    // Update vendor
    builder
      .addCase(updateVendor.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateVendor.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateError = null;
        // Update the vendor in the list
        const index = state.vendors.findIndex(vendor => vendor.id === action.payload.id);
        if (index !== -1) {
          state.vendors[index] = action.payload;
        }
        // Update selected vendor if it's the same
        if (state.selectedVendor?.id === action.payload.id) {
          state.selectedVendor = action.payload;
        }
        // Update vendor detail if it's the same
        if (state.vendorDetail?.id === action.payload.id) {
          state.vendorDetail = action.payload;
        }
      })
      .addCase(updateVendor.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload as string;
      });

    // Delete vendor
    builder
      .addCase(deleteVendor.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteVendor.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = null;
        // Remove the vendor from the list
        state.vendors = state.vendors.filter(vendor => vendor.id !== action.payload);
        // Clear selected vendor if it was deleted
        if (state.selectedVendor?.id === action.payload) {
          state.selectedVendor = null;
        }
        // Clear vendor detail if it was deleted
        if (state.vendorDetail?.id === action.payload) {
          state.vendorDetail = null;
        }
      })
      .addCase(deleteVendor.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload as string;
      });

    // Fetch vendor detail
    builder
      .addCase(fetchVendorDetail.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(fetchVendorDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.vendorDetail = action.payload;
        state.detailError = null;
      })
      .addCase(fetchVendorDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload as string;
      });
  },
});

export const {
  clearErrors,
  setSelectedVendor,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  clearDetailError,
  clearVendorDetail,
} = vendorsSlice.actions;

export default vendorsSlice.reducer;
