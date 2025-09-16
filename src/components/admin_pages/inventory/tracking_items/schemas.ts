import { FormSchema } from '../../../common/FormSchema';

// Schema for adding a new item usage record
export const addItemUsageSchema = new FormSchema({
  fields: [
    {
      name: 'itemid',
      label: 'Item',
      type: 'searchable-select',
      required: true,
      options: [], // Will be populated dynamically with inventory items
      placeholder: 'Search and select an item',
    },
    {
      name: 'taken_items',
      label: 'Taken Items',
      type: 'number',
      required: true,
      validation: {
        min: 1,
      },
      placeholder: 'Enter number of items taken',
    },
    {
      name: 'itemused',
      label: 'Items Used',
      type: 'number',
      required: true,
      validation: {
        min: 0,
      },
      placeholder: 'Enter number of items used',
    },
    {
      name: 'item_waste',
      label: 'Items Wasted',
      type: 'number',
      required: true,
      validation: {
        min: 0,
      },
      placeholder: 'Enter number of items wasted',
    },
    {
      name: 'taken_by',
      label: 'Taken By',
      type: 'text',
      required: true,
      validation: {
        minLength: 2,
        maxLength: 100,
      },
      placeholder: 'Enter who took the items (e.g., Dr. Smith)',
    },
    {
      name: 'comment',
      label: 'Comment',
      type: 'textarea',
      required: false,
      placeholder: 'Enter any additional comments',
    },
  ],
  layout: 'two-column',
});

// Schema for editing an existing item usage record
export const editItemUsageSchema = new FormSchema({
  fields: [
    {
      name: 'itemid',
      label: 'Item',
      type: 'searchable-select',
      disabled: true,
      required: true,
      options: [], // Will be populated dynamically with inventory items
      placeholder: 'Search and select an item',
    },
    {
      name: 'taken_items',
      label: 'Taken Items',
      type: 'number',
      disabled: true,
      required: true,
      validation: {
        min: 1,
      },
      placeholder: 'Enter number of items taken',
    },
    {
      name: 'itemused',
      label: 'Items Used',
      type: 'number',
      required: true,
      validation: {
        min: 0,
      },
      placeholder: 'Enter number of items used',
    },
    {
      name: 'item_waste',
      label: 'Items Wasted',
      type: 'number',
      required: true,
      validation: {
        min: 0,
      },
      placeholder: 'Enter number of items wasted',
    },
    {
      name: 'taken_by',
      label: 'Taken By',
      type: 'text',
      required: true,
      disabled: true,
      validation: {
        minLength: 2,
        maxLength: 100,
      },
      placeholder: 'Enter who took the items (e.g., Dr. Smith)',
    },
    {
      name: 'comment',
      label: 'Comment',
      type: 'textarea',
      required: false,
      placeholder: 'Enter any additional comments',
    },
  ],
  layout: 'two-column',
});
