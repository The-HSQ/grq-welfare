import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { 
  fetchAppointments, 
  createAppointment, 
  updateAppointment, 
  deleteAppointment,
  setCurrentAppointment,
  clearError,
  type Appointment,
  type CreateAppointmentData,
  type UpdateAppointmentData
} from '@/store/slices/dialysisSlice';
import { 
  PageHeader, 
  DataTable, 
  AddDialog, 
  EditDialog, 
  DeleteDialog,
  type Column 
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, User, Stethoscope } from 'lucide-react';
import { createFormSchema } from '@/components/common/FormSchema';

// Simple date formatting function
const formatDate = (dateString: string, format: 'date' | 'datetime' = 'datetime') => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = format === 'datetime' 
    ? { 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      }
    : { 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit' 
      };
  return date.toLocaleDateString('en-US', options);
};

const DoctorAppointmentPageComponent = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    appointments, 
    isLoading, 
    isCreating, 
    isUpdating, 
    isDeleting, 
    error 
  } = useSelector((state: RootState) => state.dialysis);

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Error states for each dialog
  const [addError, setAddError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Fetch appointments on component mount
  useEffect(() => {
    dispatch(fetchAppointments());
  }, [dispatch]);

  // Clear errors when dialogs close
  useEffect(() => {
    if (!addDialogOpen) setAddError(null);
    if (!editDialogOpen) setEditError(null);
    if (!deleteDialogOpen) setDeleteError(null);
  }, [addDialogOpen, editDialogOpen, deleteDialogOpen]);

  // Clear global error when component unmounts or error changes
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Form schema for add/edit dialogs
  const appointmentSchema = createFormSchema({
    fields: [
      {
        name: 'patient_name',
        label: 'Patient Name',
        type: 'text',
        required: true,
        placeholder: 'Enter patient name',
        validation: {
          minLength: 2,
          maxLength: 100
        }
      },
      {
        name: 'date',
        label: 'Appointment Date & Time',
        type: 'datetime-local',
        required: true,
        placeholder: 'Select date and time'
      },
      {
        name: 'purpose_of_visit',
        label: 'Purpose of Visit',
        type: 'textarea',
        required: true,
        placeholder: 'Enter purpose of visit',
        validation: {
          minLength: 5,
          maxLength: 500
        }
      },
      {
        name: 'doctor_name',
        label: 'Doctor Name',
        type: 'text',
        required: true,
        placeholder: 'Enter doctor name',
        validation: {
          minLength: 2,
          maxLength: 100
        }
      },
      {
        name: 'doctor_comment',
        label: 'Doctor Comment',
        type: 'textarea',
        required: false,
        placeholder: 'Enter doctor comment (optional)',
        validation: {
          maxLength: 1000
        }
      }
    ],
    layout: 'single'
  });

  // Table columns configuration
  const columns: Column<Appointment>[] = [
    {
      key: 'patient_name',
      header: 'Patient Name',
      sortable: true,
      width: '200px',
      render: (value) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'date',
      header: 'Date & Time',
      sortable: true,
      width: '180px',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{formatDate(value, 'datetime')}</span>
        </div>
      )
    },
    {
      key: 'doctor_name',
      header: 'Doctor',
      sortable: true,
      width: '150px',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-muted-foreground" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'purpose_of_visit',
      header: 'Purpose',
      sortable: true,
      width: '250px',
      render: (value) => (
        <div className="max-w-[250px] truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'doctor_comment',
      header: 'Doctor Comment',
      sortable: false,
      width: '200px',
      render: (value) => (
        <div className="max-w-[200px] truncate text-muted-foreground" title={value || 'No comment'}>
          {value || 'No comment'}
        </div>
      )
    },
    {
      key: 'created_at',
      header: 'Created',
      sortable: true,
      width: '120px',
      render: (value) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(value, 'date')}
        </span>
      )
    }
  ];

  // Handle add appointment
  const handleAddAppointment = async (data: any) => {
    try {
      setAddError(null);
      const appointmentData: CreateAppointmentData = {
        patient_name: data.patient_name,
        date: data.date,
        purpose_of_visit: data.purpose_of_visit,
        doctor_name: data.doctor_name,
        doctor_comment: data.doctor_comment || ''
      };
      
      const result = await dispatch(createAppointment(appointmentData));
      
      if (createAppointment.fulfilled.match(result)) {
        setAddDialogOpen(false);
      } else if (createAppointment.rejected.match(result)) {
        setAddError(result.payload as string);
      }
    } catch (error) {
      setAddError('An unexpected error occurred');
    }
  };

  // Handle edit appointment
  const handleEditAppointment = async (data: any) => {
    if (!selectedAppointment) return;
    
    try {
      setEditError(null);
      const appointmentData: UpdateAppointmentData = {
        patient_name: data.patient_name,
        date: data.date,
        purpose_of_visit: data.purpose_of_visit,
        doctor_name: data.doctor_name,
        doctor_comment: data.doctor_comment || ''
      };
      
      const result = await dispatch(updateAppointment({ 
        id: selectedAppointment.id, 
        appointmentData 
      }));
      
      if (updateAppointment.fulfilled.match(result)) {
        setEditDialogOpen(false);
        setSelectedAppointment(null);
      } else if (updateAppointment.rejected.match(result)) {
        setEditError(result.payload as string);
      }
    } catch (error) {
      setEditError('An unexpected error occurred');
    }
  };

  // Handle delete appointment
  const handleDeleteAppointment = async () => {
    if (!selectedAppointment) return;
    
    try {
      setDeleteError(null);
      const result = await dispatch(deleteAppointment(selectedAppointment.id));
      
      if (deleteAppointment.fulfilled.match(result)) {
        setDeleteDialogOpen(false);
        setSelectedAppointment(null);
      } else if (deleteAppointment.rejected.match(result)) {
        const errorMessage = result.payload as string;
        // Check if it's a 404 error
        if (errorMessage.includes('404') || errorMessage.includes('not found')) {
          setDeleteError('Appointment not found');
        } else {
          setDeleteError(errorMessage);
        }
      }
    } catch (error) {
      setDeleteError('An unexpected error occurred');
    }
  };

  // Handle edit button click
  const handleEditClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setEditDialogOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDeleteDialogOpen(true);
  };

  // Get default values for edit dialog
  const getEditDefaultValues = () => {
    if (!selectedAppointment) return {};
    
    return {
      patient_name: selectedAppointment.patient_name,
      date: selectedAppointment.date.slice(0, 16), // Convert to datetime-local format
      purpose_of_visit: selectedAppointment.purpose_of_visit,
      doctor_name: selectedAppointment.doctor_name,
      doctor_comment: selectedAppointment.doctor_comment || ''
    };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Doctor Appointments"
        description="Manage patient appointments with doctors"
        action={
          <Button 
            onClick={() => setAddDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Appointment
          </Button>
        }
      />

      {/* Global Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={appointments || []}
        columns={columns}
        searchKey="patient_name"
        searchPlaceholder="Search by patient name..."
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        loading={isLoading}
        emptyMessage="No appointments found"
        pagination={true}
        pageSize={10}
        defaultSort={{ key: 'date', direction: 'desc' }}
      />

      {/* Add Dialog */}
      <AddDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        title="Add New Appointment"
        description="Create a new doctor appointment for a patient"
        schema={appointmentSchema}
        onSubmit={handleAddAppointment}
        loading={isCreating}
        error={addError}
      />

      {/* Edit Dialog */}
      <EditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        title="Edit Appointment"
        description="Update appointment details"
        schema={appointmentSchema}
        defaultValues={getEditDefaultValues()}
        onSubmit={handleEditAppointment}
        loading={isUpdating}
        error={editError}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Appointment"
        description="Are you sure you want to delete this appointment?"
        itemName={selectedAppointment?.patient_name}
        onConfirm={handleDeleteAppointment}
        loading={isDeleting}
        error={deleteError}
      />
    </div>
  );
};

export default DoctorAppointmentPageComponent;