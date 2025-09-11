import { z } from "zod";

// Role options
export const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "medical_admin", label: "Medical Admin" },
  { value: "accountant_medical", label: "Accountant Medical" },
  { value: "office_admin", label: "Office Admin" },
] as const;

// Status options
export const statusOptions = [{ value: "active", label: "Active" }] as const;

// Role and status types
export const roleEnum = z.enum([
  "admin",
  "medical_admin",
  "accountant_medical",
  "office_admin",
]);
export const statusEnum = z.enum(["active"]);

// Create User Schema
export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  role: roleEnum,
  status: statusEnum,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*\d)/,
      "Password must contain at least one lowercase letter, and one number"
    ),
});

// Edit User Schema (password is optional)
export const editUserSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be less than 50 characters")
      .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
    email: z
      .string()
      .email("Please enter a valid email address")
      .min(1, "Email is required"),
    role: roleEnum,
    status: statusEnum,
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*\d)/,
        "Password must contain at least one lowercase letter, and one number"
      )
      .optional()
      .or(z.literal("")),
    password_confirm: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      // If password is provided, password_confirm must match
      if (data.password && data.password !== "" && !data.password_confirm) {
        return false;
      }
      if (
        data.password &&
        data.password !== "" &&
        data.password_confirm &&
        data.password !== data.password_confirm
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Passwords don't match",
      path: ["password_confirm"],
    }
  );

// TypeScript types derived from schemas
export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type EditUserFormData = z.infer<typeof editUserSchema>;

// Validation error type
export type ValidationError = {
  field: string;
  message: string;
};

// Donor schemas
export const createDonorSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  contact: z
    .string()
    .min(10, "Contact must be at least 10 characters")
    .max(15, "Contact must be less than 15 characters")
    .regex(
      /^[0-9+\-\s()]+$/,
      "Contact can only contain numbers, +, -, spaces, and parentheses"
    ),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address must be less than 200 characters"),
  image: z
    .instanceof(File, { message: "Please select an image file" })
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "Image size must be less than 5MB"
    )
    .refine(
      (file) =>
        ["image/jpeg", "image/jpg", "image/png", "image/gif"].includes(
          file.type
        ),
      "Only JPEG, PNG, and GIF images are allowed"
    ),
});

export const editDonorSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  contact: z
    .string()
    .min(10, "Contact must be at least 10 characters")
    .max(15, "Contact must be less than 15 characters")
    .regex(
      /^[0-9+\-\s()]+$/,
      "Contact can only contain numbers, +, -, spaces, and parentheses"
    ),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address must be less than 200 characters"),
  image: z
    .instanceof(File, { message: "Please select an image file" })
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "Image size must be less than 5MB"
    )
    .refine(
      (file) =>
        ["image/jpeg", "image/jpg", "image/png", "image/gif"].includes(
          file.type
        ),
      "Only JPEG, PNG, and GIF images are allowed"
    )
    .optional()
    .or(z.literal("")),
});

// TypeScript types derived from donor schemas
export type CreateDonorFormData = z.infer<typeof createDonorSchema>;
export type EditDonorFormData = z.infer<typeof editDonorSchema>;

// Donation purpose options
export const purposeOptions: { value: string; label: string }[] = [
  { value: "dialysis", label: "Dialysis" },
  { value: "lab", label: "Lab" },
  { value: "woman_center", label: "Woman Center" },
  { value: "donated_vehicle", label: "Donated Vehicle" },
  { value: "computer_lab", label: "Computer Lab" },
];

// Currency options
export const currencyOptions: { value: string; label: string }[] = [
  { value: "USD", label: "USD" },
  { value: "PKR", label: "PKR" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
  { value: "OTHER", label: "Other" },
];

// Purpose and donation type enums
export const purposeEnum = z.enum([
  "dialysis",
  "lab",
  "woman_center",
  "donated_vehicle",
  "computer_lab",
]);
export const currencyEnum = z.string().min(1, "Currency is required");

// Create Donation Schema
export const createDonationSchema = z.object({
  donner: z
    .number()
    .min(1, "Please select a donor"),
  date: z.string().min(1, "Date is required"),
  amount: z
    .number()
    .min(0.01, "Amount must be greater than 0")
    .max(999999999, "Amount is too large"),
  purpose: purposeEnum,
  donation_type: z.string(),
  currency: currencyEnum,
  in_rupees: z
    .number()
    .min(0, "Amount in rupees must be positive")
    .optional()
    .or(z.literal("")),
});

// Edit Donation Schema
export const editDonationSchema = z.object({
  donner: z
    .number()
    .min(1, "Please select a donor"),
  date: z.string().min(1, "Date is required"),
  amount: z
    .number()
    .min(0.01, "Amount must be greater than 0")
    .max(999999999, "Amount is too large"),
  purpose: purposeEnum,
  donation_type: z.string(),
  currency: currencyEnum,
  in_rupees: z
    .number()
    .min(0, "Amount in rupees must be positive")
    .optional()
    .or(z.literal("")),
});

// TypeScript types derived from donation schemas
export type CreateDonationFormData = z.infer<typeof createDonationSchema>;
export type EditDonationFormData = z.infer<typeof editDonationSchema>;

// Vendor type options
export const vendorTypeOptions: { value: string; label: string }[] = [
  { value: "dialysis", label: "Dialysis" },
  { value: "lab", label: "Lab" },
  { value: "woman_center", label: "Woman Center" },
  { value: "donated_vehicle", label: "Donated Vehicle" },
  { value: "computer_lab", label: "Computer Lab" },
  { value: "zakat", label: "Zakat" },
];

// Vendor type enum
export const vendorTypeEnum = z.enum([
  "dialysis",
  "lab", 
  "woman_center",
  "donated_vehicle",
  "computer_lab",
  "zakat",
]);

// Create Vendor Schema
export const createVendorSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  contact_person: z
    .string()
    .min(2, "Contact person name must be at least 2 characters")
    .max(50, "Contact person name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Contact person name can only contain letters and spaces"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  phone: z
    .string()
    .min(10, "Phone must be at least 10 characters")
    .max(15, "Phone must be less than 15 characters")
    .regex(
      /^[0-9+\-\s()]+$/,
      "Phone can only contain numbers, +, -, spaces, and parentheses"
    ),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address must be less than 200 characters"),
  vendor_type: vendorTypeEnum,
  tax_id: z
    .string()
    .min(1, "Tax ID is required")
    .max(50, "Tax ID must be less than 50 characters"),
  payment_terms: z
    .string()
    .min(1, "Payment terms are required"),
  is_active: z.boolean(),
});

