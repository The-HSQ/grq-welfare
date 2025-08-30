import { createFormSchema } from '@/components/common/FormSchema';

export const addWarningFixSchema = createFormSchema({
  fields: [
    {
      name: 'warning',
      label: 'Warning',
      type: 'select',
      required: true,
      placeholder: 'Select a warning',
      options: [], // This will be populated from the warnings data
    },
    {
      name: 'fix_warning_description',
      label: 'Fix Description',
      type: 'textarea',
      required: true,
      placeholder: 'Enter the fix description...',
      validation: {
        minLength: 10,
        maxLength: 500,
      },
    },
  ],
});

export const editWarningFixSchema = createFormSchema({
  fields: [
    {
      name: 'warning',
      label: 'Warning',
      type: 'select',
      required: true,
      placeholder: 'Select a warning',
      options: [], // This will be populated from the warnings data
    },
    {
      name: 'fix_warning_description',
      label: 'Fix Description',
      type: 'textarea',
      required: true,
      placeholder: 'Enter the fix description...',
      validation: {
        minLength: 10,
        maxLength: 500,
      },
    },
  ],
});
