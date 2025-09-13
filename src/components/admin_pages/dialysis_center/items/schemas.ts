import { createFormSchema } from '@/components/common/FormSchema';
import type { FormFieldConfig } from '@/components/common/FormField';

// Form field configurations for dialysis items
const itemFields: FormFieldConfig[] = [
  {
    name: 'item_name',
    label: 'Item Name',
    type: 'text',
    placeholder: 'Enter item name',
    required: true,
    validation: {
      minLength: 2,
      maxLength: 100,
    },
  },
  {
    name: 'item_type',
    label: 'Item Type',
    type: 'text',
    placeholder: 'Enter item type (MG/ML)',
    required: true,
    validation: {
      minLength: 1,
    },
  },
  {
    name: 'quantity',
    label: 'Quantity',
    type: 'number',
    placeholder: 'Enter quantity',
    required: true,
    min: 0,
    validation: {
      min: 0,
    },
  },
  {
    name: 'quantity_type',
    label: 'Quantity Type',
    type: 'select',
    placeholder: 'Select quantity type',
    required: true,
    options: [
      { value: 'none', label: 'None' },
      { value: 'boxes', label: 'Boxes' },
      { value: 'bottles', label: 'Bottles' },
      { value: 'packs', label: 'Packs' },
      { value: 'units', label: 'Units' },
      { value: 'pieces', label: 'Pieces' },
      { value: 'bags', label: 'Bags' },
      { value: 'tubes', label: 'Tubes' },
      { value: 'sets', label: 'Sets' },
    ],
  },
  {
    name: 'used_items',
    label: 'Used Items',
    type: 'number',
    placeholder: 'Enter used items count',
    required: true,
    min: 0,
    validation: {
      min: 0,
    },
  },
  {
    name: 'admin_comment',
    label: 'Admin Comment',
    type: 'textarea',
    placeholder: 'Enter admin comment',
    required: false,
  },
];

// Create form schema for adding new items
export const createItemSchema = createFormSchema({
  fields: itemFields,
  layout: 'two-column',
  className: 'space-y-4',
});

// Create form schema for editing items
export const editItemSchema = createFormSchema({
  fields: itemFields,
  layout: 'two-column',
  className: 'space-y-4',
});

// Default values for create form
export const createItemDefaultValues = {
  item_name: '',
  item_type: '',
  quantity: '',
  quantity_type: '',
  used_items: '',
  admin_comment: '',
};

// Helper function to get edit form default values from product data
export const getEditItemDefaultValues = (product: any) => ({
  item_name: product.item_name || '',
  item_type: product.item_type || '',
  quantity: product.quantity || product.available_items || '',
  quantity_type: product.quantity_type || '',
  used_items: product.used_items || 0,
  admin_comment: product.admin_comment || '',
});

// Form field configuration for adding new quantity
const addQuantityField: FormFieldConfig[] = [
  {
    name: 'additional_quantity',
    label: 'Additional Quantity',
    type: 'number',
    placeholder: 'Enter additional quantity',
    required: true,
    min: 1,
    validation: {
      min: 1,
    },
  },
];

// Form field configuration for using items
const useItemsField: FormFieldConfig[] = [
  {
    name: 'items_to_use',
    label: 'Items to Use',
    type: 'number',
    placeholder: 'Enter number of items to use',
    required: true,
    min: 1,
    validation: {
      min: 1,
    },
  },
];

// Create form schema for adding new quantity
export const addQuantitySchema = createFormSchema({
  fields: addQuantityField,
  layout: 'single',
  className: 'space-y-4',
});

// Create form schema for using items
export const useItemsSchema = createFormSchema({
  fields: useItemsField,
  layout: 'single',
  className: 'space-y-4',
});

// Default values for add quantity form
export const addQuantityDefaultValues = {
  additional_quantity: '',
};

// Default values for use items form
export const useItemsDefaultValues = {
  items_to_use: '',
};
