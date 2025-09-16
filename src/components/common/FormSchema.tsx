import { z } from 'zod';
import type { FormFieldConfig } from './FormField';

export interface FormSchemaConfig {
  fields: FormFieldConfig[];
  layout?: 'single' | 'two-column' | 'three-column';
  className?: string;
}

export class FormSchema {
  private config: FormSchemaConfig;

  constructor(config: FormSchemaConfig) {
    this.config = config;
  }

  // Build Zod schema from field configurations
  buildZodSchema(): z.ZodObject<any> {
    const schemaObject: Record<string, z.ZodTypeAny> = {};

    this.config.fields.forEach((field) => {
      let fieldSchema: z.ZodTypeAny;

      // Base schema based on field type
      switch (field.type) {
        case 'email':
          fieldSchema = z.string().email('Invalid email address');
          break;
        case 'number':
          fieldSchema = z.coerce.number();
          break;
        case 'checkbox':
        case 'switch':
          fieldSchema = z.boolean();
          break;
        case 'date':
        case 'datetime-local':
        case 'time':
          fieldSchema = z.string();
          break;
        case 'file':
        case 'image':
          // For file uploads, we accept File objects, existing file paths (strings), or null/undefined/empty string
          fieldSchema = z.any().refine(
            (val) => val === null || val === undefined || val === '' || val instanceof File || (typeof val === 'string' && val.length > 0),
            'Please select a valid file'
          );
          break;
        case 'select':
        case 'searchable-select':
          // Select fields can accept both string and number values, convert to string
          fieldSchema = z.union([z.string(), z.number()]).transform(val => String(val));
          break;
        case 'multi-select':
        case 'item-selector':
          // Multi-select and item-selector fields accept arrays of strings
          fieldSchema = z.array(z.string());
          break;
        default:
          fieldSchema = z.string();
      }

      // For optional fields, make the base schema nullable to accept null values
      if (!field.required) {
        if (field.type === 'number') {
          fieldSchema = z.union([z.coerce.number(), z.null()]).transform(val => val === null ? undefined : val);
        } else if (field.type === 'checkbox' || field.type === 'switch') {
          fieldSchema = z.union([z.boolean(), z.null()]).transform(val => val === null ? false : val);
        } else if (field.type === 'date' || field.type === 'datetime-local' || field.type === 'time') {
          fieldSchema = z.union([z.string(), z.null()]).transform(val => val === null ? undefined : val);
        } else if (field.type === 'file' || field.type === 'image') {
          // File fields already handle null in their base schema
        } else if (field.type === 'multi-select' || field.type === 'item-selector') {
          // Multi-select and item-selector fields can be empty arrays
          fieldSchema = z.array(z.string()).optional();
        } else {
          // For string fields (text, textarea, etc.)
          fieldSchema = z.union([z.string(), z.null()]).transform(val => val === null || val === '' ? undefined : val);
        }
      }

      // Apply validation rules
      if (field.validation) {
        if (field.validation.minLength && fieldSchema instanceof z.ZodString) {
          fieldSchema = fieldSchema.min(field.validation.minLength, `Minimum ${field.validation.minLength} characters`);
        }
        if (field.validation.maxLength && fieldSchema instanceof z.ZodString) {
          fieldSchema = fieldSchema.max(field.validation.maxLength, `Maximum ${field.validation.maxLength} characters`);
        }
        if (field.validation.min !== undefined && fieldSchema instanceof z.ZodNumber) {
          fieldSchema = fieldSchema.min(field.validation.min, `Minimum value is ${field.validation.min}`);
        }
        if (field.validation.max !== undefined && fieldSchema instanceof z.ZodNumber) {
          fieldSchema = fieldSchema.max(field.validation.max, `Maximum value is ${field.validation.max}`);
        }
        if (field.validation.pattern && fieldSchema instanceof z.ZodString) {
          fieldSchema = fieldSchema.regex(field.validation.pattern, 'Invalid format');
        }
      }

      // Apply direct field validation rules (for backward compatibility)
      if (field.min !== undefined && fieldSchema instanceof z.ZodNumber) {
        fieldSchema = fieldSchema.min(field.min, `Minimum value is ${field.min}`);
      }
      if (field.max !== undefined && fieldSchema instanceof z.ZodNumber) {
        fieldSchema = fieldSchema.max(field.max, `Maximum value is ${field.max}`);
      }

      // Apply required/optional
      if (field.required) {
        if (fieldSchema instanceof z.ZodString) {
          fieldSchema = fieldSchema
            .min(1, `${field.label} is required`)
            .refine((val) => val.trim().length > 0, `${field.label} cannot be empty`);
        } else if (field.type === 'number') {
          fieldSchema = fieldSchema
            .refine((val) => val !== null && val !== undefined, `${field.label} is required`);
        } else if (field.type === 'checkbox' || field.type === 'switch') {
          fieldSchema = fieldSchema
            .refine((val) => val !== null && val !== undefined, `${field.label} is required`);
        } else if (field.type === 'file' || field.type === 'image') {
          fieldSchema = fieldSchema.refine(
            (val) => val !== null && val !== undefined && (val instanceof File || (typeof val === 'string' && val.length > 0)),
            `${field.label} is required`
          );
        } else if (field.type === 'select') {
          // Special validation for select fields with "OTHER" option
          const hasOtherOption = field.options?.some(option => option.value === 'OTHER');
          if (hasOtherOption) {
            fieldSchema = fieldSchema.refine(
              (val) => {
                if (!val || val === '') return false;
                if (val === 'OTHER') return false; // "OTHER" alone is not valid, need custom value
                return true;
              },
              `${field.label} is required. If you select "Other", please provide a custom value.`
            );
          } else {
            fieldSchema = fieldSchema.refine(
              (val) => val !== null && val !== undefined && val !== '',
              `${field.label} is required`
            );
          }
        }
      } else {
          fieldSchema = fieldSchema.optional();
      }
      schemaObject[field.name] = fieldSchema;
    });

    return z.object(schemaObject);
  }

