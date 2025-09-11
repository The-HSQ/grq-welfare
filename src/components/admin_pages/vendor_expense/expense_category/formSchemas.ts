import { FormSchema, createFormSchema } from '@/components/common/FormSchema';
import { expenseCategoryTypeOptions } from '@/lib/schemas';

// Create Expense Category Form Schema
export const createExpenseCategoryFormSchema = createFormSchema({
  fields: [
    {
      name: 'name',
      label: 'Category Name',
      type: 'text',
      required: true,
      placeholder: 'Enter category name',
      validation: {
        minLength: 2,
        maxLength: 100,
      },
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: false,
      placeholder: 'Enter category description',
      validation: {
        minLength: 5,
        maxLength: 500,
      },
    },
    {
      name: 'category_type',
      label: 'Category Type',
      type: 'select',
      required: true,
      placeholder: 'Select category type',
      options: expenseCategoryTypeOptions,
    },
  ],
  layout: 'single',
});

// Edit Expense Category Form Schema
export const editExpenseCategoryFormSchema = createFormSchema({
  fields: [
    {
      name: 'name',
      label: 'Category Name',
      type: 'text',
      required: true,
      placeholder: 'Enter category name',
      validation: {
        minLength: 2,
        maxLength: 100,
      },
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: false,
      placeholder: 'Enter category description',
      validation: {
        minLength: 5,
        maxLength: 500,
      },
    },
    {
      name: 'category_type',
      label: 'Category Type',
      type: 'select',
      required: true,
      placeholder: 'Select category type',
      options: expenseCategoryTypeOptions,
    },
  ],
  layout: 'single',
});
