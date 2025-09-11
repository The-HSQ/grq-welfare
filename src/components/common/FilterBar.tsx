import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchIcon, FilterIcon, XIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date';
  placeholder?: string;
  options?: { value: string; label: string }[];
}

export interface FilterBarProps {
  filters: FilterOption[];
  values: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  onClearFilters?: () => void;
  searchKey?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  searchValue?: string;
  showClearButton?: boolean;
  showToggleButton?: boolean;
  defaultFiltersVisible?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  values,
  onFilterChange,
  onClearFilters,
  searchKey,
  searchPlaceholder = "Search...",
  onSearchChange,
  searchValue = "",
  showClearButton = true,
  showToggleButton = false,
  defaultFiltersVisible = true
}) => {
  const [filtersVisible, setFiltersVisible] = useState(defaultFiltersVisible);
  const hasActiveFilters = Object.values(values).some(value => 
    value !== undefined && value !== null && value !== "" && value !== "all"
  ) || (searchValue && searchValue.trim() !== "");

  const handleClearFilters = () => {
    if (onClearFilters) {
      onClearFilters();
    }
  };

  const renderFilterInput = (filter: FilterOption) => {
    switch (filter.type) {
      case 'text':
        return (
          <Input
            placeholder={filter.placeholder || `Enter ${filter.label.toLowerCase()}`}
            value={values[filter.key] || ""}
            onChange={(e) => onFilterChange(filter.key, e.target.value)}
            className="w-full"
          />
        );
      
      case 'select':
        return (
          <Select
            value={values[filter.key] || undefined}
            onValueChange={(value) => onFilterChange(filter.key, value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={filter.placeholder || `Select ${filter.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {filter.options?.filter(option => option.value !== '').map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'date':
        return (
          <Input
            type="date"
            value={values[filter.key] || ""}
            onChange={(e) => onFilterChange(filter.key, e.target.value)}
            className="w-full"
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FilterIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters</span>
        </div>
        
        <div className="flex items-center gap-2">
          {showToggleButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFiltersVisible(!filtersVisible)}
              className="h-8 px-2"
            >
              {filtersVisible ? (
                <>
                  <ChevronUpIcon className="h-4 w-4 mr-1" />
                  Hide Filters
                </>
              ) : (
                <>
                  <ChevronDownIcon className="h-4 w-4 mr-1" />
                  Show Filters
                </>
              )}
            </Button>
          )}
          
          {showClearButton && hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-8 px-2"
            >
              <XIcon className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {filtersVisible && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Search Input */}
          {searchKey && onSearchChange && (
            <div className="relative flex items-center">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Filter Inputs */}
          {filters.map((filter) => (
            <div key={filter.key} className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {filter.label}
              </label>
              {renderFilterInput(filter)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
