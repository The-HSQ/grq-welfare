import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import { 
  fetchVehicles, 
  createVehicle, 
  updateVehicle, 
  deleteVehicle,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  type Vehicle,
  type CreateVehicleData,
  type UpdateVehicleData
} from '../../../../store/slices/vehicleSlice';
import { 
  PageHeader, 
  DataTable, 
  AddDialog, 
  EditDialog, 
  DeleteDialog, 
  FilterBar,
  type Column,
} from '../../../common';
import { Button } from '../../../ui/button';
import { Plus } from 'lucide-react';
import { createVehicleSchema, updateVehicleSchema, vehicleFilterOptions } from './schemas';
import toast from 'react-hot-toast';

const VehiclesPage: React.FC = () => {
  const dispatch = useDispatch();
  const { 
    vehicles, 
    isLoading, 
    error,
    createLoading,
    updateLoading,
    deleteLoading,
    createError,
    updateError,
    deleteError
  } = useSelector((state: RootState) => (state as any).vehicles);

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Filter states
  const [filters, setFilters] = useState<Record<string, any>>({
    vehicle_type: '',
    donated: 'all',
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Load vehicles on component mount
  useEffect(() => {
    dispatch(fetchVehicles() as any);
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

  // Filter and search vehicles
  const filteredVehicles = useMemo(() => {
    let filtered = vehicles;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter((vehicle: Vehicle) =>
        vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.number_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vehicle.donated_by && vehicle.donated_by.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply filters
    if (filters.vehicle_type && filters.vehicle_type.trim()) {
      filtered = filtered.filter((vehicle: Vehicle) => 
        vehicle.vehicle_type.toLowerCase().includes(filters.vehicle_type.toLowerCase())
      );
    }

    if (filters.donated && filters.donated !== 'all') {
      const isDonated = filters.donated === 'true';
      filtered = filtered.filter((vehicle: Vehicle) => vehicle.donated === isDonated);
    }

    return filtered;
  }, [vehicles, searchTerm, filters]);

  // Table columns
  const columns: Column<Vehicle>[] = [
    {
      key: 'name',
      header: 'Vehicle Name',
      sortable: true,
      width: '200px',
    },
    {
      key: 'number_plate',
      header: 'Number Plate',
      sortable: true,
      width: '150px',
    },
    {
      key: 'vehicle_type',
      header: 'Type',
      sortable: true,
      width: '120px',
      render: (value) => {
        const typeLabels: Record<string, string> = {
          'avery_car': 'Avery Car',
          'ambulance': 'Ambulance',
          'van': 'Van',
          'truck': 'Truck',
          'motorcycle': 'Motorcycle',
          'OTHER': 'Other',
        };
        return typeLabels[value] || value;
      },
    },
    {
      key: 'donated',
      header: 'Status',
      sortable: true,
      width: '100px',
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value 
            ? 'bg-green-100 text-green-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {value ? 'Donated' : 'Purchased'}
        </span>
      ),
    },
    {
      key: 'donated_by',
      header: 'Donated By',
      sortable: true,
      width: '150px',
      render: (value) => value || '-',
    },
    {
      key: 'rate_per_km',
      header: 'Rate/KM',
      sortable: true,
      width: '100px',
      render: (value) => `$${value}`,
    },
    {
      key: 'current_mileage',
      header: 'Mileage',
      sortable: true,
      width: '100px',
      render: (value) => value?.toLocaleString() || '0',
    },
    {
      key: 'usage_count',
      header: 'Usage Count',
      sortable: true,
      width: '120px',
      render: (value) => value || '0',
    },
    {
      key: 'last_used',
      header: 'Last Used',
      sortable: true,
      width: '120px',
      render: (value) => {
        if (!value) return '-';
        return new Date(value).toLocaleDateString();
      },
    },
  ];

  // Event handlers
  const handleAddVehicle = (data: CreateVehicleData) => {
    dispatch(createVehicle(data) as any).then((result: any) => {
      if (result.type === 'vehicles/createVehicle/fulfilled') {
        setAddDialogOpen(false);
        toast.success('Vehicle created successfully');
      }
    });
  };

  const handleEditVehicle = (data: UpdateVehicleData) => {
    if (selectedVehicle) {
      dispatch(updateVehicle({ id: selectedVehicle.id, vehicleData: data }) as any).then((result: any) => {
        if (result.type === 'vehicles/updateVehicle/fulfilled') {
          setEditDialogOpen(false);
          setSelectedVehicle(null);
          toast.success('Vehicle updated successfully');
        }
      });
    }
  };

  const handleDeleteVehicle = () => {
    if (selectedVehicle) {
      dispatch(deleteVehicle(selectedVehicle.id) as any).then((result: any) => {
        if (result.type === 'vehicles/deleteVehicle/fulfilled') {
          setDeleteDialogOpen(false);
          setSelectedVehicle(null);
          toast.success('Vehicle deleted successfully');
        }
      });
    }
  };

  const handleEditClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setDeleteDialogOpen(true);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      vehicle_type: '',
      donated: 'all',
    });
    setSearchTerm('');
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  // Get default values for edit dialog
  const getEditDefaultValues = (vehicle: Vehicle): Record<string, any> => {
    return {
      name: vehicle.name,
      number_plate: vehicle.number_plate,
      vehicle_type: vehicle.vehicle_type,
      donated: vehicle.donated,
      donated_by: vehicle.donated_by || '',
      purchase_date: vehicle.purchase_date || '',
      purchase_price: vehicle.purchase_price ? parseFloat(vehicle.purchase_price) : '',
      donation_amount: vehicle.donation_amount ? parseFloat(vehicle.donation_amount) : '',
      rate_per_km: vehicle.rate_per_km ? parseFloat(vehicle.rate_per_km) : '',
      current_mileage: vehicle.current_mileage,
    };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Vehicles Management"
        description="Manage your vehicle fleet, track usage, and monitor donations"
        action={
          <Button onClick={() => setAddDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Vehicle
          </Button>
        }
      >
      </PageHeader>

      {/* Filters */}
      <FilterBar
        filters={vehicleFilterOptions}
        values={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        searchKey="search"
        searchPlaceholder="Search vehicles by name, plate, or donor..."
        onSearchChange={handleSearchChange}
        searchValue={searchTerm}
        showToggleButton={true}
        defaultFiltersVisible={false}
      />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={filteredVehicles}
        columns={columns}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        loading={isLoading}
        emptyMessage="No vehicles found. Add your first vehicle to get started."
        pagination={true}
        pageSize={10}
        defaultSort={{ key: 'created_at', direction: 'desc' }}
      />

      {/* Add Vehicle Dialog */}
      <AddDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        title="Add New Vehicle"
        description="Enter the vehicle details below"
        schema={createVehicleSchema}
        onSubmit={handleAddVehicle}
        loading={createLoading}
        error={createError}
        cancelText='Cancel'
        showCancelButton={true}
        submitText="Add Vehicle"
      />

      {/* Edit Vehicle Dialog */}
      {selectedVehicle && (
        <EditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          title="Edit Vehicle"
          description="Update the vehicle details below"
          schema={updateVehicleSchema}
          defaultValues={getEditDefaultValues(selectedVehicle)}
          onSubmit={handleEditVehicle}
          loading={updateLoading}
          error={updateError}
          submitText="Save Changes"
        />
      )}

      {/* Delete Vehicle Dialog */}
      {selectedVehicle && (
        <DeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Vehicle"
          description="Are you sure you want to delete this vehicle? This action cannot be undone."
          itemName={selectedVehicle.name}
          onConfirm={handleDeleteVehicle}
          loading={deleteLoading}
          error={deleteError}
          confirmText="Delete Vehicle"
        />
      )}
    </div>
  );
};

export default VehiclesPage;