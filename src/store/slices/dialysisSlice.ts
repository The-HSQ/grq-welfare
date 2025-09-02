import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { dialysisAPI } from '../../services/api';

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

// Ward interface
export interface Ward {
  id: string;
  ward_name: string;
  is_available: boolean;
  created_at: string;
  available_beds_count: number;
  total_beds_count: number;
}

// Bed interface
export interface Bed {
  id: string;
  bed_name: string;
  ward: string;
  ward_name: string;
  ward_details: {
    id: string;
    ward_name: string;
    is_available: boolean;
    created_at: string;
    available_beds_count: number;
    total_beds_count: number;
  };
  is_available: boolean;
  created_at: string;
}

// Shift interface
export interface Shift {
  id: string;
  shift_no: string;
  start_time: string;
  end_time: string;
  created_at: string;
}

// Machine interface
export interface Machine {
  id: string;
  machine_name: string;
  machine_type: string;
  status: string;
  maintenance_date: string;
  next_maintenance_date: string;
  disinfection_chemical_change: string | null;
  dia_safe_filter_change: string | null;
  created_at: string;
  warnings: any[];
  active_warnings_count: number;
}

// Warning interface
export interface Warning {
  id: string;
  machine: string;
  warning_description: string;
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
  fixes: any[];
  fix_count: number;
}

// Warning Fix interface
export interface WarningFix {
  id: string;
  warning: string;
  fix_warning_description: string;
  created_at: string;
}

// Machines response interface (for paginated response)
export interface MachinesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Machine[];
}

// Simple machines array response (for new API format)
export type MachinesArrayResponse = Machine[];

// Create ward interface
export interface CreateWardData {
  ward_name: string;
}

// Update ward interface
export interface UpdateWardData {
  ward_name?: string;
}

// Create bed interface
export interface CreateBedData {
  bed_name: string;
  ward: string;
}

// Update bed interface
export interface UpdateBedData {
  bed_name?: string;
  ward?: string;
}

// Create shift interface
export interface CreateShiftData {
  shift_no: string;
  start_time: string;
  end_time: string;
}

// Update shift interface
export interface UpdateShiftData {
  shift_no?: string;
  start_time?: string;
  end_time?: string;
}

// Create machine interface
export interface CreateMachineData {
  machine_name: string;
  machine_type: string;
  status: string;
  maintenance_date: string;
  next_maintenance_date: string;
  disinfection_chemical_change?: string;
  dia_safe_filter_change?: string;
}

// Update machine interface
export interface UpdateMachineData {
  machine_name?: string;
  machine_type?: string;
  status?: string;
  maintenance_date?: string;
  next_maintenance_date?: string;
  disinfection_chemical_change?: string;
  dia_safe_filter_change?: string;
}

// Create warning interface
export interface CreateWarningData {
  machine: string;
  warning_description: string;
}

// Update warning interface
export interface UpdateWarningData {
  machine?: string;
  warning_description?: string;
}

// Create warning fix interface
export interface CreateWarningFixData {
  warning: string;
  fix_warning_description: string;
}

// Update warning fix interface
export interface UpdateWarningFixData {
  warning?: string;
  fix_warning_description?: string;
}

// Product interface
export interface Product {
  id: string;
  item_name: string;
  item_type: string;
  quantity_type: string;
  available_items: number;
  created_at: string;
  quantity?: number;
  new_quantity?: number;
  used_items?: number;
  updated_at?: string;
}

// Products response interface
export interface ProductsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

// Simple products array response (for new API format)
export type ProductsArrayResponse = Product[];

// Create product interface
export interface CreateProductData {
  item_name: string;
  item_type: string;
  quantity: number;
  quantity_type: string;
  used_items: number;
}

// Update product interface
export interface UpdateProductData {
  item_name?: string;
  item_type?: string;
  quantity?: number;
  quantity_type?: string;
  used_items?: number;
}

// Patient interface
export interface Patient {
  id: string;
  name: string;
  nic: string;
  phone: string;
  address: string;
  image: string;
  dialysis_per_week: number;
  next_dialysis_date: string;
  manually_set_dialysis_date: string;
  next_dialysis_info?: {
    date: string;
    formatted_date: string;
  };
  zakat_eligible: boolean;
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
  relative_name: string;
  relative_nic: string;
  relative_phone: string;
  relative_address: string;
  document_path: string;
  uploaded_at: string;
  dialysis_sessions?: any[];
  dialysis_count?: number;
  last_dialysis_date?: string | null;
}

// Patient with dialysis history response interface
export interface PatientWithDialysisHistory {
  patient: Patient;
  dialysis_history: Dialysis[];
}

// Dialysis interface
export interface Dialysis {
  id: string;
  patient: string;
  patient_name: string;
  patient_image: string;
  bed: string;
  bed_name: string;
  machine: string;
  machine_name: string;
  machine_status: string;
  shift: string;
  shift_no: string;
  start_time: string;
  end_time: string;
  blood_pressure: string;
  last_blood_pressure: string;
  weight: string;
  last_weight: string;
  technician_comment: string;
  doctor_comment: string;
  created_at: string;
}

// Today's dialysis session interface (from sessions_by_shift)
export interface TodayDialysisSession {
  dialysis_id: string;
  patient_image: string;
  patient_name: string;
  patient_nic: string;
  bed_name: string;
  ward_name: string;
  machine_name: string;
  start_time: string;
  end_time: string;
  blood_pressure: string;
  last_blood_pressure: string;
  weight: string;
  last_weight: string;
  technician_comment: string;
  doctor_comment: string;
  created_at: string;
}

