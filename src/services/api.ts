import api from '../lib/axios';

// Example API service functions
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login/', credentials),

  logout: () => api.post('/auth/logout/'),
  
  getProfile: () => api.get('/auth/profile'),
};

export const userAPI = {
  // Get all users with pagination
  getUsers: (params?: { page?: number; page_size?: number }) => 
    api.get('/auth/users/', { params }),
  
  // Get single user by ID
  getUserById: (id: string) => 
    api.get(`/auth/users/${id}/`),
  
  // Create new user
  createUser: (userData: {
    name: string;
    email: string;
    role: string;
    password?: string;
  }) => api.post('/auth/users/', userData),
  
  // Update user
  updateUser: (id: string, userData: {
    name?: string;
    email?: string;
    role?: string;
    status?: string;
    password?: string;
    password_confirm?: string;
  }) => api.patch(`/auth/users/${id}/`, userData),
  
  // Delete user
  deleteUser: (id: string) => 
    api.delete(`/auth/users/${id}/`),
};

// Alias for usersAPI to match the slice
export const usersAPI = userAPI;

export const dialysisAPI = {
  // Get dashboard statistics
  getDashboardStats: () => 
    api.get('/medical/dashboard/stats/'),
  
  // Get products
  getProducts: (params?: { page?: number; page_size?: number }) => 
    api.get('/medical/products/', { params }),
  
  // Get single product by ID
  getProductById: (id: string) => 
    api.get(`/medical/products/${id}/`),
  
  // Create new product
  createProduct: (productData: {
    item_name: string;
    item_type: string;
    quantity: number;
    quantity_type: string;
    used_items: number;
  }) => api.post('/medical/products/', productData),
  
  // Update product
  updateProduct: (id: string, productData: {
    item_name?: string;
    item_type?: string;
    quantity?: number;
    quantity_type?: string;
    used_items?: number;
  }) => api.patch(`/medical/products/${id}/`, productData),
  
  // Delete product
  deleteProduct: (id: string) => 
    api.delete(`/medical/products/${id}/`),
  
  // Add new quantity to product
  addQuantity: (id: string, data: { additional_quantity: number }) => 
    api.post(`/medical/products/${id}/add-quantity/`, data),
  
  // Use items from product
  useItems: (id: string, data: { items_to_use: number }) => 
    api.post(`/medical/products/${id}/use-items/`, data),
  
  // Get dialysis machines
  getMachines: (params?: { page?: number; page_size?: number }) => 
    api.get('/medical/machines/', { params }),
  
  // Get single machine by ID
  getMachineById: (id: string) => 
    api.get(`/medical/machines/${id}/`),
  
  // Create new machine
  createMachine: (machineData: {
    machine_name: string;
    machine_type: string;
    status: string;
    maintenance_date: string;
    next_maintenance_date: string;
  }) => api.post('/medical/machines/', machineData),
  
  // Update machine
  updateMachine: (id: string, machineData: {
    machine_name?: string;
    machine_type?: string;
    status?: string;
    maintenance_date?: string;
    next_maintenance_date?: string;
  }) => api.patch(`/medical/machines/${id}/`, machineData),
  
  // Delete machine
  deleteMachine: (id: string) => 
    api.delete(`/medical/machines/${id}/`),
  
  // Get patients
  getPatients: (params?: { page?: number; page_size?: number }) => 
    api.get('/medical/patients/', { params }),
  
  // Get single patient by ID with dialysis history
  getPatientById: (id: string) => 
    api.get(`/medical/patients/${id}/dialysis-history/`),
  
  // Create new patient
  createPatient: (patientData: FormData) => 
    api.post('/medical/patients/', patientData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  // Update patient
  updatePatient: (id: string, patientData: FormData) => 
    api.patch(`/medical/patients/${id}/`, patientData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  // Delete patient
  deletePatient: (id: string) => 
    api.delete(`/medical/patients/${id}/`),
  
  // Get warnings
  getWarnings: (params?: { page?: number; page_size?: number; status?: string }) => 
    api.get('/medical/warnings/', { params }),
  
  // Get single warning by ID
  getWarningById: (id: string) => 
    api.get(`/medical/warnings/${id}/`),
  
  // Create new warning
  createWarning: (warningData: {
    machine: string;
    warning_description: string;
  }) => api.post('/medical/warnings/', warningData),
  
  // Update warning
  updateWarning: (id: string, warningData: {
    machine?: string;
    warning_description?: string;
  }) => api.patch(`/medical/warnings/${id}/`, warningData),
  
  // Delete warning
  deleteWarning: (id: string) => 
    api.delete(`/medical/warnings/${id}/`),
  
  // Get warning fixes
  getWarningFixes: () => 
    api.get('/medical/warning-fixes/'),
  
  // Get single warning fix by ID
  getWarningFixById: (id: string) => 
    api.get(`/medical/warning-fixes/${id}/`),
  
  // Create warning fix
  createWarningFix: (warningFixData: {
    warning: string;
    fix_warning_description: string;
  }) => api.post('/medical/warning-fixes/', warningFixData),
  
  // Update warning fix
  updateWarningFix: (id: string, warningFixData: {
    warning?: string;
    fix_warning_description?: string;
  }) => api.patch(`/medical/warning-fixes/${id}/`, warningFixData),
  
  // Delete warning fix
  deleteWarningFix: (id: string) => 
    api.delete(`/medical/warning-fixes/${id}/`),
  
  // Resolve warning
  resolveWarning: (warningId: string) => 
    api.post(`/medical/warnings/${warningId}/resolve/`),
  
  // Get wards
  getWards: () => 
    api.get('/medical/wards/'),
  
  // Get single ward by ID
  getWardById: (id: string) => 
    api.get(`/medical/wards/${id}/`),
  
  // Create new ward
  createWard: (wardData: {
    ward_name: string;
  }) => api.post('/medical/wards/', wardData),
  
  // Update ward
  updateWard: (id: string, wardData: {
    ward_name?: string;
  }) => api.patch(`/medical/wards/${id}/`, wardData),
  
  // Delete ward
  deleteWard: (id: string) => 
    api.delete(`/medical/wards/${id}/`),
  
  // Get beds
  getBeds: () => 
    api.get('/medical/beds/'),
  
  // Get single bed by ID
  getBedById: (id: string) => 
    api.get(`/medical/beds/${id}/`),
  
  // Create new bed
  createBed: (bedData: {
    bed_name: string;
    ward: string;
  }) => api.post('/medical/beds/', bedData),
  
  // Update bed
  updateBed: (id: string, bedData: {
    bed_name?: string;
    ward?: string;
  }) => api.patch(`/medical/beds/${id}/`, bedData),
  
  // Delete bed
  deleteBed: (id: string) => 
    api.delete(`/medical/beds/${id}/`),
  
  // Get shifts
  getShifts: () => 
    api.get('/medical/shifts/'),
  
  // Get single shift by ID
  getShiftById: (id: string) => 
    api.get(`/medical/shifts/${id}/`),
  
  // Create new shift
  createShift: (shiftData: {
    shift_no: string;
    start_time: string;
    end_time: string;
  }) => api.post('/medical/shifts/', shiftData),
  
  // Update shift
  updateShift: (id: string, shiftData: {
    shift_no?: string;
    start_time?: string;
    end_time?: string;
  }) => api.patch(`/medical/shifts/${id}/`, shiftData),
  
  // Delete shift
  deleteShift: (id: string) => 
    api.delete(`/medical/shifts/${id}/`),
  
  // Get dialysis sessions
  getDialysis: (params?: { page?: number; page_size?: number }) => 
    api.get('/medical/dialysis/', { params }),
  
  // Get single dialysis session by ID
  getDialysisById: (id: string) => 
    api.get(`/medical/dialysis/${id}/`),
  
  // Create new dialysis session
  createDialysis: (dialysisData: {
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
  }) => api.post('/medical/dialysis/', dialysisData),
  
  // Update dialysis session
  updateDialysis: (id: string, dialysisData: {
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
  }) => api.patch(`/medical/dialysis/${id}/`, dialysisData),
  
  // Delete dialysis session
  deleteDialysis: (id: string) => 
    api.delete(`/medical/dialysis/${id}/`),
  
  // Get today's dialysis sessions
  getTodayDialysis: () => 
    api.get('/medical/dialysis/today/'),
  
  // Get upcoming patients for dialysis
  getUpcomingPatients: () => 
    api.get('/medical/dialysis/upcoming/patients/'),
};

// Generic API functions
export const apiService = {
  get: (url: string) => api.get(url),
  post: (url: string, data?: any) => api.post(url, data),
  put: (url: string, data?: any) => api.put(url, data),
  delete: (url: string) => api.delete(url),
  patch: (url: string, data?: any) => api.patch(url, data),
};
