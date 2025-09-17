import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import { handleAsyncError } from './dialysisSlice';

// Vehicle interfaces
export interface Vehicle {
  id: number;
  name: string;
  number_plate: string;
  vehicle_type: string;
  donated: boolean;
  donated_by?: string;
  purchase_date?: string;
  purchase_price?: string;
  donation_amount?: string;
  rate_per_km: string;
  current_mileage: number;
  is_donated?: boolean;
  latest_usage?: any;
  created_at: string;
  updated_at: string;
  // Additional fields from list response
  gap_between_vehicle_vehicle_usage_current_mileage?: number;
  usage_count?: number;
  last_used?: string;
}

// Vehicle Usage interfaces
export interface VehicleUsage {
  id: number;
  vehicle: number;
  vehicle_name: string;
  vehicle_number_plate: string;
  vehicle_rate_per_km: string;
  date: string;
  trip_purpose: string;
  current_mileage: number;
  end_mileage: number;
  total_mileage_used: number;
  driver_name: string;
  personal_used_by: string | null;
  paid_amount: string;
  total_amount_per_mileage: string;
  total_amount_to_pay: string;
  created_at: string;
  updated_at: string;
}

export interface CreateVehicleUsageData {
  vehicle: number;
  date: string;
  trip_purpose: string;
  current_mileage: number;
  end_mileage: number;
  driver_name: string;
  personal_used_by?: string | null;
  paid_amount: number;
}

export interface UpdateVehicleUsageData {
  vehicle?: number;
  date?: string;
  trip_purpose?: string;
  current_mileage?: number;
  end_mileage?: number;
  driver_name?: string;
  personal_used_by?: string | null;
  paid_amount?: number;
}

export interface CreateVehicleData {
  name: string;
  number_plate: string;
  vehicle_type: string;
  donated: boolean;
  donated_by?: string;
  purchase_date?: string;
  purchase_price?: number;
  donation_amount?: number;
  rate_per_km: number;
  current_mileage: number;
}

export interface UpdateVehicleData {
  name?: string;
  number_plate?: string;
  vehicle_type?: string;
  donated?: boolean;
  donated_by?: string;
  purchase_date?: string;
  purchase_price?: number;
  donation_amount?: number;
  rate_per_km?: number;
  current_mileage?: number;
}

interface VehicleState {
  vehicles: Vehicle[];
  vehicleUsages: VehicleUsage[];
  isLoading: boolean;
  error: string | null;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  createError: string | null;
  updateError: string | null;
  deleteError: string | null;
  // Vehicle Usage states
  usageLoading: boolean;
  usageError: string | null;
  createUsageLoading: boolean;
  updateUsageLoading: boolean;
  deleteUsageLoading: boolean;
  createUsageError: string | null;
  updateUsageError: string | null;
  deleteUsageError: string | null;
}

const initialState: VehicleState = {
  vehicles: [],
  vehicleUsages: [],
  isLoading: false,
  error: null,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  createError: null,
  updateError: null,
  deleteError: null,
  // Vehicle Usage states
  usageLoading: false,
  usageError: null,
  createUsageLoading: false,
  updateUsageLoading: false,
  deleteUsageLoading: false,
  createUsageError: null,
  updateUsageError: null,
  deleteUsageError: null,
};

// Async thunks
export const fetchVehicles = createAsyncThunk(
  'vehicles/fetchVehicles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get('/vehicles/vehicles/');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to fetch vehicles'));
    }
  }
);

export const createVehicle = createAsyncThunk(
  'vehicles/createVehicle',
  async (vehicleData: CreateVehicleData, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/vehicles/vehicles/', vehicleData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to create vehicle'));
    }
  }
);

export const updateVehicle = createAsyncThunk(
  'vehicles/updateVehicle',
  async ({ id, vehicleData }: { id: number; vehicleData: UpdateVehicleData }, { rejectWithValue }) => {
    try {
      const response = await apiService.put(`/vehicles/vehicles/${id}/`, vehicleData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to update vehicle'));
    }
  }
);

export const deleteVehicle = createAsyncThunk(
  'vehicles/deleteVehicle',
  async (id: number, { rejectWithValue }) => {
    try {
      await apiService.delete(`/vehicles/vehicles/${id}/`);
      return id;
    } catch (error: any) {
      // Handle specific error cases
      return rejectWithValue(handleAsyncError(error, 'Failed to delete vehicle'));
    }
  }
);

// Vehicle Usage async thunks
export const fetchVehicleUsages = createAsyncThunk(
  'vehicles/fetchVehicleUsages',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get('/vehicles/vehicle-usage/');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to fetch vehicle usages'));
    }
  }
);