// Today's dialysis response interface
export interface TodayDialysisResponse {
  date: string;
  total_sessions: number;
  sessions_by_shift: {
    [shiftName: string]: TodayDialysisSession[];
  };
  all_sessions: Dialysis[];
}

// Upcoming patient interface
export interface UpcomingPatient {
  patient_id: string;
  image: string;
  name: string;
  nic: string;
  phone: string;
  address: string;
  dialysis_per_week: number;
  next_dialysis_date: string;
  manually_set_dialysis_date: string;
  zakat_eligible: boolean;
  created_at: string;
  updated_at: string;
  days_until_dialysis: number;
  is_past_due: boolean;
}

// Upcoming patients response interface
export interface UpcomingPatientsResponse {
  total_patients: number;
  past_due_patients_count: number;
  upcoming_patients_count: number;
  date_range: {
    from_date: string;
    to_date: string;
    days_ahead: number;
  };
  past_due_patients: UpcomingPatient[];
  upcoming_patients: UpcomingPatient[];
  patients_by_date: Array<{
    date: string;
    total_patients: number;
    patients: UpcomingPatient[];
  }>;
  all_patients: Patient[];
}

// Create dialysis interface
export interface CreateDialysisData {
  patient: string;
  bed: string;
  machine: string;
  shift: string;
  start_time: string;
  end_time: string;
  blood_pressure: string;
  last_blood_pressure: string;
  weight: string;
  last_weight: string;
  technician_comment: string;
  doctor_comment: string;
  created_at: string;
}

// Update dialysis interface
export interface UpdateDialysisData {
  patient?: string;
  bed?: string;
  machine?: string;
  shift?: string;
  start_time?: string;
  end_time?: string;
  blood_pressure?: string;
  last_blood_pressure?: string;
  weight?: string;
  last_weight?: string;
  technician_comment?: string;
  doctor_comment?: string;
  created_at?: string;
}

// Create patient interface
export interface CreatePatientData {
  name: string;
  nic: string;
  phone: string;
  address: string;
  dialysis_per_week: number;
  next_dialysis_date: string;
  manually_set_dialysis_date: string;
  zakat_eligible: boolean;
  relative_name: string;
  relative_nic: string;
  relative_phone: string;
  relative_address: string;
  image?: File;
  document_path?: File;
  created_at?: string;
}

// Update patient interface
export interface UpdatePatientData {
  name?: string;
  nic?: string;
  phone?: string;
  address?: string;
  dialysis_per_week?: number;
  next_dialysis_date?: string;
  manually_set_dialysis_date?: string;
  zakat_eligible?: boolean;
  relative_name?: string;
  relative_nic?: string;
  relative_phone?: string;
  relative_address?: string;
  image?: File;
  document_path?: File;
  created_at?: string;
}

// Dashboard stats interface
export interface DashboardStats {
  total_patients: number;
  active_machines: number;
  working_machines: number;
  not_working_machines: number;
  warning_machines: number;
  available_beds: number;
  total_beds: number;
  total_wards: number;
  available_wards: number;
  total_warnings: number;
  active_warnings: number;
  resolved_warnings: number;
  total_products: number;
  dialysis_machines: number;
  ro_machines: number;
  todays_dialysis: number;
  upcoming_dialysis: number;
  total_dialysis: number;
}

interface DialysisState {
  dashboardStats: DashboardStats | null;
  products: ProductsResponse | null;
  productsArray: ProductsArrayResponse | null;
  machines: MachinesResponse | null;
  machinesArray: MachinesArrayResponse | null;
  warnings: Warning[] | null;
  warningFixes: WarningFix[] | null;
  wards: Ward[] | null;
  beds: Bed[] | null;
  shifts: Shift[] | null;
  patients: Patient[] | null;
  dialysis: Dialysis[] | null;
  todayDialysis: TodayDialysisResponse | null;
  upcomingPatients: UpcomingPatientsResponse | null;
  currentProduct: Product | null;
  currentMachine: Machine | null;
  currentWarning: Warning | null;
  currentWarningFix: WarningFix | null;
  currentWard: Ward | null;
  currentBed: Bed | null;
  currentShift: Shift | null;
  currentPatient: Patient | null;
  currentDialysis: Dialysis | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isAddingQuantity: boolean;
  isUsingItems: boolean;
  error: string | null;
}

const initialState: DialysisState = {
  dashboardStats: null,
  products: null,
  productsArray: null,
  machines: null,
  machinesArray: null,
  warnings: null,
  warningFixes: null,
  wards: null,
  beds: null,
  shifts: null,
  patients: null,
  dialysis: null,
  todayDialysis: null,
  upcomingPatients: null,
  currentProduct: null,
  currentMachine: null,
  currentWarning: null,
  currentWarningFix: null,
  currentWard: null,
  currentBed: null,
  currentShift: null,
  currentPatient: null,
  currentDialysis: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isAddingQuantity: false,
  isUsingItems: false,
  error: null,
};

// Async thunk to fetch dashboard stats
export const fetchDashboardStats = createAsyncThunk(
  'dialysis/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dialysisAPI.getDashboardStats();
      return response.data;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to fetch dashboard stats'));
      }
  }
);

