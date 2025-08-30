import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  PageHeader, 
  DataTable, 
  AddDialog, 
  EditDialog, 
  DeleteDialog, 
  FilterBar,
  createFormSchema,
  type FilterOption
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { 
  fetchDialysis, 
  createDialysis, 
  updateDialysis, 
  deleteDialysis, 
  fetchPatients,
  fetchBeds,
  fetchMachines,
  fetchShifts,
  setCurrentDialysis,
  clearError,
  type Dialysis,
  type CreateDialysisData,
  type UpdateDialysisData
} from '@/store/slices/dialysisSlice';
import { RootState, AppDispatch } from '@/store';

const DialysisPageComponent = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  // Redux state
  const { 
    dialysis, 
    patients, 
    beds, 
    machines, 
    machinesArray,
    shifts,
    isLoading, 
    isCreating, 
    isUpdating, 
    isDeleting, 
    error 
  } = useSelector((state: RootState) => state.dialysis);

  // Local state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDialysis, setSelectedDialysis] = useState<Dialysis | null>(null);
  const [filters, setFilters] = useState({
    patient: '',
    bed: '',
    machine: '',
    shift: '',
  });

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchDialysis());
    dispatch(fetchPatients());
    dispatch(fetchBeds());
    dispatch(fetchMachines());
    dispatch(fetchShifts());
  }, [dispatch]);

  // Clear errors when dialogs close
  useEffect(() => {
    if (!addDialogOpen && !editDialogOpen && !deleteDialogOpen) {
      dispatch(clearError());
    }
  }, [addDialogOpen, editDialogOpen, deleteDialogOpen, dispatch]);

  // Filter dialysis data
  const filteredDialysis = dialysis?.filter(item => {
    if (filters.patient && !item.patient_name.toLowerCase().includes(filters.patient.toLowerCase())) return false;
    if (filters.bed && !item.bed_name.toLowerCase().includes(filters.bed.toLowerCase())) return false;
    if (filters.machine && !item.machine_name.toLowerCase().includes(filters.machine.toLowerCase())) return false;
    if (filters.shift && !item.shift_no.toLowerCase().includes(filters.shift.toLowerCase())) return false;
    return true;
  }) || [];

  // Get machines array safely - filter only not working machines
  const getMachinesArray = () => {
    let allMachines: any[] = [];
    if (machinesArray) allMachines = machinesArray;
    else if (machines?.results) allMachines = machines.results;
    else if (Array.isArray(machines)) allMachines = machines;
    
    // Filter only not working machines
    return allMachines.filter((m: any) => m.machine_status !== 'working');
  };

  // Filter options for the filter bar
  const filterOptions: FilterOption[] = [
    {
      key: 'patient',
      label: 'Patient',
      type: 'text',
      placeholder: 'Search by patient name...',
    },
    {
      key: 'bed',
      label: 'Bed',
      type: 'select',
      placeholder: 'Select bed...',
      options: [
        { value: '', label: 'All Beds' },
        ...(beds?.map(b => ({ value: b.bed_name, label: b.bed_name + ' - ' + b.ward_name })) || [])
      ],
    },
    {
      key: 'machine',
      label: 'Machine',
      type: 'select',
      placeholder: 'Select machine...',
      options: [
        { value: '', label: 'All Machines' },
        ...(getMachinesArray().map((m: any) => ({ value: m.machine_name, label: m.machine_name })) || [])
      ],
    },
    {
      key: 'shift',
      label: 'Shift',
      type: 'select',
      placeholder: 'Select shift...',
      options: [
        { value: '', label: 'All Shifts' },
        ...(shifts?.map(s => ({ value: s.shift_no, label: s.shift_no })) || [])
      ],
    },
  ];

  // Create form schema for add dialog
  const createDialysisSchema = createFormSchema({
    fields: [
      {
        name: 'patient',
        label: 'Patient',
        type: 'select',
        required: true,
        options: patients?.map(p => ({ value: p.id, label: p.name })) || [],
      },
      {
        name: 'bed',
        label: 'Bed',
        type: 'select',
        required: true,
        options: beds?.map(b => ({ value: b.id, label: b.bed_name + ' - ' + b.ward_name })) || [],
      },
      {
        name: 'machine',
        label: 'Machine',
        type: 'select',
        required: true,
        options: getMachinesArray().map((m: any) => ({ value: m.id, label: m.machine_name })) || [],
      },
      {
        name: 'shift',
        label: 'Shift',
        type: 'select',
        required: true,
        options: shifts?.map(s => ({ value: s.id, label: s.shift_no })) || [],
      },
      {
        name: 'start_time',
        label: 'Start Time',
        type: 'time',
        required: true,
      },
      {
        name: 'end_time',
        label: 'End Time',
        type: 'time',
        required: true,
      },
      {
        name: 'blood_pressure',
        label: 'Blood Pressure',
        type: 'text',
        required: false,
        placeholder: 'e.g., 120/80',
      },
      {
        name: 'last_blood_pressure',
        label: 'Last Blood Pressure',
        type: 'text',
        required: false,
        placeholder: 'e.g., 118/78',
      },
      {
        name: 'weight',
        label: 'Weight',
        type: 'text',
        required: false,
        placeholder: 'e.g., 70kg',
      },
      {
        name: 'last_weight',
        label: 'Last Weight',
        type: 'text',
        required: false,
        placeholder: 'e.g., 69.5kg',
      },
      {
        name: 'technician_comment',
        label: 'Technician Comment',
        type: 'textarea',
        required: false,
        rows: 3,
        placeholder: 'Enter technician comments...',
      },
      {
        name: 'doctor_comment',
        label: 'Doctor Comment',
        type: 'textarea',
        required: false,
        rows: 3,
        placeholder: 'Enter doctor comments...',
      },
    ],
    layout: 'two-column',
  });

  // Create form schema for edit dialog
  const editDialysisSchema = createFormSchema({
    fields: [
      {
        name: 'patient',
        label: 'Patient',
        type: 'select',
        required: true,
        options: patients?.map(p => ({ value: p.id, label: p.name })) || [],
      },
      {
        name: 'bed',
        label: 'Bed',
        type: 'select',
        required: true,
        options: beds?.map(b => ({ value: b.id, label: b.bed_name + ' - ' + b.ward_name })) || [],
      },
      {
        name: 'machine',
        label: 'Machine',
        type: 'select',
        required: true,
        options: getMachinesArray().map((m: any) => ({ value: m.id, label: m.machine_name })) || [],
      },
      {
        name: 'shift',
        label: 'Shift',
        type: 'select',
        required: true,
        options: shifts?.map(s => ({ value: s.id, label: s.shift_no })) || [],
      },
      {
        name: 'start_time',
        label: 'Start Time',
        type: 'time',
        required: true,
      },
      {
        name: 'end_time',
        label: 'End Time',
        type: 'time',
        required: true,
      },
      {
        name: 'blood_pressure',
        label: 'Blood Pressure',
        type: 'text',
        required: false,
        placeholder: 'e.g., 122/82',
      },
      {
        name: 'last_blood_pressure',
        label: 'Last Blood Pressure',
        type: 'text',
        required: false,
        placeholder: 'e.g., 120/80',
      },
      {
        name: 'weight',
        label: 'Weight',
        type: 'text',
        required: false,
        placeholder: 'e.g., 70.2kg',
      },
      {
        name: 'last_weight',
        label: 'Last Weight',
        type: 'text',
        required: false,
        placeholder: 'e.g., 70kg',
      },
      {
        name: 'technician_comment',
        label: 'Technician Comment',
        type: 'textarea',
        required: false,
        rows: 3,
        placeholder: 'Enter technician comments...',
      },
      {
        name: 'doctor_comment',
        label: 'Doctor Comment',
        type: 'textarea',
        required: false,
        rows: 3,
        placeholder: 'Enter doctor comments...',
      },
    ],
    layout: 'two-column',
  });

  // Data table columns
  const columns = [
    {
      key: 'patient_name' as keyof Dialysis,
      header: 'Patient',
      sortable: true,
    },
    {
      key: 'bed_name' as keyof Dialysis,
      header: 'Bed',
      sortable: true,
    },
    {
      key: 'machine_name' as keyof Dialysis,
      header: 'Machine',
      sortable: true,
    },
    {
      key: 'shift_no' as keyof Dialysis,
      header: 'Shift',
      sortable: true,
    },
    {
      key: 'start_time' as keyof Dialysis,
      header: 'Start Time',
      sortable: true,
    },
    {
      key: 'end_time' as keyof Dialysis,
      header: 'End Time',
      sortable: true,
    },
    {
      key: 'blood_pressure' as keyof Dialysis,
      header: 'Blood Pressure',
      sortable: true,
    },
    {
      key: 'weight' as keyof Dialysis,
      header: 'Weight',
      sortable: true,
    },
    {
      key: 'created_at' as keyof Dialysis,
      header: 'Created At',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  // Handle add dialysis
  const handleAddDialysis = (data: CreateDialysisData) => {
    dispatch(createDialysis(data)).then((result) => {
      if (createDialysis.fulfilled.match(result)) {
        setAddDialogOpen(false);
      }
    });
  };

  // Handle edit dialysis
  const handleEditDialysis = (data: UpdateDialysisData) => {
    if (selectedDialysis) {
      dispatch(updateDialysis({ id: selectedDialysis.id, dialysisData: data })).then((result) => {
        if (updateDialysis.fulfilled.match(result)) {
          setEditDialogOpen(false);
          setSelectedDialysis(null);
        }
      });
    }
  };

  // Handle delete dialysis
  const handleDeleteDialysis = () => {
    if (selectedDialysis) {
      dispatch(deleteDialysis(selectedDialysis.id)).then((result) => {
        if (deleteDialysis.fulfilled.match(result)) {
          setDeleteDialogOpen(false);
          setSelectedDialysis(null);
        }
      });
    }
  };

  // Handle view dialysis details
  const handleViewDialysis = (dialysis: Dialysis) => {
    dispatch(setCurrentDialysis(dialysis));
    navigate(`/dialysis-center/dialysis/${dialysis.id}`);
  };

  // Handle edit button click
  const handleEditClick = (dialysis: Dialysis) => {
    setSelectedDialysis(dialysis);
    setEditDialogOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (dialysis: Dialysis) => {
    setSelectedDialysis(dialysis);
    setDeleteDialogOpen(true);
  };

  // Get default values for edit dialog
  const getEditDefaultValues = () => {
    if (!selectedDialysis) return {};
    
    return {
      patient: selectedDialysis.patient,
      bed: selectedDialysis.bed,
      machine: selectedDialysis.machine,
      shift: selectedDialysis.shift,
      start_time: selectedDialysis.start_time,
      end_time: selectedDialysis.end_time,
      blood_pressure: selectedDialysis.blood_pressure,
      last_blood_pressure: selectedDialysis.last_blood_pressure,
      weight: selectedDialysis.weight,
      last_weight: selectedDialysis.last_weight,
      technician_comment: selectedDialysis.technician_comment,
      doctor_comment: selectedDialysis.doctor_comment,
    };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Dialysis Management"
        description="Manage dialysis sessions for patients"
      >
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Dialysis
        </Button>
      </PageHeader>

      {/* Filter Bar */}
      <FilterBar
        filters={filterOptions}
        values={filters}
        onFilterChange={(key, value) => 
          setFilters(prev => ({ ...prev, [key]: value }))
        }
        onClearFilters={() => setFilters({ patient: '', bed: '', machine: '', shift: '' })}
      />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading dialysis data</h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={filteredDialysis}
        columns={columns}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onView={handleViewDialysis}
        loading={isLoading}
        emptyMessage="No dialysis sessions found"
        pagination={true}
        pageSize={10}
      />

      {/* Add Dialog */}
      <AddDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        title="Add Dialysis Session"
        description="Create a new dialysis session for a patient"
        schema={createDialysisSchema}
        onSubmit={handleAddDialysis}
        loading={isCreating}
        error={error}
      />

      {/* Edit Dialog */}
      <EditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        title="Edit Dialysis Session"
        description="Update dialysis session information"
        schema={editDialysisSchema}
        onSubmit={handleEditDialysis}
        loading={isUpdating}
        error={error}
        defaultValues={getEditDefaultValues()}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Dialysis Session"
        description={`Are you sure you want to delete the dialysis session for ${selectedDialysis?.patient_name}? This action cannot be undone.`}
        onConfirm={handleDeleteDialysis}
        loading={isDeleting}
      />
    </div>
  );
};

export default DialysisPageComponent;