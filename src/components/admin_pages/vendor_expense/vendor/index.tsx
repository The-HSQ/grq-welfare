import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  PageHeader, 
  DataTable, 
  FilterBar, 
  AddDialog, 
  EditDialog, 
  DeleteDialog,
  type Column,
  type FilterOption 
} from '../../../../components/common';
import { 
  fetchVendors, 
  createVendor, 
  updateVendor, 
  deleteVendor,
  setSelectedVendor,
  clearErrors,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  type Vendor,
  type CreateVendorData,
  type UpdateVendorData
} from '../../../../store/slices/vendorSlice';
import { RootState, AppDispatch } from '../../../../store';
import {
  vendorTypeOptions,
  type CreateVendorFormData,
  type EditVendorFormData
} from '../../../../lib/schemas';
import { FormSchema } from '../../../../components/common/FormSchema';
import { Button } from '../../../../components/ui/button';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const VendorsPageComponent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const {
    vendors,
    loading,
    error,
    createLoading,
    createError,
    updateLoading,
    updateError,
    deleteLoading,
    deleteError,
    selectedVendor
  } = useSelector((state: RootState) => state.vendors);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Fetch vendors on component mount
  useEffect(() => {
    dispatch(fetchVendors());
  }, [dispatch]);

  // Clear errors when dialogs close
  useEffect(() => {
    if (!isAddDialogOpen) {
      dispatch(clearCreateError());
    }
    if (!isEditDialogOpen) {
      dispatch(clearUpdateError());
    }
    if (!isDeleteDialogOpen) {
      dispatch(clearDeleteError());
    }
  }, [isAddDialogOpen, isEditDialogOpen, isDeleteDialogOpen, dispatch]);

  // Show error toast when there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
  }, [error, dispatch]);

  // Filter options for the filter bar
  const filterOptions: FilterOption[] = [
    {
      key: 'type',
      label: 'Vendor Type',
      type: 'select',
      options: [
        { value: 'all', label: 'All Types' },
        ...vendorTypeOptions
      ]
    }
  ];

  const filterValues = {
    type: typeFilter
  };

  const handleFilterChange = (key: string, value: any) => {
    if (key === 'type') {
      setTypeFilter(value);
    }
  };

  const handleClearFilters = () => {
    setTypeFilter('all');
    setSearchTerm('');
  };

  // Filter vendors based on search and filters
  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && vendor.is_active) ||
                         (statusFilter === 'inactive' && !vendor.is_active);
    
    const matchesType = typeFilter === 'all' || vendor.vendor_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Table columns configuration
  const columns: Column<Vendor>[] = [
    {
      key: 'name',
      header: 'Vendor Name',
      sortable: true,
      render: (value, vendor: Vendor) => (
        <div className="font-medium text-gray-900">
          {vendor.name}
        </div>
      )
    },
    {
      key: 'contact_person',
      header: 'Contact Person',
      sortable: true,
      render: (value, vendor: Vendor) => (
        <div className="text-gray-700">
          {vendor.contact_person}
        </div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      render: (value, vendor: Vendor) => (
        <div className="text-gray-600">
          {vendor.email}
        </div>
      )
    },
    {
      key: 'phone',
      header: 'Phone',
      sortable: false,
      render: (value, vendor: Vendor) => (
        <div className="text-gray-600">
          {vendor.phone}
        </div>
      )
    },
    {
      key: 'vendor_type_display',
      header: 'Type',
      sortable: true,
      render: (value, vendor: Vendor) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {vendor.vendor_type_display}
        </span>
      )
    },
    {
      key: 'tax_id',
      header: 'Tax ID',
      sortable: true,
      render: (value, vendor: Vendor) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {vendor.tax_id}
        </span>
      )
    },
    {
      key: 'payment_terms',
      header: 'Payment Terms',
      sortable: true,
      render: (value, vendor: Vendor) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          {vendor.payment_terms}
        </span>
      )
    }
  ];

  // Event handlers
  const handleView = (vendor: Vendor) => {
    dispatch(setSelectedVendor(vendor));
    navigate(`/office-management/vender/${vendor.id}`);
  };

  const handleEdit = (vendor: Vendor) => {
    dispatch(setSelectedVendor(vendor));
    setIsEditDialogOpen(true);
  };

  const handleDelete = (vendor: Vendor) => {
    dispatch(setSelectedVendor(vendor));
    setIsDeleteDialogOpen(true);
  };

  const handleAddSuccess = (data: CreateVendorFormData) => {
    const vendorData: CreateVendorData = {
      name: data.name,
      contact_person: data.contact_person,
      email: data.email,
      phone: data.phone,
      address: data.address,
      vendor_type: data.vendor_type,
      tax_id: data.tax_id,
      payment_terms: data.payment_terms,
      is_active: data.is_active
    };
    
    dispatch(createVendor(vendorData)).then((result: any) => {
      if (createVendor.fulfilled.match(result)) {
        toast.success('Vendor created successfully');
        setIsAddDialogOpen(false);
      }
    });
  };

  const handleEditSuccess = (data: EditVendorFormData) => {
    if (!selectedVendor) return;
    
    const vendorData: UpdateVendorData = {
      name: data.name,
      contact_person: data.contact_person,
      email: data.email,
      phone: data.phone,
      address: data.address,
      vendor_type: data.vendor_type,
      tax_id: data.tax_id,
      payment_terms: data.payment_terms,
      is_active: data.is_active
    };
    
    dispatch(updateVendor({ vendorId: selectedVendor.id, vendorData })).then((result: any) => {
      if (updateVendor.fulfilled.match(result)) {
        toast.success('Vendor updated successfully');
        setIsEditDialogOpen(false);
        dispatch(setSelectedVendor(null));
      }
    });
  };

  const handleDeleteConfirm = () => {
    if (!selectedVendor) return;
    
    dispatch(deleteVendor(selectedVendor.id)).then((result: any) => {
      if (deleteVendor.fulfilled.match(result)) {
        toast.success('Vendor deleted successfully');
        setIsDeleteDialogOpen(false);
        dispatch(setSelectedVendor(null));
      }
    });
  };

  // Form field configurations
  const addFormFields = [
    {
      name: 'name',
      label: 'Vendor Name',
      type: 'text' as const,
      placeholder: 'Enter vendor name',
      required: true
    },
    {
      name: 'contact_person',
      label: 'Contact Person',
      type: 'text' as const,
      placeholder: 'Enter contact person name',
      required: true
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email' as const,
      placeholder: 'Enter email address',
      required: true
    },
    {
      name: 'phone',
      label: 'Phone',
      type: 'text' as const,
      placeholder: 'Enter phone number',
      required: true
    },
    {
      name: 'address',
      label: 'Address',
      type: 'textarea' as const,
      placeholder: 'Enter address',
      required: true
    },
    {
      name: 'vendor_type',
      label: 'Vendor Type',
      type: 'select' as const,
      options: vendorTypeOptions,
      required: true
    },
    {
      name: 'tax_id',
      label: 'Tax ID',
      type: 'text' as const,
      placeholder: 'Enter tax ID',
      required: true
    },
    {
      name: 'payment_terms',
      label: 'Payment Terms',
      type: 'text' as const,
      placeholder: 'Enter payment terms',
      required: true
    },
  ];

  const editFormFields = addFormFields; // Same fields for edit

  // Create FormSchema objects
  const addFormSchema = new FormSchema({
    fields: addFormFields,
    layout: 'two-column'
  });

  const editFormSchema = new FormSchema({
    fields: editFormFields,
    layout: 'two-column'
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Vendors"
        description="Manage your vendors and suppliers"
      >
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Vendor
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
        values={filterValues}
        onFilterChange={handleFilterChange}
        searchKey="name"
        searchPlaceholder="Search vendors..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        showClearButton={true}
        onClearFilters={handleClearFilters}
        defaultFiltersVisible={false}
        showToggleButton={true}
      />

      {/* Data Table */}
      <DataTable
        data={filteredVendors}
        columns={columns}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No vendors found"
        pagination={true}
        pageSize={10}
      />

      {/* Add Dialog */}
      <AddDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        title="Add New Vendor"
        schema={addFormSchema}
        onSubmit={handleAddSuccess}
        loading={createLoading}
        error={createError}
      />

      {/* Edit Dialog */}
      <EditDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            dispatch(setSelectedVendor(null));
          }
        }}
        title="Edit Vendor"
        schema={editFormSchema}
        defaultValues={selectedVendor ? {
          name: selectedVendor.name,
          contact_person: selectedVendor.contact_person,
          email: selectedVendor.email,
          phone: selectedVendor.phone,
          address: selectedVendor.address,
          vendor_type: selectedVendor.vendor_type,
          tax_id: selectedVendor.tax_id,
          payment_terms: selectedVendor.payment_terms,
          is_active: selectedVendor.is_active
        } : {}}
        onSubmit={handleEditSuccess}
        loading={updateLoading}
        error={updateError}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            dispatch(setSelectedVendor(null));
          }
        }}
        title="Delete Vendor"
        description={`Are you sure you want to delete "${selectedVendor?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        error={deleteError}
      />
    </div>
  );
};

export default VendorsPageComponent;