// Async thunk to fetch products
export const fetchProducts = createAsyncThunk(
  'dialysis/fetchProducts',
  async (params: { page?: number; page_size?: number } | undefined, { rejectWithValue }) => {
    try {
      const response = await dialysisAPI.getProducts(params);
      // Handle both array response and paginated response
      if (Array.isArray(response.data)) {
        return { type: 'array', data: response.data };
      } else {
        return { type: 'paginated', data: response.data };
      }
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to fetch products'));
      }
  }
);

// Async thunk to create product
export const createProduct = createAsyncThunk(
  'dialysis/createProduct',
  async (productData: CreateProductData, { rejectWithValue }) => {
    try {
      const response = await dialysisAPI.createProduct(productData);
      return response.data;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to create product'));
      }
  }
);

// Async thunk to update product
export const updateProduct = createAsyncThunk(
  'dialysis/updateProduct',
  async ({ id, productData }: { id: string; productData: UpdateProductData }, { rejectWithValue }) => {
    try {
      const response = await dialysisAPI.updateProduct(id, productData);
      return response.data;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to update product'));
      }
  }
);

// Async thunk to delete product
export const deleteProduct = createAsyncThunk(
  'dialysis/deleteProduct',
  async (id: string, { rejectWithValue }) => {
    try {
      await dialysisAPI.deleteProduct(id);
      return id;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to delete product'));
      }
  }
);

// Async thunk to add quantity to product
export const addQuantity = createAsyncThunk(
  'dialysis/addQuantity',
  async ({ id, additional_quantity }: { id: string; additional_quantity: number }, { rejectWithValue }) => {
    try {
      const response = await dialysisAPI.addQuantity(id, { additional_quantity });
      return response.data;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to add quantity'));
      }
  }
);

// Async thunk to use items from product
export const useItems = createAsyncThunk(
  'dialysis/useItems',
  async ({ id, items_to_use }: { id: string; items_to_use: number }, { rejectWithValue }) => {
    try {
      const response = await dialysisAPI.useItems(id, { items_to_use });
      return response.data;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to use items'));
      }
  }
);

// Async thunk to fetch machines
export const fetchMachines = createAsyncThunk(
  'dialysis/fetchMachines',
  async (params: { page?: number; page_size?: number } | undefined, { rejectWithValue }) => {
    try {
      const response = await dialysisAPI.getMachines(params);
      // Handle both array response and paginated response
      if (Array.isArray(response.data)) {
        return { type: 'array', data: response.data };
      } else {
        return { type: 'paginated', data: response.data };
      }
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to fetch machines'));
      }
  }
);

// Async thunk to create machine
export const createMachine = createAsyncThunk(
  'dialysis/createMachine',
  async (machineData: CreateMachineData, { rejectWithValue }) => {
    try {
      const response = await dialysisAPI.createMachine(machineData);
      return response.data;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to create machine'));
      }
  }
);

// Async thunk to update machine
export const updateMachine = createAsyncThunk(
  'dialysis/updateMachine',
  async ({ id, machineData }: { id: string; machineData: UpdateMachineData }, { rejectWithValue }) => {
    try {
      const response = await dialysisAPI.updateMachine(id, machineData);
      return response.data;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to update machine'));
      }
  }
);

// Async thunk to delete machine
export const deleteMachine = createAsyncThunk(
  'dialysis/deleteMachine',
  async (id: string, { rejectWithValue }) => {
    try {
      await dialysisAPI.deleteMachine(id);
      return id;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to delete machine'));
      }
  }
);

// Async thunk to fetch wards
export const fetchWards = createAsyncThunk(
  'dialysis/fetchWards',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dialysisAPI.getWards();
      return response.data;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to fetch wards'));
      }
  }
);

// Async thunk to create ward
export const createWard = createAsyncThunk(
  'dialysis/createWard',
  async (wardData: CreateWardData, { rejectWithValue }) => {
    try {
      const response = await dialysisAPI.createWard(wardData);
      return response.data;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to create ward'));
      }
  }
);

// Async thunk to update ward
export const updateWard = createAsyncThunk(
  'dialysis/updateWard',
  async ({ id, wardData }: { id: string; wardData: UpdateWardData }, { rejectWithValue }) => {
    try {
      const response = await dialysisAPI.updateWard(id, wardData);
      return response.data;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to update ward'));
      }
  }
);

// Async thunk to delete ward
export const deleteWard = createAsyncThunk(
  'dialysis/deleteWard',
  async (id: string, { rejectWithValue }) => {
    try {
      await dialysisAPI.deleteWard(id);
      return id;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to delete ward'));
      }
  }
);

// Async thunk to fetch beds
export const fetchBeds = createAsyncThunk(
  'dialysis/fetchBeds',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dialysisAPI.getBeds();
      return response.data;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to fetch beds'));
      }
  }
);

// Async thunk to create bed
export const createBed = createAsyncThunk(
  'dialysis/createBed',
  async (bedData: CreateBedData, { rejectWithValue }) => {
    try {
      const response = await dialysisAPI.createBed(bedData);
      return response.data;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to create bed'));
      }
  }
);

// Async thunk to update bed
export const updateBed = createAsyncThunk(
  'dialysis/updateBed',
  async ({ id, bedData }: { id: string; bedData: UpdateBedData }, { rejectWithValue }) => {
    try {
      const response = await dialysisAPI.updateBed(id, bedData);
      return response.data;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to update bed'));
      }
  }
);

