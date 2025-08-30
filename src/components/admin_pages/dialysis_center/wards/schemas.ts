import { FormSchema } from '@/components/common/FormSchema';

// Add Ward Schema
export const addWardSchema = new FormSchema({
  fields: [
    {
      name: 'ward_name',
      label: 'Ward Name',
      type: 'text',
      required: true,
      placeholder: 'Enter ward name',
      validation: {
        minLength: 2,
        maxLength: 100,
      },
    },
  ],
  layout: 'single',
});

// Edit Ward Schema
export const editWardSchema = new FormSchema({
  fields: [
    {
      name: 'ward_name',
      label: 'Ward Name',
      type: 'text',
      required: true,
      placeholder: 'Enter ward name',
      validation: {
        minLength: 2,
        maxLength: 100,
      },
    },
  ],
  layout: 'single',
});
