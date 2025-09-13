import { FormSchema, createFormSchema } from '../../../common/FormSchema';
import { 
  paymentMethodOptions
} from '../../../../lib/schemas';

// Get categories and vendors from API (these will be populated dynamically)
export const getExpenseFormSchema = (
  categories: { id: number; name: string }[] = [],
  vendors: { id: number; name: string }[] = [],
  medicalProducts: { id: number; item_name: string; item_type: string; available_items: number; quantity_type: string }[] = [],
  inventoryItems: { id: number; item_name: string; item_type: string; available_items: number; quantity_type: string }[] = []
): FormSchema => {
  return createFormSchema({
    fields: [
      {
        name: 'title',
        label: 'Name',
        type: 'text',
        placeholder: 'Enter expense title',
        required: true,
        validation: {
          minLength: 2,
          maxLength: 200,
        },
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Enter expense description',
        required: false,
        rows: 3,
        validation: {
          minLength: 5,
          maxLength: 1000,
        },
      },
      {
        name: 'amount',
        label: 'Amount (PKR)',
        type: 'text',
        placeholder: '0.00 (PKR)',
        required: true,
        validation: {
          pattern: /^\d+(\.\d{1,2})?$/,
        },
      },
      {
        name: 'due_balance_to_vendor',
        label: 'Due Balance to Vendor',
        type: 'text',
        placeholder: '0.00 (PKR)',
        required: true,
      },
      {
        name: 'category',
        label: 'Expense Type/Category Type',
        type: 'searchable-select',
        required: true,
        options: categories.map(cat => ({
          value: cat.id.toString(),
          label: cat.name,
        })),
        placeholder: 'Search and select a category',
      },
      {
        name: 'vendor',
        label: 'Vendor',
        type: 'searchable-select',
        required: true,
        options: vendors.map(vendor => ({
          value: vendor.id.toString(),
          label: vendor.name,
        })),
        placeholder: 'Search and select a vendor',
      },
      {
        name: 'expense_date',
        label: 'Expense Date',
        type: 'date',
        required: true,
      },
      {
        name: 'payment_method',
        label: 'Payment Method',
        type: 'text',
        required: true,
        options: paymentMethodOptions,
        placeholder: 'Enter payment method',
      },
      {
        name: 'inventory_items',
        label: 'Welfare Inventory Items',
        type: 'item-selector',
        required: false,
        items: inventoryItems,
        selectorType: 'inventory',
        placeholder: 'Select inventory items',
      },
      {
        name: 'dialysis_products',
        label: 'Dialysis Inventory Items',
        type: 'item-selector',
        required: false,
        items: medicalProducts,
        selectorType: 'medical',
        placeholder: 'Select dialysis products',
      },
    ],
    layout: 'two-column',
  });
};