// Async thunk to delete bed
export const deleteBed = createAsyncThunk(
  'dialysis/deleteBed',
  async (id: string, { rejectWithValue }) => {
    try {
      await dialysisAPI.deleteBed(id);
      return id;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to delete bed'));
      }
  }
);

// Async thunk to fetch shifts
export const fetchShifts = createAsyncThunk(
  'dialysis/fetchShifts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dialysisAPI.getShifts();
      return response.data;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to fetch shifts'));
      }
  }
);

// Async thunk to create shift
export const createShift = createAsyncThunk(
  'dialysis/createShift',
  async (shiftData: CreateShiftData, { rejectWithValue }) => {
    try {
      const response = await dialysisAPI.createShift(shiftData);
      return response.data;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to create shift'));
      }
  }
);

// Async thunk to update shift
export const updateShift = createAsyncThunk(
  'dialysis/updateShift',
  async ({ id, shiftData }: { id: string; shiftData: UpdateShiftData }, { rejectWithValue }) => {
    try {
      const response = await dialysisAPI.updateShift(id, shiftData);
      return response.data;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to update shift'));
      }
  }
);

// Async thunk to delete shift
export const deleteShift = createAsyncThunk(
  'dialysis/deleteShift',
  async (id: string, { rejectWithValue }) => {
    try {
      await dialysisAPI.deleteShift(id);
      return id;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to delete shift'));
      }
  }
);

// Async thunk to fetch warnings
export const fetchWarnings = createAsyncThunk(
  'dialysis/fetchWarnings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dialysisAPI.getWarnings();
      return response.data;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to fetch warnings'));
      }
  }
);

// Async thunk to create warning
export const createWarning = createAsyncThunk(
  'dialysis/createWarning',
  async (warningData: CreateWarningData, { rejectWithValue }) => {
    try {
      const response = await dialysisAPI.createWarning(warningData);
      return response.data;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to create warning'));
      }
  }
);

// Async thunk to update warning
export const updateWarning = createAsyncThunk(
  'dialysis/updateWarning',
  async ({ id, warningData }: { id: string; warningData: UpdateWarningData }, { rejectWithValue }) => {
    try {
      const response = await dialysisAPI.updateWarning(id, warningData);
      return response.data;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to update warning'));
      }
  }
);

// Async thunk to delete warning
export const deleteWarning = createAsyncThunk(
  'dialysis/deleteWarning',
  async (id: string, { rejectWithValue }) => {
    try {
      await dialysisAPI.deleteWarning(id);
      return id;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to delete warning'));
      }
  }
);

// Async thunk to fetch warning fixes
export const fetchWarningFixes = createAsyncThunk(
  'dialysis/fetchWarningFixes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dialysisAPI.getWarningFixes();
      return response.data;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to fetch warning fixes'));
      }
  }
);

// Async thunk to create warning fix
export const createWarningFix = createAsyncThunk(
  'dialysis/createWarningFix',
  async (warningFixData: CreateWarningFixData, { rejectWithValue }) => {
    try {
      const response = await dialysisAPI.createWarningFix(warningFixData);
      return response.data;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to create warning fix'));
      }
  }
);

// Async thunk to update warning fix
export const updateWarningFix = createAsyncThunk(
  'dialysis/updateWarningFix',
  async ({ id, warningFixData }: { id: string; warningFixData: UpdateWarningFixData }, { rejectWithValue }) => {
    try {
      const response = await dialysisAPI.updateWarningFix(id, warningFixData);
      return response.data;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to update warning fix'));
      }
  }
);

// Async thunk to delete warning fix
export const deleteWarningFix = createAsyncThunk(
  'dialysis/deleteWarningFix',
  async (id: string, { rejectWithValue }) => {
    try {
      await dialysisAPI.deleteWarningFix(id);
      return id;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to delete warning fix'));
      }
  }
);

// Async thunk to resolve warning
export const resolveWarning = createAsyncThunk(
  'dialysis/resolveWarning',
  async (warningId: string, { rejectWithValue }) => {
    try {
      const response = await dialysisAPI.resolveWarning(warningId);
      return response.data;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to resolve warning'));
      }
  }
);

// Async thunk to fetch patients
export const fetchPatients = createAsyncThunk(
  'dialysis/fetchPatients',
  async (params: { page?: number; page_size?: number } | undefined, { rejectWithValue }) => {
    try {
      const response = await dialysisAPI.getPatients(params);
      return response.data;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to fetch patients'));
      }
  }
);

// Async thunk to create patient
export const createPatient = createAsyncThunk(
  'dialysis/createPatient',
  async (patientData: FormData, { rejectWithValue }) => {
    try {
      const response = await dialysisAPI.createPatient(patientData);
      return response.data;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to create patient'));
      }
  }
);

// Async thunk to update patient
export const updatePatient = createAsyncThunk(
  'dialysis/updatePatient',
  async ({ id, patientData }: { id: string; patientData: FormData }, { rejectWithValue }) => {
    try {
      const response = await dialysisAPI.updatePatient(id, patientData);
      return response.data;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to update patient'));
      }
  }
);

// Async thunk to delete patient
export const deletePatient = createAsyncThunk(
  'dialysis/deletePatient',
  async (id: string, { rejectWithValue }) => {
    try {
      await dialysisAPI.deletePatient(id);
      return id;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to delete patient'));
      }
  }
);

