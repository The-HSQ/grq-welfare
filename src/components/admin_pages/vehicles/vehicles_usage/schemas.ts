import { createFormSchema, type FormSchema } from '../../../common/FormSchema';
import { type FilterOption } from '../../../common/FilterBar';

// Trip purpose options
const tripPurposeOptions = [
  { value: 'dialysis_use', label: 'Dialysis Use' },
  { value: 'lab_use', label: 'Lab Use' },
  { value: 'women_vocation_use', label: 'Women Vocation Use' },
  { value: 'computer_lab_use', label: 'Computer Lab Use' },
  { value: 'personal_use', label: 'Personal Use' },
];

// Create Vehicle Usage Schema
export const createVehicleUsageSchema = (): FormSchema => {
  return createFormSchema({
    fields: [
      {
        name: 'vehicle',
        label: 'Vehicle',
        type: 'select',
        required: true,
        placeholder: 'Select a vehicle',
        options: [] // Will be populated dynamically
      },
      {
        name: 'date',
        label: 'Date & Time',
        type: 'datetime-local',
        required: true,
        placeholder: 'Select date and time'
      },
      {
        name: 'trip_purpose',
        label: 'Trip Purpose',
        type: 'select',
        required: true,
        placeholder: 'Select trip purpose',
        options: tripPurposeOptions
      },
      {
        name: 'current_mileage',
        label: 'Start Mileage',
        type: 'number',
        required: true,
        placeholder: 'Enter start mileage',
        min: 0,
        validation: {
          min: 0
        }
      },
      {
        name: 'end_mileage',
        label: 'End Mileage',
        type: 'number',
        required: false,
        placeholder: 'Enter end mileage',
        min: 0,
        validation: {
          min: 0
        }
      },
      {
        name: 'driver_name',
        label: 'Driver Name',
        type: 'text',
        required: true,
        placeholder: 'Enter driver name',
        validation: {
          minLength: 2,
          maxLength: 100
        }
      },
      {
        name: 'personal_used_by',
        label: 'Personal Used By',
        type: 'text',
        required: false,
        placeholder: 'Enter person name',
        validation: {
          maxLength: 100
        }
      },
      {
        name: 'paid_amount',
        label: 'Paid Amount (PKR)',
        type: 'number',
        required: false,
        placeholder: 'Enter paid amount',
        min: 0,
        step: 0.01,
        validation: {
          min: 0
        }
      },
      {
        name: 'admin_comment',
        label: 'Admin Comment',
        type: 'textarea',
        required: false,
        placeholder: 'Enter admin comment'
      }
    ],
    layout: 'two-column',
    className: 'space-y-4'
  });
};

// Update Vehicle Usage Schema
export const updateVehicleUsageSchema = (): FormSchema => {
  return createFormSchema({
    fields: [
      {
        name: 'vehicle',
        label: 'Vehicle',
        type: 'select',
        required: true,
        placeholder: 'Select a vehicle',
        options: [] // Will be populated dynamically
      },
      {
        name: 'date',
        label: 'Date & Time',
        type: 'datetime-local',
        required: true,
        placeholder: 'Select date and time'
      },
      {
        name: 'trip_purpose',
        label: 'Trip Purpose',
        type: 'select',
        required: true,
        placeholder: 'Select trip purpose',
        options: tripPurposeOptions
      },
      {
        name: 'current_mileage',
        label: 'Start Mileage',
        type: 'number',
        required: true,
        placeholder: 'Enter start mileage',
        min: 0,
        validation: {
          min: 0
        }
      },
      {
        name: 'end_mileage',
        label: 'End Mileage',
        type: 'number',
        required: false,
        placeholder: 'Enter end mileage',
        min: 0,
        validation: {
          min: 0
        }
      },
      {
        name: 'driver_name',
        label: 'Driver Name',
        type: 'text',
        required: true,
        placeholder: 'Enter driver name',
        validation: {
          minLength: 2,
          maxLength: 100
        }
      },
      {
        name: 'personal_used_by',
        label: 'Personal Used By',
        type: 'text',
        required: false,
        placeholder: 'Enter person name',
        validation: {
          maxLength: 100
        }
      },
      {
        name: 'paid_amount',
        label: 'Paid Amount (PKR)',
        type: 'number',
        required: false,
        placeholder: 'Enter paid amount',
        min: 0,
        step: 0.01,
        validation: {
          min: 0
        }
      },
      {
        name: 'admin_comment',
        label: 'Admin Comment',
        type: 'textarea',
        required: false,
        placeholder: 'Enter admin comment'
      }
    ],
    layout: 'two-column',
    className: 'space-y-4'
  });
};

// Filter options for vehicle usage
export const vehicleUsageFilterOptions: FilterOption[] = [
  {
    key: 'trip_purpose',
    label: 'Trip Purpose',
    type: 'select',
    placeholder: 'All purposes',
    options: [
      { value: '', label: 'All purposes' },
      ...tripPurposeOptions
    ]
  },
  {
    key: 'vehicle',
    label: 'Vehicle',
    type: 'select',
    placeholder: 'All vehicles',
    options: [
      { value: '', label: 'All vehicles' }
    ]
  },
  {
    key: 'date',
    label: 'Date',
    type: 'date',
    placeholder: 'Select date'
  }
];
