import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { DynamicForm } from "./DynamicForm";
import { FormSchema } from "./FormSchema";

interface ResponsiveAddDialogProps {
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
  getMediaUrl?: (path: string | null | undefined) => string | null;
  showCancelButton?: boolean;
}

// Hook to detect screen size
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    // Check on mount
    checkIsMobile();

    // Add event listener
    window.addEventListener("resize", checkIsMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return isMobile;
};

export const ResponsiveAddDialog: React.FC<ResponsiveAddDialogProps> = ({
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
  showCancelButton = true,
}) => {
  const isMobile = useIsMobile();

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  const handleSubmit = (data: any) => {
    onSubmit(data);
  };

  console.log(error);

  // Common content component
  const FormContent = () => (
    <>
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
    </>
  );

  // Render Dialog for desktop/laptop
  if (!isMobile) {
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
            <FormContent />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Render Drawer for mobile/tablet
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>

        <div className="px-4 pb-4 overflow-y-auto flex-1">
          <FormContent />
        </div>
      </DrawerContent>
    </Drawer>
  );
};
