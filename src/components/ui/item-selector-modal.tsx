import React, { useState, useEffect } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Badge } from "./badge";
import { Checkbox } from "./checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./dialog";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "./table";
import { Search, Package, Stethoscope, X } from "lucide-react";

export interface ItemData {
  id: number;
  item_name: string;
  item_type: string;
  available_items: number;
  quantity_type: string;
  quantity?: number;
  new_quantity?: number;
  used_items?: number;
}

interface ItemSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: ItemData[];
  selectedItems: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  title: string;
  type: "inventory" | "medical";
  loading?: boolean;
}

export const ItemSelectorModal: React.FC<ItemSelectorModalProps> = ({
  open,
  onOpenChange,
  items,
  selectedItems,
  onSelectionChange,
  title,
  type,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState<ItemData[]>(items);
  const [tempSelectedItems, setTempSelectedItems] =
    useState<string[]>(selectedItems);

  // Update filtered items when search term or items change
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredItems(items);
    } else {
      const filtered = items.filter(
        (item) =>
          item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.item_type.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredItems(filtered);
    }
  }, [searchTerm, items]);

  // Update temp selection when selectedItems prop changes
  useEffect(() => {
    setTempSelectedItems(selectedItems);
  }, [selectedItems]);

  const handleItemToggle = (itemId: string) => {
    setTempSelectedItems((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleSelectAll = () => {
    const allIds = filteredItems.map((item) => item.id.toString());
    setTempSelectedItems(allIds);
  };

  const handleDeselectAll = () => {
    setTempSelectedItems([]);
  };

  const handleApply = () => {
    onSelectionChange(tempSelectedItems);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setTempSelectedItems(selectedItems);
    onOpenChange(false);
  };

  const getSelectedCount = () => {
    return tempSelectedItems.length;
  };

  const getTotalCount = () => {
    return filteredItems.length;
  };

  const getAvailabilityColor = (available: number) => {
    if (available === 0) return "text-red-600 bg-red-50";
    if (available < 10) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  const getAvailabilityText = (available: number) => {
    if (available === 0) return "Out of Stock";
    if (available < 10) return "Low Stock";
    return "In Stock";
  };

  const getStockStatus = () => {
    const outOfStock = filteredItems.filter(
      (item) => item.available_items === 0,
    ).length;
    const lowStock = filteredItems.filter(
      (item) => item.available_items > 0 && item.available_items < 10,
    ).length;
    const inStock = filteredItems.filter(
      (item) => item.available_items >= 10,
    ).length;

    return { outOfStock, lowStock, inStock };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === "inventory" ? (
              <Package className="h-5 w-5 text-blue-600" />
            ) : (
              <Stethoscope className="h-5 w-5 text-green-600" />
            )}
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Search and Controls */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search items by name or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={filteredItems.length === 0}
              >
                Select All ({getTotalCount()})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeselectAll}
                disabled={tempSelectedItems.length === 0}
              >
                Deselect All
              </Button>
            </div>
          </div>

          {/* Selection Summary */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Selected Items:</span>
                <Badge variant="secondary" className="font-semibold">
                  {getSelectedCount()}
                </Badge>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Showing {getTotalCount()} of {items.length} items
            </div>
          </div>

          {/* Items Table */}
          <div className="flex-1 border rounded-lg overflow-hidden">
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          filteredItems.length > 0 &&
                          tempSelectedItems.length === filteredItems.length
                        }
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleSelectAll();
                          } else {
                            handleDeselectAll();
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Item Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <tr>
                    <td colSpan={2} className="p-0">
                      <div className="max-h-[200px] overflow-y-auto">
                        <table className="w-full">
                          <tbody>
                            {loading ? (
                              <tr>
                                <td colSpan={2} className="text-center py-8">
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                                    Loading items...
                                  </div>
                                </td>
                              </tr>
                            ) : filteredItems.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={2}
                                  className="text-center py-8 text-gray-500"
                                >
                                  {searchTerm
                                    ? "No items found matching your search."
                                    : "No items available."}
                                </td>
                              </tr>
                            ) : (
                              filteredItems.map((item) => {
                                const isSelected = tempSelectedItems.includes(
                                  item.id.toString(),
                                );

                                return (
                                  <tr
                                    key={item.id}
                                    className={`cursor-pointer hover:bg-gray-50 ${
                                      isSelected ? "bg-blue-50" : ""
                                    }`}
                                    onClick={() =>
                                      handleItemToggle(item.id.toString())
                                    }
                                  >
                                    <td
                                      className="px-4 py-2"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={() =>
                                          handleItemToggle(item.id.toString())
                                        }
                                      />
                                    </td>

                                    <td className="px-4 py-2 font-medium">
                                      {item.item_name}
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {getSelectedCount()} item{getSelectedCount() !== 1 ? "s" : ""}{" "}
              selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleApply}>Apply Selection</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
