import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface ResponsiveDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  itemName?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  error?: string | null;
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
    window.addEventListener('resize', checkIsMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

export const ResponsiveDeleteDialog: React.FC<ResponsiveDeleteDialogProps> = ({
  open,
  onOpenChange,
  title = "Are you sure?",
  description,
  itemName,
  onConfirm,
  onCancel,
  confirmText = "Delete",
  cancelText = "Cancel",
  loading = false,
  error = null
}) => {
  const isMobile = useIsMobile();

  const handleCancel = () => {
    if (loading) {
      return; // Don't allow canceling while loading
    }
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onConfirm();
    // Don't close dialog immediately - let the parent component handle it based on the response
  };

  const defaultDescription = itemName 
    ? `This action cannot be undone. This will permanently delete "${itemName}".`
    : "This action cannot be undone.";

  const handleOpenChange = (open: boolean) => {
    // Don't allow closing while loading
    if (!open && loading) {
      return;
    }
    onOpenChange(open);
  };

  // Common content component
  const DeleteContent = () => (
    <>
      {/* Error Display */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2">
        <Button
          onClick={handleCancel}
          disabled={loading}
          variant="outline"
          className="w-full sm:w-auto"
        >
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={loading}
          variant="destructive"
          className="w-full sm:w-auto"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Spinner size="sm" />
              <span>Deleting...</span>
            </div>
          ) : (
            confirmText
          )}
        </Button>
      </div>
    </>
  );

  // Render AlertDialog for desktop/laptop
  if (!isMobile) {
    return (
      <AlertDialog 
        open={open} 
        onOpenChange={handleOpenChange}
      >
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>
              {description || defaultDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-0">
            <DeleteContent />
          </div>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // Render Drawer for mobile/tablet
  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="max-h-[50vh]">
        <DrawerHeader className="pb-4">
          <DrawerTitle className="text-lg font-semibold">{title}</DrawerTitle>
          <DrawerDescription className="text-sm text-muted-foreground">
            {description || defaultDescription}
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="px-4 pb-4">
          <DeleteContent />
        </div>
      </DrawerContent>
    </Drawer>
  );
};