export const createVehicleUsage = createAsyncThunk(
  'vehicles/createVehicleUsage',
  async (usageData: CreateVehicleUsageData, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/vehicles/vehicle-usage/', usageData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to create vehicle usage'));
    }
  }
);

export const updateVehicleUsage = createAsyncThunk(
  'vehicles/updateVehicleUsage',
  async ({ id, usageData }: { id: number; usageData: UpdateVehicleUsageData }, { rejectWithValue }) => {
    try {
      const response = await apiService.put(`/vehicles/vehicle-usage/${id}/`, usageData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to update vehicle usage'));
    }
  }
);

export const deleteVehicleUsage = createAsyncThunk(
  'vehicles/deleteVehicleUsage',
  async (id: number, { rejectWithValue }) => {
    try {
      await apiService.delete(`/vehicles/vehicle-usage/${id}/`);
      return id;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to delete vehicle usage'));
    }
  }
);

const vehicleSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
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
    clearAllErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },
    // Vehicle Usage error clearing actions
    clearUsageError: (state) => {
      state.usageError = null;
    },
    clearCreateUsageError: (state) => {
      state.createUsageError = null;
    },
    clearUpdateUsageError: (state) => {
      state.updateUsageError = null;
    },
    clearDeleteUsageError: (state) => {
      state.deleteUsageError = null;
    },
    clearAllUsageErrors: (state) => {
      state.usageError = null;
      state.createUsageError = null;
      state.updateUsageError = null;
      state.deleteUsageError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Vehicles
      .addCase(fetchVehicles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vehicles = action.payload;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Vehicle
      .addCase(createVehicle.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createVehicle.fulfilled, (state, action) => {
        state.createLoading = false;
        state.vehicles.push(action.payload);
      })
      .addCase(createVehicle.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload as string;
      })
      // Update Vehicle
      .addCase(updateVehicle.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateVehicle.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.vehicles.findIndex(vehicle => vehicle.id === action.payload.id);
        if (index !== -1) {
          state.vehicles[index] = action.payload;
        }
      })
      .addCase(updateVehicle.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload as string;
      })
      // Delete Vehicle
      .addCase(deleteVehicle.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.vehicles = state.vehicles.filter(vehicle => vehicle.id !== action.payload);
      })
      .addCase(deleteVehicle.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload as string;
      })
      // Fetch Vehicle Usages
      .addCase(fetchVehicleUsages.pending, (state) => {
        state.usageLoading = true;
        state.usageError = null;
      })
      .addCase(fetchVehicleUsages.fulfilled, (state, action) => {
        state.usageLoading = false;
        state.vehicleUsages = action.payload;
      })
      .addCase(fetchVehicleUsages.rejected, (state, action) => {
        state.usageLoading = false;
        state.usageError = action.payload as string;
      })
      // Create Vehicle Usage
      .addCase(createVehicleUsage.pending, (state) => {
        state.createUsageLoading = true;
        state.createUsageError = null;
      })
      .addCase(createVehicleUsage.fulfilled, (state, action) => {
        state.createUsageLoading = false;
        // Don't add the payload directly as it might not include all calculated fields
        // The component will refresh the data to get the complete response
      })
      .addCase(createVehicleUsage.rejected, (state, action) => {
        state.createUsageLoading = false;
        state.createUsageError = action.payload as string;
      })
      // Update Vehicle Usage
      .addCase(updateVehicleUsage.pending, (state) => {
        state.updateUsageLoading = true;
        state.updateUsageError = null;
      })
      .addCase(updateVehicleUsage.fulfilled, (state, action) => {
        state.updateUsageLoading = false;
        // Don't update in place as the payload might not include all calculated fields
        // The component will refresh the data to get the complete response
      })
      .addCase(updateVehicleUsage.rejected, (state, action) => {
        state.updateUsageLoading = false;
        state.updateUsageError = action.payload as string;
      })
      // Delete Vehicle Usage
      .addCase(deleteVehicleUsage.pending, (state) => {
        state.deleteUsageLoading = true;
        state.deleteUsageError = null;
      })
      .addCase(deleteVehicleUsage.fulfilled, (state, action) => {
        state.deleteUsageLoading = false;
        state.vehicleUsages = state.vehicleUsages.filter(usage => usage.id !== action.payload);
      })
      .addCase(deleteVehicleUsage.rejected, (state, action) => {
        state.deleteUsageLoading = false;
        state.deleteUsageError = action.payload as string;
      });
  },
});

export const { 
  clearError, 
  clearCreateError, 
  clearUpdateError, 
  clearDeleteError, 
  clearAllErrors,
  clearUsageError,
  clearCreateUsageError,
  clearUpdateUsageError,
  clearDeleteUsageError,
  clearAllUsageErrors
} = vehicleSlice.actions;

export default vehicleSlice.reducer;
