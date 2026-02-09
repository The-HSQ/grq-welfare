import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState, AppDispatch } from "../../../../store";
import {
  fetchInventoryItems,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  addQuantityToItem,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  clearAddQuantityError,
  setSelectedItem,
  type InventoryItem,
  type CreateInventoryItemData,
  type UpdateInventoryItemData,
  type AddQuantityData,
} from "../../../../store/slices/inventorySlice";
import {
  createItemUsageRecord,
  type CreateItemUsageRecordData,
} from "../../../../store/slices/itemUsageSlice";
import { PageHeader } from "../../../common/PageHeader";
import { DataTable, Column } from "../../../common/DataTable";
import { ResponsiveAddDialog } from "@/components/common";
import { ResponsiveEditDialog } from "@/components/common";
import { ResponsiveDeleteDialog } from "@/components/common";
import { FilterBar, FilterOption } from "../../../common/FilterBar";
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../ui/dialog";
import { DynamicForm } from "../../../common/DynamicForm";
import { FormSchema } from "../../../common/FormSchema";
import { Plus, Package, ClipboardList } from "lucide-react";
import {
  addInventorySchema,
  editInventorySchema,
  addQuantitySchema,
} from "./schemas";

// Schema for creating usage record
const createUsageRecordSchema = new FormSchema({
  fields: [
    {
      name: 'taken_items',
      label: 'Taken Items',
      type: 'number',
      required: true,
      validation: {
        min: 1,
      },
      placeholder: 'Enter number of items taken',
    },
    {
      name: 'taken_by',
      label: 'Taken By',
      type: 'text',
      required: true,
      validation: {
        minLength: 2,
        maxLength: 100,
      },
      placeholder: 'Enter who took the items (e.g., Dr. Smith)',
    },
    {
      name: 'comment',
      label: 'Comment',
      type: 'textarea',
      required: false,
      placeholder: 'Enter any additional comments',
    },
  ],
  layout: 'two-column',
});

