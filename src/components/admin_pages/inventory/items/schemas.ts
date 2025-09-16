import { FormSchema } from '../../../common/FormSchema';

// Quantity type options for the select field
export const quantityTypeOptions = [
  { value: 'none', label: 'None' },
  { value: 'pieces', label: 'Pieces' },
  { value: 'boxes', label: 'Boxes' },
  { value: 'bottles', label: 'Bottles' },
  { value: 'packs', label: 'Packs' },
  { value: 'units', label: 'Units' },
  { value: 'OTHER', label: 'Other' },
];

// Inventory type options for the select field
export const inventoryTypeOptions = [
  { value: 'lab', label: 'Lab' },
  { value: 'women_center', label: 'Women Center' },
  { value: 'OTHER', label: 'Other' },
];

// Schema for adding a new inventory item
export const addInventorySchema = new FormSchema({
  fields: [
    {
      name: 'item_name',
      label: 'Item Name',
      type: 'text',
      required: true,
      validation: {
        minLength: 2,
        maxLength: 200,
      },
      placeholder: 'Enter item name',
    },
    {
      name: 'item_type',
      label: 'Item Type',
      type: 'text',
      required: true,
      placeholder: 'Enter item type (e.g., mg, ml, etc.)',
    },
    {
      name: 'quantity',
      label: 'Initial Quantity',
      type: 'number',
      required: true,
      validation: {
        min: 0,
      },
      placeholder: 'Enter initial quantity',
    },
    {
      name: 'quantity_type',
      label: 'Quantity Type',
      type: 'select',
      required: true,
      options: quantityTypeOptions,
      placeholder: 'Select quantity type',
    },
    {
      name: 'inventory_type',
      label: 'Inventory Type',
      type: 'select',
      required: true,
      options: inventoryTypeOptions,
      placeholder: 'Select inventory type',
    },
    {
      name: 'date',
      label: 'Date',
      type: 'date',
      required: true,
      placeholder: 'Select date',
    },
    {
      name: 'admin_comment',
      label: 'Admin Comment',
      type: 'textarea',
      required: false,
      placeholder: 'Enter admin comment',
    },
  ],
  layout: 'two-column',
});

// Schema for editing an existing inventory item
export const editInventorySchema = new FormSchema({
  fields: [
    {
      name: 'item_name',
      label: 'Item Name',
      type: 'text',
      disabled: true,
      required: true,
      validation: {
        minLength: 2,
        maxLength: 200,
      },
      placeholder: 'Enter item name',
    },
    {
      name: 'item_type',
      label: 'Item Type',
      type: 'text',
      disabled: true,
      required: true,
      placeholder: 'Enter item type (e.g., mg, ml, etc.)',
    },
    {
      name: 'quantity',
      label: 'Available Items',
      type: 'number',
      disabled: true,
      required: true,
      validation: {
        min: 0,
      },
      placeholder: 'Enter items available',
    },
    {
      name: 'quantity_type',
      label: 'Quantity Type',
      type: 'select',
      disabled: true,
      required: true,
      options: quantityTypeOptions,
      placeholder: 'Select quantity type',
    },
    {
      name: 'inventory_type',
      label: 'Inventory Type',
      type: 'select',
      disabled: true,
      required: true,
      options: inventoryTypeOptions,
      placeholder: 'Select inventory type',
    },
    {
      name: 'date',
      label: 'Date',
      disabled: true,
      type: 'date',
      required: true,
      placeholder: 'Select date',
    },
    {
      name: 'admin_comment',
      label: 'Admin Comment',
      type: 'textarea',
      required: false,
      placeholder: 'Enter admin comment',
    },
  ],
  layout: 'two-column',
});

// Schema for adding quantity to an inventory item
export const addQuantitySchema = new FormSchema({
  fields: [
    {
      name: 'additional_quantity',
      label: 'Additional Quantity to Available Item',
      type: 'number',
      required: true,
      validation: {
        min: 1,
      },
      placeholder: 'Enter additional quantity to available item',
    },
  ],
  layout: 'single',
});