// Async thunk to get patient by ID with dialysis history
export const getPatientById = createAsyncThunk(
  'dialysis/getPatientById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await dialysisAPI.getPatientById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to get patient'));
    }
  }
);

// Async thunk to fetch dialysis sessions
export const fetchDialysis = createAsyncThunk(
  'dialysis/fetchDialysis',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dialysisAPI.getDialysis();
      return response.data;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to fetch dialysis sessions'));
      }
  }
);

// Async thunk to create dialysis session
export const createDialysis = createAsyncThunk(
  'dialysis/createDialysis',
  async (dialysisData: CreateDialysisData, { rejectWithValue }) => {
    try {
      const response = await dialysisAPI.createDialysis(dialysisData);
      return response.data;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to create dialysis session'));
      }
  }
);

// Async thunk to update dialysis session
export const updateDialysis = createAsyncThunk(
  'dialysis/updateDialysis',
  async ({ id, dialysisData }: { id: string; dialysisData: UpdateDialysisData }, { rejectWithValue }) => {
    try {
      const response = await dialysisAPI.updateDialysis(id, dialysisData);
      return response.data;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to update dialysis session'));
      }
  }
);

// Async thunk to delete dialysis session
export const deleteDialysis = createAsyncThunk(
  'dialysis/deleteDialysis',
  async (id: string, { rejectWithValue }) => {
    try {
      await dialysisAPI.deleteDialysis(id);
      return id;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to delete dialysis session'));
      }
  }
);

// Async thunk to get dialysis session by ID
export const getDialysisById = createAsyncThunk(
  'dialysis/getDialysisById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await dialysisAPI.getDialysisById(id);
      return response.data;
          } catch (error: any) {
        return rejectWithValue(handleAsyncError(error, 'Failed to get dialysis session'));
      }
  }
);

// Async thunk to fetch today's dialysis sessions
export const fetchTodayDialysis = createAsyncThunk(
  'dialysis/fetchTodayDialysis',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dialysisAPI.getTodayDialysis();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to fetch today\'s dialysis sessions'));
    }
  }
);

// Async thunk to fetch upcoming patients
export const fetchUpcomingPatients = createAsyncThunk(
  'dialysis/fetchUpcomingPatients',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dialysisAPI.getUpcomingPatients();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleAsyncError(error, 'Failed to fetch upcoming patients'));
    }
  }
);

