import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import { machineAddSchema, machineEditSchema } from './schemas';
import { 
  fetchMachines, 
  createMachine, 
  updateMachine, 
  deleteMachine,
  clearError,
  type Machine,
  type CreateMachineData,
  type UpdateMachineData
} from '@/store/slices/dialysisSlice';
import type { AppDispatch, RootState } from '@/store';

const MachinePageComponent = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    machines, 
    machinesArray,
    isLoadingMachines, 
    isCreating, 
    isUpdating, 
    isDeleting, 
    error 
  } = useSelector((state: RootState) => state.dialysis);

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);

  // Filter states
  const [filters, setFilters] = useState({
    machine_type: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Filter options
  const filterOptions: FilterOption[] = [
    {
      key: 'machine_type',
      label: 'Machine Type',
      type: 'select',
      placeholder: 'Filter by type',
      options: [
        { value: 'dialysis', label: 'Dialysis' },
        { value: 'ro', label: 'RO' },
      ],
    },
  ];

  // Table columns
  const columns: Column<Machine>[] = [
    {
      key: 'machine_name',
      header: 'Machine Name',
      sortable: true,
    },
    {
      key: 'machine_type',
      header: 'Machine Type',
      sortable: true,
      render: (value) => (
        <Badge variant="outline" className="capitalize">
          {value}
        </Badge>
      ),
    },
    {
      key: 'maintenance_date',
      header: 'Maintenance Date',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'next_maintenance_date',
      header: 'Next Maintenance',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'disinfection_chemical_change',
      header: 'Disinfection Chemical Change',
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString() : '---',
    },
    {
      key: 'dia_safe_filter_change',
      header: 'Dia Safe Filter Change',
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString() : '---',
    },
    {
      key: 'active_warnings_count',
      header: 'Active Warnings',
      sortable: true,
      render: (value) => (
        <Badge variant={value > 0 ? 'destructive' : 'secondary'}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Created At',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  // Load machines on component mount
  useEffect(() => {
    dispatch(fetchMachines());
  }, [dispatch]);

  // Clear error when dialogs close
  useEffect(() => {
    if (!addDialogOpen && !editDialogOpen && !deleteDialogOpen) {
      dispatch(clearError());
    }
  }, [addDialogOpen, editDialogOpen, deleteDialogOpen, dispatch]);

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({ machine_type: '' });
    setSearchTerm('');
  };

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  // Handle add machine
  const handleAddMachine = (data: any) => {
    const machineData: CreateMachineData = {
      machine_name: data.machine_name,
      machine_type: data.machine_type,
      status: data.status,
      maintenance_date: data.maintenance_date,
      next_maintenance_date: data.next_maintenance_date,
      disinfection_chemical_change: data.disinfection_chemical_change || null,
      dia_safe_filter_change: data.dia_safe_filter_change || null,
    };
    dispatch(createMachine(machineData)).then((result) => {
      if (createMachine.fulfilled.match(result)) {
        setAddDialogOpen(false);
      }
    });
  };

  // Handle edit machine
  const handleEditMachine = (data: any) => {
    if (!selectedMachine) return;
    
    const machineData: UpdateMachineData = {
      machine_name: data.machine_name,
      machine_type: data.machine_type,
      maintenance_date: data.maintenance_date,
      next_maintenance_date: data.next_maintenance_date,
      disinfection_chemical_change: data.disinfection_chemical_change || null,
      dia_safe_filter_change: data.dia_safe_filter_change || null,
    };
    dispatch(updateMachine({ id: selectedMachine.id, machineData })).then((result) => {
      if (updateMachine.fulfilled.match(result)) {
        setEditDialogOpen(false);
        setSelectedMachine(null);
      }
    });
  };

  // Handle delete machine
  const handleDeleteMachine = () => {
    if (!selectedMachine) return;
    
    dispatch(deleteMachine(selectedMachine.id)).then((result) => {
      if (deleteMachine.fulfilled.match(result)) {
        setDeleteDialogOpen(false);
        setSelectedMachine(null);
      }
    });
  };

  // Handle edit button click
  const handleEdit = (machine: Machine) => {
    setSelectedMachine(machine);
    setEditDialogOpen(true);
  };

  // Handle delete button click
  const handleDelete = (machine: Machine) => {
    setSelectedMachine(machine);
    setDeleteDialogOpen(true);
  };

  // Filter data based on search and filters
  const filteredData = (machinesArray || machines?.results || []).filter(machine => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!machine.machine_name?.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Machine type filter
    if (filters.machine_type && machine.machine_type !== filters.machine_type) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Machines"
        description="Manage dialysis machines and their maintenance schedules"
      >
        <Button onClick={() => setAddDialogOpen(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Machine
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
        searchKey="machine_name"
        searchPlaceholder="Search machines..."
        onSearchChange={handleSearchChange}
        searchValue={searchTerm}
        defaultFiltersVisible={false}
        showToggleButton={true}
      />

      {/* Data Table */}
      <DataTable
        data={filteredData}
        columns={columns}
        onEdit={handleEdit}
        loading={isLoadingMachines}
        emptyMessage="No machines found"
        pagination={true}
        pageSize={10}
        searchKey={undefined}
      />

      {/* Add Dialog */}
      <AddDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        title="Add New Machine"
        description="Create a new dialysis machine with maintenance schedule"
        schema={machineAddSchema}
        onSubmit={handleAddMachine}
        loading={isCreating}
        error={error}
      />

      {/* Edit Dialog */}
      <EditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        title="Edit Machine"
        description="Update machine information and maintenance schedule"
        schema={machineEditSchema}
        defaultValues={selectedMachine ? {
          machine_name: selectedMachine.machine_name,
          machine_type: selectedMachine.machine_type,
          maintenance_date: selectedMachine.maintenance_date,
          next_maintenance_date: selectedMachine.next_maintenance_date,
          disinfection_chemical_change: selectedMachine.disinfection_chemical_change || '',
          dia_safe_filter_change: selectedMachine.dia_safe_filter_change || '',
        } : {}}
        onSubmit={handleEditMachine}
        loading={isUpdating}
        error={error}
      />

      {/* Delete Dialog */}
      {/* <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Machine"
        description="Are you sure you want to delete this machine? This action cannot be undone."
        itemName={selectedMachine?.machine_name}
        onConfirm={handleDeleteMachine}
        loading={isDeleting}
      /> */}
    </div>
  );
};

export default MachinePageComponent;