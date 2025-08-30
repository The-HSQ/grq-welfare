import { z } from 'zod';

// Role options
export const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'medical_admin', label: 'Medical Admin' },
  { value: 'accountant_medical', label: 'Accountant Medical' },
  { value: 'office_admin', label: 'Office Admin' },
] as const;

// Status options
export const statusOptions = [
  { value: 'active', label: 'Active' },
] as const;

// Role and status types
export const roleEnum = z.enum(['admin', 'medical_admin', 'accountant_medical', 'office_admin']);
export const statusEnum = z.enum(['active']);

// Create User Schema
export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  role: roleEnum,
  status: statusEnum,
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*\d)/, 'Password must contain at least one lowercase letter, and one number'),
});

// Edit User Schema (password is optional)
export const editUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  role: roleEnum,
  status: statusEnum,
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*\d)/, 'Password must contain at least one lowercase letter, and one number')
    .optional()
    .or(z.literal('')),
  password_confirm: z
    .string()
    .optional()
    .or(z.literal('')),
}).refine((data) => {
  // If password is provided, password_confirm must match
  if (data.password && data.password !== '' && !data.password_confirm) {
    return false;
  }
  if (data.password && data.password !== '' && data.password_confirm && data.password !== data.password_confirm) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["password_confirm"],
});

// TypeScript types derived from schemas
export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type EditUserFormData = z.infer<typeof editUserSchema>;

// Validation error type
export type ValidationError = {
  field: string;
  message: string;
};

// Helper function to format validation errors
export const formatValidationErrors = (error: z.ZodError): ValidationError[] => {
  return error.issues.map((err: any) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
};
