import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../../store";
import {
  fetchDonations,
  setSelectedDonation,
  clearErrors,
  createDonation,
  updateDonation,
  deleteDonation,
  type Donation,
} from "../../../../store/slices/donationSlice";
import { fetchDonors } from "../../../../store/slices/donorSlice";
import {
  PageHeader,
  DataTable,
  FilterBar,
  ResponsiveAddDialog,
  ResponsiveEditDialog,
  ResponsiveDeleteDialog,
  type Column,
  type FilterOption,
} from "@/components/common";
import { Button } from "../../../../components/ui/button";
import { FormSchema } from "../../../common";
import { formatDate } from "../../../../lib/utils";
import {
  purposeOptions,
  currencyOptions,
  type CreateDonationFormData,
  type EditDonationFormData,
  donationTypeOptions,
} from "../../../../lib/schemas";
import { PlusIcon } from "lucide-react";

// Filter options for the donation table
const filterOptions: FilterOption[] = [
  {
    key: "purpose",
    label: "Purpose",
    type: "select",
    options: purposeOptions,
  },
  {
    key: "donation_type",
    label: "Donation Type",
    type: "text",
    placeholder: "Search by donation type...",
  },
  {
    key: "currency",
    label: "Currency",
    type: "text",
    placeholder: "Search by currency...",
  },
  {
    key: "date",
    label: "Date",
    type: "date",
    placeholder: "Search by date...",
  },
];

// Table columns configuration
const columns: Column<Donation>[] = [
  {
    key: "donner_name",
    header: "DONOR NAME",
    sortable: true,
    render: (value, donation: Donation) => (
      <div className="font-medium text-gray-900">{donation.donner_name}</div>
    ),
  },
  {
    key: "amount",
    header: "AMOUNT",
    sortable: true,
    render: (value, donation: Donation) => (
      <div className="text-gray-900">
        {donation.currency} {donation.amount.toLocaleString()}
      </div>
    ),
  },
  {
    key: "purpose_display",
    header: "PURPOSE",
    sortable: true,
    render: (value, donation: Donation) => (
      <div className="text-gray-600">{donation.purpose_display}</div>
    ),
  },
  {
    key: "donation_type",
    header: "TYPE",
    sortable: true,
    render: (value, donation: Donation) => (
      <div className="text-gray-600 capitalize">{donation.donation_type}</div>
    ),
  },
  {
    key: "in_rupees",
    header: "IN RUPEES",
    sortable: true,
    render: (value, donation: Donation) => (
      <div className="text-gray-600">
        {donation.in_rupees
          ? `PKR ${donation.in_rupees.toLocaleString()}`
          : "-"}
      </div>
    ),
  },
  {
    key: "date",
    header: "DATE",
    sortable: true,
    render: (value, donation: Donation) => (
      <div className="text-gray-600">{formatDate(donation.date)}</div>
    ),
  },
];

// Form field configurations
const createFormFields = [
  {
    name: "donner",
    label: "Donor",
    type: "searchable-select" as const,
    placeholder: "Select donor",
    required: true,
    options: [],
  },
  {
    name: "date",
    label: "Date",
    type: "datetime-local" as const,
    placeholder: "Select date and time",
    required: true,
  },
  {
    name: "purpose",
    label: "Purpose",
    type: "select" as const,
    placeholder: "Select purpose",
    required: true,
    options: purposeOptions,
  },
  {
    name: "donation_type",
    label: "Donation Type",
    type: "select" as const,
    placeholder:
      "Select Donation Type",
    required: true,
    options: donationTypeOptions,
  },
  {
    name: "currency",
    label: "Currency",
    type: "select" as const,
    placeholder: "Select currency",
    required: true,
    options: currencyOptions,
  },
  {
    name: "amount",
    label: "Amount",
    type: "number" as const,
    placeholder: "Enter amount",
    required: true,
    min: 0.01,
    step: 0.01,
  },
  {
    name: "in_rupees",
    label: "Amount in Rupees",
    type: "number" as const,
    placeholder: "Enter amount in rupees (optional)",
    required: true,
    min: 0,
    step: 0.01,
  },
  {
    name: "donor_comment",
    label: "Donor Comment",
    type: "textarea" as const,
    placeholder: "Enter donor comment (optional)",
    required: false,
  },
];