// Edit Vendor Schema
export const editVendorSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  contact_person: z
    .string()
    .min(2, "Contact person name must be at least 2 characters")
    .max(50, "Contact person name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Contact person name can only contain letters and spaces"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  phone: z
    .string()
    .min(10, "Phone must be at least 10 characters")
    .max(15, "Phone must be less than 15 characters")
    .regex(
      /^[0-9+\-\s()]+$/,
      "Phone can only contain numbers, +, -, spaces, and parentheses"
    ),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address must be less than 200 characters"),
  vendor_type: vendorTypeEnum,
  tax_id: z
    .string()
    .min(1, "Tax ID is required")
    .max(50, "Tax ID must be less than 50 characters"),
  payment_terms: z
    .string()
    .min(1, "Payment terms are required"),
  is_active: z.boolean(),
});

// TypeScript types derived from vendor schemas
export type CreateVendorFormData = z.infer<typeof createVendorSchema>;
export type EditVendorFormData = z.infer<typeof editVendorSchema>;

// Expense Category type options
export const expenseCategoryTypeOptions: { value: string; label: string }[] = [
  { value: "dialysis", label: "Dialysis" },
  { value: "lab", label: "Lab" },
  { value: "woman_center", label: "Woman Center" },
  { value: "donated_vehicle", label: "Donated Vehicle" },
  { value: "computer_lab", label: "Computer Lab" },
  { value: "zakat", label: "Zakat" },
];

// Expense Category type enum
export const expenseCategoryTypeEnum = z.enum([
  "dialysis",
  "lab", 
  "woman_center",
  "donated_vehicle",
  "computer_lab",
  "zakat",
]);

// Create Expense Category Schema
export const createExpenseCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .max(500, "Description must be less than 500 characters"),
  category_type: expenseCategoryTypeEnum,
});

// Edit Expense Category Schema
export const editExpenseCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .max(500, "Description must be less than 500 characters"),
  category_type: expenseCategoryTypeEnum,
});

// TypeScript types derived from expense category schemas
export type CreateExpenseCategoryFormData = z.infer<typeof createExpenseCategorySchema>;
export type EditExpenseCategoryFormData = z.infer<typeof editExpenseCategorySchema>;

// Payment method options
export const paymentMethodOptions: { value: string; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "credit_card", label: "Credit Card" },
  { value: "debit_card", label: "Debit Card" },
  { value: "check", label: "Check" },
  { value: "other", label: "Other" },
];

// Expense status options
export const expenseStatusOptions: { value: string; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "paid", label: "Paid" },
];

// Payment method and status enums
export const paymentMethodEnum = z.enum([
  "cash",
  "bank_transfer", 
  "credit_card",
  "debit_card",
  "check",
  "other",
]);

export const expenseStatusEnum = z.enum([
  "pending",
  "approved",
  "rejected", 
  "paid",
]);

// Create Expense Schema
export const createExpenseSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .max(1000, "Description must be less than 1000 characters"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Amount must be a valid number with up to 2 decimal places"),
  category: z
    .number()
    .min(1, "Please select a category"),
  vendor: z
    .number()
    .min(1, "Please select a vendor"),
  expense_date: z
    .string()
    .min(1, "Expense date is required"),
  payment_method: paymentMethodEnum,
  status: expenseStatusEnum,
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional()
    .or(z.literal("")),
});

// Edit Expense Schema
export const editExpenseSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .max(1000, "Description must be less than 1000 characters"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Amount must be a valid number with up to 2 decimal places"),
  category: z
    .number()
    .min(1, "Please select a category"),
  vendor: z
    .number()
    .min(1, "Please select a vendor"),
  expense_date: z
    .string()
    .min(1, "Expense date is required"),
  payment_method: paymentMethodEnum,
  status: expenseStatusEnum,
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional()
    .or(z.literal("")),
});

// TypeScript types derived from expense schemas
export type CreateExpenseFormData = z.infer<typeof createExpenseSchema>;
export type EditExpenseFormData = z.infer<typeof editExpenseSchema>;

// Helper function to format validation errors
export const formatValidationErrors = (
  error: z.ZodError
): ValidationError[] => {
  return error.issues.map((err: any) => ({
    field: err.path.join("."),
    message: err.message,
  }));
};