const dialysisSlice = createSlice({
  name: 'dialysis',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDashboardStats: (state) => {
      state.dashboardStats = null;
    },
    clearProducts: (state) => {
      state.products = null;
    },
    clearProductsArray: (state) => {
      state.productsArray = null;
    },
    setCurrentProduct: (state, action: PayloadAction<Product | null>) => {
      state.currentProduct = action.payload;
    },
    setCurrentMachine: (state, action: PayloadAction<Machine | null>) => {
      state.currentMachine = action.payload;
    },
    setCurrentWard: (state, action: PayloadAction<Ward | null>) => {
      state.currentWard = action.payload;
    },
    setCurrentBed: (state, action: PayloadAction<Bed | null>) => {
      state.currentBed = action.payload;
    },
    setCurrentShift: (state, action: PayloadAction<Shift | null>) => {
      state.currentShift = action.payload;
    },
    setCurrentWarning: (state, action: PayloadAction<Warning | null>) => {
      state.currentWarning = action.payload;
    },
    setCurrentWarningFix: (state, action: PayloadAction<WarningFix | null>) => {
      state.currentWarningFix = action.payload;
    },
    setCurrentPatient: (state, action: PayloadAction<Patient | null>) => {
      state.currentPatient = action.payload;
    },
    setCurrentDialysis: (state, action: PayloadAction<Dialysis | null>) => {
      state.currentDialysis = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action: PayloadAction<DashboardStats>) => {
        state.isLoading = false;
        state.dashboardStats = action.payload;
        state.error = null;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch dashboard stats';
      })
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<{ type: string; data: any }>) => {
        state.isLoading = false;
        if (action.payload.type === 'array') {
          state.productsArray = action.payload.data;
          state.products = null;
        } else {
          state.products = action.payload.data;
          state.productsArray = null;
        }
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch products';
      })
      // Create product
      .addCase(createProduct.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.isCreating = false;
        if (state.products) {
          state.products.results.unshift(action.payload);
          state.products.count += 1;
        }
        if (state.productsArray) {
          state.productsArray.unshift(action.payload);
        }
        state.error = null;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string || 'Failed to create product';
      })
      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.isUpdating = false;
        if (state.products) {
          const index = state.products.results.findIndex(p => p.id === action.payload.id);
          if (index !== -1) {
            state.products.results[index] = action.payload;
          }
        }
        if (state.productsArray) {
          const index = state.productsArray.findIndex(p => p.id === action.payload.id);
          if (index !== -1) {
            state.productsArray[index] = action.payload;
          }
        }
        state.error = null;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string || 'Failed to update product';
      })
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action: PayloadAction<string>) => {
        state.isDeleting = false;
        if (state.products) {
          state.products.results = state.products.results.filter(p => p.id !== action.payload);
          state.products.count -= 1;
        }
        if (state.productsArray) {
          state.productsArray = state.productsArray.filter(p => p.id !== action.payload);
        }
        state.error = null;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string || 'Failed to delete product';
      })
      // Add quantity
      .addCase(addQuantity.pending, (state) => {
        state.isAddingQuantity = true;
        state.error = null;
      })
      .addCase(addQuantity.fulfilled, (state, action: PayloadAction<Product>) => {
        state.isAddingQuantity = false;
        if (state.products) {
          const index = state.products.results.findIndex(p => p.id === action.payload.id);
          if (index !== -1) {
            state.products.results[index] = action.payload;
          }
        }
        if (state.productsArray) {
          const index = state.productsArray.findIndex(p => p.id === action.payload.id);
          if (index !== -1) {
            state.productsArray[index] = action.payload;
          }
        }
        state.error = null;
      })
      .addCase(addQuantity.rejected, (state, action) => {
        state.isAddingQuantity = false;
        state.error = action.payload as string || 'Failed to add quantity';
      })
      // Use items
      .addCase(useItems.pending, (state) => {
        state.isUsingItems = true;
        state.error = null;
      })
      .addCase(useItems.fulfilled, (state, action: PayloadAction<Product>) => {
        state.isUsingItems = false;
        if (state.products) {
          const index = state.products.results.findIndex(p => p.id === action.payload.id);
          if (index !== -1) {
            state.products.results[index] = action.payload;
          }
        }
        if (state.productsArray) {
          const index = state.productsArray.findIndex(p => p.id === action.payload.id);
          if (index !== -1) {
            state.productsArray[index] = action.payload;
          }
        }
        state.error = null;
      })
      .addCase(useItems.rejected, (state, action) => {
        state.isUsingItems = false;
        state.error = action.payload as string || 'Failed to use items';
      })
      // Fetch machines
      .addCase(fetchMachines.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMachines.fulfilled, (state, action: PayloadAction<{ type: string; data: any }>) => {
        state.isLoading = false;
        if (action.payload.type === 'array') {
          state.machinesArray = action.payload.data;
          state.machines = null;
        } else {
          state.machines = action.payload.data;
          state.machinesArray = null;
        }
        state.error = null;
      })
      .addCase(fetchMachines.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch machines';
      })
      // Create machine
      .addCase(createMachine.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createMachine.fulfilled, (state, action: PayloadAction<Machine>) => {
        state.isCreating = false;
        if (state.machines) {
          state.machines.results.unshift(action.payload);
          state.machines.count += 1;
        }
        if (state.machinesArray) {
          state.machinesArray.unshift(action.payload);
        }
        state.error = null;
      })
      .addCase(createMachine.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string || 'Failed to create machine';
      })
      // Update machine
      .addCase(updateMachine.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateMachine.fulfilled, (state, action: PayloadAction<Machine>) => {
        state.isUpdating = false;
        if (state.machines) {
          const index = state.machines.results.findIndex(m => m.id === action.payload.id);
          if (index !== -1) {
            state.machines.results[index] = action.payload;
          }
        }
        if (state.machinesArray) {
          const index = state.machinesArray.findIndex(m => m.id === action.payload.id);
          if (index !== -1) {
            state.machinesArray[index] = action.payload;
          }
        }
        state.error = null;
      })
      .addCase(updateMachine.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string || 'Failed to update machine';
      })
      // Delete machine
      .addCase(deleteMachine.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteMachine.fulfilled, (state, action: PayloadAction<string>) => {
        state.isDeleting = false;
        if (state.machines) {
          state.machines.results = state.machines.results.filter(m => m.id !== action.payload);
          state.machines.count -= 1;
        }
        if (state.machinesArray) {
          state.machinesArray = state.machinesArray.filter(m => m.id !== action.payload);
        }
        state.error = null;
      })
      .addCase(deleteMachine.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string || 'Failed to delete machine';
      })
      // Fetch wards
      .addCase(fetchWards.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWards.fulfilled, (state, action: PayloadAction<Ward[]>) => {
        state.isLoading = false;
        state.wards = action.payload;
        state.error = null;
      })
      .addCase(fetchWards.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch wards';
      })
      // Create ward
      .addCase(createWard.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createWard.fulfilled, (state, action: PayloadAction<Ward>) => {
        state.isCreating = false;
        if (state.wards) {
          state.wards.unshift(action.payload);
        } else {
          state.wards = [action.payload];
        }
        state.error = null;
      })
      .addCase(createWard.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string || 'Failed to create ward';
      })
      // Update ward
      .addCase(updateWard.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateWard.fulfilled, (state, action: PayloadAction<Ward>) => {
        state.isUpdating = false;
        if (state.wards) {
          const index = state.wards.findIndex(w => w.id === action.payload.id);
          if (index !== -1) {
            state.wards[index] = action.payload;
          }
        }
        state.error = null;
      })
      .addCase(updateWard.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string || 'Failed to update ward';
      })
      // Delete ward
      .addCase(deleteWard.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteWard.fulfilled, (state, action: PayloadAction<string>) => {
        state.isDeleting = false;
        if (state.wards) {
          state.wards = state.wards.filter(w => w.id !== action.payload);
        }
        state.error = null;
      })
      .addCase(deleteWard.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string || 'Failed to delete ward';
      })
      // Fetch beds
      .addCase(fetchBeds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBeds.fulfilled, (state, action: PayloadAction<Bed[]>) => {
        state.isLoading = false;
        state.beds = action.payload;
        state.error = null;
      })
      .addCase(fetchBeds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch beds';
      })
      // Create bed
      .addCase(createBed.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createBed.fulfilled, (state, action: PayloadAction<Bed>) => {
        state.isCreating = false;
        if (state.beds) {
          state.beds.unshift(action.payload);
        } else {
          state.beds = [action.payload];
        }
        state.error = null;
      })
      .addCase(createBed.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string || 'Failed to create bed';
      })
      // Update bed
      .addCase(updateBed.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateBed.fulfilled, (state, action: PayloadAction<Bed>) => {
        state.isUpdating = false;
        if (state.beds) {
          const index = state.beds.findIndex(b => b.id === action.payload.id);
          if (index !== -1) {
            state.beds[index] = action.payload;
          }
        }
        state.error = null;
      })
      .addCase(updateBed.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string || 'Failed to update bed';
      })
      // Delete bed
      .addCase(deleteBed.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteBed.fulfilled, (state, action: PayloadAction<string>) => {
        state.isDeleting = false;
        if (state.beds) {
          state.beds = state.beds.filter(b => b.id !== action.payload);
        }
        state.error = null;
      })
      .addCase(deleteBed.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string || 'Failed to delete bed';
      })
      // Fetch shifts
      .addCase(fetchShifts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchShifts.fulfilled, (state, action: PayloadAction<Shift[]>) => {
        state.isLoading = false;
        state.shifts = action.payload;
        state.error = null;
      })
      .addCase(fetchShifts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch shifts';
      })
      // Create shift
      .addCase(createShift.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createShift.fulfilled, (state, action: PayloadAction<Shift>) => {
        state.isCreating = false;
        if (state.shifts) {
          state.shifts.unshift(action.payload);
        } else {
          state.shifts = [action.payload];
        }
        state.error = null;
      })
      .addCase(createShift.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string || 'Failed to create shift';
      })
      // Update shift
      .addCase(updateShift.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateShift.fulfilled, (state, action: PayloadAction<Shift>) => {
        state.isUpdating = false;
        if (state.shifts) {
          const index = state.shifts.findIndex(s => s.id === action.payload.id);
          if (index !== -1) {
            state.shifts[index] = action.payload;
          }
        }
        state.error = null;
      })
      .addCase(updateShift.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string || 'Failed to update shift';
      })
      // Delete shift
      .addCase(deleteShift.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteShift.fulfilled, (state, action: PayloadAction<string>) => {
        state.isDeleting = false;
        if (state.shifts) {
          state.shifts = state.shifts.filter(s => s.id !== action.payload);
        }
        state.error = null;
      })
      .addCase(deleteShift.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string || 'Failed to delete shift';
      })
      // Fetch warnings
      .addCase(fetchWarnings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWarnings.fulfilled, (state, action: PayloadAction<Warning[]>) => {
        state.isLoading = false;
        state.warnings = action.payload;
        state.error = null;
      })
      .addCase(fetchWarnings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch warnings';
      })
      // Create warning
      .addCase(createWarning.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createWarning.fulfilled, (state, action: PayloadAction<Warning>) => {
        state.isCreating = false;
        if (state.warnings) {
          state.warnings.unshift(action.payload);
        } else {
          state.warnings = [action.payload];
        }
        state.error = null;
      })
      .addCase(createWarning.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string || 'Failed to create warning';
      })
      // Update warning
      .addCase(updateWarning.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateWarning.fulfilled, (state, action: PayloadAction<Warning>) => {
        state.isUpdating = false;
        if (state.warnings) {
          const index = state.warnings.findIndex(w => w.id === action.payload.id);
          if (index !== -1) {
            state.warnings[index] = action.payload;
          }
        }
        state.error = null;
      })
      .addCase(updateWarning.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string || 'Failed to update warning';
      })
      // Delete warning
      .addCase(deleteWarning.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteWarning.fulfilled, (state, action: PayloadAction<string>) => {
        state.isDeleting = false;
        if (state.warnings) {
          state.warnings = state.warnings.filter(w => w.id !== action.payload);
        }
        state.error = null;
      })
      .addCase(deleteWarning.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string || 'Failed to delete warning';
      })
      // Fetch warning fixes
      .addCase(fetchWarningFixes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWarningFixes.fulfilled, (state, action: PayloadAction<WarningFix[]>) => {
        state.isLoading = false;
        state.warningFixes = action.payload;
        state.error = null;
      })
      .addCase(fetchWarningFixes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch warning fixes';
      })
      // Create warning fix
      .addCase(createWarningFix.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createWarningFix.fulfilled, (state, action: PayloadAction<WarningFix>) => {
        state.isCreating = false;
        if (state.warningFixes) {
          state.warningFixes.unshift(action.payload);
        } else {
          state.warningFixes = [action.payload];
        }
        state.error = null;
      })
      .addCase(createWarningFix.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string || 'Failed to create warning fix';
      })
      // Update warning fix
      .addCase(updateWarningFix.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateWarningFix.fulfilled, (state, action: PayloadAction<WarningFix>) => {
        state.isUpdating = false;
        if (state.warningFixes) {
          const index = state.warningFixes.findIndex(wf => wf.id === action.payload.id);
          if (index !== -1) {
            state.warningFixes[index] = action.payload;
          }
        }
        state.error = null;
      })
      .addCase(updateWarningFix.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string || 'Failed to update warning fix';
      })
      // Delete warning fix
      .addCase(deleteWarningFix.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteWarningFix.fulfilled, (state, action: PayloadAction<string>) => {
        state.isDeleting = false;
        if (state.warningFixes) {
          state.warningFixes = state.warningFixes.filter(wf => wf.id !== action.payload);
        }
        state.error = null;
      })
      .addCase(deleteWarningFix.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string || 'Failed to delete warning fix';
      })
      // Resolve warning
      .addCase(resolveWarning.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(resolveWarning.fulfilled, (state, action: PayloadAction<Warning>) => {
        state.isUpdating = false;
        if (state.warnings) {
          const index = state.warnings.findIndex(w => w.id === action.payload.id);
          if (index !== -1) {
            state.warnings[index] = action.payload;
          }
        }
        state.error = null;
      })
      .addCase(resolveWarning.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string || 'Failed to resolve warning';
      })
      // Fetch patients
      .addCase(fetchPatients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action: PayloadAction<Patient[]>) => {
        state.isLoading = false;
        state.patients = action.payload;
        state.error = null;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch patients';
      })
      // Create patient
      .addCase(createPatient.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createPatient.fulfilled, (state, action: PayloadAction<Patient>) => {
        state.isCreating = false;
        if (state.patients) {
          state.patients.unshift(action.payload);
        } else {
          state.patients = [action.payload];
        }
        state.error = null;
      })
      .addCase(createPatient.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string || 'Failed to create patient';
      })
      // Update patient
      .addCase(updatePatient.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updatePatient.fulfilled, (state, action: PayloadAction<Patient>) => {
        state.isUpdating = false;
        if (state.patients) {
          const index = state.patients.findIndex(p => p.id === action.payload.id);
          if (index !== -1) {
            state.patients[index] = action.payload;
          }
        }
        state.currentPatient = action.payload;
        state.error = null;
      })
      .addCase(updatePatient.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string || 'Failed to update patient';
      })
      // Delete patient
      .addCase(deletePatient.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deletePatient.fulfilled, (state, action: PayloadAction<string>) => {
        state.isDeleting = false;
        if (state.patients) {
          state.patients = state.patients.filter(p => p.id !== action.payload);
        }
        state.error = null;
      })
      .addCase(deletePatient.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string || 'Failed to delete patient';
      })
      // Get patient by ID
      .addCase(getPatientById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPatientById.fulfilled, (state, action: PayloadAction<PatientWithDialysisHistory>) => {
        state.isLoading = false;
        state.currentPatient = action.payload.patient;
        state.dialysis = action.payload.dialysis_history;
        state.error = null;
      })
      .addCase(getPatientById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to get patient';
      })
      // Fetch dialysis
      .addCase(fetchDialysis.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDialysis.fulfilled, (state, action: PayloadAction<Dialysis[]>) => {
        state.isLoading = false;
        state.dialysis = action.payload;
        state.error = null;
      })
      .addCase(fetchDialysis.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch dialysis sessions';
      })
      // Create dialysis
      .addCase(createDialysis.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createDialysis.fulfilled, (state, action: PayloadAction<Dialysis>) => {
        state.isCreating = false;
        if (state.dialysis) {
          state.dialysis.unshift(action.payload);
        } else {
          state.dialysis = [action.payload];
        }
        state.error = null;
      })
      .addCase(createDialysis.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string || 'Failed to create dialysis session';
      })
      // Update dialysis
      .addCase(updateDialysis.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateDialysis.fulfilled, (state, action: PayloadAction<Dialysis>) => {
        state.isUpdating = false;
        if (state.dialysis) {
          const index = state.dialysis.findIndex(d => d.id === action.payload.id);
          if (index !== -1) {
            state.dialysis[index] = action.payload;
          }
        }
        state.currentDialysis = action.payload;
        state.error = null;
      })
      .addCase(updateDialysis.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string || 'Failed to update dialysis session';
      })
      // Delete dialysis
      .addCase(deleteDialysis.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteDialysis.fulfilled, (state, action: PayloadAction<string>) => {
        state.isDeleting = false;
        if (state.dialysis) {
          state.dialysis = state.dialysis.filter(d => d.id !== action.payload);
        }
        state.error = null;
      })
      .addCase(deleteDialysis.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string || 'Failed to delete dialysis session';
      })
      // Get dialysis by ID
      .addCase(getDialysisById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDialysisById.fulfilled, (state, action: PayloadAction<Dialysis>) => {
        state.isLoading = false;
        state.currentDialysis = action.payload;
        state.error = null;
      })
      .addCase(getDialysisById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to get dialysis session';
      })
      // Fetch today's dialysis
      .addCase(fetchTodayDialysis.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTodayDialysis.fulfilled, (state, action: PayloadAction<TodayDialysisResponse>) => {
        state.isLoading = false;
        state.todayDialysis = action.payload;
        state.error = null;
      })
      .addCase(fetchTodayDialysis.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch today\'s dialysis sessions';
      })
      // Fetch upcoming patients
      .addCase(fetchUpcomingPatients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUpcomingPatients.fulfilled, (state, action: PayloadAction<UpcomingPatientsResponse>) => {
        state.isLoading = false;
        state.upcomingPatients = action.payload;
        state.error = null;
      })
      .addCase(fetchUpcomingPatients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch upcoming patients';
      });
  },
});

export const { clearError, clearDashboardStats, clearProducts, clearProductsArray, setCurrentProduct, setCurrentMachine, setCurrentWarning, setCurrentWarningFix, setCurrentWard, setCurrentBed, setCurrentShift, setCurrentPatient, setCurrentDialysis } = dialysisSlice.actions;
export default dialysisSlice.reducer;
