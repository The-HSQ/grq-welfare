import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Controller, type FieldError } from 'react-hook-form';
import { Upload, X, FileText, Image as ImageIcon, Download, Eye, EyeOff } from 'lucide-react';

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'switch' | 'date' | 'datetime-local' | 'time' | 'file' | 'image';
  placeholder?: string;
  options?: FormFieldOption[];
  required?: boolean;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  className?: string;
  accept?: string; // For file inputs
  maxSize?: number; // Max file size in MB
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  };
}

interface FormFieldProps {
  field: FormFieldConfig;
  control: any;
  error?: FieldError;
  className?: string;
  getMediaUrl?: (path: string | null | undefined) => string | null; // Function to get media URL for existing files
}

export const FormField: React.FC<FormFieldProps> = ({
  field,
  control,
  error,
  className = '',
  getMediaUrl
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [existingFile, setExistingFile] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const renderField = (value: any, onChange: (value: any) => void) => {
    const commonProps = {
      placeholder: field.placeholder,
      disabled: field.disabled,
      className: `w-full ${field.className || ''} ${className}`,
    };

    switch (field.type) {
      case 'file':
      case 'image':
        return (
          <div className="space-y-3">
            {/* Existing File Display (for edit mode) */}
            {existingFile && !value && (
              <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {field.type === 'image' ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                    <span className="text-sm text-gray-600">Current file: {existingFile.split('/').pop()}</span>
                  </div>
                  {getMediaUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const mediaUrl = getMediaUrl(existingFile);
                        if (mediaUrl) {
                          const link = document.createElement('a');
                          link.href = mediaUrl;
                          link.download = existingFile.split('/').pop() || 'file';
                          link.click();
                        }
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {field.type === 'image' && getMediaUrl && (
                  <div className="mt-2">
                    <img
                      src={getMediaUrl(existingFile) || undefined}
                      alt="Current file"
                      className="max-w-full h-32 object-cover rounded-md border"
                    />
                  </div>
                )}
              </div>
            )}

            {/* File Input */}
            <div className="flex items-center gap-3">
              <Input
                {...commonProps}
                type="file"
                accept={field.accept || (field.type === 'image' ? 'image/*' : '*/*')}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Validate file size
                    if (field.maxSize && file.size > field.maxSize * 1024 * 1024) {
                      alert(`File size must be less than ${field.maxSize}MB`);
                      e.target.value = '';
                      return;
                    }
                    
                    onChange(file);
                    setFileName(file.name);
                    setExistingFile(null); // Clear existing file when new file is selected
                    
                    // Create preview for images
                    if (field.type === 'image' && file.type.startsWith('image/')) {
                      const url = URL.createObjectURL(file);
                      setPreviewUrl(url);
                    } else {
                      setPreviewUrl(null);
                    }
                  } else {
                    onChange(null);
                    setFileName(null);
                    setPreviewUrl(null);
                  }
                }}
              />
              {value && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onChange(null);
                    setFileName(null);
                    setPreviewUrl(null);
                    // Reset the file input
                    const fileInput = document.querySelector(`input[name="${field.name}"]`) as HTMLInputElement;
                    if (fileInput) fileInput.value = '';
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* File Name Display */}
            {fileName && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {field.type === 'image' ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                <span>{fileName}</span>
              </div>
            )}

            {/* Image Preview */}
            {previewUrl && field.type === 'image' && (
              <div className="mt-2">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-32 object-cover rounded-md border"
                />
              </div>
            )}

            {/* File Size Info */}
            {field.maxSize && (
              <p className="text-xs text-gray-500">
                Maximum file size: {field.maxSize}MB
              </p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={field.rows || 3}
          />
        );

      case 'select':
        return (
          <Select value={value || ''} onValueChange={onChange}>
            <SelectTrigger {...commonProps}>
              <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`}
              >
                {field.options?.find(option => option.value == value)?.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <Checkbox
            checked={value || false}
            onCheckedChange={onChange}
            disabled={field.disabled}
          />
        );

      case 'radio':
        return (
          <RadioGroup value={value || ''} onValueChange={onChange}>
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${field.name}-${option.value}`} />
                <Label htmlFor={`${field.name}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'switch':
        return (
          <Switch
            checked={value || false}
            onCheckedChange={onChange}
            disabled={field.disabled}
          />
        );

      case 'password':
        return (
          <div className="relative">
            <Input
              {...commonProps}
              type={showPassword ? "text" : "password"}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className={`${commonProps.className} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        );

      default:
        return (
          <Input
            {...commonProps}
            type={field.type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            min={field.min}
            max={field.max}
            step={field.step}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name} className={field.required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}>
        {field.label}
      </Label>
      <Controller
        name={field.name}
        control={control}
        render={({ field: { value, onChange } }) => {
          // Set existing file when value is a string (existing file path)
          useEffect(() => {
            if (typeof value === 'string' && value && !value.startsWith('blob:')) {
              setExistingFile(value);
            }
          }, [value]);

          // Reset password visibility when field value changes
          useEffect(() => {
            if (field.type === 'password') {
              setShowPassword(false);
            }
          }, [field.type, value]);

          return renderField(value, onChange);
        }}
      />
      {error && (
        <p className="text-sm text-red-500">{error.message}</p>
      )}
    </div>
  );
};
