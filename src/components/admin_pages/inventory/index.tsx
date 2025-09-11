import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState, AppDispatch } from "../../../store";
import {
  fetchInventoryItems,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  addQuantityToItem,
  useItemsFromInventory,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  clearAddQuantityError,
  clearUseItemsError,
  setSelectedItem,
  type InventoryItem,
  type CreateInventoryItemData,
  type UpdateInventoryItemData,
  type AddQuantityData,
  type UseItemsData,
} from "../../../store/slices/inventorySlice";
import { PageHeader } from "../../common/PageHeader";
import { DataTable, Column } from "../../common/DataTable";
import { AddDialog } from "../../common/AddDialog";
import { EditDialog } from "../../common/EditDialog";
import { DeleteDialog } from "../../common/DeleteDialog";
import { FilterBar, FilterOption } from "../../common/FilterBar";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Plus, MinusCircle, Package } from "lucide-react";
import {
  addInventorySchema,
  editInventorySchema,
  addQuantitySchema,
  useItemsSchema,
} from "./schemas";

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
    useItemsLoading,
    useItemsError,
    selectedItem,
  } = useSelector((state: RootState) => state.inventory);

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addQuantityDialogOpen, setAddQuantityDialogOpen] = useState(false);
  const [useItemsDialogOpen, setUseItemsDialogOpen] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    item_type: "",
    inventory_type: "",
    quantity_type: "",
    date: "",
    month: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [customQuantityType, setCustomQuantityType] = useState("");

  // Filter options
  const filterOptions: FilterOption[] = [
    {
      key: "inventory_type",
      label: "Location",
      type: "select",
      options: [
        { value: "", label: "All Locations" },
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
        { value: "", label: "All Types" },
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
        if (customLocation && item.inventory_type && 
            !item.inventory_type.toLowerCase().includes(customLocation.toLowerCase())) {
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
    
    // Clear custom location if user changes from "OTHER" to something else
    if (key === "inventory_type" && value !== "OTHER") {
      setCustomLocation("");
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
    setCustomLocation("");
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
    if (!useItemsDialogOpen) {
      dispatch(clearUseItemsError());
    }
  }, [
    addDialogOpen,
    editDialogOpen,
    deleteDialogOpen,
    addQuantityDialogOpen,
    useItemsDialogOpen,
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

  // Handle use items
  const handleUseItems = (data: UseItemsData) => {
    if (selectedItem) {
      dispatch(
        useItemsFromInventory({ itemId: selectedItem.id.toString(), data })
      ).then((result) => {
        if (useItemsFromInventory.fulfilled.match(result)) {
          setUseItemsDialogOpen(false);
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

  // Handle use items click
  const handleUseItemsClick = (item: InventoryItem) => {
    dispatch(setSelectedItem(item));
    setUseItemsDialogOpen(true);
  };

  // Handle view click
  const handleViewClick = (item: InventoryItem) => {
    navigate(`/office-management/inventory/${item.id}`);
  };

  // Table columns configuration
  const columns: Column<InventoryItem>[] = [
    {
      key: "item_name",
      header: "Item Name",
      sortable: true,
      width: "200px",
    },
    {
      key: "item_type",
      header: "Item Type",
      sortable: true,
      width: "120px",
      render: (value) => (
        <Badge variant="secondary" className="capitalize">
          {value}
        </Badge>
      ),
    },
    {
      key: "available_items",
      header: "Available",
      sortable: true,
      width: "100px",
      render: (value, row) => (
        <div className="font-semibold text-green-600">{value}</div>
      ),
    },
    {
      key: "quantity_type",
      header: "Quantity Type",
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
      header: "Location",
      sortable: true,
      width: "120px",
      render: (value) => (
        <Badge variant="outline" className="capitalize">
          {value}
        </Badge>
      ),
    },
    {
      key: "date",
      header: "Date",
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
        title="Update Quantity"
      >
        <Package className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleUseItemsClick(item)}
        className="h-8 w-8"
        title="Use Items"
      >
        <MinusCircle className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Welfare Inventory Management"
        description="Manage all welfare inventory items for laboratory, Women Vocational Training Center, except dialysis center"
        action={
          <Button
            onClick={() => setAddDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Item
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
        searchPlaceholder="Search welfare inventory items..."
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
            <span className="text-sm font-medium text-blue-800">Custom Location Search</span>
          </div>
          <div className="max-w-md">
            <input
              type="text"
              placeholder="Enter custom location to search..."
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-blue-600 mt-1">
              Type any location name to search for items in that location
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
        emptyMessage="No welfare inventory items found"
        pagination={true}
        pageSize={10}
        defaultSort={{ key: "date", direction: "desc" }}
      />

      {/* Add Item Dialog */}
      <AddDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        title="Add New Welfare Inventory Item"
        description="Create a new welfare inventory item with initial quantity"
        schema={addInventorySchema}
        onSubmit={handleAddItem}
        loading={createLoading}
        error={createError}
      />

      {/* Edit Item Dialog */}
      {selectedItem && (
        <EditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          title="Edit Welfare Inventory Item"
          description="Update welfare inventory item details"
          schema={editInventorySchema}
          defaultValues={{
            item_name: selectedItem.item_name,
            item_type: selectedItem.item_type,
            quantity: selectedItem.quantity,
            quantity_type: selectedItem.quantity_type,
            used_items: selectedItem.used_items,
            inventory_type: selectedItem.inventory_type,
            date: selectedItem.date,
          }}
          onSubmit={handleEditItem}
          loading={updateLoading}
          error={updateError}
        />
      )}

      {/* Delete Item Dialog */}
      {selectedItem && (
        <DeleteDialog
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
        <AddDialog
          open={addQuantityDialogOpen}
          onOpenChange={setAddQuantityDialogOpen}
          title={`Update Quantity - ${selectedItem.item_name}`}
          description={`Update quantity to ${selectedItem.item_name}. Current available: ${selectedItem.available_items} ${selectedItem.quantity_type}`}
          schema={addQuantitySchema}
          onSubmit={handleAddQuantity}
          loading={addQuantityLoading}
          error={addQuantityError}
          submitText="Update Quantity"
        />
      )}

      {/* Use Items Dialog */}
      {selectedItem && (
        <AddDialog
          open={useItemsDialogOpen}
          onOpenChange={setUseItemsDialogOpen}
          title={`Use Items - ${selectedItem.item_name}`}
          description={`Mark items as used from ${selectedItem.item_name}. Available: ${selectedItem.available_items} ${selectedItem.quantity_type}`}
          schema={useItemsSchema}
          onSubmit={handleUseItems}
          loading={useItemsLoading}
          error={useItemsError}
          submitText="Use Items"
        />
      )}
    </div>
  );
};

export default InventoryPageComponent;
