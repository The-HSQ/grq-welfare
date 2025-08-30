import { FormSchema } from '@/components/common/FormSchema';

// Schema for adding a new warning
export const addWarningSchema = new FormSchema({
  fields: [
    {
      name: 'machine',
      label: 'Machine',
      type: 'select',
      required: true,
      placeholder: 'Select a machine',
      options: [], // Will be populated dynamically with machines
    },
    {
      name: 'warning_description',
      label: 'Warning Description',
      type: 'textarea',
      required: true,
      placeholder: 'Enter warning description',
      validation: {
        minLength: 3,
        maxLength: 500,
      },
    },
  ],
  layout: 'single',
});

// Schema for editing an existing warning
export const editWarningSchema = new FormSchema({
  fields: [
    {
      name: 'machine',
      label: 'Machine',
      type: 'select',
      required: true,
      placeholder: 'Select a machine',
      options: [], // Will be populated dynamically with machines
    },
    {
      name: 'warning_description',
      label: 'Warning Description',
      type: 'textarea',
      required: true,
      placeholder: 'Enter warning description',
      validation: {
        minLength: 3,
        maxLength: 500,
      },
    },
  ],
  layout: 'single',
});
