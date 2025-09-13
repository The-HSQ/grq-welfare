import { createFormSchema } from '../../../common/FormSchema';

// Vehicle type options
export const vehicleTypeOptions = [
  { value: 'avery_car', label: 'Avery Car' },
  { value: 'ambulance', label: 'Ambulance' },
  { value: 'van', label: 'Van' },
  { value: 'truck', label: 'Truck' },
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'OTHER', label: 'Other' },
];

// Create vehicle schema
export const createVehicleSchema = createFormSchema({
  fields: [
    {
      name: 'name',
      label: 'Vehicle Name',
      type: 'text',
      required: true,
      placeholder: 'Enter vehicle name',
      validation: {
        minLength: 2,
        maxLength: 100,
      },
    },
    {
      name: 'number_plate',
      label: 'Number Plate',
      type: 'text',
      required: true,
      placeholder: 'Enter number plate (e.g., ABC-123)',
      validation: {
        minLength: 3,
        maxLength: 20,
        pattern: /^[A-Z0-9-]+$/i,
      },
    },
    {
      name: 'vehicle_type',
      label: 'Vehicle Type',
      type: 'select',
      required: true,
      options: vehicleTypeOptions,
    },
    {
      name: 'donated',
      label: 'Is Donated',
      type: 'switch',
      required: true,
    },
    {
      name: 'donated_by',
      label: 'Donated By',
      type: 'text',
      required: false,
      placeholder: 'Enter donor name',
      validation: {
        maxLength: 100,
      },
    },
    {
      name: 'purchase_date',
      label: 'Purchase Date',
      type: 'date',
      required: false,
    },
    {
      name: 'purchase_price',
      label: 'Purchase Price',
      type: 'number',
      required: false,
      placeholder: 'Enter purchase price',
      validation: {
        min: 0,
      },
    },
    {
      name: 'donation_amount',
      label: 'Donation Amount',
      type: 'number',
      required: false,
      placeholder: 'Enter donation amount',
      validation: {
        min: 0,
      },
    },
    {
      name: 'rate_per_km',
      label: 'Rate Per KM',
      type: 'number',
      required: true,
      placeholder: 'Enter rate per kilometer',
      validation: {
        min: 0,
      },
    },
    {
      name: 'current_mileage',
      label: 'Current Mileage',
      type: 'number',
      required: true,
      placeholder: 'Enter current mileage',
      validation: {
        min: 0,
      },
    },
  ],
  layout: 'two-column',
});

// Update vehicle schema (same as create but all fields optional except required ones)
export const updateVehicleSchema = createFormSchema({
  fields: [
    {
      name: 'name',
      label: 'Vehicle Name',
      type: 'text',
      required: true,
      placeholder: 'Enter vehicle name',
      validation: {
        minLength: 2,
        maxLength: 100,
      },
    },
    {
      name: 'number_plate',
      label: 'Number Plate',
      type: 'text',
      required: true,
      placeholder: 'Enter number plate (e.g., ABC-123)',
      validation: {
        minLength: 3,
        maxLength: 20,
        pattern: /^[A-Z0-9-]+$/i,
      },
    },
    {
      name: 'vehicle_type',
      label: 'Vehicle Type',
      type: 'select',
      required: true,
      options: vehicleTypeOptions,
    },
    {
      name: 'donated',
      label: 'Is Donated',
      type: 'switch',
      required: true,
    },
    {
      name: 'donated_by',
      label: 'Donated By',
      type: 'text',
      required: false,
      placeholder: 'Enter donor name',
      validation: {
        maxLength: 100,
      },
    },
    {
      name: 'purchase_date',
      label: 'Purchase Date',
      type: 'date',
      required: false,
    },
    {
      name: 'purchase_price',
      label: 'Purchase Price',
      type: 'number',
      required: false,
      placeholder: 'Enter purchase price',
      validation: {
        min: 0,
      },
    },
    {
      name: 'donation_amount',
      label: 'Donation Amount',
      type: 'number',
      required: false,
      placeholder: 'Enter donation amount',
      validation: {
        min: 0,
      },
    },
    {
      name: 'rate_per_km',
      label: 'Rate Per KM',
      type: 'number',
      required: true,
      placeholder: 'Enter rate per kilometer',
      validation: {
        min: 0,
      },
    },
    {
      name: 'current_mileage',
      label: 'Current Odometer (KM)',
      type: 'number',
      required: true,
      placeholder: 'Enter current odometer (KM)',
      validation: {
        min: 0,
      },
    },
  ],
  layout: 'two-column',
});

// Filter options for the filter bar
export const vehicleFilterOptions = [
  {
    key: 'vehicle_type',
    label: 'Vehicle Type',
    type: 'text' as const,
    placeholder: 'Filter by vehicle type...',
  },
  {
    key: 'donated',
    label: 'Donation Status',
    type: 'select' as const,
    options: [
      { value: 'all', label: 'All' },
      { value: 'true', label: 'Donated' },
      { value: 'false', label: 'Purchased' },
    ],
  },
];