const InventoryPageComponent = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const {
    items,
    loading,
    error,
    createLoading,
    createError,
    updateLoading,
    updateError,
    deleteLoading,
    deleteError,
    addQuantityLoading,
    addQuantityError,
    selectedItem,
  } = useSelector((state: RootState) => state.inventory);

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addQuantityDialogOpen, setAddQuantityDialogOpen] = useState(false);
  const [usageRecordDialogOpen, setUsageRecordDialogOpen] = useState(false);
  const [selectedItemForUsage, setSelectedItemForUsage] = useState<InventoryItem | null>(null);
  const [usageRecordError, setUsageRecordError] = useState<string | null>(null);
  const [usageRecordLoading, setUsageRecordLoading] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    item_type: "",
    inventory_type: "",
    quantity_type: "",
    date: "",
    month: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [customInventoryType, setCustomInventoryType] = useState("");
  const [customQuantityType, setCustomQuantityType] = useState("");

  // Filter options
  const filterOptions: FilterOption[] = [
    {
      key: "inventory_type",
      label: "Inventory Type",
      type: "select",
      options: [
        { value: "", label: "All Inventory Types" },
        { value: "lab", label: "Lab" },
        { value: "women_center", label: "Women Center" },
        { value: "OTHER", label: "Other" },
      ],
    },
    {
      key: "quantity_type",
      label: "Quantity Type",
      type: "select",
      options: [
        { value: "", label: "All Quantity Types" },
        { value: "none", label: "None" },
        { value: "pieces", label: "Pieces" },
        { value: "boxes", label: "Boxes" },
        { value: "bottles", label: "Bottles" },
        { value: "packs", label: "Packs" },
        { value: "units", label: "Units" },
        { value: "OTHER", label: "Other" },
      ],
    },
    {
      key: "date",
      label: "Date",
      type: "date",
    },
    {
      key: "month",
      label: "Month",
      type: "select",
      options: [
        { value: "", label: "All Months" },
        { value: "01", label: "January" },
        { value: "02", label: "February" },
        { value: "03", label: "March" },
        { value: "04", label: "April" },
        { value: "05", label: "May" },
        { value: "06", label: "June" },
        { value: "07", label: "July" },
        { value: "08", label: "August" },
        { value: "09", label: "September" },
        { value: "10", label: "October" },
        { value: "11", label: "November" },
        { value: "12", label: "December" },
      ],
    },
  ];

  // Filter and search logic
  const filteredItems = items.filter((item) => {
    // Search filter
    if (
      searchTerm &&
      item.item_name &&
      !item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Inventory type filter
    if (filters.inventory_type) {
      if (filters.inventory_type === "OTHER") {
        // If "Other" is selected, use custom location search
        if (customInventoryType && item.inventory_type && 
            !item.inventory_type.toLowerCase().includes(customInventoryType.toLowerCase())) {
          return false;
        }
      } else {
        // For predefined locations, use exact match
        if (item.inventory_type !== filters.inventory_type) {
          return false;
        }
      }
    }

    // Quantity type filter
    if (filters.quantity_type) {
      if (filters.quantity_type === "OTHER") {
        // If "Other" is selected, use custom quantity type search
        if (customQuantityType && item.quantity_type && 
            !item.quantity_type.toLowerCase().includes(customQuantityType.toLowerCase())) {
          return false;
        }
      } else {
        // For predefined quantity types, use exact match
        if (item.quantity_type !== filters.quantity_type) {
          return false;
        }
      }
    }

    // Date filter
    if (filters.date && item.date !== filters.date) {
      return false;
    }

    // Month filter
    if (filters.month && item.date) {
      const itemMonth = new Date(item.date).getMonth() + 1; // getMonth() returns 0-11, so add 1
      const selectedMonth = parseInt(filters.month);
      if (itemMonth !== selectedMonth) {
        return false;
      }
    }

    return true;
  });

  // Filter handlers
  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    
    // Clear custom inventory type if user changes from "OTHER" to something else
    if (key === "inventory_type" && value !== "OTHER") {
      setCustomInventoryType("");
    }
    
    // Clear custom quantity type if user changes from "OTHER" to something else
    if (key === "quantity_type" && value !== "OTHER") {
      setCustomQuantityType("");
    }
  };

  const handleClearFilters = () => {
    setFilters({
      item_type: "",
      inventory_type: "",
      quantity_type: "",
      date: "",
      month: "",
    });
    setSearchTerm("");
    setCustomInventoryType("");
    setCustomQuantityType("");
  };

  // Fetch inventory items on component mount
  useEffect(() => {
    dispatch(fetchInventoryItems());
  }, [dispatch]);

  // Clear errors when dialogs close
  useEffect(() => {
    if (!addDialogOpen) {
      dispatch(clearCreateError());
    }
    if (!editDialogOpen) {
      dispatch(clearUpdateError());
    }
    if (!deleteDialogOpen) {
      dispatch(clearDeleteError());
    }
    if (!addQuantityDialogOpen) {
      dispatch(clearAddQuantityError());
    }
  }, [
    addDialogOpen,
    editDialogOpen,
    deleteDialogOpen,
    addQuantityDialogOpen,
    dispatch,
  ]);

  // Handle add inventory item
  const handleAddItem = (data: CreateInventoryItemData) => {
    dispatch(createInventoryItem(data)).then((result) => {
      if (createInventoryItem.fulfilled.match(result)) {
        setAddDialogOpen(false);
      }
    });
  };

  // Handle edit inventory item
  const handleEditItem = (data: UpdateInventoryItemData) => {
    if (selectedItem) {
      dispatch(
        updateInventoryItem({
          itemId: selectedItem.id.toString(),
          itemData: data,
        })
      ).then((result) => {
        if (updateInventoryItem.fulfilled.match(result)) {
          setEditDialogOpen(false);
          dispatch(setSelectedItem(null));
        }
      });
    }
  };

  // Handle delete inventory item
  const handleDeleteItem = () => {
    if (selectedItem) {
      dispatch(deleteInventoryItem(selectedItem.id.toString())).then(
        (result) => {
          if (deleteInventoryItem.fulfilled.match(result)) {
            setDeleteDialogOpen(false);
            dispatch(setSelectedItem(null));
          }
        }
      );
    }
  };

  // Handle add quantity
  const handleAddQuantity = (data: AddQuantityData) => {
    if (selectedItem) {
      dispatch(
        addQuantityToItem({ itemId: selectedItem.id.toString(), data })
      ).then((result) => {
        if (addQuantityToItem.fulfilled.match(result)) {
          setAddQuantityDialogOpen(false);
          dispatch(setSelectedItem(null));
        }
      });
    }
  };

  // Handle edit click
  const handleEditClick = (item: InventoryItem) => {
    dispatch(setSelectedItem(item));
    setEditDialogOpen(true);
  };

  // Handle delete click
  const handleDeleteClick = (item: InventoryItem) => {
    dispatch(setSelectedItem(item));
    setDeleteDialogOpen(true);
  };

  // Handle add quantity click
  const handleAddQuantityClick = (item: InventoryItem) => {
    dispatch(setSelectedItem(item));
    setAddQuantityDialogOpen(true);
  };

  // Handle view click
  const handleViewClick = (item: InventoryItem) => {
    navigate(`/office-management/inventory/${item.id}`);
  };

  // Handle create usage record click
  const handleCreateUsageRecordClick = (item: InventoryItem) => {
    setSelectedItemForUsage(item);
    setUsageRecordError(null); // Clear any previous errors
    setUsageRecordDialogOpen(true);
  };

  // Handle usage record form submission
  const handleUsageRecordSubmit = (data: any) => {
    if (!selectedItemForUsage) return;

    setUsageRecordLoading(true);
    setUsageRecordError(null);

    const usageData: CreateItemUsageRecordData = {
      itemid: selectedItemForUsage.id,
      taken_items: data.taken_items,
      itemused: 0, // Default to 0 since field was removed from form
      item_waste: 0, // Default to 0 since field was removed from form
      taken_by: data.taken_by,
      comment: data.comment || `Usage record for ${selectedItemForUsage.item_name}`
    };

    dispatch(createItemUsageRecord(usageData)).then((result) => {
      setUsageRecordLoading(false);
      
      if (createItemUsageRecord.fulfilled.match(result)) {
        setUsageRecordDialogOpen(false);
        setSelectedItemForUsage(null);
        setUsageRecordError(null);
        // Refresh the inventory items to update available quantities
        dispatch(fetchInventoryItems());
      } else {
        // Error - extract error message
        const errorPayload = result.payload as any;
        let errorMessage = "Failed to create usage record";
        
        if (errorPayload && typeof errorPayload === 'string') {
          errorMessage = errorPayload;
        } else if (errorPayload && errorPayload.message) {
          errorMessage = errorPayload.message;
        } else if (errorPayload && errorPayload.error) {
          errorMessage = errorPayload.error;
        } else if (errorPayload && typeof errorPayload === 'object') {
          // Handle field-specific errors
          const fieldErrors = Object.entries(errorPayload)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('; ');
          errorMessage = fieldErrors || errorMessage;
        }
        
        setUsageRecordError(errorMessage);
        console.error("Failed to create item usage record:", result.payload);
      }
    });
  };

  // Table columns configuration
  const columns: Column<InventoryItem>[] = [
    {
      key: "id",
      header: "ID",
      sortable: true,
      width: "100px",
    },
    {
      key: "item_name",
      header: "ITEM NAME",
      sortable: true,
      width: "200px",
    },
    {
      key: "item_type",
      header: "ITEM TYPE",
      sortable: true,
      width: "120px",
      render: (value) => (
        <Badge variant="secondary" className="capitalize">
          {value}
        </Badge>
      ),
    },
    {
      key: "total_used_items",
      header: "TOTAL USED ITEMS",
      sortable: true,
      width: "120px",
      render: (value, row) => (
        <div className="font-semibold text-red-600">{value}</div>
      ),
    },
    {
      key: "total_waste_items",
      header: "TOTAL WASTE ITEMS",
      sortable: true,
      width: "130px",
      render: (value, row) => (
        <div className="font-semibold text-yellow-600">{value}</div>
      ),
    },
    {
      key: "available_items",
      header: "AVAILABLE ITEMS",
      sortable: true,
      width: "100px",
      render: (value, row) => (
        <div className="font-semibold text-green-600">{value}</div>
      ),
    },
    {
      key: "quantity_type",
      header: "QUANTITY TYPE",
      sortable: true,
      width: "100px",
      render: (value, row) => (
        <div className="text-xs capitalize text-muted-foreground">
          {row.quantity_type}
        </div>
      ),
    },
    {
      key: "inventory_type",
      header: "INVENTORY TYPE",
      sortable: true,
      width: "120px",
      render: (value) => (
        <Badge variant="outline" className="capitalize">
          {value}
        </Badge>
      ),
    },
    {
      key: "admin_comment",
      header: "ADMIN COMMENT",
      sortable: true,
      width: "250px",
      render: (value) => (
        <div className="text-xs text-muted-foreground">{value}</div>
      ),
    },
    {
      key: "updated_at",
      header: "LAST UPDATE",
      sortable: true,
      width: "140px",
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: "date",
      header: "DATE",
      sortable: true,
      width: "120px",
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  // Custom actions for each row
  const renderActions = (item: InventoryItem) => (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleAddQuantityClick(item)}
        className="h-8 w-8"
        title="Update Available Quantity"
      >
        <Package className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleCreateUsageRecordClick(item)}
        className="h-8 w-8"
        title="Create Tracking Item Record"
      >
        <ClipboardList className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Welfare Inventory Items Management"
        description="Manage all inventory items with comprehensive tracking and tracking item records"
        action={
          <Button
            onClick={() => setAddDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Inventory Item
          </Button>
        }
      />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <FilterBar
        filters={filterOptions}
        values={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        searchKey="item_name"
        searchPlaceholder="Search inventory items..."
        onSearchChange={setSearchTerm}
        searchValue={searchTerm}
        showClearButton={true}
        defaultFiltersVisible={false}
        showToggleButton={true}
      />

      {/* Custom Location Input - Show when "Other" is selected */}
      {filters.inventory_type === "OTHER" && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-blue-800">Custom Inventory Type Search</span>
          </div>
          <div className="max-w-md">
            <input
              type="text"
              placeholder="Enter custom inventory type to search..."
              value={customInventoryType}
              onChange={(e) => setCustomInventoryType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-blue-600 mt-1">
              Type any inventory type to search for items in that inventory type
            </p>
          </div>
        </div>
      )}

      {/* Custom Quantity Type Input - Show when "Other" is selected */}
      {filters.quantity_type === "OTHER" && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-green-800">Custom Quantity Type Search</span>
          </div>
          <div className="max-w-md">
            <input
              type="text"
              placeholder="Enter custom quantity type to search..."
              value={customQuantityType}
              onChange={(e) => setCustomQuantityType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-xs text-green-600 mt-1">
              Type any quantity type to search for items with that quantity type
            </p>
          </div>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={filteredItems}
        columns={columns}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onView={handleViewClick}
        actions={renderActions}
        loading={loading}
        emptyMessage="No inventory items found"
        pagination={true}
        pageSize={10}
        defaultSort={{ key: "date", direction: "desc" }}
      />

      {/* Add Item Dialog */}
      <ResponsiveAddDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        title="Add New Inventory Item"
        description="Create a new inventory item with initial quantity"
        schema={addInventorySchema}
        onSubmit={handleAddItem}
        loading={createLoading}
        error={createError}
      />

      {/* Edit Item Dialog */}
      {selectedItem && (
        <ResponsiveEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          title="Edit Inventory Item"
          description="Update inventory item details"
          schema={editInventorySchema}
          defaultValues={{
            item_name: selectedItem.item_name,
            item_type: selectedItem.item_type,
            available_items: selectedItem.available_items,
            quantity_type: selectedItem.quantity_type,
            inventory_type: selectedItem.inventory_type,
            admin_comment: selectedItem.admin_comment,
            date: selectedItem.date,
          }}
          onSubmit={handleEditItem}
          loading={updateLoading}
          error={updateError}
        />
      )}

      {/* Delete Item Dialog */}
      {selectedItem && (
        <ResponsiveDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Inventory Item"
          description="Are you sure you want to delete this inventory item? This action cannot be undone."
          itemName={selectedItem.item_name}
          onConfirm={handleDeleteItem}
          loading={deleteLoading}
          error={deleteError}
        />
      )}

      {/* Add Quantity Dialog */}
      {selectedItem && (
        <ResponsiveAddDialog
          open={addQuantityDialogOpen}
          onOpenChange={setAddQuantityDialogOpen}
          title={`Add Available Quantity - ${selectedItem.item_name}`}
          description={`Add additional available quantity to ${selectedItem.item_name}. Current available: ${selectedItem.available_items} ${selectedItem.quantity_type}`}
          schema={addQuantitySchema}
          onSubmit={handleAddQuantity}
          loading={addQuantityLoading}
          error={addQuantityError}
          submitText="Add Available Quantity"
        />
      )}

      {/* Usage Record Dialog */}
      {selectedItemForUsage && (
        <Dialog open={usageRecordDialogOpen} onOpenChange={setUsageRecordDialogOpen}>
          <DialogContent className="sm:max-w-[600px] overflow-y-scroll max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Create Tracking Item Record</DialogTitle>
              <DialogDescription>
                Create a tracking item record for {selectedItemForUsage.item_name}. 
                Available: {selectedItemForUsage.available_items} {selectedItemForUsage.quantity_type}
              </DialogDescription>
            </DialogHeader>

            <div className="">
              Available Items: <span className="font-semibold text-green-600">{selectedItemForUsage.available_items} {selectedItemForUsage.quantity_type}</span>
            </div>
            
            <div className="py-4">
              {/* Error Display */}
              {usageRecordError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">{usageRecordError}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <DynamicForm
                schema={createUsageRecordSchema}
                onSubmit={handleUsageRecordSubmit}
                onCancel={() => {
                  setUsageRecordDialogOpen(false);
                  setSelectedItemForUsage(null);
                  setUsageRecordError(null);
                }}
                loading={usageRecordLoading}
                submitText="Create Tracking Item Record"
                cancelText="Cancel"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default InventoryPageComponent;
