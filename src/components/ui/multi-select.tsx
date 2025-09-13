import React, { useState } from 'react';
import { Button } from './button';
import { Badge } from './badge';
import { X, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value = [],
  onChange,
  placeholder = "Select items...",
  className = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (selectedValue: string) => {
    if (value.includes(selectedValue)) {
      // Remove if already selected
      onChange(value.filter(v => v !== selectedValue));
    } else {
      // Add if not selected
      onChange([...value, selectedValue]);
    }
  };

  const handleRemove = (valueToRemove: string) => {
    onChange(value.filter(v => v !== valueToRemove));
  };

  const selectedOptions = options.filter(option => value.includes(option.value));

  return (
    <div className={`relative ${className}`}>
      <div className="min-h-[40px] border border-input bg-background rounded-md p-2 flex flex-wrap gap-1">
        {selectedOptions.length > 0 ? (
          selectedOptions.map((option) => (
            <Badge key={option.value} variant="secondary" className="flex items-center gap-1">
              {option.label}
              <button
                type="button"
                onClick={() => handleRemove(option.value)}
                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        ) : (
          <span className="text-muted-foreground text-sm">{placeholder}</span>
        )}
      </div>
      
      <Select
        value=""
        onValueChange={handleSelect}
        disabled={disabled}
      >
        <SelectTrigger className="absolute inset-0 opacity-0 cursor-pointer">
          <SelectValue placeholder="" />
        </SelectTrigger>
        <SelectContent>
          {options
            .filter(option => !value.includes(option.value))
            .map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
};
