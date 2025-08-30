import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Package, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { FilterBar, type FilterOption } from "@/components/common/FilterBar";
import { AddDialog } from "@/components/common/AddDialog";
import { EditDialog } from "@/components/common/EditDialog";
import { DeleteDialog } from "@/components/common/DeleteDialog";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  addQuantity,
  useItems,
  type Product,
} from "@/store/slices/dialysisSlice";
import {
  createItemSchema,
  editItemSchema,
  addQuantitySchema,
  useItemsSchema,
  createItemDefaultValues,
  getEditItemDefaultValues,
  addQuantityDefaultValues,
  useItemsDefaultValues,
} from "./schemas";
import type { RootState, AppDispatch } from "@/store";

const ItemsPageComponent = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    products,
    productsArray,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isAddingQuantity,
    isUsingItems,
    error,
  } = useSelector((state: RootState) => state.dialysis);

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addQuantityDialogOpen, setAddQuantityDialogOpen] = useState(false);
  const [useItemsDialogOpen, setUseItemsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValues, setFilterValues] = useState({
    item_type: "",
    quantity_type: "",
  });

  // Filter configuration
  const filterOptions: FilterOption[] = [
    {
      key: "item_type",
      label: "Item Type",
      type: "text",
      placeholder: "Search by item type...",
    },
    {
      key: "quantity_type",
      label: "Quantity Type",
      type: "select",
      placeholder: "Select quantity type",
      options: [
        { value: "", label: "All" },
        { value: "none", label: "None" },
        { value: "boxes", label: "Boxes" },
        { value: "bottles", label: "Bottles" },
        { value: "packs", label: "Packs" },
        { value: "units", label: "Units" },
        { value: "pieces", label: "Pieces" },
        { value: "bags", label: "Bags" },
        { value: "tubes", label: "Tubes" },
        { value: "sets", label: "Sets" },
      ],
    },
  ];

  // Fetch products on component mount
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Handle add product
  const handleAddProduct = (data: any) => {
    dispatch(
      createProduct({
        item_name: data.item_name,
        item_type: data.item_type,
        quantity: parseInt(data.quantity),
        quantity_type: data.quantity_type,
        used_items: parseInt(data.used_items),
      })
    ).then((result) => {
      if (createProduct.fulfilled.match(result)) {
        setAddDialogOpen(false);
      }
    });
  };

  // Handle edit product
  const handleEditProduct = (data: any) => {
    if (selectedProduct) {
      dispatch(
        updateProduct({
          id: selectedProduct.id,
          productData: {
            item_name: data.item_name,
            item_type: data.item_type,
            quantity: parseInt(data.quantity),
            quantity_type: data.quantity_type,
            used_items: parseInt(data.used_items),
          },
        })
      ).then((result) => {
        if (updateProduct.fulfilled.match(result)) {
          setEditDialogOpen(false);
          setSelectedProduct(null);
        }
      });
    }
  };

  // Handle delete product
  const handleDeleteProduct = () => {
    if (selectedProduct) {
      dispatch(deleteProduct(selectedProduct.id)).then((result) => {
        if (deleteProduct.fulfilled.match(result)) {
          setDeleteDialogOpen(false);
          setSelectedProduct(null);
        }
      });
    }
  };

  // Handle edit button click
  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditDialogOpen(true);
  };

  // Handle delete button click
  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  // Handle add quantity
  const handleAddQuantity = (data: any) => {
    if (selectedProduct) {
      dispatch(
        addQuantity({
          id: selectedProduct.id,
          additional_quantity: parseInt(data.additional_quantity),
        })
      ).then((result) => {
        if (addQuantity.fulfilled.match(result)) {
          setAddQuantityDialogOpen(false);
          setSelectedProduct(null);
        }
      });
    }
  };

  // Handle use items
  const handleUseItems = (data: any) => {
    if (selectedProduct) {
      dispatch(
        useItems({
          id: selectedProduct.id,
          items_to_use: parseInt(data.items_to_use),
        })
      ).then((result) => {
        if (useItems.fulfilled.match(result)) {
          setUseItemsDialogOpen(false);
          setSelectedProduct(null);
        }
      });
    }
  };

  // Handle add quantity button click
  const handleAddQuantityClick = (product: Product) => {
    setSelectedProduct(product);
    setAddQuantityDialogOpen(true);
  };

  // Handle use items button click
  const handleUseItemsClick = (product: Product) => {
    setSelectedProduct(product);
    setUseItemsDialogOpen(true);
  };

  // Filter handlers
  const handleFilterChange = (key: string, value: any) => {
    setFilterValues(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilterValues({
      item_type: "",
      quantity_type: "",
    });
    setSearchTerm("");
  };

  // Filter data based on search and filter values
  const filteredData = (productsArray || products?.results || []).filter((item: Product) => {
    // Search term filter (searches in item_name)
    if (searchTerm && !item.item_name?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Item type filter
    if (filterValues.item_type && !item.item_type?.toLowerCase().includes(filterValues.item_type.toLowerCase())) {
      return false;
    }

    // Quantity type filter
    if (filterValues.quantity_type && item.quantity_type !== filterValues.quantity_type) {
      return false;
    }

    return true;
  });

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Table columns configuration
  const columns: Column<Product>[] = [
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
    },
    {
      key: "available_items",
      header: "Available Items",
      sortable: true,
      width: "140px",
      render: (value) => (
        <span className="font-medium text-green-600">{value}</span>
      ),
    },
    {
      key: "quantity_type",
      header: "Quantity Type",
      sortable: true,
      width: "120px",
      render: (value) => <span className="capitalize">{value}</span>,
    },
    {
      key: "created_at",
      header: "Created At",
      sortable: true,
      width: "180px",
      render: (value) => formatDate(value),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Dialysis Items Management"
        description="Manage dialysis center inventory and medical supplies"
      >
        <Button
          onClick={() => setAddDialogOpen(true)}
          disabled={isCreating}
          className="flex items-center gap-2"
        >
          {isCreating ? <Spinner size="sm" /> : <Plus className="h-4 w-4" />}
          Add New Item
        </Button>
      </PageHeader>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <FilterBar
        filters={filterOptions}
        values={filterValues}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        searchKey="item_name"
        searchPlaceholder="Search items by name..."
        onSearchChange={setSearchTerm}
        searchValue={searchTerm}
        showClearButton={true}
      />

      {/* Data Table */}
      <DataTable
        data={filteredData}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        actions={(row) => (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAddQuantityClick(row)}
              className="h-8 w-8 p-0"
              title="Update Quantity"
            >
              <Package className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleUseItemsClick(row)}
              className="h-8 w-8 p-0"
              title="Use Items"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </>
        )}
        loading={isLoading}
        emptyMessage="No items found. Add your first item to get started."
        pagination={true}
        pageSize={10}
      />

      {/* Add Dialog */}
      <AddDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        title="Add New Item"
        description="Add a new dialysis item to the inventory"
        schema={createItemSchema}
        defaultValues={createItemDefaultValues}
        onSubmit={handleAddProduct}
        loading={isCreating}
        submitText={isCreating ? "Adding..." : "Add Item"}
        error={error}
      />

      {/* Edit Dialog */}
      <EditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        title="Edit Item"
        description="Update the item information"
        schema={editItemSchema}
        defaultValues={
          selectedProduct ? getEditItemDefaultValues(selectedProduct) : {}
        }
        onSubmit={handleEditProduct}
        loading={isUpdating}
        submitText={isUpdating ? "Updating..." : "Update Item"}
        error={error}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
        itemName={selectedProduct?.item_name}
        onConfirm={handleDeleteProduct}
        loading={isDeleting}
        confirmText={isDeleting ? "Deleting..." : "Delete Item"}
      />

      {/* Update Quantity Dialog */}
      <AddDialog
        open={addQuantityDialogOpen}
        onOpenChange={setAddQuantityDialogOpen}
        title="Update Quantity"
        description={`Update quantity to "${selectedProduct?.item_name}"`}
        schema={addQuantitySchema}
        defaultValues={addQuantityDefaultValues}
        onSubmit={handleAddQuantity}
        loading={isAddingQuantity}
        submitText={isAddingQuantity ? "Updating..." : "Update Quantity"}
        error={error}
      />

      {/* Use Items Dialog */}
      <AddDialog
        open={useItemsDialogOpen}
        onOpenChange={setUseItemsDialogOpen}
        title="Use Items"
        description={`Use items from "${selectedProduct?.item_name}"`}
        schema={useItemsSchema}
        defaultValues={useItemsDefaultValues}
        onSubmit={handleUseItems}
        loading={isUsingItems}
        submitText={isUsingItems ? "Using..." : "Use Items"}
        error={error}
      />
    </div>
  );
};

export default ItemsPageComponent;