const editFormFields = [
  {
    name: "donner",
    label: "Donor",
    type: "select" as const,
    placeholder: "Select donor",
    required: true,
    options: [] as { value: string; label: string }[], // Will be populated with donors
  },
  {
    name: "date",
    label: "Date",
    type: "datetime-local" as const,
    placeholder: "Select date and time",
    required: true,
  },
  {
    name: "purpose",
    label: "Purpose",
    type: "select" as const,
    placeholder: "Select purpose",
    required: true,
    options: purposeOptions,
  },
  {
    name: "donation_type",
    label: "Donation Type",
    type: "select" as const,
    placeholder:
      "Select Donation Type",
    required: true,
    options: donationTypeOptions,
  },
  {
    name: "currency",
    label: "Currency",
    type: "select" as const,
    placeholder: "Select currency",
    required: true,
    options: currencyOptions,
  },
  {
    name: "amount",
    label: "Amount",
    type: "number" as const,
    placeholder: "Enter amount",
    required: true,
    min: 0.01,
    step: 0.01,
  },
  {
    name: "in_rupees",
    label: "Amount in Rupees",
    type: "number" as const,
    placeholder: "Enter amount in rupees (optional)",
    required: true,
    min: 0,
    step: 0.01,
  },
  {
    name: "donor_comment",
    label: "Donor Comment",
    type: "textarea" as const,
    placeholder: "Enter donor comment (optional)",
    required: false,
  },
];

const DonationManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    donations,
    loading,
    error,
    createLoading,
    createError,
    updateLoading,
    updateError,
    deleteLoading,
    deleteError,
    selectedDonation,
  } = useSelector((state: RootState) => state.donations);

  const { donors } = useSelector((state: RootState) => state.donors);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Fetch donations and donors on component mount
  useEffect(() => {
    dispatch(fetchDonations());
    // Also fetch donors for the dropdown
    if (donors.length === 0) {
      dispatch(fetchDonors());
    }
  }, [dispatch, donors.length]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearErrors());
    };
  }, [dispatch]);

  // Filter donations based on current filters
  const filteredDonations = donations.filter((donation) => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      const donationValue = donation[key as keyof Donation];
      return String(donationValue).toLowerCase().includes(value.toLowerCase());
    });
  });

  // Handle add donation
  const handleAddDonation = async (data: CreateDonationFormData) => {
    // Check if there are no donors available
    if (donors.length === 0) {
      alert("Cannot add donation: No donors available. Please add donors first.");
      return;
    }

    try {
      const donationData = {
        ...data,
        donner: Number(data.donner),
        in_rupees: data.in_rupees === "" ? undefined : data.in_rupees,
        donor_comment: data.donor_comment === "" ? undefined : data.donor_comment,
      };
      await dispatch(createDonation(donationData)).unwrap();
      setIsAddDialogOpen(false);
      dispatch(clearErrors());
    } catch (error) {
      // Error is handled by the slice
    }
  };

  // Handle edit donation
  const handleEditDonation = async (data: EditDonationFormData) => {
    if (!selectedDonation) return;

    // Check if there are no donors available
    if (donors.length === 0) {
      alert("Cannot update donation: No donors available. Please add donors first.");
      return;
    }

    try {
      const donationData = {
        ...data,
        donner: Number(data.donner),
        in_rupees: data.in_rupees === "" ? undefined : data.in_rupees,
        donor_comment: data.donor_comment === "" ? undefined : data.donor_comment,
      };
      await dispatch(
        updateDonation({ donationId: selectedDonation.id, donationData })
      ).unwrap();
      setIsEditDialogOpen(false);
      dispatch(setSelectedDonation(null));
      dispatch(clearErrors());
    } catch (error) {
      // Error is handled by the slice
    }
  };

  // Handle delete donation
  const handleDeleteDonation = async () => {
    if (!selectedDonation) return;

    try {
      await dispatch(deleteDonation(selectedDonation.id)).unwrap();
      setIsDeleteDialogOpen(false);
      dispatch(setSelectedDonation(null));
      dispatch(clearErrors());
    } catch (error) {
      // Error is handled by the slice
    }
  };

  // Handle row actions
  const handleEdit = (donation: Donation) => {
    dispatch(setSelectedDonation(donation));
    setIsEditDialogOpen(true);
  };

  const handleDelete = (donation: Donation) => {
    dispatch(setSelectedDonation(donation));
    setIsDeleteDialogOpen(true);
  };

  const handleView = (donation: Donation) => {
    // Navigate to donation detail page
    window.location.href = `/donations/${donation.id}`;
  };

  // Prepare donor options for forms
  const donorOptions = donors.length > 0 
    ? donors.map((donor) => ({
        value: String(donor.id),
        label: donor.name,
      })).sort((a, b) => a.label.localeCompare(b.label))
    : [];

  // Update form schemas with donor options
  const createFormSchemaWithDonors = new FormSchema({
    fields: createFormFields.map((field) =>
      field.name === "donner" ? { 
        ...field, 
        options: donorOptions,
        placeholder: donors.length > 0 ? "Select donor" : "No donors available",
        disabled: donors.length === 0,
      } : field
    ),
    layout: "two-column",
  });

  const editFormSchemaWithDonors = new FormSchema({
    fields: editFormFields.map((field) =>
      field.name === "donner" ? { 
        ...field, 
        options: donorOptions,
        placeholder: donors.length > 0 ? "Select donor" : "No donors available",
        disabled: donors.length === 0,
      } : field
    ),
    layout: "two-column",
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Donation Management"
        description="Manage donation records and details"
      >
        <Button onClick={() => setIsAddDialogOpen(true)}><PlusIcon className="h-4 w-4" /> Add Donation</Button>
      </PageHeader>

      {/* Filter Bar */}
      <FilterBar
        filters={filterOptions}
        values={filters}
        onFilterChange={(key, value) =>
          setFilters((prev) => ({ ...prev, [key]: value }))
        }
        onClearFilters={() => setFilters({})}
        searchKey="donner_name"
        searchPlaceholder="Search by donor name..."
        onSearchChange={(value) =>
          setFilters((prev) => ({ ...prev, donner_name: value }))
        }
        searchValue={filters.donner_name || ""}
        defaultFiltersVisible={false}
        showToggleButton={true}
      />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={filteredDonations}
        columns={columns}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        emptyMessage="No donations found"
        pagination={true}
        pageSize={10}
        defaultSort={{ key: "date", direction: "desc" }}
      />

      {/* Add Dialog */}
      <ResponsiveAddDialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) dispatch(clearErrors());
        }}
        title="Add New Donation"
        schema={createFormSchemaWithDonors}
        onSubmit={handleAddDonation}
        loading={createLoading}
        error={createError}
        submitText="Add Donation"
      />

      {/* Edit Dialog */}
      <ResponsiveEditDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            dispatch(setSelectedDonation(null));
            dispatch(clearErrors());
          }
        }}
        title="Edit Donation"
        schema={editFormSchemaWithDonors}
        defaultValues={
          selectedDonation
            ? {
                donner: String(selectedDonation.donner),
                date: new Date(selectedDonation.date)
                  .toISOString()
                  .slice(0, 16),
                amount: selectedDonation.amount,
                purpose: selectedDonation.purpose,
                donation_type: selectedDonation.donation_type,
                currency: selectedDonation.currency,
                in_rupees: selectedDonation.in_rupees || "",
                donor_comment: selectedDonation.donor_comment || "",
              }
            : {}
        }
        onSubmit={handleEditDonation}
        loading={updateLoading}
        error={updateError}
        submitText="Update Donation"
      />

      {/* Delete Dialog */}
      <ResponsiveDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            dispatch(setSelectedDonation(null));
            dispatch(clearErrors());
          }
        }}
        title="Delete Donation"
        description={`Are you sure you want to delete this donation of ${selectedDonation?.currency} ${selectedDonation?.amount}? This action cannot be undone.`}
        onConfirm={handleDeleteDonation}
        loading={deleteLoading}
        error={deleteError}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default DonationManagement;
