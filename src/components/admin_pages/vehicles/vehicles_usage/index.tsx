import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import { 
  fetchVehicleUsages, 
  createVehicleUsage, 
  updateVehicleUsage, 
  deleteVehicleUsage,
  fetchVehicles,
  clearCreateUsageError,
  clearUpdateUsageError,
  clearDeleteUsageError,
  type VehicleUsage,
  type CreateVehicleUsageData,
  type UpdateVehicleUsageData,
  type Vehicle
} from '../../../../store/slices/vehicleSlice';
import { 
  PageHeader, 
  DataTable, 
  DeleteDialog, 
  FilterBar,
  type Column,
} from '../../../common';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../ui/dialog';
import VehicleUsageForm from './VehicleUsageForm';
import { Button } from '../../../ui/button';
import { Plus } from 'lucide-react';
import { vehicleUsageFilterOptions } from './schemas';
import toast from 'react-hot-toast';

const VehiclesUsagePageComponent: React.FC = () => {
  const dispatch = useDispatch();
  const { 
    vehicleUsages, 
    vehicles,
    usageLoading,
    createUsageLoading,
    updateUsageLoading,
    deleteUsageLoading,
    createUsageError,
    updateUsageError,
    deleteUsageError
  } = useSelector((state: RootState) => (state as any).vehicles);

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUsage, setSelectedUsage] = useState<VehicleUsage | null>(null);
  // Filter states
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Load data on component mount
  useEffect(() => {
    dispatch(fetchVehicleUsages() as any);
    dispatch(fetchVehicles() as any);
  }, [dispatch]);

  // Clear errors when dialogs close
  useEffect(() => {
    if (!addDialogOpen) {
      dispatch(clearCreateUsageError());
    }
  }, [addDialogOpen, dispatch]);

  useEffect(() => {
    if (!editDialogOpen) {
      dispatch(clearUpdateUsageError());
    }
  }, [editDialogOpen, dispatch]);

  useEffect(() => {
    if (!deleteDialogOpen) {
      dispatch(clearDeleteUsageError());
    }
  }, [deleteDialogOpen, dispatch]);

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value
    }));
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = vehicleUsages;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((usage: VehicleUsage) => 
        usage.vehicle_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usage.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usage.vehicle_number_plate?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply other filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        filtered = filtered.filter((usage: VehicleUsage) => {
          switch (key) {
            case 'trip_purpose':
              return usage.trip_purpose === value;
            case 'vehicle':
              return usage.vehicle === parseInt(value);
            case 'date':
              return new Date(usage.date).toDateString() === new Date(value).toDateString();
            default:
              return true;
          }
        });
      }
    });

    return filtered;
  }, [vehicleUsages, searchTerm, filters]);

  // Table columns
  const columns: Column<VehicleUsage>[] = [
    {
      key: 'vehicle_name',
      header: 'Vehicle Name',
      sortable: true,
      width: '150px'
    },
    {
      key: 'vehicle_number_plate',
      header: 'Number Plate',
      sortable: true,
      width: '120px'
    },
    {
      key: 'trip_purpose',
      header: 'Trip Purpose',
      sortable: true,
      width: '120px',
      render: (value) => value.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
    },
    {
      key: 'driver_name',
      header: 'Driver',
      sortable: true,
      width: '120px'
    },
    {
      key: 'current_mileage',
      header: 'Start Mileage',
      sortable: true,
      width: '120px',
      render: (value) => value?.toLocaleString() || '-'
    },
    {
      key: 'end_mileage',
      header: 'End Mileage',
      sortable: true,
      width: '120px',
      render: (value) => value?.toLocaleString() || '-'
    },
    {
      key: 'total_mileage_used',
      header: 'Miles Used',
      sortable: true,
      width: '100px',
      render: (value) => value?.toLocaleString() || '-'
    },
    {
      key: 'paid_amount',
      header: 'Paid Amount',
      sortable: true,
      width: '120px',
      render: (value) => `PKR ${parseFloat(value || '0').toFixed(2)}`
    },
    {
      key: 'total_amount_to_pay',
      header: 'Total Amount to Pay',
      sortable: true,
      width: '120px',
      render: (value) => `PKR ${parseFloat(value || '0').toFixed(2)}`
    },
    {
      key: 'date',
      header: 'Date & Time',
      sortable: true,
      width: '150px',
      render: (value) => {
        const date = new Date(value);
        return (
          <div className="text-sm">
            <div>{date.toLocaleDateString()}</div>
            <div className="text-gray-500">{date.toLocaleTimeString()}</div>
          </div>
        );
      }
    },
  ];

  // Handle add vehicle usage
  const handleAddUsage = (data: CreateVehicleUsageData | UpdateVehicleUsageData) => {
    dispatch(createVehicleUsage(data as CreateVehicleUsageData) as any)
      .unwrap()
      .then(() => {
        // Refresh the vehicle usage data to get complete response with calculated fields
        dispatch(fetchVehicleUsages() as any);
        toast.success('Vehicle usage added successfully');
        setAddDialogOpen(false);
      })
      .catch((error: string) => {
        toast.error(error || 'Failed to add vehicle usage');
      });
  };

  // Handle edit vehicle usage
  const handleEditUsage = (data: CreateVehicleUsageData | UpdateVehicleUsageData) => {
    if (!selectedUsage) return;
    
    dispatch(updateVehicleUsage({ id: selectedUsage.id, usageData: data as UpdateVehicleUsageData }) as any)
      .unwrap()
      .then(() => {
        // Refresh the vehicle usage data to get complete response with calculated fields
        dispatch(fetchVehicleUsages() as any);
        toast.success('Vehicle usage updated successfully');
        setEditDialogOpen(false);
        setSelectedUsage(null);
      })
      .catch((error: string) => {
        toast.error(error || 'Failed to update vehicle usage');
      });
  };

  // Handle delete vehicle usage
  const handleDeleteUsage = () => {
    if (!selectedUsage) return;
    
    dispatch(deleteVehicleUsage(selectedUsage.id) as any)
      .unwrap()
      .then(() => {
        toast.success('Vehicle usage deleted successfully');
        setDeleteDialogOpen(false);
        setSelectedUsage(null);
      })
      .catch((error: string) => {
        toast.error(error || 'Failed to delete vehicle usage');
      });
  };

  // Handle edit click
  const handleEditClick = (usage: VehicleUsage) => {
    setSelectedUsage(usage);
    setEditDialogOpen(true);
  };

  // Handle delete click
  const handleDeleteClick = (usage: VehicleUsage) => {
    setSelectedUsage(usage);
    setDeleteDialogOpen(true);
  };

  // Get vehicle options for select fields
  const vehicleOptions = useMemo(() => {
    return vehicles.map((vehicle: Vehicle) => ({
      value: vehicle.id.toString(),
      label: `${vehicle.name} (${vehicle.number_plate})`
    }));
  }, [vehicles]);



  // Update filter options with vehicle options
  const filterOptions = useMemo(() => {
    return vehicleUsageFilterOptions.map(filter => {
      if (filter.key === 'vehicle') {
        return {
          ...filter,
          options: [
            { value: '', label: 'All vehicles' },
            ...vehicleOptions
          ]
        };
      }
      return filter;
    });
  }, [vehicleOptions]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vehicle Usage"
        description="Manage vehicle usage records and track mileage"
        action={
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Usage
          </Button>
        }
      />

      <FilterBar
        filters={filterOptions}
        values={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        searchKey="search"
        searchPlaceholder="Search by vehicle name, driver, or plate..."
        onSearchChange={setSearchTerm}
        searchValue={searchTerm}
        showToggleButton={true}
        defaultFiltersVisible={false}
      />

      <DataTable
        data={filteredData}
        columns={columns}
        loading={usageLoading}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        emptyMessage="No vehicle usage records found"
        pagination={true}
        pageSize={10}
        defaultSort={{ key: 'date', direction: 'desc' }}
      />

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[800px] overflow-y-scroll max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Add Vehicle Usage</DialogTitle>
            <DialogDescription>Create a new vehicle usage record</DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {/* Error Display */}
            {createUsageError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {createUsageError}
              </div>
            )}
            
            <VehicleUsageForm
              mode="create"
              vehicles={vehicles}
              onSubmit={handleAddUsage}
              onCancel={() => setAddDialogOpen(false)}
              loading={createUsageLoading}
              submitText="Add Usage"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {selectedUsage && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[800px] overflow-y-scroll max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Edit Vehicle Usage</DialogTitle>
              <DialogDescription>Update vehicle usage information</DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              {/* Error Display */}
              {updateUsageError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {updateUsageError}
                </div>
              )}
              
              <VehicleUsageForm
                mode="edit"
                vehicles={vehicles}
                defaultValues={{
                  vehicle: selectedUsage.vehicle.toString(),
                  date: new Date(selectedUsage.date).toISOString().slice(0, 16),
                  trip_purpose: selectedUsage.trip_purpose,
                  current_mileage: selectedUsage.current_mileage,
                  end_mileage: selectedUsage.end_mileage,
                  driver_name: selectedUsage.driver_name,
                  personal_used_by: selectedUsage.personal_used_by || '',
                  paid_amount: parseFloat(selectedUsage.paid_amount)
                }}
                onSubmit={handleEditUsage}
                onCancel={() => {
                  setEditDialogOpen(false);
                  setSelectedUsage(null);
                }}
                loading={updateUsageLoading}
                submitText="Save Changes"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Vehicle Usage"
        description="Are you sure you want to delete this vehicle usage record?"
        itemName={selectedUsage ? `${selectedUsage.vehicle_name} - ${new Date(selectedUsage.date).toLocaleDateString()}` : ''}
        onConfirm={handleDeleteUsage}
        loading={deleteUsageLoading}
        error={deleteUsageError}
      />
    </div>
  );
};

export default VehiclesUsagePageComponent;