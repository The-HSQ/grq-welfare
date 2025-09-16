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
  
  // Add waste items to product
  addWasteItems: (id: string, data: { items_to_waste: number }) => 
    api.post(`/medical/products/${id}/waste-items/`, data),
  
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
  
  // Get single patient by ID with documents
  getPatientWithDocuments: (id: string) => 
    api.get(`/medical/patients/${id}/`),
  
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
  
  // Upload patient document
  uploadPatientDocument: (documentData: FormData) => 
    api.post('/medical/patient-documents/', documentData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  // Delete patient document
  deletePatientDocument: (documentId: number) => 
    api.delete(`/medical/patient-documents/${documentId}/`),

  // Get appointments
  getAppointments: () => 
    api.get('/medical/appointments/'),
  
  // Get single appointment by ID
  getAppointmentById: (id: number) => 
    api.get(`/medical/appointments/${id}/`),
  
  // Create new appointment
  createAppointment: (appointmentData: {
    patient_name: string;
    date: string;
    purpose_of_visit: string;
    doctor_name: string;
    doctor_comment: string;
  }) => api.post('/medical/appointments/', appointmentData),
  
  // Update appointment
  updateAppointment: (id: number, appointmentData: {
    patient_name?: string;
    date?: string;
    purpose_of_visit?: string;
    doctor_name?: string;
    doctor_comment?: string;
  }) => api.patch(`/medical/appointments/${id}/`, appointmentData),
  
  // Delete appointment
  deleteAppointment: (id: number) => 
    api.delete(`/medical/appointments/${id}/`),
};

