import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, User, Hash } from 'lucide-react';

interface SuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  patientName?: string;
  tokenNumber?: number;
  onClose?: () => void;
  closeText?: string;
}

export const SuccessDialog: React.FC<SuccessDialogProps> = ({
  open,
  onOpenChange,
  title = "Token Number Created Successfully!",
  description = "Now Use Token Number for the patient appointment.",
  patientName,
  tokenNumber,
  onClose,
  closeText = "Close"
}) => {
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="flex flex-col items-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <DialogTitle className="text-2xl text-green-700">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-base mt-2">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="py-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                Token Number Details
              </h3>
            </div>
            
            <div className="space-y-3">
              {tokenNumber && (
                <div className="flex items-center justify-between p-3 bg-white rounded-md border">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-gray-700">Token Number:</span>
                  </div>
                  <span className="font-bold text-green-700 text-lg">{tokenNumber}</span>
                </div>
              )}
              
              {patientName && (
                <div className="flex items-center justify-between p-3 bg-white rounded-md border">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-gray-700">Patient Name:</span>
                  </div>
                  <span className="font-bold text-green-700 text-lg">{patientName}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button 
            onClick={handleClose}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-2"
          >
            {closeText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
