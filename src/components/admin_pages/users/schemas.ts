import { FormSchema } from '../../common/FormSchema';

// Role options for the select field
export const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'office_admin', label: 'Office Admin' },
    { value: 'medical_admin', label: 'Dialysis Admin' },
    { value: 'accountant_medical', label: 'Dialysis Reception' },
];

// Schema for adding a new user
export const addUserSchema = new FormSchema({
  fields: [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      required: true,
      validation: {
        minLength: 2,
        maxLength: 100,
      },
      placeholder: 'Enter full name',
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      validation: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      },
      placeholder: 'Enter email address',
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      required: true,
      options: roleOptions,
      placeholder: 'Select user role',
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      required: true,
      validation: {
        minLength: 8,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      },
      placeholder: 'Enter password (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)',
    },
  ],
  layout: 'single',
});

// Schema for editing an existing user
export const editUserSchema = new FormSchema({
  fields: [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      required: true,
      validation: {
        minLength: 2,
        maxLength: 100,
      },
      placeholder: 'Enter full name',
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      validation: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      },
      placeholder: 'Enter email address',
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      required: true,
      options: roleOptions,
      placeholder: 'Select user role',
    },
    {
      name: 'password',
      label: 'New Password (Optional)',
      type: 'password',
      required: false,
      validation: {
        minLength: 8,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      },
      placeholder: 'Enter new password (optional)',
    },
    {
      name: 'password_confirm',
      label: 'Confirm New Password',
      type: 'password',
      required: false,
      placeholder: 'Confirm new password',
    },
  ],
  layout: 'single',
});
