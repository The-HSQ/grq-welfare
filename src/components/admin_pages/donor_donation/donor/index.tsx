import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../../../../store';
import {
  fetchDonors,
  setSelectedDonor,
  clearErrors,
  createDonor,
  updateDonor,
  deleteDonor,
  type Donor,
} from '../../../../store/slices/donorSlice';
import {
  PageHeader,
  DataTable,
  FilterBar,
  AddDialog,
  EditDialog,
  DeleteDialog,
  type Column,
  type FilterOption,
} from '../../../common';
import { Button } from '../../../../components/ui/button';
import { FormSchema } from '../../../common';
import { formatDate } from '../../../../lib/utils';
import { getMediaUrl } from '../../../../lib/mediaUtils';
import { Plus } from 'lucide-react';
import LazyImage from '../../../common/LazyImage';

// Filter options for the donor table
const filterOptions: FilterOption[] = [
  {
    key: 'name',
    label: 'Name',
    type: 'text',
    placeholder: 'Search by name...',
  },
  {
    key: 'contact',
    label: 'Contact',
    type: 'text',
    placeholder: 'Search by contact...',
  },
  {
    key: 'address',
    label: 'Address',
    type: 'text',
    placeholder: 'Search by address...',
  },
];

// Table columns configuration
const columns: Column<Donor>[] = [
  {
    key: 'image',
    header: 'Image',
    sortable: false,
    render: (value, donor: Donor) => {
      const image = getMediaUrl(donor.image);
      
      return (
        <div className="flex items-center">
          {donor.image ? (
            <LazyImage
              src={image || ''}
              alt={donor.name || 'Donor'}
              className="w-10 h-10 rounded-md object-cover"
              fallback={
                <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-xs font-medium">
                    {donor.name ? donor.name.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
              }
            />
          ) : (
            <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-xs font-medium">
                {donor.name ? donor.name.charAt(0).toUpperCase() : '?'}
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
    render: (value, donor: Donor) => (
      <div className="font-medium text-gray-900">{donor.name}</div>
    ),
  },
  {
    key: 'contact',
    header: 'Contact',
    sortable: true,
    render: (value, donor: Donor) => (
      <div className="text-gray-600">{donor.contact}</div>
    ),
  },
  {
    key: 'address',
    header: 'Address',
    sortable: true,
    render: (value, donor: Donor) => (
      <div className="text-gray-600 max-w-xs truncate" title={donor.address}>
        {donor.address}
      </div>
    ),
  },
  {
    key: 'created_at',
    header: 'Created Date',
    sortable: true,
    render: (value, donor: Donor) => (
      <div className="text-gray-600">{formatDate(donor.created_at)}</div>
    ),
  },
];

// Form field configurations
const createFormFields = [
  {
    name: 'name',
    label: 'Name',
    type: 'text' as const,
    placeholder: 'Enter donor name',
    required: true,
  },
  {
    name: 'contact',
    label: 'Contact',
    type: 'text' as const,
    placeholder: 'Enter contact number',
    required: true,
  },
  {
    name: 'address',
    label: 'Address',
    type: 'textarea' as const,
    placeholder: 'Enter address',
    required: false,
  },
  {
    name: 'image',
    label: 'Image',
    type: 'file' as const,
    accept: 'image/*',
    required: false,
  },
];

const editFormFields = [
  {
    name: 'name',
    label: 'Name',
    type: 'text' as const,
    placeholder: 'Enter donor name',
    required: true,
  },
  {
    name: 'contact',
    label: 'Contact',
    type: 'text' as const,
    placeholder: 'Enter contact number',
    required: true,
  },
  {
    name: 'address',
    label: 'Address',
    type: 'textarea' as const,
    placeholder: 'Enter address',
    required: false,
  },
  {
    name: 'image',
    label: 'Image',
    type: 'file' as const,
    accept: 'image/*',
    required: false,
  },
];

// Create FormSchema instances
const createDonorFormSchema = new FormSchema({
  fields: createFormFields,
});

const editDonorFormSchema = new FormSchema({
  fields: editFormFields,
});

const DonorManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const {
    donors,
    loading,
    error,
    createLoading,
    createError,
    updateLoading,
    updateError,
    deleteLoading,
    deleteError,
    selectedDonor,
  } = useSelector((state: RootState) => state.donors);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Fetch donors on component mount
  useEffect(() => {
    dispatch(fetchDonors());
  }, [dispatch]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearErrors());
    };
  }, [dispatch]);

  // Filter donors based on current filters
  const filteredDonors = donors.filter((donor) => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      const donorValue = donor[key as keyof Donor];
      return String(donorValue).toLowerCase().includes(value.toLowerCase());
    });
  });

  // Handle add donor
  const handleAddDonor = async (data: FormData) => {
    try {
      // Debug: Log FormData contents to verify binary data
      console.log('Create FormData contents:');
      for (let [key, value] of data.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File object (${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }
      
      await dispatch(createDonor(data)).unwrap();
      setIsAddDialogOpen(false);
      dispatch(clearErrors());
    } catch (error) {
      // Error is handled by the slice
    }
  };

  // Handle edit donor
  const handleEditDonor = async (data: FormData) => {
    if (!selectedDonor) return;
    
    try {
      // Debug: Log FormData contents to verify binary data
      console.log('Edit FormData contents:');
      for (let [key, value] of data.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File object (${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }
      
      await dispatch(updateDonor({ donorId: selectedDonor.id, donorData: data })).unwrap();
      setIsEditDialogOpen(false);
      dispatch(setSelectedDonor(null));
      dispatch(clearErrors());
    } catch (error) {
      // Error is handled by the slice
    }
  };

  // Handle delete donor
  const handleDeleteDonor = async () => {
    if (!selectedDonor) return;
    
    try {
      await dispatch(deleteDonor(selectedDonor.id)).unwrap();
      setIsDeleteDialogOpen(false);
      dispatch(setSelectedDonor(null));
      dispatch(clearErrors());
    } catch (error) {
      // Error is handled by the slice
    }
  };

  // Handle row actions
  const handleEdit = (donor: Donor) => {
    dispatch(setSelectedDonor(donor));
    setIsEditDialogOpen(true);
  };

  const handleDelete = (donor: Donor) => {
    dispatch(setSelectedDonor(donor));
    setIsDeleteDialogOpen(true);
  };

  const handleView = (donor: Donor) => {
    // Navigate to donor detail page
    navigate(`/office-management/donors/${donor.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Donor Management"
        description="Manage donor information and details"
      >
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Donor
        </Button>
      </PageHeader>

      {/* Filter Bar */}
      <FilterBar
        filters={filterOptions}
        values={filters}
        onFilterChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
        onClearFilters={() => setFilters({})}
        searchKey="name"
        searchPlaceholder="Search donors..."
        onSearchChange={(value) => setFilters(prev => ({ ...prev, name: value }))}
        searchValue={filters.name || ''}
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
        data={filteredDonors}
        columns={columns}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        emptyMessage="No donors found"
        searchPlaceholder="Search donors..."
        pagination={true}
        pageSize={10}
      />

      {/* Add Dialog */}
      <AddDialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) dispatch(clearErrors());
        }}
        title="Add New Donor"
        schema={createDonorFormSchema}
        onSubmit={handleAddDonor}
        loading={createLoading}
        error={createError}
        submitText="Add Donor"
      />

      {/* Edit Dialog */}
      <EditDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            dispatch(setSelectedDonor(null));
            dispatch(clearErrors());
          }
        }}
        title="Edit Donor"
        schema={editDonorFormSchema}
        defaultValues={selectedDonor ? {
          name: selectedDonor.name,
          contact: selectedDonor.contact,
          address: selectedDonor.address,
          // Don't include image in defaultValues - let the form handle existing image display
        } : {}}
        onSubmit={handleEditDonor}
        loading={updateLoading}
        error={updateError}
        submitText="Update Donor"
        getMediaUrl={getMediaUrl}
        existingFiles={selectedDonor ? {
          image: selectedDonor.image
        } : {}}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            dispatch(setSelectedDonor(null));
            dispatch(clearErrors());
          }
        }}
        title="Delete Donor"
        description={`Are you sure you want to delete "${selectedDonor?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteDonor}
        loading={deleteLoading}
        error={deleteError}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default DonorManagement;