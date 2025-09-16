import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../../store";
import {
  fetchItemUsageRecords,
  createItemUsageRecord,
  updateItemUsageRecord,
  deleteItemUsageRecord,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  setSelectedRecord,
  type ItemUsageRecord,
  type CreateItemUsageRecordData,
  type UpdateItemUsageRecordData,
} from "../../../../store/slices/itemUsageSlice";
import {
  fetchInventoryItems,
  type InventoryItem,
} from "../../../../store/slices/inventorySlice";
import { PageHeader } from "../../../common/PageHeader";
import { DataTable, Column } from "../../../common/DataTable";
import { EditDialog } from "../../../common/EditDialog";
import { DeleteDialog } from "../../../common/DeleteDialog";
import { FilterBar, FilterOption } from "../../../common/FilterBar";
import { Badge } from "../../../ui/badge";
import {
  editItemUsageSchema,
} from "./schemas";

const TrackingItemsPageComponent = () => {

  const dispatch = useDispatch<AppDispatch>();
  const {
    records,
    loading,
    error,
    updateLoading,
    updateError,
    deleteLoading,
    deleteError,
    selectedRecord,
  } = useSelector((state: RootState) => state.itemUsage);
  
  const { items: inventoryItems } = useSelector((state: RootState) => state.inventory);

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    taken_by: "",
    date: "",
    month: "",
    year: "",
    itemid: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Filter options
  const filterOptions: FilterOption[] = [
    {
      key: "taken_by",
      label: "Taken By",
      type: "text",
      placeholder: "Search by person who took items",
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
    {
      key: "year",
      label: "Year",
      type: "select",
      options: [
        { value: "", label: "All Years" },
        { value: "2024", label: "2024" },
        { value: "2025", label: "2025" },
        { value: "2026", label: "2026" },
        { value: "2027", label: "2027" },
        { value: "2028", label: "2028" },
      ],
    },
    {
      key: "itemid",
      label: "Item",
      type: "select",
      options: [
        { value: "", label: "All Items" },
        ...(inventoryItems?.map((item: InventoryItem) => ({
          value: item.id.toString(),
          label: `${item.id} - ${item.item_name} (Available: ${item.available_items} ${item.quantity_type})`,
        })) || []),
      ],
    },
  ];

  // Filter and search logic
  const filteredRecords = records.filter((record) => {
    // Search filter
    if (
      searchTerm &&
      record.itemid &&
      !record.itemid.toString().includes(searchTerm) &&
      record.item_name &&
      !record.item_name.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Taken by filter
    if (filters.taken_by && 
        !record.taken_by.toLowerCase().includes(filters.taken_by.toLowerCase())) {
      return false;
    }

    // Date filter
    if (filters.date && record.date) {
      try {
        // Convert both dates to YYYY-MM-DD format for comparison
        const recordDateObj = new Date(record.date);
        const recordDate = recordDateObj.toISOString().split('T')[0];
        const filterDate = filters.date;
        
        if (recordDate !== filterDate) {
          return false;
        }
      } catch (error) {
        // If there's an error parsing the date, skip this filter
        return true;
      }
    }

    // Month filter
    if (filters.month && record.date) {
      const recordMonth = new Date(record.date).getMonth() + 1; // getMonth() returns 0-11, so add 1
      const selectedMonth = parseInt(filters.month);
      if (recordMonth !== selectedMonth) {
        return false;
      }
    }

    // Year filter
    if (filters.year && record.date) {
      const recordYear = new Date(record.date).getFullYear().toString();
      if (recordYear !== filters.year) {
        return false;
      }
    }

    // Item filter
    if (filters.itemid && record.itemid.toString() !== filters.itemid) {
      return false;
    }

    return true;
  });

  // Filter handlers
  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      taken_by: "",
      date: "",
      month: "",
      year: "",
      itemid: "",
    });
    setSearchTerm("");
  };

  // Fetch data on component mount
  useEffect(() => {
    // Fetch inventory items first, then usage records
    dispatch(fetchInventoryItems()).then(() => {
      dispatch(fetchItemUsageRecords());
    });
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
  }, [addDialogOpen, editDialogOpen, deleteDialogOpen, dispatch]);

  // Handle add item usage record
  const handleAddRecord = (data: CreateItemUsageRecordData) => {
    dispatch(createItemUsageRecord(data)).then((result) => {
      if (createItemUsageRecord.fulfilled.match(result)) {
        setAddDialogOpen(false);
        // Refresh the usage records to ensure item names are properly displayed
        dispatch(fetchItemUsageRecords());
      }
    });
  };

  // Handle edit item usage record
  const handleEditRecord = (data: UpdateItemUsageRecordData) => {
    if (selectedRecord) {
      dispatch(
        updateItemUsageRecord({
          recordId: selectedRecord.id.toString(),
          recordData: data,
        })
      ).then((result) => {
        if (updateItemUsageRecord.fulfilled.match(result)) {
          setEditDialogOpen(false);
          dispatch(setSelectedRecord(null));
          // Refresh the usage records to ensure item names are properly displayed
          dispatch(fetchItemUsageRecords());
        }
      });
    }
  };

  // Handle delete item usage record
  const handleDeleteRecord = () => {
    if (selectedRecord) {
      dispatch(deleteItemUsageRecord(selectedRecord.id.toString())).then(
        (result) => {
          if (deleteItemUsageRecord.fulfilled.match(result)) {
            setDeleteDialogOpen(false);
            dispatch(setSelectedRecord(null));
          }
        }
      );
    }
  };

  // Handle edit click
  const handleEditClick = (record: ItemUsageRecord) => {
    dispatch(setSelectedRecord(record));
    setEditDialogOpen(true);
  };

  // Handle delete click
  const handleDeleteClick = (record: ItemUsageRecord) => {
    dispatch(setSelectedRecord(record));
    setDeleteDialogOpen(true);
  };

  const createEditSchema = () => {
    // Return base schema if inventory items are not loaded yet
    if (!inventoryItems || inventoryItems.length === 0) {
      return editItemUsageSchema;
    }
    
    const itemOptions = inventoryItems.map((item: InventoryItem) => ({
      value: item.id.toString(),
      label: `${item.item_name} (Available: ${item.available_items} ${item.quantity_type})`,
    }));
    
    const schema = (editItemUsageSchema as any).clone();
    // Update the itemid field options using the built-in method
    schema.updateFieldOptions('itemid', itemOptions);
    return schema;
  };

  // Table columns configuration
  const columns: Column<ItemUsageRecord>[] = [
    {
      key: "item_name",
      header: "Item Name",
      sortable: true,
      width: "200px",
      render: (value, row) => (
        <div className="font-semibold">
          <span className="text-sm text-blue-600">
            {row.itemid} - {' '}
          </span>
           {value}
        </div>
      ),
    },
    {
      key: "taken_items",
      header: "Taken Items",
      sortable: true,
      width: "120px",
      render: (value) => (
        <div className="font-semibold text-blue-600">{value}</div>
      ),
    },
    {
      key: "itemused",
      header: "Items Used",
      sortable: true,
      width: "120px",
      render: (value) => (
        <div className="font-semibold text-green-600">{value}</div>
      ),
    },
    {
      key: "item_waste",
      header: "Items Wasted",
      sortable: true,
      width: "130px",
      render: (value) => (
        <div className="font-semibold text-red-600">{value}</div>
      ),
    },
    {
      key: "taken_by",
      header: "Taken By",
      sortable: true,
      width: "150px",
      render: (value) => (
        <Badge variant="secondary" className="capitalize">
          {value}
        </Badge>
      ),
    },
    {
      key: "comment",
      header: "Comment",
      sortable: true,
      width: "250px",
      render: (value) => (
        <div className="text-xs text-muted-foreground">{value || "No comment"}</div>
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Tracking Item Tracking"
        description="Track and manage tracking item records with detailed tracking of taken, used, and wasted items"
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
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchKey="itemid"
        searchPlaceholder="Search by item id or name..."
        showClearButton={true}
        defaultFiltersVisible={false}
        showToggleButton={true}
      />

      {/* Data Table */}
      <DataTable
        data={filteredRecords}
        columns={columns}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        loading={loading}
        emptyMessage="No tracking item records found"
        pagination={true}
        pageSize={10}
        defaultSort={{ key: "date", direction: "desc" }}
      />

      {/* Edit Usage Record Dialog */}
      {selectedRecord && (
        <EditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          title="Edit Tracking Item Record"
          description="Update tracking item record details"
          schema={createEditSchema()}
          defaultValues={{
            itemid: selectedRecord.itemid.toString(),
            taken_items: selectedRecord.taken_items,
            itemused: selectedRecord.itemused,
            item_waste: selectedRecord.item_waste,
            taken_by: selectedRecord.taken_by,
            comment: selectedRecord.comment,
          }}
          onSubmit={handleEditRecord}
          loading={updateLoading}
          error={updateError}
        />
      )}

      {/* Delete Usage Record Dialog */}
      {selectedRecord && (
        <DeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Tracking Item Record"
          description="Are you sure you want to delete this item usage record? This action cannot be undone."
          itemName={`${selectedRecord.item_name} - ${selectedRecord.taken_by}`}
          onConfirm={handleDeleteRecord}
          loading={deleteLoading}
          error={deleteError}
        />
      )}
    </div>
  );
};

export default TrackingItemsPageComponent;