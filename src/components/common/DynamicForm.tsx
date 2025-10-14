import React from 'react';
import { useForm, FormProvider, type FieldError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormField } from './FormField';
import { Spinner } from '@/components/ui/spinner';
import type { FormSchema } from './FormSchema';
import { Button } from '../ui/button';

interface DynamicFormProps {
  schema: FormSchema;
  defaultValues?: Record<string, any>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  submitText?: string;
  cancelText?: string;
  showCancelButton?: boolean;
  getMediaUrl?: (path: string | null | undefined) => string | null; // Function to get media URL for existing files
  existingFiles?: Record<string, string | null>; // Existing file paths for display purposes
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  schema,
  defaultValues,
  onSubmit,
  onCancel,
  loading = false,
  disabled = false,
  className = '',
  submitText = 'Submit',
  cancelText = 'Cancel',
  showCancelButton = true,
  getMediaUrl,
  existingFiles = {}
}) => {
  const zodSchema = schema.buildZodSchema();
  const formDefaultValues = defaultValues || schema.getDefaultValues();
  const layout = schema.getLayout();
  const fields = schema.getFields();

  const methods = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues: formDefaultValues,
    mode: 'onChange'
  });

  const {
    handleSubmit,
    formState: { errors, isValid }
  } = methods;



  const handleFormSubmit = (data: any) => {
    // Check if there are any file fields in the form
    const hasFileFields = fields.some(field => field.type === 'file' || field.type === 'image');
    
    if (hasFileFields) {
      // Convert to FormData for file uploads
      const formData = new FormData();
      
      Object.keys(data).forEach(key => {
        const value = data[key];
        if (value !== null && value !== undefined) {
          if (value instanceof File) {
            // Handle file uploads
            formData.append(key, value);
          } else if (typeof value === 'boolean') {
            // Handle boolean values
            formData.append(key, value.toString());
          } else {
            // Handle other values
            formData.append(key, value.toString());
          }
        }
      });
      
      onSubmit(formData);
    } else {
      // Regular form submission for non-file forms
      onSubmit(data);
    }
  };

  const handleFormCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const getLayoutClasses = () => {
    switch (layout) {
      case 'two-column':
        return 'grid grid-cols-1 md:grid-cols-2 gap-4';
      case 'three-column':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
      default:
        return 'space-y-4';
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className={`space-y-6 ${className}`}>
        <div className={getLayoutClasses()}>
          {fields.map((field) => (
            <FormField
              key={field.name}
              field={field}
              control={methods.control}
              error={errors[field.name] as FieldError}
              getMediaUrl={getMediaUrl}
              existingFile={existingFiles[field.name]}
            />
          ))}
        </div>

        <div className="flex items-center justify-end gap-2 pt-4">
          {showCancelButton && (
            <Button
              type="button"
              variant="outline"
              onClick={handleFormCancel}
              disabled={loading}
            >
              {cancelText}
            </Button>
          )}
          <Button
            type="submit"
            disabled={disabled || loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" />
                <span>Submitting...</span>
              </div>
            ) : (
              submitText
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