  // Get default values for the form
  getDefaultValues(): Record<string, any> {
    const defaultValues: Record<string, any> = {};

    this.config.fields.forEach((field) => {
      // For optional fields, use undefined as default
      if (!field.required) {
        switch (field.type) {
          case 'checkbox':
          case 'switch':
            defaultValues[field.name] = false;
            break;
          case 'file':
          case 'image':
            defaultValues[field.name] = null;
            break;
          default:
            defaultValues[field.name] = undefined;
        }
      } else {
        // For required fields, use appropriate defaults
        switch (field.type) {
          case 'checkbox':
          case 'switch':
            defaultValues[field.name] = false;
            break;
          case 'select':
            defaultValues[field.name] = '';
            break;
          case 'number':
            defaultValues[field.name] = '';
            break;
          case 'password':
            defaultValues[field.name] = '';
            break;
          case 'file':
          case 'image':
            defaultValues[field.name] = null;
            break;
          default:
            defaultValues[field.name] = '';
        }
      }
    });

    return defaultValues;
  }

  // Get field configurations
  getFields(): FormFieldConfig[] {
    return this.config.fields;
  }

  // Get layout configuration
  getLayout(): 'single' | 'two-column' | 'three-column' {
    return this.config.layout || 'single';
  }

  // Get className
  getClassName(): string {
    return this.config.className || '';
  }

  // Validate data against schema
  validate(data: any): { success: boolean; data?: any; errors?: any } {
    const schema = this.buildZodSchema();
    const result = schema.safeParse(data);
    
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { success: false, errors: result.error };
    }
  }

  // Get field by name
  getField(name: string): FormFieldConfig | undefined {
    return this.config.fields.find(field => field.name === name);
  }

  // Update field configuration
  updateField(name: string, updates: Partial<FormFieldConfig>): void {
    const fieldIndex = this.config.fields.findIndex(field => field.name === name);
    if (fieldIndex !== -1) {
      this.config.fields[fieldIndex] = { ...this.config.fields[fieldIndex], ...updates };
    }
  }

  // Add new field
  addField(field: FormFieldConfig): void {
    this.config.fields.push(field);
  }

  // Remove field
  removeField(name: string): void {
    this.config.fields = this.config.fields.filter(field => field.name !== name);
  }

  // Update field options (for select fields)
  updateFieldOptions(name: string, options: { value: string; label: string }[]): void {
    const fieldIndex = this.config.fields.findIndex(field => field.name === name);
    if (fieldIndex !== -1) {
      this.config.fields[fieldIndex] = { 
        ...this.config.fields[fieldIndex], 
        options 
      };
    }
  }

  // Clone the schema with deep copy
  clone(): FormSchema {
    const clonedConfig = {
      ...this.config,
      fields: this.config.fields.map(field => ({
        ...field,
        options: field.options ? [...field.options] : undefined,
        validation: field.validation ? { ...field.validation } : undefined,
      }))
    };
    return new FormSchema(clonedConfig);
  }
}

// Utility function to create form schema
export const createFormSchema = (config: FormSchemaConfig): FormSchema => {
  return new FormSchema(config);
};