export const donorAPI = {
  // Get all donors
  getDonors: () => 
    api.get('/financial/donners/'),
  
  // Get single donor by ID
  getDonorById: (id: number) => 
    api.get(`/financial/donners/${id}/`),
  
  // Create new donor
  createDonor: (donorData: FormData) => 
    api.post('/financial/donners/', donorData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  // Update donor
  updateDonor: (id: number, donorData: FormData) => 
    api.patch(`/financial/donners/${id}/`, donorData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  // Delete donor
  deleteDonor: (id: number) => 
    api.delete(`/financial/donners/${id}/`),
};

export const donationAPI = {
  // Get all donations
  getDonations: () => 
    api.get('/financial/donations/'),
  
  // Get single donation by ID
  getDonationById: (id: number) => 
    api.get(`/financial/donations/${id}/`),
  
  // Create new donation
  createDonation: (donationData: {
    donner: number;
    date: string;
    amount: number;
    purpose: string;
    donation_type: string;
    currency: string;
    in_rupees?: number;
  }) => api.post('/financial/donations/', donationData),
  
  // Update donation
  updateDonation: (id: number, donationData: {
    donner?: number;
    date?: string;
    amount?: number;
    purpose?: string;
    donation_type?: string;
    currency?: string;
    in_rupees?: number;
  }) => api.patch(`/financial/donations/${id}/`, donationData),
  
  // Delete donation
  deleteDonation: (id: number) => 
    api.delete(`/financial/donations/${id}/`),
};

export const vendorAPI = {
  // Get all vendors
  getVendors: () => 
    api.get('/financial/vendors/'),
  
  // Get single vendor by ID
  getVendorById: (id: number) => 
    api.get(`/financial/vendors/${id}/`),
  
  // Create new vendor
  createVendor: (vendorData: {
    name: string;
    contact_person: string;
    email: string;
    phone: string;
    address: string;
    vendor_type: string;
    tax_id: string;
    payment_terms: string;
    is_active: boolean;
  }) => api.post('/financial/vendors/', vendorData),
  
  // Update vendor
  updateVendor: (id: number, vendorData: {
    name?: string;
    contact_person?: string;
    email?: string;
    phone?: string;
    address?: string;
    vendor_type?: string;
    tax_id?: string;
    payment_terms?: string;
    is_active?: boolean;
  }) => api.patch(`/financial/vendors/${id}/`, vendorData),
  
  // Delete vendor
  deleteVendor: (id: number) => 
    api.delete(`/financial/vendors/${id}/`),
};

export const expenseCategoryAPI = {
  // Get all expense categories
  getExpenseCategories: () => 
    api.get('/financial/expense-categories/'),
  
  // Get single expense category by ID
  getExpenseCategoryById: (id: number) => 
    api.get(`/financial/expense-categories/${id}/`),
  
  // Create new expense category
  createExpenseCategory: (expenseCategoryData: {
    name: string;
    description: string;
    category_type: string;
  }) => api.post('/financial/expense-categories/', expenseCategoryData),
  
  // Update expense category
  updateExpenseCategory: (id: number, expenseCategoryData: {
    name: string;
    description: string;
    category_type: string;
  }) => api.patch(`/financial/expense-categories/${id}/`, expenseCategoryData),
  
  // Delete expense category
  deleteExpenseCategory: (id: number) => 
    api.delete(`/financial/expense-categories/${id}/`),
};

export const expenseAPI = {
  // Get all expenses
  getExpenses: () => 
    api.get('/financial/expenses/'),
  
  // Get single expense by ID
  getExpenseById: (id: number) => 
    api.get(`/financial/expenses/${id}/`),
  
  // Create new expense
  createExpense: (expenseData: {
    title: string;
    description: string;
    amount: string;
    category: number;
    vendor: number;
    expense_date: string;
    payment_method: string;
    due_balance_to_vendor: string;
    notes: string;
    inventory_items_ids?: number[];
    dialysis_product_ids?: number[];
  }) => api.post('/financial/expenses/', expenseData),
  
  // Update expense
  updateExpense: (id: number, expenseData: {
    title?: string;
    description?: string;
    amount?: string;
    category?: number;
    vendor?: number;
    expense_date?: string;
    payment_method?: string;
    due_balance_to_vendor?: string;
    notes?: string;
    inventory_items_ids?: number[];
    dialysis_product_ids?: number[];
  }) => api.patch(`/financial/expenses/${id}/`, expenseData),
  
  // Delete expense
  deleteExpense: (id: number) => 
    api.delete(`/financial/expenses/${id}/`),
};

export const inventoryAPI = {
  // Get all inventory items
  getInventoryItems: (params?: { 
    page?: number; 
    page_size?: number;
    item_type?: string;
    quantity_type?: string;
    inventory_type?: string;
    date?: string;
    search?: string;
    ordering?: string;
  }) => 
    api.get('/inventory/items/', { params }),
  
  // Get single inventory item by ID
  getInventoryItemById: (id: string) => 
    api.get(`/inventory/items/${id}/`),
  
  // Create new inventory item
  createInventoryItem: (itemData: {
    item_name: string;
    item_type: string;
    quantity: number;
    new_quantity?: number;
    quantity_type: string;
    inventory_type: string;
    date: string;
    admin_comment?: string;
  }) => api.post('/inventory/items/', itemData),
  
  // Update inventory item
  updateInventoryItem: (id: string, itemData: {
    item_name?: string;
    item_type?: string;
    quantity?: number;
    new_quantity?: number;
    quantity_type?: string;
    inventory_type?: string;
    date?: string;
    admin_comment?: string;
  }) => api.patch(`/inventory/items/${id}/`, itemData),
  
  // Delete inventory item
  deleteInventoryItem: (id: string) => 
    api.delete(`/inventory/items/${id}/`),
  
  // Add quantity to inventory item
  addQuantity: (id: string, data: { additional_quantity: number }) => 
    api.post(`/inventory/items/${id}/add-quantity/`, data),
  
  // Use items from inventory
  useItems: (id: string, data: { items_to_use: number }) => 
    api.post(`/inventory/items/${id}/use-items/`, data),
  
  // Add waste items to inventory
  addWasteItems: (id: string, data: { items_to_waste: number }) => 
    api.post(`/inventory/items/${id}/waste-items/`, data),
  
  // Get items by inventory type
  getItemsByInventoryType: (inventoryType: string) => 
    api.get(`/inventory/items/inventory-type/${inventoryType}/`),
  
  // Get low stock items
  getLowStockItems: () => 
    api.get('/inventory/items/low-stock/'),
  
  // Get out of stock items
  getOutOfStockItems: () => 
    api.get('/inventory/items/out-of-stock/'),
  
  // Get items by date range
  getItemsByDateRange: (startDate: string, endDate: string) => 
    api.get('/inventory/items/date-range/', { 
      params: { start_date: startDate, end_date: endDate } 
    }),
  
  // Get inventory summary
  getInventorySummary: () => 
    api.get('/inventory/items/summary/'),
  
  // Get all item usage records
  getItemUsageRecords: () => 
    api.get('/inventory/item-usage/'),
  
  // Get single item usage record by ID
  getItemUsageRecordById: (id: string) => 
    api.get(`/inventory/item-usage/${id}/`),
  
  // Create new item usage record
  createItemUsageRecord: (usageData: {
    itemid: number;
    taken_items: number;
    itemused: number;
    item_waste: number;
    taken_by: string;
    comment: string;
  }) => api.post('/inventory/item-usage/', usageData),
  
  // Update item usage record
  updateItemUsageRecord: (id: string, usageData: {
    itemid?: number;
    taken_items?: number;
    itemused?: number;
    item_waste?: number;
    taken_by?: string;
    comment?: string;
  }) => api.patch(`/inventory/item-usage/${id}/`, usageData),
  
  // Delete item usage record
  deleteItemUsageRecord: (id: string) => 
    api.delete(`/inventory/item-usage/${id}/`),
};

export const dashboardAPI = {
  // Get dashboard statistics
  getDashboardData: () => 
    api.get('/dashboard/'),
};

// Generic API functions
export const apiService = {
  get: (url: string) => api.get(url),
  post: (url: string, data?: any) => api.post(url, data),
  put: (url: string, data?: any) => api.put(url, data),
  delete: (url: string) => api.delete(url),
  patch: (url: string, data?: any) => api.patch(url, data),
};
