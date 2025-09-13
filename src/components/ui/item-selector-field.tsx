import React, { useState } from 'react';
import { Button } from './button';
import { Badge } from './badge';
import { Label } from './label';
import { Package, Stethoscope, Plus, X } from 'lucide-react';
import { ItemSelectorModal, ItemData } from './item-selector-modal';

interface ItemSelectorFieldProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  items: ItemData[];
  type: 'inventory' | 'medical';
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  loading?: boolean;
}

export const ItemSelectorField: React.FC<ItemSelectorFieldProps> = ({
  label,
  value = [],
  onChange,
  items,
  type,
  placeholder = "Select items...",
  disabled = false,
  className = "",
  loading = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedItems = items.filter(item => value.includes(item.id.toString()));

  const handleRemoveItem = (itemId: string) => {
    onChange(value.filter(id => id !== itemId));
  };

  const handleModalSelectionChange = (selectedIds: string[]) => {
    onChange(selectedIds);
  };

  const getIcon = () => {
    return type === 'inventory' ? (
      <Package className="h-4 w-4 text-blue-600" />
    ) : (
      <Stethoscope className="h-4 w-4 text-green-600" />
    );
  };

  const getTypeColor = () => {
    return type === 'inventory' ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-green-50 border-green-200 text-green-800';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium flex items-center gap-2">
        {getIcon()}
        {value.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {value.length} selected
          </Badge>
        )}
      </Label>

      {/* Selected Items Display */}
      <div className="min-h-[40px] max-h-[150px] overflow-y-auto border border-input bg-background rounded-md p-3">
        {selectedItems.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedItems.map((item) => (
              <Badge
                key={item.id}
                variant="secondary"
                className={`flex items-center gap-2 ${getTypeColor()}`}
              >
                <span className="text-xs font-medium">{item.item_name}</span>
                <span className="text-xs opacity-75">
                  ({item.available_items} {item.quantity_type})
                </span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id.toString())}
                    className="ml-1 hover:bg-red-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center text-muted-foreground text-sm py-2">
            {placeholder}
          </div>
        )}
      </div>

      {/* Select Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        disabled={disabled || loading}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        {loading ? 'Loading...' : `Select ${type === 'inventory' ? 'Inventory Items' : 'Dialysis Products'}`}
      </Button>

      {/* Item Selector Modal */}
      <ItemSelectorModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        items={items}
        selectedItems={value}
        onSelectionChange={handleModalSelectionChange}
        title={`Select ${type === 'inventory' ? 'Inventory Items' : 'Dialysis Products'}`}
        type={type}
        loading={loading}
      />
    </div>
  );
};
