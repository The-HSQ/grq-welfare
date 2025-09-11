import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterBar } from "@/components/common/FilterBar";
import { DataTable } from "@/components/common/DataTable";
import type { Column } from "@/components/common/DataTable";
import { AddDialog } from "@/components/common/AddDialog";
import { EditDialog } from "@/components/common/EditDialog";
import { DeleteDialog } from "@/components/common/DeleteDialog";
import { Spinner } from "@/components/ui/spinner";
import { PlusIcon } from "lucide-react";
import {
  fetchWards,
  createWard,
  updateWard,
  deleteWard,
  setCurrentWard,
  clearError,
  type Ward,
  type CreateWardData,
  type UpdateWardData,
} from "@/store/slices/dialysisSlice";
import { addWardSchema, editWardSchema } from "./schemas";
import type { RootState } from "@/store";

const WardsPageComponent = () => {
  const dispatch = useDispatch();
  const {
    wards,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    currentWard,
  } = useSelector((state: RootState) => state.dialysis);

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
  });

  // Load wards on component mount
  useEffect(() => {
    dispatch(fetchWards() as any);
  }, [dispatch]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Handle search change
  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      search: "",
    });
  };

  // Handle add ward
  const handleAddWard = (data: CreateWardData) => {
    dispatch(createWard(data) as any);
    setAddDialogOpen(false);
  };

  // Handle edit ward
  const handleEditWard = (data: UpdateWardData) => {
    if (currentWard) {
      dispatch(updateWard({ id: currentWard.id, wardData: data }) as any);
      setEditDialogOpen(false);
    }
  };

  // Handle delete ward
  const handleDeleteWard = () => {
    if (currentWard) {
      dispatch(deleteWard(currentWard.id) as any);
      setDeleteDialogOpen(false);
    }
  };

  // Open edit dialog
  const handleEdit = (ward: Ward) => {
    dispatch(setCurrentWard(ward));
    setEditDialogOpen(true);
  };

  // Open delete dialog
  const handleDelete = (ward: Ward) => {
    dispatch(setCurrentWard(ward));
    setDeleteDialogOpen(true);
  };

  // Filter data based on current filters
  const filteredData =
    wards?.filter((ward) => {
      // Search filter
      if (
        filters.search &&
        !ward.ward_name.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }
      return true;
    }) || [];

  // Table columns
  const columns: Column<Ward>[] = [
    {
      key: "ward_name",
      header: "Ward Name",
      sortable: true,
    },
    {
      key: "total_beds_count",
      header: "Total Beds",
      sortable: true,
      render: (value: number) => <span className="font-medium">{value}</span>,
    },
    {
      key: "created_at",
      header: "Created At",
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-muted-foreground">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Wards Management"
        description="Manage dialysis center wards and bed availability"
      >
        <Button
          onClick={() => setAddDialogOpen(true)}
          disabled={isCreating}
          className="flex items-center gap-2"
        >
          {isCreating ? (
            <Spinner size="sm" />
          ) : (
            <PlusIcon className="h-4 w-4" />
          )}
          Add Ward
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
        filters={[]}
        values={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        searchKey="ward_name"
        searchPlaceholder="Search wards..."
        onSearchChange={handleSearchChange}
        searchValue={filters.search}
        showClearButton={true}
        defaultFiltersVisible={false}
        showToggleButton={true}
      />

      {/* Data Table */}
      <DataTable
        data={filteredData}
        columns={columns}
        onEdit={handleEdit}
        loading={isLoading}
        emptyMessage="No wards found"
        pagination={true}
        pageSize={10}
      />

      {/* Add Dialog */}
      <AddDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        title="Add New Ward"
        description="Create a new ward for the dialysis center"
        schema={addWardSchema}
        onSubmit={handleAddWard}
        loading={isCreating}
        error={error}
      />

      {/* Edit Dialog */}
      <EditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        title="Edit Ward"
        description="Update ward information"
        schema={editWardSchema}
        defaultValues={currentWard ? { ward_name: currentWard.ward_name } : {}}
        onSubmit={handleEditWard}
        loading={isUpdating}
        error={error}
      />

      {/* Delete Dialog */}
      {/* <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Ward"
        description="Are you sure you want to delete this ward? This action cannot be undone."
        itemName={currentWard?.ward_name}
        onConfirm={handleDeleteWard}
        loading={isDeleting}
        confirmText="Delete Ward"
      /> */}
    </div>
  );
};

export default WardsPageComponent;
