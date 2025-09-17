import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { donorAPI } from '../../services/api';
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

// Donation interface
export interface Donation {
  id: number;
  donner: number;
  donner_name: string;
  date: string;
  amount: number;
  purpose: string;
  purpose_display: string;
  donation_type: string;
  currency: string;
  in_rupees: number;
  created_at: string;
}

// Donor interface
export interface Donor {
  id: number;
  name: string;
  contact: string;
  address: string;
  image: string;
  created_at: string;
  donations?: Donation[];
}

// Create donor interface
export interface CreateDonorData {
  name: string;
  contact: string;
  address: string;
  image: File;
}

// Update donor interface
export interface UpdateDonorData {
  name?: string;
  contact?: string;
  address?: string;
  image?: File;
}

// Donors response interface (array response)
export type DonorsArrayResponse = Donor[];

// Create donor response interface
export interface CreateDonorResponse {
  id: number;
  name: string;
  contact: string;
  address: string;
  image: string;
  created_at: string;
}

// Update donor response interface
export interface UpdateDonorResponse {
  id: number;
  name: string;
  contact: string;
  address: string;
  image: string;
  created_at: string;
}

// Donors state interface
export interface DonorsState {
  donors: Donor[];
  loading: boolean;
  error: string | null;
  createLoading: boolean;
  createError: string | null;
  updateLoading: boolean;
  updateError: string | null;
  deleteLoading: boolean;
  deleteError: string | null;
  selectedDonor: Donor | null;
  donorDetail: Donor | null;
  detailLoading: boolean;
  detailError: string | null;
}

// Initial state
const initialState: DonorsState = {
  donors: [],
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
  updateLoading: false,
  updateError: null,
  deleteLoading: false,
  deleteError: null,
  selectedDonor: null,
  donorDetail: null,
  detailLoading: false,
  detailError: null,
};

// Async thunks
export const fetchDonors = createAsyncThunk(
  'donors/fetchDonors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await donorAPI.getDonors();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to fetch donors'));
    }
  }
);

export const createDonor = createAsyncThunk(
  'donors/createDonor',
  async (donorData: FormData, { rejectWithValue }) => {
    try {
      console.log('API call - Creating donor with data:', donorData);
      const response = await donorAPI.createDonor(donorData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to create donor'));
    }
  }
);

export const updateDonor = createAsyncThunk(
  'donors/updateDonor',
  async ({ donorId, donorData }: { donorId: number; donorData: FormData }, { rejectWithValue }) => {
    try {
      console.log('API call - Updating donor with data:', donorData);
      const response = await donorAPI.updateDonor(donorId, donorData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to update donor'));
    }
  }
);

export const deleteDonor = createAsyncThunk(
  'donors/deleteDonor',
  async (donorId: number, { rejectWithValue }) => {
    try {
      await donorAPI.deleteDonor(donorId);
      return donorId;
    } catch (error: any) {
      const errorData = error.response?.data;
      if (error.response?.status === 404) {
        return rejectWithValue('Donor not found');
      }
      return rejectWithValue(handleAsyncError(error, 'Failed to delete donor'));
    }
  }
);

export const fetchDonorDetail = createAsyncThunk(
  'donors/fetchDonorDetail',
  async (donorId: number, { rejectWithValue }) => {
    try {
      const response = await donorAPI.getDonorById(donorId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to fetch donor details'));
    }
  }
);

// Donors slice
const donorsSlice = createSlice({
  name: 'donors',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.detailError = null;
    },
    setSelectedDonor: (state, action: PayloadAction<Donor | null>) => {
      state.selectedDonor = action.payload;
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
    clearDonorDetail: (state) => {
      state.donorDetail = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch donors
    builder
      .addCase(fetchDonors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDonors.fulfilled, (state, action) => {
        state.loading = false;
        state.donors = action.payload;
        state.error = null;
      })
      .addCase(fetchDonors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create donor
    builder
      .addCase(createDonor.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createDonor.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createError = null;
        // Add the new donor to the list
        state.donors.unshift(action.payload);
      })
      .addCase(createDonor.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload as string;
      });

    // Update donor
    builder
      .addCase(updateDonor.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateDonor.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateError = null;
        // Update the donor in the list
        const index = state.donors.findIndex(donor => donor.id === action.payload.id);
        if (index !== -1) {
          state.donors[index] = action.payload;
        }
        // Update selected donor if it's the same
        if (state.selectedDonor?.id === action.payload.id) {
          state.selectedDonor = action.payload;
        }
        // Update donor detail if it's the same
        if (state.donorDetail?.id === action.payload.id) {
          state.donorDetail = action.payload;
        }
      })
      .addCase(updateDonor.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload as string;
      });

    // Delete donor
    builder
      .addCase(deleteDonor.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteDonor.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = null;
        // Remove the donor from the list
        state.donors = state.donors.filter(donor => donor.id !== action.payload);
        // Clear selected donor if it was deleted
        if (state.selectedDonor?.id === action.payload) {
          state.selectedDonor = null;
        }
        // Clear donor detail if it was deleted
        if (state.donorDetail?.id === action.payload) {
          state.donorDetail = null;
        }
      })
      .addCase(deleteDonor.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload as string;
      });

    // Fetch donor detail
    builder
      .addCase(fetchDonorDetail.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(fetchDonorDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.donorDetail = action.payload;
        state.detailError = null;
      })
      .addCase(fetchDonorDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload as string;
      });
  },
});

export const {
  clearErrors,
  setSelectedDonor,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  clearDetailError,
  clearDonorDetail,
} = donorsSlice.actions;

export default donorsSlice.reducer;
