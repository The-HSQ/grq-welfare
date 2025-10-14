import * as React from 'react';
const { useEffect, useState, useMemo, useCallback } = React;
import LazyImage from '@/components/common/LazyImage';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  PageHeader, 
  DataTable, 
  ResponsiveAddDialog, 
  ResponsiveEditDialog, 
  ResponsiveDeleteDialog, 
  FilterBar,
  type Column 
} from '@/components/common';
import { 
  fetchPatients, 
  createPatient, 
  updatePatient, 
  deletePatient, 
  setCurrentPatient,
  clearError,
  getPatientWithDocuments,
  type Patient 
} from '../../../../store/slices/dialysisSlice';
import { patientAddSchema, patientEditSchema } from './schemas';
import type { RootState } from '../../../../store';
import { useAppDispatch } from '../../../../store/hooks';
import { getMediaUrl, formatDate, formatDateTime } from '../../../../lib/utils';
import { FormSchema } from '@/components/common/FormSchema';
import { PlusIcon, FileTextIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DocumentsModal } from './DocumentsModal';

export const PatientsComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const { 
    patients, 
    isLoadingPatients, 
    isCreating, 
    isUpdating, 
    isDeleting, 
    error,
    currentPatient,
  } = useSelector((state: RootState) => state.dialysis);

  // Local state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [selectedPatientForDocuments, setSelectedPatientForDocuments] = useState<Patient | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    zakat_eligible: '',
    dialysis_per_week: '',
    date: '',
    year: '',
    status: 'active', // Default to active status
    handicapped: 'all',
    access_type: 'all',
    hbsag: 'all',
    hcv: 'all',
    hiv: 'all',
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

  // Generate year options for the last 5 years
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
      const year = currentYear - i;
      years.push({ value: year.toString(), label: year.toString() });
    }
    return years;
  };

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
  const handleViewPatient = useCallback((patient: Patient) => {
    dispatch(setCurrentPatient(patient));
    navigate(`/dialysis-center/patients/${patient.id}`);
  }, [dispatch, navigate]);

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
  const handleEditClick = useCallback((patient: Patient) => {
    setSelectedPatient(patient);
    setIsEditDialogOpen(true);
  }, []);

  // Handle delete patient
  const handleDeleteClick = useCallback((patient: Patient) => {
    setSelectedPatient(patient);
    setIsDeleteDialogOpen(true);
  }, []);

  // Handle view documents
  const handleViewDocuments = async (patient: Patient) => {
    setSelectedPatientForDocuments(patient);
    setIsDocumentsModalOpen(true);
    
    // Fetch patient with documents
    try {
      await dispatch(getPatientWithDocuments(patient.id)).unwrap();
    } catch (error) {
      // Error is handled by the slice
    }
  };

  // Handle document changes (upload/delete)
  const handleDocumentChange = () => {
    // Refresh the patient list to update document counts
    dispatch(fetchPatients(undefined));
  };

  // Filter patients based on search and filters - memoized for performance
  const filteredPatients = useMemo(() => {
    if (!patients) return [];
    
    return patients.filter(patient => {
      const matchesSearch = (patient.name?.toLowerCase().includes(filters.search.toLowerCase()) || false) ||
                           (patient.nic?.toLowerCase().includes(filters.search.toLowerCase()) || false) ||
                           (patient.phone?.toLowerCase().includes(filters.search.toLowerCase()) || false) ||
                           (patient.address?.toLowerCase().includes(filters.search.toLowerCase()) || false) ||
                           (patient.relative_name?.toLowerCase().includes(filters.search.toLowerCase()) || false) ||
                           (patient.relative_phone?.toLowerCase().includes(filters.search.toLowerCase()) || false);
      
      const matchesZakat = filters.zakat_eligible === '' || 
                          (filters.zakat_eligible === 'true' && patient.zakat_eligible) ||
                          (filters.zakat_eligible === 'false' && !patient.zakat_eligible);
      
      const matchesDialysis = filters.dialysis_per_week === '' || 
                             patient.dialysis_per_week === parseInt(filters.dialysis_per_week);
      
      const matchesStatus = filters.status === 'all' || filters.status === '' || patient.status === filters.status;

      const matchesHandicapped = filters.handicapped === 'all' || filters.handicapped === '' || patient.handicapped === (filters.handicapped === 'true');

      const matchesAccessType = filters.access_type === 'all' || filters.access_type === '' || patient.access_type === filters.access_type;

      // Medical test filters
      const matchesHbsag = filters.hbsag === 'all' || filters.hbsag === '' || patient.hbsag === filters.hbsag;
      const matchesHcv = filters.hcv === 'all' || filters.hcv === '' || patient.hcv === filters.hcv;
      const matchesHiv = filters.hiv === 'all' || filters.hiv === '' || patient.hiv === filters.hiv;
      
      // Date filter
      if (filters.date && patient.created_at) {
        try {
          const date = new Date(patient.created_at);
          if (!isNaN(date.getTime())) {
            const itemDate = date.toISOString().split('T')[0];
            if (itemDate !== filters.date) return false;
          }
        } catch (error) {
          // Skip this patient if date is invalid
          return false;
        }
      }
      
      // Year filter
      if (filters.year && patient.created_at) {
        try {
          const date = new Date(patient.created_at);
          if (!isNaN(date.getTime())) {
            const itemYear = date.getFullYear().toString();
            if (itemYear !== filters.year) return false;
          }
        } catch (error) {
          // Skip this patient if date is invalid
          return false;
        }
      }
      
      return matchesSearch && matchesZakat && matchesDialysis && matchesStatus && matchesHandicapped && matchesAccessType && matchesHbsag && matchesHcv && matchesHiv;
    });
  }, [patients, filters]);

  // Create FormSchema instances
  const addSchema = new FormSchema(patientAddSchema);
  const editSchema = new FormSchema(patientEditSchema);

  // Separate component for image cell that can use hooks
  const ImageCell = ({ patient }: { patient: Patient }) => {
    const image = getMediaUrl(patient.image);

    return (
      <div className="flex w-full items-center">
        {patient.image ? (
          <LazyImage
            src={image || ''}
            alt={patient.name || 'Patient'}
            className="w-10 h-10 rounded-lg object-cover"
            fallback={
              <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-xs font-medium">
                  {patient.name ? patient.name.charAt(0).toUpperCase() : '?'}
                </span>
              </div>
            }
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
  };

  // Table columns configuration
  const columns: Column<Patient>[] = [
    {
      key: 'image' as keyof Patient,
      header: 'IMAGE',
      render: (value, patient) => <ImageCell patient={patient} />,
    },
    {
      key: 'name',
      header: 'NAME',
      sortable: true,
      render: (value, patient) => (
        <div className="font-medium text-gray-900 flex flex-col">
          {patient.name}
          {patient.nic && (
            <span className="text-gray-600 text-xs">{patient.nic}</span>
          )}
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'PHONE',
      sortable: true,
      render: (value, patient) => (
        patient.phone ? (
        <div className="text-gray-600">{patient.phone}</div>
        ) : (
          <div className="text-gray-600">-</div>
        )
      ),
    },
    {
      key: 'address',
      header: 'ADDRESS',
      sortable: true,
      render: (value, patient) => (
        <div className="text-gray-600 max-w-xs" title={patient.address}>
          {patient.address || "-"}
        </div>
      ),
    },
    {
      key: 'dialysis_per_week',
      header: 'DIALYSIS/WEEK',
      sortable: true,
      render: (value, patient) => (
        patient.dialysis_per_week ? (
        <div className="text-gray-600">{patient.dialysis_per_week}</div>
        ) : (
          <div className="text-gray-600">-</div>
        )
      ),
    },
    {
      key: 'next_dialysis_date',
      header: 'NEXT DIALYSIS',
      sortable: true,
      render: (value, patient) => (
        <div className="text-gray-600">
          {patient.manually_set_dialysis_date ? formatDateTime(patient.manually_set_dialysis_date) : patient.dialysis_per_week === 0 ? '-' : formatDateTime(patient.next_dialysis_date)}
        </div>
      ),
    },
    {
      key: 'access_type',
      header: 'ACCESS TYPE',
      sortable: true,
      render: (value, patient) => (
        <Badge variant={patient.access_type === 'av_fistula' ? 'default' : 'secondary'} className={patient.access_type === 'av_fistula' ? 'bg-gray-500 text-white' : 'bg-gray-300 text-white'}>
          {patient.access_type === 'av_fistula' ? 'Av Fistula' : patient.access_type === 'catheter' ? 'Catheter' : 'Unknown'}
        </Badge>
      ),
    },
    {
      key: 'handicapped',
      header: 'HANDICAPPED',
      sortable: true,
      render: (value, patient) => (
        <Badge variant={patient.handicapped ? 'default' : 'secondary'} className={patient.handicapped ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
          {patient.handicapped ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      key: 'zakat_eligible',
      header: 'ZAKAT ELIGIBLE',
      sortable: true,
      render: (value, patient) => (
        <Badge variant={patient.zakat_eligible ? 'default' : 'secondary'} className={patient.zakat_eligible ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
          {patient.zakat_eligible ? 'Eligible' : 'Not Eligible'}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'STATUS',
      sortable: true,
      render: (value, patient) => (
        <Badge variant={patient.status === 'active' ? 'default' : 'secondary'} className={patient.status === 'active' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
          {patient.status === 'active' ? 'Active' : patient.status === 'inactive' ? 'Inactive' : 'Unknown'}
        </Badge>
      ),
    },
    {
      key: 'documents_count',
      header: 'DOCUMENTS',
      sortable: true,
      render: (value, patient) => (
        <div className="text-gray-600">
          {patient.documents_count && patient.documents_count > 0 ? (
            <button
              onClick={() => handleViewDocuments(patient)}
              className="text-primary hover:text-primary border border-primary rounded-md px-2 py-1 flex justify-center items-center gap-2 hover:bg-primary/10 cursor-pointer transition-colors"
            >
              <FileTextIcon className="w-4 h-4" />
              {patient.documents_count}
            </button>
          ) : (
            <button
              onClick={() => handleViewDocuments(patient)}
              className="text-primary hover:text-primary border border-primary rounded-md px-2 py-1 flex justify-center items-center gap-2 hover:bg-primary/10 cursor-pointer transition-colors"
            >
              <FileTextIcon className="w-4 h-4" />
              {patient.documents_count}
            </button>
          )}
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'CREATED AT',
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
    {
      key: 'date',
      label: 'Date',
      type: 'date' as const,
      placeholder: 'Select date...',
      value: filters.date,
    },
    {
      key: 'year',
      label: 'Year',
      type: 'select' as const,
      placeholder: 'Select year...',
      options: [
        { value: '', label: 'All Years' },
        ...generateYearOptions()
      ],
      value: filters.year,
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'all', label: 'All' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
      value: filters.status,
    },
    {
      key: 'handicapped',
      label: 'Handicapped',
      type: 'select' as const,
      options: [
        { value: 'all', label: 'All' },
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ],
      value: filters.handicapped,
    },
    {
      key: 'access_type',
      label: 'Access Type',
      type: 'select' as const,
      options: [
        { value: 'all', label: 'All' },
        { value: 'av_fistula', label: 'Av Fistula' },
        { value: 'catheter', label: 'Catheter' },
      ],
      value: filters.access_type,
    },
    {
      key: 'hbsag',
      label: 'HBSAG',
      type: 'select' as const,
      options: [
        { value: 'all', label: 'All' },
        { value: '+ve', label: '+ve' },
        { value: '-ve', label: '-ve' },
      ],
      value: filters.hbsag,
    },
    {
      key: 'hcv',
      label: 'HCV',
      type: 'select' as const,
      options: [
        { value: 'all', label: 'All' },
        { value: '+ve', label: '+ve' },
        { value: '-ve', label: '-ve' },
      ],
      value: filters.hcv,
    },
    {
      key: 'hiv',
      label: 'HIV',
      type: 'select' as const,
      options: [
        { value: 'all', label: 'All' },
        { value: '+ve', label: '+ve' },
        { value: '-ve', label: '-ve' },
      ],
      value: filters.hiv,
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
        onFilterChange={(key, value) => 
          setFilters(prev => ({ ...prev, [key]: value }))
        }
        onClearFilters={() => setFilters({ search: '', zakat_eligible: '', dialysis_per_week: '', date: '', year: '', status: 'active', handicapped: 'all', access_type: 'all', hbsag: 'all', hcv: 'all', hiv: 'all' })}
        defaultFiltersVisible={false}
        showToggleButton={true}
      />

      {/* Data Table */}
      <DataTable
        data={filteredPatients}
        columns={columns}
        loading={isLoadingPatients}
        emptyMessage="No patients found"
        onView={handleViewPatient}
        onEdit={handleEditClick}
        pagination={true}
        pageSize={10}
      />

      {/* Add Dialog */}
      <ResponsiveAddDialog
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
      <ResponsiveEditDialog
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
          // For image field, set to empty string to avoid validation issues
          // The existing image will be shown in the form field display
          image: '',
          // Ensure all select fields have default values
          zakat_eligible: selectedPatient.zakat_eligible ?? false,
          status: selectedPatient.status ?? 'active',
          handicapped: selectedPatient.handicapped ?? false,
          access_type: selectedPatient.access_type ?? '',
          hbsag: selectedPatient.hbsag ?? '',
          hcv: selectedPatient.hcv ?? '',
          hiv: selectedPatient.hiv ?? '',
          dialysis_per_week: selectedPatient.dialysis_per_week ?? 0,
          name: selectedPatient.name ?? '',
          nic: selectedPatient.nic ?? '',
          phone: selectedPatient.phone ?? '',
          address: selectedPatient.address ?? '',
          relative_name: selectedPatient.relative_name ?? '',
          relative_phone: selectedPatient.relative_phone ?? '',
          blood_test_cbc: selectedPatient.blood_test_cbc ?? false,
          rft_creatinine: selectedPatient.rft_creatinine ?? false,
          rft_urea: selectedPatient.rft_urea ?? false
        } : {
          // Default values for new patient
          zakat_eligible: false,
          status: 'active',
          handicapped: false,
          access_type: '',
          hbsag: '',
          hcv: '',
          hiv: '',
          dialysis_per_week: 0,
          name: '',
          nic: '',
          phone: '',
          address: '',
          relative_name: '',
          relative_phone: '',
          blood_test_cbc: false,
          rft_creatinine: false,
          rft_urea: false
        }}
        loading={isUpdating}
        error={error || undefined}
        getMediaUrl={getMediaUrl}
        existingFiles={{
          image: selectedPatient?.image || null,
          document_path: selectedPatient?.document_path || null
        }}
      />

      {/* Delete Dialog */}
      {/* <ResponsiveDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) setSelectedPatient(null);
        }}
        onConfirm={handleDeletePatient}
        title="Delete Patient"
        itemName={selectedPatient?.name || undefined}
        loading={isDeleting}
      /> */}

      {/* Documents Modal */}
      <DocumentsModal
        open={isDocumentsModalOpen}
        onOpenChange={(open) => {
          setIsDocumentsModalOpen(open);
          if (!open) {
            setSelectedPatientForDocuments(null);
          }
        }}
        documents={currentPatient?.documents || []}
        patientName={selectedPatientForDocuments?.name || ''}
        patientId={selectedPatientForDocuments?.id || ''}
        isLoading={isLoadingPatients}
        isUploading={isCreating}
        isDeleting={isDeleting}
        uploadError={error}
        onDocumentChange={handleDocumentChange}
      />
    </div>
  );
};