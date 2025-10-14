import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { FilterBar } from '@/components/common/FilterBar';
import { DataTable } from '@/components/common/DataTable';
import { Spinner } from '@/components/ui/spinner';
import { 
  fetchBeds, 
  createBed, 
  updateBed, 
  deleteBed, 
  fetchWards,
  clearError,
  type Bed,
  type CreateBedData,
  type UpdateBedData
} from '@/store/slices/dialysisSlice';
import { createBedSchema, editBedSchema, bedTableColumns } from './schemas';
import type { FilterOption } from '@/components/common/FilterBar';
import { ResponsiveAddDialog, ResponsiveEditDialog, ResponsiveDeleteDialog } from '@/components/common';

const BedsPageComponent = () => {
  const dispatch = useAppDispatch();
  const { 
    beds, 
    wards, 
    isLoadingBeds, 
    isCreating, 
    isUpdating, 
    isDeleting, 
    error 
  } = useAppSelector((state) => state.dialysis);

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);

  // Filter states
  const [filters, setFilters] = useState({
    ward: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Filter options
  const filterOptions: FilterOption[] = [
    {
      key: 'ward',
      label: 'Ward',
      type: 'select',
      placeholder: 'Filter by ward',
      options: wards?.map((ward: any) => ({ value: ward.id, label: ward.ward_name })) || [],
    },
  ];

  // Load data on component mount
  useEffect(() => {
    dispatch(fetchBeds());
    dispatch(fetchWards());
  }, [dispatch]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Update ward options in schemas when wards data is loaded
  useEffect(() => {
    if (wards) {
      const wardOptions = wards.map((ward: any) => ({ value: ward.id, label: ward.ward_name }));
      createBedSchema.updateFieldOptions('ward', wardOptions);
      editBedSchema.updateFieldOptions('ward', wardOptions);
    }
  }, [wards]);

  // Filter and search data
  const filteredData = beds?.filter((bed: any) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!bed.bed_name?.toLowerCase().includes(searchLower) && 
          !bed.ward_name?.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Ward filter
    if (filters.ward && bed.ward !== filters.ward) {
      return false;
    }

    return true;
  }) || [];

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({ ward: '' });
    setSearchTerm('');
  };

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  // Handle add bed
  const handleAddBed = (data: CreateBedData) => {
    dispatch(createBed(data));
    setAddDialogOpen(false);
  };

  // Handle edit bed
  const handleEditBed = (data: UpdateBedData) => {
    if (selectedBed) {
      dispatch(updateBed({ id: selectedBed.id, bedData: data }));
      setEditDialogOpen(false);
      setSelectedBed(null);
    }
  };

  // Handle delete bed
  const handleDeleteBed = () => {
    if (selectedBed) {
      dispatch(deleteBed(selectedBed.id));
      setDeleteDialogOpen(false);
      setSelectedBed(null);
    }
  };

  // Handle edit click
  const handleEditClick = (bed: Bed) => {
    setSelectedBed(bed);
    setEditDialogOpen(true);
  };

  // Handle delete click
  const handleDeleteClick = (bed: Bed) => {
    setSelectedBed(bed);
    setDeleteDialogOpen(true);
  };

  // Get default values for edit form
  const getEditDefaultValues = () => {
    if (!selectedBed) return {};
    return {
      bed_name: selectedBed.bed_name,
      ward: selectedBed.ward,
    };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Beds Management"
        description="Manage dialysis center beds and their assignments"
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
          Add Bed
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
        values={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        searchKey="bed_name"
        searchPlaceholder="Search beds..."
        onSearchChange={handleSearchChange}
        searchValue={searchTerm}
        defaultFiltersVisible={false}
        showToggleButton={true}
      />

      {/* Data Table */}
        <DataTable
          data={filteredData}
          columns={bedTableColumns}
          onEdit={handleEditClick}
          loading={isLoadingBeds}
          emptyMessage="No beds found"
          pagination={true}
          pageSize={10}
        />

      {/* Add Dialog */}
      <ResponsiveAddDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        title="Add New Bed"
        description="Create a new bed for the dialysis center"
        schema={createBedSchema}
        onSubmit={handleAddBed}
        loading={isCreating}
        error={error}
      />

      {/* Edit Dialog */}
      <ResponsiveEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        title="Edit Bed"
        description="Update bed information"
        schema={editBedSchema}
        defaultValues={getEditDefaultValues()}
        onSubmit={handleEditBed}
        loading={isUpdating}
        error={error}
      />

      {/* Delete Dialog */}
      {/* <ResponsiveDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Bed"
        description="Are you sure you want to delete this bed? This action cannot be undone."
        itemName={selectedBed?.bed_name}
        onConfirm={handleDeleteBed}
        loading={isDeleting}
      /> */}
    </div>
  );
};

export default BedsPageComponent;