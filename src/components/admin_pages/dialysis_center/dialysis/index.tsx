import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  PageHeader,
  DataTable,
  AddDialog,
  EditDialog,
  DeleteDialog,
  FilterBar,
  createFormSchema,
  type FilterOption,
  type Column,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";
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
  type UpdateDialysisData,
} from "@/store/slices/dialysisSlice";
import { RootState, AppDispatch } from "@/store";
import { getMediaUrl } from "@/lib/utils";

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
    error,
  } = useSelector((state: RootState) => state.dialysis);

  // Local state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDialysis, setSelectedDialysis] = useState<Dialysis | null>(
    null
  );
  const [filters, setFilters] = useState({
    patient: "",
    bed: "",
    machine: "",
    shift: "",
    date: "",
    year: "",
    month: "",
  });
  const [validationError, setValidationError] = useState<string | null>(null);

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
      setValidationError(null);
    }
  }, [addDialogOpen, editDialogOpen, deleteDialogOpen, dispatch]);

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

  // Generate month options
  const generateMonthOptions = () => {
    const months = [
      { value: "", label: "All Months" },
      { value: "1", label: "January" },
      { value: "2", label: "February" },
      { value: "3", label: "March" },
      { value: "4", label: "April" },
      { value: "5", label: "May" },
      { value: "6", label: "June" },
      { value: "7", label: "July" },
      { value: "8", label: "August" },
      { value: "9", label: "September" },
      { value: "10", label: "October" },
      { value: "11", label: "November" },
      { value: "12", label: "December" },
    ];
    return months;
  };

  // Filter dialysis data
  const filteredDialysis =
    dialysis?.filter((item) => {
      if (
        filters.patient &&
        !item.patient_name.toLowerCase().includes(filters.patient.toLowerCase())
      )
        return false;
      if (
        filters.bed &&
        !item.bed_name.toLowerCase().includes(filters.bed.toLowerCase())
      )
        return false;
      if (
        filters.machine &&
        !item.machine_name.toLowerCase().includes(filters.machine.toLowerCase())
      )
        return false;
      if (
        filters.shift &&
        !item.shift_no.toLowerCase().includes(filters.shift.toLowerCase())
      )
        return false;

      // Date filter
      if (filters.date) {
        const itemDate = new Date(item.created_at).toISOString().split("T")[0];
        if (itemDate !== filters.date) return false;
      }

      // Month filter
      if (filters.month) {
        const itemMonth = (new Date(item.created_at).getMonth() + 1).toString();
        if (itemMonth !== filters.month) return false;
      }

      // Year filter
      if (filters.year) {
        const itemYear = new Date(item.created_at).getFullYear().toString();
        if (itemYear !== filters.year) return false;
      }

      return true;
    }) || [];

  // Get machines array safely - filter only dialysis machines that are not working
  const getMachinesArray = () => {
    let allMachines: any[] = [];
    if (machinesArray) allMachines = machinesArray;
    else if (machines?.results) allMachines = machines.results;
    else if (Array.isArray(machines)) allMachines = machines;

    // Filter only dialysis machines that are not working
    return allMachines.filter((m: any) => 
      m.machine_type === 'dialysis'
    );
  };

  // Convert time string (HH:MM) to minutes since midnight
  const convertTimeToMinutes = (timeString: string) => {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Validate dialysis time against shift time
  const validateDialysisTime = (data: any) => {
    if (data.shift && data.start_time) {
      const selectedShift = shifts?.find((s) => s.id === data.shift);
      if (selectedShift) {
        const shiftStartTime = selectedShift.start_time;
        const shiftEndTime = selectedShift.end_time;
        const dialysisStartTime = data.start_time;

        // Convert times to comparable values (minutes since midnight)
        const shiftStartMinutes = convertTimeToMinutes(shiftStartTime);
        const shiftEndMinutes = convertTimeToMinutes(shiftEndTime);
        const dialysisStartMinutes = convertTimeToMinutes(dialysisStartTime);

        if (
          dialysisStartMinutes < shiftStartMinutes ||
          dialysisStartMinutes > shiftEndMinutes
        ) {
          return `Dialysis start time must be within shift time (${shiftStartTime} - ${shiftEndTime})`;
        }
      }
    }
    return null; // No validation error
  };

  // Filter options for the filter bar
  const filterOptions: FilterOption[] = [
    {
      key: "patient",
      label: "Patient",
      type: "text",
      placeholder: "Search by patient name...",
    },
    {
      key: "bed",
      label: "Bed",
      type: "select",
      placeholder: "Select bed...",
      options: [
        { value: "", label: "All Beds" },
        ...(beds?.map((b) => ({
          value: b.bed_name,
          label: b.bed_name + " - " + b.ward_name,
        })) || []),
      ],
    },
    {
      key: "machine",
      label: "Machine",
      type: "select",
      placeholder: "Select machine...",
      options: [
        { value: "", label: "All Machines" },
        ...(getMachinesArray().map((m: any) => ({
          value: m.machine_name,
          label: m.machine_name,
        })) || []),
      ],
    },
    {
      key: "shift",
      label: "Shift",
      type: "select",
      placeholder: "Select shift...",
      options: [
        { value: "", label: "All Shifts" },
        ...(shifts?.map((s) => ({
          value: s.shift_no,
          label: s.shift_no + " (" + s.start_time + " - " + s.end_time + ")",
        })) || []),
      ],
    },
    {
      key: "date",
      label: "Date",
      type: "date",
      placeholder: "Select date...",
    },

    {
      key: "month",
      label: "Month",
      type: "select",
      placeholder: "Select month...",
      options: generateMonthOptions(),
    },
    {
      key: "year",
      label: "Year",
      type: "select",
      placeholder: "Select year...",
      options: [{ value: "", label: "All Years" }, ...generateYearOptions()],
    },
  ];

  // Create form schema for add dialog
  const createDialysisSchema = createFormSchema({
    fields: [
      {
        name: "patient",
        label: "Patient",
        type: "select",
        required: true,
        options: patients?.map((p) => ({ value: p.id, label: p.name })) || [],
      },
      {
        name: "bed",
        label: "Bed",
        type: "select",
        required: true,
        options:
          beds?.map((b) => ({
            value: b.id,
            label: b.bed_name + " - " + b.ward_name,
          })) || [],
      },
      {
        name: "machine",
        label: "Machine",
        type: "select",
        required: true,
        options:
          getMachinesArray().map((m: any) => ({
            value: m.id,
            label: m.machine_name,
          })) || [],
      },
      {
        name: "shift",
        label: "Shift",
        type: "select",
        required: true,
        options:
          shifts?.map((s) => ({
            value: s.id,
            label: s.shift_no + " (" + s.start_time + " - " + s.end_time + ")",
          })) || [],
      },
      {
        name: "start_time",
        label: "Start Time",
        type: "time",
        required: true,
      },
      {
        name: "end_time",
        label: "End Time",
        type: "time",
        required: true,
      },
      {
        name: "blood_pressure",
        label: "Before Dialysis BP",
        type: "text",
        required: false,
        placeholder: "e.g., 120/80",
      },
      {
        name: "last_blood_pressure",
        label: "After Dialysis BP",
        type: "text",
        required: false,
        placeholder: "e.g., 118/78",
      },
      {
        name: "weight",
        label: "Before Dialysis Weight",
        type: "text",
        required: false,
        placeholder: "e.g., 70kg",
      },
      {
        name: "last_weight",
        label: "After Dialysis Weight",
        type: "text",
        required: false,
        placeholder: "e.g., 69.5kg",
      },
      {
        name: "technician_comment",
        label: "Technician Comment",
        type: "textarea",
        required: false,
        rows: 3,
        placeholder: "Enter technician comments...",
      },
      {
        name: "doctor_comment",
        label: "Doctor Comment",
        type: "textarea",
        required: false,
        rows: 3,
        placeholder: "Enter doctor comments...",
      },
      {
        name: "created_at",
        label: "Created At",
        type: "datetime-local",
        required: false,
      },
    ],
    layout: "two-column",
  });

  // Create form schema for edit dialog
  const editDialysisSchema = createFormSchema({
    fields: [
      {
        name: "patient",
        label: "Patient",
        type: "select",
        required: true,
        options: patients?.map((p) => ({ value: p.id, label: p.name })) || [],
      },
      {
        name: "bed",
        label: "Bed",
        type: "select",
        required: true,
        options:
          beds?.map((b) => ({
            value: b.id,
            label: b.bed_name + " - " + b.ward_name,
          })) || [],
      },
      {
        name: "machine",
        label: "Machine",
        type: "select",
        required: true,
        options:
          getMachinesArray().map((m: any) => ({
            value: m.id,
            label: m.machine_name,
          })) || [],
      },
      {
        name: "shift",
        label: "Shift",
        type: "select",
        required: true,
        options:
          shifts?.map((s) => ({
            value: s.id,
            label: s.shift_no + " (" + s.start_time + " - " + s.end_time + ")",
          })) || [],
      },
      {
        name: "start_time",
        label: "Start Time",
        type: "time",
        required: true,
      },
      {
        name: "end_time",
        label: "End Time",
        type: "time",
        required: true,
      },
      {
        name: "blood_pressure",
        label: "Before Dialysis BP",
        type: "text",
        required: false,
        placeholder: "e.g., 122/82",
      },
      {
        name: "last_blood_pressure",
        label: "After Dialysis BP",
        type: "text",
        required: false,
        placeholder: "e.g., 120/80",
      },
      {
        name: "weight",
        label: "Before Dialysis Weight",
        type: "text",
        required: false,
        placeholder: "e.g., 70.2kg",
      },
      {
        name: "last_weight",
        label: "After Dialysis Weight",
        type: "text",
        required: false,
        placeholder: "e.g., 70kg",
      },
      {
        name: "technician_comment",
        label: "Technician Comment",
        type: "textarea",
        required: false,
        rows: 3,
        placeholder: "Enter technician comments...",
      },
      {
        name: "doctor_comment",
        label: "Doctor Comment",
        type: "textarea",
        required: false,
        rows: 3,
        placeholder: "Enter doctor comments...",
      },
      {
        name: "created_at",
        label: "Created At",
        type: "datetime-local",
        required: false,
      },
    ],
    layout: "two-column",
  });

  // Data table columns
  const columns: Column<Dialysis>[] = [
    {
      key: "patient_image",
      header: "Image",
      render: (value: string, patient: Dialysis) => {
        return (
          <div className="flex w-full items-center">
            {patient.patient_image ? (
              <img
                src={getMediaUrl(patient.patient_image) || undefined}
                alt={patient.patient_name}
                className="w-10 h-10 rounded-lg object-cover"
                onError={(e) => {
                  console.error("Image failed to load:", {
                    src: e.currentTarget.src,
                    patientId: patient.id,
                    imageField: patient.patient_image,
                  });
                }}
                onLoad={() => {
                  console.log("Image loaded successfully:", {
                    src: getMediaUrl(patient.patient_image),
                    patientId: patient.id,
                  });
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-xs font-medium">
                  {patient.patient_name
                    ? patient.patient_name.charAt(0).toUpperCase()
                    : "?"}
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "patient_name" as keyof Dialysis,
      header: "Patient",
      sortable: true,
    },
    {
      key: "bed_name" as keyof Dialysis,
      header: "Bed",
      sortable: true,
    },
    {
      key: "machine_name" as keyof Dialysis,
      header: "Machine",
      sortable: true,
    },
    {
      key: "shift_no" as keyof Dialysis,
      header: "Shift",
      sortable: true,
    },
    {
      key: "start_time" as keyof Dialysis,
      header: "Start Time",
      sortable: true,
    },
    {
      key: "end_time" as keyof Dialysis,
      header: "End Time",
      sortable: true,
    },
    {
      key: "blood_pressure" as keyof Dialysis,
      header: "Before - After Dialysis BP",
      sortable: true,
      render: (value: string, patient: Dialysis) =>
        value ? `${value} - ${patient.last_blood_pressure}` : "-",
    },
    {
      key: "weight" as keyof Dialysis,
      header: "Before - After Dialysis Weight",
      sortable: true,
      render: (value: string, patient: Dialysis) =>
        value ? `${value} - ${patient.last_weight}` : "-",
    },
    {
      key: "technician_comment" as keyof Dialysis,
      header: "Technician Comment",
      sortable: true,
      render: (value: string) => value || "-",
    },
    {
      key: "doctor_comment" as keyof Dialysis,
      header: "Doctor Comment",
      sortable: true,
      render: (value: string) => value || "-",
    },
    {
      key: "created_at" as keyof Dialysis,
      header: "Created At",
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  // Handle add dialysis
  const handleAddDialysis = (data: CreateDialysisData) => {
    // Clear previous validation errors
    setValidationError(null);

    // Validate dialysis time against shift time
    const validationError = validateDialysisTime(data);
    if (validationError) {
      setValidationError(validationError);
      return;
    }

    dispatch(createDialysis(data)).then((result) => {
      if (createDialysis.fulfilled.match(result)) {
        setAddDialogOpen(false);
      }
    });
  };

  // Handle edit dialysis
  const handleEditDialysis = (data: UpdateDialysisData) => {
    if (selectedDialysis) {
      // Clear previous validation errors
      setValidationError(null);

      // Validate dialysis time against shift time
      const validationError = validateDialysisTime(data);
      if (validationError) {
        setValidationError(validationError);
        return;
      }

      dispatch(
        updateDialysis({ id: selectedDialysis.id, dialysisData: data })
      ).then((result) => {
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
      patient_image: selectedDialysis.patient_image,
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
      created_at: selectedDialysis.created_at,
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
        <Button onClick={() => navigate("/dialysis-center/today-dialysis")}>
          <Calendar className="h-4 w-4 mr-2" />
          Today's Dialysis
        </Button>
      </PageHeader>

      {/* Filter Bar */}
      <FilterBar
        filters={filterOptions}
        values={filters}
        onFilterChange={(key, value) =>
          setFilters((prev) => ({ ...prev, [key]: value }))
        }
        onClearFilters={() =>
          setFilters({
            patient: "",
            bed: "",
            machine: "",
            shift: "",
            date: "",
            year: "",
            month: "",
          })
        }
      />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading dialysis data
              </h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
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
        defaultSort={{ key: "created_at", direction: "desc" }}
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
        error={validationError || error}
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
        error={validationError || error}
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
