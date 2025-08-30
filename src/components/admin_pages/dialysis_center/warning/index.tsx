import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusIcon } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { FilterBar } from '@/components/common/FilterBar';
import type { FilterOption } from '@/components/common/FilterBar';
import { DataTable } from '@/components/common/DataTable';
import type { Column } from '@/components/common/DataTable';
import { AddDialog } from '@/components/common/AddDialog';
import { EditDialog } from '@/components/common/EditDialog';
import { DeleteDialog } from '@/components/common/DeleteDialog';
import { Spinner } from '@/components/ui/spinner';
import { 
  fetchWarnings, 
  createWarning, 
  updateWarning, 
  deleteWarning,
  fetchMachines,
  setCurrentWarning,
  clearError 
} from '@/store/slices/dialysisSlice';
import { addWarningSchema, editWarningSchema } from './schemas';
import type { RootState } from '@/store/index';
import type { Warning } from '@/store/slices/dialysisSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const WarningPageComponent = () => {
  const dispatch = useAppDispatch();
  const { 
    warnings, 
    machinesArray, 
    isLoading, 
    isCreating, 
    isUpdating, 
    isDeleting, 
    error 
  } = useAppSelector((state: RootState) => state.dialysis);

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedWarning, setSelectedWarning] = useState<Warning | null>(null);

  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    machine: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchWarnings());
    dispatch(fetchMachines());
  }, [dispatch]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Filter options
  const filterOptions: FilterOption[] = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      placeholder: 'Filter by status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'resolved', label: 'Resolved' },
      ],
    },
    {
      key: 'machine',
      label: 'Machine',
      type: 'select',
      placeholder: 'Filter by machine',
      options: machinesArray?.map(machine => ({
        value: machine.id,
        label: machine.machine_name,
      })) || [],
    },
  ];

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({ status: '', machine: '' });
    setSearchTerm('');
  };

  // Filter data based on current filters
  const filteredData = warnings?.filter(warning => {
    // Status filter
    if (filters.status) {
      if (filters.status === 'active' && warning.is_resolved) return false;
      if (filters.status === 'resolved' && !warning.is_resolved) return false;
    }

    // Machine filter
    if (filters.machine && warning.machine !== filters.machine) return false;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return warning.warning_description.toLowerCase().includes(searchLower);
    }

    return true;
  }) || [];

  // Table columns
  const columns: Column<Warning>[] = [
    {
      key: 'warning_description',
      header: 'Description',
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      ),
    },
    {
      key: 'machine',
      header: 'Machine',
      render: (value) => {
        const machine = machinesArray?.find(m => m.id === value);
        return machine ? machine.machine_name : 'Unknown Machine';
      },
    },
    {
      key: 'is_resolved',
      header: 'Status',
      render: (value) => (
        <Badge variant={value ? 'secondary' : 'destructive'}>
          {value ? 'Resolved' : 'Active'}
        </Badge>
      ),
    },
    {
      key: 'fix_count',
      header: 'Fix Count',
      render: (value) => (
        <span className="text-sm text-muted-foreground">
          {value} fixes
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (value) => (
        <span className="text-sm text-muted-foreground">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'updated_at',
      header: 'Updated',
      render: (value) => (
        <span className="text-sm text-muted-foreground">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
  ];

  // Handle add warning
  const handleAddWarning = (data: any) => {
    dispatch(createWarning(data));
    setAddDialogOpen(false);
  };

  // Handle edit warning
  const handleEditWarning = (data: any) => {
    if (selectedWarning) {
      dispatch(updateWarning({ id: selectedWarning.id, warningData: data }));
      setEditDialogOpen(false);
      setSelectedWarning(null);
    }
  };

  // Handle delete warning
  const handleDeleteWarning = () => {
    if (selectedWarning) {
      dispatch(deleteWarning(selectedWarning.id));
      setDeleteDialogOpen(false);
      setSelectedWarning(null);
    }
  };

  // Handle edit button click
  const handleEdit = (warning: Warning) => {
    setSelectedWarning(warning);
    dispatch(setCurrentWarning(warning));
    setEditDialogOpen(true);
  };

  // Handle delete button click
  const handleDelete = (warning: Warning) => {
    setSelectedWarning(warning);
    setDeleteDialogOpen(true);
  };

  // Update schemas with machine options
  const getAddSchema = () => {
    const schema = addWarningSchema;
    const machineOptions = machinesArray?.map(machine => ({
      value: machine.id,
      label: machine.machine_name,
    })) || [];
    schema.updateFieldOptions('machine', machineOptions);
    return schema;
  };

  const getEditSchema = () => {
    const schema = editWarningSchema;
    const machineOptions = machinesArray?.map(machine => ({
      value: machine.id,
      label: machine.machine_name,
    })) || [];
    schema.updateFieldOptions('machine', machineOptions);
    return schema;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Warnings Management"
        description="Manage dialysis machine warnings and alerts"
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
          Add Warning
        </Button>
      </PageHeader>

      {/* Filter Bar */}
      <FilterBar
        filters={filterOptions}
        values={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        searchKey="warning_description"
        searchPlaceholder="Search warnings..."
        onSearchChange={setSearchTerm}
        searchValue={searchTerm}
      />

      {/* Data Table */}
      <DataTable
        data={filteredData}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={isLoading}
        emptyMessage="No warnings found"
        pagination={true}
        pageSize={10}
      />

      {/* Add Dialog */}
      <AddDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        title="Add New Warning"
        description="Create a new warning for a dialysis machine"
        schema={getAddSchema()}
        onSubmit={handleAddWarning}
        loading={isCreating}
        error={error}
      />

      {/* Edit Dialog */}
      <EditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        title="Edit Warning"
        description="Update warning information"
        schema={getEditSchema()}
        defaultValues={selectedWarning ? {
          machine: selectedWarning.machine,
          warning_description: selectedWarning.warning_description,
        } : {}}
        onSubmit={handleEditWarning}
        loading={isUpdating}
        error={error}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Warning"
        description="Are you sure you want to delete this warning? This action cannot be undone."
        itemName={selectedWarning?.warning_description}
        onConfirm={handleDeleteWarning}
        loading={isDeleting}
      />
    </div>
  );
};

export default WarningPageComponent;