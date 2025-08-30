import * as React from 'react';
const { useEffect, useState } = React;
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  PageHeader, 
  DataTable, 
  AddDialog, 
  EditDialog, 
  DeleteDialog, 
  FilterBar,
  type Column 
} from '../../../common';
import { 
  fetchPatients, 
  createPatient, 
  updatePatient, 
  deletePatient, 
  setCurrentPatient,
  clearError,
  type Patient 
} from '../../../../store/slices/dialysisSlice';
import { patientAddSchema, patientEditSchema } from './schemas';
import type { RootState } from '../../../../store';
import { useAppDispatch } from '../../../../store/hooks';
import { getMediaUrl, formatDate, formatDateTime } from '../../../../lib/utils';
import { FormSchema } from '../../../common/FormSchema';
import { EyeIcon, PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const PatientsComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const { 
    patients, 
    isLoading, 
    isCreating, 
    isUpdating, 
    isDeleting, 
    error,
  } = useSelector((state: RootState) => state.dialysis);

  // Local state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    zakat_eligible: '',
    dialysis_per_week: '',
  });

  // Fetch patients on component mount
  useEffect(() => {
    dispatch(fetchPatients(undefined));
  }, [dispatch]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Handle add patient
  const handleAddPatient = async (formData: FormData) => {
    try {
      await dispatch(createPatient(formData)).unwrap();
      setIsAddDialogOpen(false);
      dispatch(fetchPatients(undefined)); // Refresh the list
    } catch (error) {
      // Error is handled by the slice
    }
  };

  // Handle edit patient
  const handleEditPatient = async (formData: FormData) => {
    if (!selectedPatient) return;
    
    try {
      // Filter out existing file paths from FormData - only send new files
      const filteredFormData = new FormData();
      
      for (const [key, value] of formData.entries()) {
        // Skip existing file paths (strings) for image and document fields
        if ((key === 'image' || key === 'document_path') && typeof value === 'string') {
          continue; // Don't send existing file paths
        }
        filteredFormData.append(key, value);
      }
      
      await dispatch(updatePatient({ id: selectedPatient.id, patientData: filteredFormData })).unwrap();
      setIsEditDialogOpen(false);
      setSelectedPatient(null);
      dispatch(fetchPatients(undefined)); // Refresh the list
    } catch (error) {
      // Error is handled by the slice
    }
  };

  // Handle delete patient
  const handleDeletePatient = async () => {
    if (!selectedPatient) return;
    
    try {
      await dispatch(deletePatient(selectedPatient.id)).unwrap();
      setIsDeleteDialogOpen(false);
      setSelectedPatient(null);
      dispatch(fetchPatients(undefined)); // Refresh the list
    } catch (error) {
      // Error is handled by the slice
    }
  };

  // Handle view patient details
  const handleViewPatient = (patient: Patient) => {
    dispatch(setCurrentPatient(patient));
    navigate(`/dialysis-center/patients/${patient.id}`);
  };

  // Format date for datetime-local input
  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Format as YYYY-MM-DDTHH:MM for datetime-local input
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Handle edit patient
  const handleEditClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsEditDialogOpen(true);
  };

  // Handle delete patient
  const handleDeleteClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDeleteDialogOpen(true);
  };

  // Filter patients based on search and filters
  const filteredPatients = patients?.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         patient.nic.toLowerCase().includes(filters.search.toLowerCase()) ||
                         patient.phone.toLowerCase().includes(filters.search.toLowerCase()) ||
                         patient.address.toLowerCase().includes(filters.search.toLowerCase()) ||
                         patient.relative_name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         patient.relative_phone.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesZakat = filters.zakat_eligible === '' || 
                        (filters.zakat_eligible === 'true' && patient.zakat_eligible) ||
                        (filters.zakat_eligible === 'false' && !patient.zakat_eligible);
    
    const matchesDialysis = filters.dialysis_per_week === '' || 
                           patient.dialysis_per_week === parseInt(filters.dialysis_per_week);
    
    return matchesSearch && matchesZakat && matchesDialysis;
  }) || [];

  // Create FormSchema instances
  const addSchema = new FormSchema(patientAddSchema);
  const editSchema = new FormSchema(patientEditSchema);

  // Table columns configuration
  const columns: Column<Patient>[] = [
    {
      key: 'image' as keyof Patient,
      header: 'Image',
      render: (value, patient) => {      
        return (
          <div className="flex items-center">
            {patient.image ? (
              <img 
                src={getMediaUrl(patient.image) || undefined} 
                alt={patient.name}
                className="w-10 h-10 rounded-lg object-cover"
                onError={(e) => {
                  console.error('Image failed to load:', {
                    src: e.currentTarget.src,
                    patientId: patient.id,
                    imageField: patient.image
                  });
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', {
                    src: getMediaUrl(patient.image),
                    patientId: patient.id
                  });
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-xs font-medium">
                  {patient.name ? patient.name.charAt(0).toUpperCase() : '?'}
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (value, patient) => (
        <div className="font-medium text-gray-900">{patient.name}</div>
      ),
    },
    {
      key: 'nic',
      header: 'NIC',
      sortable: true,
      render: (value, patient) => (
        <div className="text-gray-600">{patient.nic}</div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      sortable: true,
      render: (value, patient) => (
        <div className="text-gray-600">{patient.phone}</div>
      ),
    },
    {
      key: 'address',
      header: 'Address',
      sortable: true,
      render: (value, patient) => (
        <div className="text-gray-600 max-w-xs truncate" title={patient.address}>
          {patient.address}
        </div>
      ),
    },
    {
      key: 'dialysis_per_week',
      header: 'Dialysis/Week',
      sortable: true,
      render: (value, patient) => (
        <div className="text-gray-600">{patient.dialysis_per_week}</div>
      ),
    },
    {
      key: 'next_dialysis_date',
      header: 'Next Dialysis',
      sortable: true,
      render: (value, patient) => (
        <div className="text-gray-600">
          {patient.next_dialysis_info?.formatted_date || formatDateTime(patient.next_dialysis_date)}
        </div>
      ),
    },
    {
      key: 'zakat_eligible',
      header: 'Zakat Eligible',
      sortable: true,
      render: (value, patient) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          patient.zakat_eligible 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {patient.zakat_eligible ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'document_path',
      header: 'Document',
      sortable: true,
      render: (value, patient) => (
        <div className="text-gray-600">
          {patient.document_path ? (
            <a 
              href={getMediaUrl(patient.document_path) || '#'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 border border-blue-600 rounded-md px-2 py-1 flex justify-center items-center gap-2"
            >
              <EyeIcon className="w-4 h-4" /> View
            </a>
          ) : (
            <span className="text-gray-400">No Document</span>
          )}
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      sortable: true,
      render: (value, patient) => (
        <div className="text-gray-600">{formatDate(patient.created_at)}</div>
      ),
    },
  ];

  // Filter options
  const filterOptions = [
    {
      key: 'search',
      label: 'Search',
      type: 'text' as const,
      placeholder: 'Search by name, NIC, phone, address',
      value: filters.search,
    },
    {
      key: 'dialysis_per_week',
      label: 'Dialysis Per Week',
      type: 'select' as const,
      options: [
        { value: '', label: 'All' },
        { value: '1', label: '1 session' },
        { value: '2', label: '2 sessions' },
        { value: '3', label: '3 sessions' },
        { value: '4', label: '4 sessions' },
        { value: '5', label: '5 sessions' },
        { value: '6', label: '6 sessions' },
        { value: '7', label: '7 sessions' },
      ],
      value: filters.dialysis_per_week,
    },
    {
      key: 'zakat_eligible',
      label: 'Zakat Eligible',
      type: 'select' as const,
      options: [
        { value: '', label: 'All' },
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ],
      value: filters.zakat_eligible,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Patients"
        description="Manage dialysis center patients"
      >
        <Button disabled={isCreating} onClick={() => setIsAddDialogOpen(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Patient
        </Button>
      </PageHeader>

      {/* Filter Bar */}
      <FilterBar
        filters={filterOptions}
        values={filters}
        onFilterChange={(key, value) => 
          setFilters(prev => ({ ...prev, [key]: value }))
        }
        onClearFilters={() => setFilters({ search: '', zakat_eligible: '', dialysis_per_week: '' })}
      />

      {/* Data Table */}
      <DataTable
        data={filteredPatients}
        columns={columns}
        loading={isLoading}
        emptyMessage="No patients found"
        onView={handleViewPatient}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      {/* Add Dialog */}
      <AddDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        title="Add New Patient"
        description="Create a new patient record"
        schema={addSchema}
        onSubmit={handleAddPatient}
        loading={isCreating}
        error={error || undefined}
        getMediaUrl={getMediaUrl}
      />

      {/* Edit Dialog */}
      <EditDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) setSelectedPatient(null);
        }}
        title="Edit Patient"
        description="Update patient information"
        schema={editSchema}
        onSubmit={handleEditPatient}
        defaultValues={selectedPatient ? {
          ...selectedPatient,
          next_dialysis_date: formatDateForInput(selectedPatient.next_dialysis_date),
          // Show only filename for existing files, not the full path
          image: selectedPatient.image ? selectedPatient.image.split('/').pop() : null,
          document_path: selectedPatient.document_path ? selectedPatient.document_path.split('/').pop() : null
        } : {}}
        loading={isUpdating}
        error={error || undefined}
        getMediaUrl={getMediaUrl}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) setSelectedPatient(null);
        }}
        onConfirm={handleDeletePatient}
        title="Delete Patient"
        itemName={selectedPatient?.name || undefined}
        loading={isDeleting}
      />
    </div>
  );
};