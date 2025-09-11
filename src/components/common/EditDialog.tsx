import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DynamicForm } from './DynamicForm';
import type { FormSchema } from './FormSchema';

interface EditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  schema: FormSchema;
  defaultValues: Record<string, any>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  disabled?: boolean;
  error?: string | null;
  getMediaUrl?: (path: string | null | undefined) => string | null; // Function to get media URL for existing files
  existingFiles?: Record<string, string | null>; // Existing file paths for display purposes
  showCancelButton?: boolean;
}

export const EditDialog: React.FC<EditDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  schema,
  defaultValues,
  onSubmit,
  onCancel,
  submitText = "Save Changes",
  cancelText = "Cancel",
  loading = false,
  disabled = false,
  error,
  getMediaUrl,
  existingFiles = {},
  showCancelButton = true
}) => {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  const handleSubmit = (data: any) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] overflow-y-scroll max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        
        <div className="py-4">
          {/* Error Display */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          
          <DynamicForm
            schema={schema}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
            disabled={disabled}
            submitText={submitText}
            cancelText={cancelText}
            showCancelButton={showCancelButton}
            getMediaUrl={getMediaUrl}
            existingFiles={existingFiles}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
