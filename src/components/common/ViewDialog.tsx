import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff } from 'lucide-react';

interface ViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  data: Record<string, any>;
  fields: Array<{
    key: string;
    label: string;
    type?: 'text' | 'badge' | 'date' | 'email' | 'status';
    badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
    format?: (value: any) => string;
  }>;
  loading?: boolean;
}

export const ViewDialog: React.FC<ViewDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  data,
  fields,
  loading = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const formatValue = (field: any, value: any) => {
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }

    if (field.format) {
      return field.format(value);
    }

    switch (field.type) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'email':
        return value;
      case 'status':
        return (
          <Badge variant={value === 'active' ? 'default' : 'destructive'}>
            {value}
          </Badge>
        );
      case 'badge':
        return (
          <Badge variant={field.badgeVariant || 'secondary'}>
            {value}
          </Badge>
        );
      default:
        return value;
    }
  };

  const renderPasswordField = (field: any, value: any) => {
    if (field.key === 'plain_password') {
      return (
        <div className="flex items-center gap-2">
          <span className={showPassword ? '' : 'select-none'}>
            {showPassword ? value : '••••••••'}
          </span>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      );
    }
    return formatValue(field, value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        
        <div className="py-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-sm text-muted-foreground">Loading user details...</p>
                  </div>
                </div>
              ) : (
                fields.map((field, index) => (
                  <div key={field.key}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="font-medium text-sm text-muted-foreground">
                        {field.label}
                      </div>
                      <div className="md:col-span-2">
                        {renderPasswordField(field, data[field.key])}
                      </div>
                    </div>
                    {index < fields.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
