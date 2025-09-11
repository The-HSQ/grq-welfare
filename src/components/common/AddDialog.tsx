import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DynamicForm } from './DynamicForm';
import { FormSchema } from './FormSchema';

interface AddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  schema: FormSchema;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  disabled?: boolean;
  defaultValues?: Record<string, any>;
  error?: string | null;
  getMediaUrl?: (path: string | null | undefined) => string | null; // Function to get media URL for existing files
  showCancelButton?: boolean;
}

export const AddDialog: React.FC<AddDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  schema,
  onSubmit,
  onCancel,
  submitText = "Add",
  cancelText = "Cancel",
  loading = false,
  disabled = false,
  defaultValues,
  error,
  getMediaUrl,
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
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
