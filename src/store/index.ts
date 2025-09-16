import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import dialysisReducer from './slices/dialysisSlice';
import usersReducer from './slices/usersSlice';
import donorsReducer from './slices/donorSlice';
import donationsReducer from './slices/donationSlice';
import vendorsReducer from './slices/vendorSlice';
import expenseCategoriesReducer from './slices/expenseCategorySlice';
import expensesReducer from './slices/expenseSlice';
import vehiclesReducer from './slices/vehicleSlice';
import inventoryReducer from './slices/inventorySlice';
import itemUsageReducer from './slices/itemUsageSlice';

// Import your reducers here
// import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    // Add your reducers here
    auth: authReducer,
    dialysis: dialysisReducer,
    users: usersReducer,
    donors: donorsReducer,
    donations: donationsReducer,
    vendors: vendorsReducer,
    expenseCategories: expenseCategoriesReducer,
    expenses: expensesReducer,
    vehicles: vehiclesReducer,
    inventory: inventoryReducer,
    itemUsage: itemUsageReducer,
    // user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'persist/PERSIST',
          'users/fetchUsers/fulfilled',
          'users/createUser/fulfilled',
          'users/updateUser/fulfilled',
          'donors/createDonor/fulfilled',
          'donors/updateDonor/fulfilled',
          'donations/createDonation/fulfilled',
          'donations/updateDonation/fulfilled',
          'vendors/createVendor/fulfilled',
          'vendors/updateVendor/fulfilled',
          'expenseCategories/createExpenseCategory/fulfilled',
          'expenseCategories/updateExpenseCategory/fulfilled',
          'expenses/createExpense/fulfilled',
          'expenses/updateExpense/fulfilled',
          'vehicles/createVehicle/fulfilled',
          'vehicles/updateVehicle/fulfilled',
          'inventory/createInventoryItem/fulfilled',
          'inventory/updateInventoryItem/fulfilled',
          'inventory/addQuantityToItem/fulfilled',
          'inventory/useItemsFromInventory/fulfilled',
          'itemUsage/createItemUsageRecord/fulfilled',
          'itemUsage/updateItemUsageRecord/fulfilled',
        ],
        // Ignore these paths in all actions
        ignoredPaths: ['payload.headers'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
