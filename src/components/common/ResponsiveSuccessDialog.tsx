import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, User, Hash } from 'lucide-react';

interface ResponsiveSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  patientName?: string;
  tokenNumber?: number;
  onClose?: () => void;
  closeText?: string;
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

export const ResponsiveSuccessDialog: React.FC<ResponsiveSuccessDialogProps> = ({
  open,
  onOpenChange,
  title = "Token Number Created Successfully!",
  description = "Now Use Token Number for the patient appointment.",
  patientName,
  tokenNumber,
  onClose,
  closeText = "Close"
}) => {
  const isMobile = useIsMobile();

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    onOpenChange(false);
  };

  // Common content component
  const SuccessContent = () => (
    <>
      {/* Success Icon and Header */}
      <div className="flex flex-col items-center mb-6">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-primary" />
        </div>
        <h2 className="text-2xl text-primary font-semibold text-center">{title}</h2>
        {description && (
          <p className="text-base mt-2 text-center text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      
      {/* Token Details */}
      <div className="bg-primary/10 border border-primary rounded-lg p-6 space-y-4 mb-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-primary mb-4">
            Token Number Details
          </h3>
        </div>
        
        <div className="space-y-3">
          {tokenNumber && (
            <div className="flex items-center justify-between p-3 bg-background rounded-md border">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-medium text-secondary-foreground">Token Number:</span>
              </div>
              <span className="font-bold text-primary text-lg">{tokenNumber}</span>
            </div>
          )}
          
          {patientName && (
            <div className="flex items-center justify-between p-3 bg-background rounded-md border">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span className="font-medium text-secondary-foreground">Patient Name:</span>
              </div>
              <span className="font-bold text-primary text-lg">{patientName}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Close Button */}
      <div className="flex justify-center">
        <Button 
          onClick={handleClose}
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-2"
        >
          {closeText}
        </Button>
      </div>
    </>
  );

  // Render Dialog for desktop/laptop
  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="sr-only">
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          
          <div className="py-4">
            <SuccessContent />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Render Drawer for mobile/tablet
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="sr-only">
          <DrawerTitle>{title}</DrawerTitle>
          {description && (
            <DrawerDescription>{description}</DrawerDescription>
          )}
        </DrawerHeader>
        
        <div className="px-4 pb-4 overflow-y-auto flex-1">
          <SuccessContent />
        </div>
      </DrawerContent>
    </Drawer>
  );
};
