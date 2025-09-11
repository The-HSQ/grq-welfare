import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { donationAPI } from '../../services/api';

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
  in_rupees: number | null;
  created_at: string;
}

// Create donation interface
export interface CreateDonationData {
  donner: number;
  date: string;
  amount: number;
  purpose: string;
  donation_type: string;
  currency: string;
  in_rupees?: number;
}

// Update donation interface
export interface UpdateDonationData {
  donner?: number;
  date?: string;
  amount?: number;
  purpose?: string;
  donation_type?: string;
  currency?: string;
  in_rupees?: number;
}

// Donations response interface (array response)
export type DonationsArrayResponse = Donation[];

// Create donation response interface
export interface CreateDonationResponse {
  id: number;
  donner: number;
  donner_name: string;
  date: string;
  amount: number;
  purpose: string;
  purpose_display: string;
  donation_type: string;
  currency: string;
  in_rupees: number | null;
  created_at: string;
}

// Update donation response interface
export interface UpdateDonationResponse {
  id: number;
  donner: number;
  donner_name: string;
  date: string;
  amount: number;
  purpose: string;
  purpose_display: string;
  donation_type: string;
  currency: string;
  in_rupees: number | null;
  created_at: string;
}

// Donations state interface
export interface DonationsState {
  donations: Donation[];
  loading: boolean;
  error: string | null;
  createLoading: boolean;
  createError: string | null;
  updateLoading: boolean;
  updateError: string | null;
  deleteLoading: boolean;
  deleteError: string | null;
  selectedDonation: Donation | null;
  donationDetail: Donation | null;
  detailLoading: boolean;
  detailError: string | null;
}

// Initial state
const initialState: DonationsState = {
  donations: [],
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
  updateLoading: false,
  updateError: null,
  deleteLoading: false,
  deleteError: null,
  selectedDonation: null,
  donationDetail: null,
  detailLoading: false,
  detailError: null,
};

// Async thunks
export const fetchDonations = createAsyncThunk(
  'donations/fetchDonations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await donationAPI.getDonations();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to fetch donations'));
    }
  }
);

export const createDonation = createAsyncThunk(
  'donations/createDonation',
  async (donationData: CreateDonationData, { rejectWithValue }) => {
    try {
      console.log('API call - Creating donation with data:', donationData);
      const response = await donationAPI.createDonation(donationData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to create donation'));
    }
  }
);

export const updateDonation = createAsyncThunk(
  'donations/updateDonation',
  async ({ donationId, donationData }: { donationId: number; donationData: UpdateDonationData }, { rejectWithValue }) => {
    try {
      console.log('API call - Updating donation with data:', donationData);
      const response = await donationAPI.updateDonation(donationId, donationData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to update donation'));
    }
  }
);

export const deleteDonation = createAsyncThunk(
  'donations/deleteDonation',
  async (donationId: number, { rejectWithValue }) => {
    try {
      await donationAPI.deleteDonation(donationId);
      return donationId;
    } catch (error: any) {
      const errorData = error.response?.data;
      if (error.response?.status === 404) {
        return rejectWithValue('Donation not found');
      }
      return rejectWithValue(handleAsyncError(error, 'Failed to delete donation'));
    }
  }
);

export const fetchDonationDetail = createAsyncThunk(
  'donations/fetchDonationDetail',
  async (donationId: number, { rejectWithValue }) => {
    try {
      const response = await donationAPI.getDonationById(donationId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to fetch donation details'));
    }
  }
);

// Donations slice
const donationsSlice = createSlice({
  name: 'donations',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.detailError = null;
    },
    setSelectedDonation: (state, action: PayloadAction<Donation | null>) => {
      state.selectedDonation = action.payload;
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
    clearDonationDetail: (state) => {
      state.donationDetail = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch donations
    builder
      .addCase(fetchDonations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDonations.fulfilled, (state, action) => {
        state.loading = false;
        state.donations = action.payload;
        state.error = null;
      })
      .addCase(fetchDonations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create donation
    builder
      .addCase(createDonation.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createDonation.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createError = null;
        // Add the new donation to the list
        state.donations.unshift(action.payload);
      })
      .addCase(createDonation.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload as string;
      });

    // Update donation
    builder
      .addCase(updateDonation.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateDonation.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateError = null;
        // Update the donation in the list
        const index = state.donations.findIndex(donation => donation.id === action.payload.id);
        if (index !== -1) {
          state.donations[index] = action.payload;
        }
        // Update selected donation if it's the same
        if (state.selectedDonation?.id === action.payload.id) {
          state.selectedDonation = action.payload;
        }
        // Update donation detail if it's the same
        if (state.donationDetail?.id === action.payload.id) {
          state.donationDetail = action.payload;
        }
      })
      .addCase(updateDonation.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload as string;
      });

    // Delete donation
    builder
      .addCase(deleteDonation.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteDonation.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = null;
        // Remove the donation from the list
        state.donations = state.donations.filter(donation => donation.id !== action.payload);
        // Clear selected donation if it was deleted
        if (state.selectedDonation?.id === action.payload) {
          state.selectedDonation = null;
        }
        // Clear donation detail if it was deleted
        if (state.donationDetail?.id === action.payload) {
          state.donationDetail = null;
        }
      })
      .addCase(deleteDonation.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload as string;
      });

    // Fetch donation detail
    builder
      .addCase(fetchDonationDetail.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(fetchDonationDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.donationDetail = action.payload;
        state.detailError = null;
      })
      .addCase(fetchDonationDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload as string;
      });
  },
});

export const {
  clearErrors,
  setSelectedDonation,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  clearDetailError,
  clearDonationDetail,
} = donationsSlice.actions;

export default donationsSlice.reducer;
