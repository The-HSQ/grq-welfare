import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../store';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  setSelectedUser,
} from '../../../store/slices/usersSlice';
import { PageHeader } from '../../common/PageHeader';
import { FilterBar } from '../../common/FilterBar';
import type { FilterOption } from '../../common/FilterBar';
import { DataTable } from '../../common/DataTable';
import type { Column } from '../../common/DataTable';
import { ResponsiveAddDialog } from '../../common/ResponsiveAddDialog';
import { ResponsiveEditDialog } from '../../common/ResponsiveEditDialog';
import { ResponsiveDeleteDialog } from '../../common/ResponsiveDeleteDialog';
import { ResponsiveViewDialog } from '../../common/ResponsiveViewDialog';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { PlusIcon } from 'lucide-react';
import { addUserSchema, editUserSchema, roleOptions } from './schemas';
import type { User, CreateUserData, UpdateUserData } from '../../../store/slices/usersSlice';
import { userAPI } from '../../../services/api';

const UsersPageComponent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    users,
    loading,
    error,
    createLoading,
    createError,
    updateLoading,
    updateError,
    deleteLoading,
    deleteError,
    selectedUser,
  } = useSelector((state: RootState) => state.users);

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToView, setUserToView] = useState<User | null>(null);
  const [fetchingUserDetails, setFetchingUserDetails] = useState(false);
  const [detailedUserData, setDetailedUserData] = useState<any>(null);

  // Filter states
  const [filters, setFilters] = useState<{ role: string; status: string }>({
    role: 'all',
    status: 'all',
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Filter options
  const filterOptions: FilterOption[] = [
    {
      key: 'role',
      label: 'Role',
      type: 'select',
      options: [
        { value: 'all', label: 'All Roles' },
        ...roleOptions,
      ],
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
  ];

  // Fetch users on component mount
  useEffect(() => {
    dispatch(fetchUsers());
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

  // Filter and search users
  const filteredUsers = users.filter((user) => {
    const matchesSearch = searchTerm
      ? user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesRole = filters.role === 'all' || user.role === filters.role;
    const matchesStatus = filters.status === 'all' || user.status === filters.status;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({ role: 'all', status: 'all' });
    setSearchTerm('');
  };

  // Handle add user
  const handleAddUser = (data: CreateUserData) => {
    // Ensure password is not empty
    if (!data.password || data.password.trim() === '') {
      console.error('Password is required');
      return;
    }
    
    // Clean the data to ensure no empty strings
    const cleanData = {
      ...data,
      password: data.password.trim(),
      name: data.name.trim(),
      email: data.email.trim(),
    };
    
    console.log('Creating user with data:', cleanData);
    dispatch(createUser(cleanData)).then((result) => {
      if (createUser.fulfilled.match(result)) {
        setAddDialogOpen(false);
        dispatch(fetchUsers());
      }
    });
  };

  // Handle edit user
  const handleEditUser = (data: UpdateUserData) => {
    // Validate password confirmation
    if (data.password && data.password !== data.password_confirm) {
      // This will be handled by the form validation, but we can add additional logic here
      return;
    }
    
    // Remove empty password fields if they're not being updated
    const userData = { ...data };
    if (!userData.password || userData.password.trim() === '') {
      delete userData.password;
      delete userData.password_confirm;
    } else {
      // Clean the password data
      userData.password = userData.password.trim();
      if (userData.password_confirm) {
        userData.password_confirm = userData.password_confirm.trim();
      }
    }
    
    // Clean other fields
    if (userData.name) userData.name = userData.name.trim();
    if (userData.email) userData.email = userData.email.trim();
    
    console.log('Updating user with data:', userData);
    
    if (selectedUser) {
      dispatch(updateUser({ userId: selectedUser.id, userData })).then((result) => {
        if (updateUser.fulfilled.match(result)) {
          setEditDialogOpen(false);
          dispatch(setSelectedUser(null));
        }
      });
    }
  };

  // Handle delete user
  const handleDeleteUser = () => {
    if (userToDelete) {
      dispatch(deleteUser(userToDelete.id)).then((result) => {
        if (deleteUser.fulfilled.match(result)) {
          setDeleteDialogOpen(false);
          setUserToDelete(null);
        }
      });
    }
  };

  // Handle edit button click
  const handleEdit = (user: User) => {
    dispatch(setSelectedUser(user));
    setEditDialogOpen(true);
  };

  // Handle delete button click
  const handleDelete = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
    // Clear any previous delete error
    dispatch(clearDeleteError());
  };

  // Handle delete dialog cancel
  const handleDeleteCancel = () => {
    setUserToDelete(null);
    dispatch(clearDeleteError());
  };

  // Async function to fetch detailed user data
  const fetchUserDetails = async (userId: string) => {
    try {
      setFetchingUserDetails(true);
      const response = await userAPI.getUserById(userId);
      setDetailedUserData(response.data);
      return response.data;
    } catch (error) {
      return null;
    } finally {
      setFetchingUserDetails(false);
    }
  };

  // Handle view button click
  const handleView = async (user: User) => {
    console.log('user id', user.id);
    setViewDialogOpen(true);
    
    // Fetch detailed user data
    const detailedData = await fetchUserDetails(user.id);
    if (detailedData) {
      setDetailedUserData(detailedData);
    }
  };

  // Table columns
  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'NAME',
      sortable: true,
      render: (value) => (
        <div className="font-medium">{value}</div>
      ),
    },
    {
      key: 'email',
      header: 'EMAIL',
      sortable: true,
      render: (value) => (
        <div className="text-sm text-muted-foreground">{value}</div>
      ),
    },
    {
      key: 'role',
      header: 'ROLE',
      sortable: true,
      render: (value) => {
        const roleOption = roleOptions.find(option => option.value === value);
        return (
          <Badge variant="secondary" className="capitalize">
            {roleOption?.label || value}
          </Badge>
        );
      },
    },
    {
      key: 'status',
      header: 'STATUS',
      sortable: true,
      render: (value) => (
        <Badge variant={value === 'active' ? 'default' : 'destructive'}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'CREATED AT',
      sortable: true,
      render: (value) => (
        <div className="text-sm text-muted-foreground">
          {new Date(value).toLocaleDateString()}
        </div>
      ),
    },
  ];

  // Get default values for edit form
  const getEditDefaultValues = () => {
    if (!selectedUser) return {};
    
    return {
      name: selectedUser.name,
      email: selectedUser.email,
      role: selectedUser.role,
      password: '',
      confirm_password: '',
    };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Users Management"
        description="Manage system users, their roles, and permissions"
      >
        <Button
          onClick={() => setAddDialogOpen(true)}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Add User
        </Button>
      </PageHeader>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      {/* Delete Error Display */}
      {deleteError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {deleteError}
        </div>
      )}

      {/* Filter Bar */}
      <FilterBar
        filters={filterOptions}
        values={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        searchKey="name"
        searchPlaceholder="Search users by name or email..."
        onSearchChange={setSearchTerm}
        searchValue={searchTerm}
        defaultFiltersVisible={false}
        showToggleButton={true}
      />

      {/* Data Table */}
        <DataTable
          data={filteredUsers}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          loading={loading}
          emptyMessage="No users found"
          pagination={true}
          pageSize={10}
        />

      {/* Add User Dialog */}
      <ResponsiveAddDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        title="Add New User"
        description="Create a new user account with the specified role and permissions"
        schema={addUserSchema}
        onSubmit={handleAddUser}
        loading={createLoading}
        error={createError}
        submitText="Create User"
      />

      {/* Edit User Dialog */}
      <ResponsiveEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        title="Edit User"
        description="Update user information and permissions"
        schema={editUserSchema}
        defaultValues={getEditDefaultValues()}
        onSubmit={handleEditUser}
        loading={updateLoading}
        error={updateError}
        submitText="Update User"
      />

      {/* Delete User Dialog */}
      <ResponsiveDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          // Don't allow closing the dialog while loading
          if (!open && deleteLoading) {
            return;
          }
          setDeleteDialogOpen(open);
          if (!open) {
            handleDeleteCancel();
          }
        }}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        itemName={userToDelete?.name}
        onConfirm={handleDeleteUser}
        onCancel={handleDeleteCancel}
        loading={deleteLoading}
        error={deleteError}
        confirmText="Delete User"
      />

      {/* View User Dialog */}
      <ResponsiveViewDialog
        open={viewDialogOpen}
        onOpenChange={(open) => {
          setViewDialogOpen(open);
          if (!open) {
            setUserToView(null);
            setDetailedUserData(null);
          }
        }}
        title="User Details"
        description="View complete user information"
        data={detailedUserData || userToView || {}}
        loading={fetchingUserDetails}
        fields={[
          {
            key: 'id',
            label: 'User ID',
            type: 'text',
          },
          {
            key: 'name',
            label: 'Full Name',
            type: 'text',
          },
          {
            key: 'email',
            label: 'Email Address',
            type: 'email',
          },
          {
            key: 'plain_password',
            label: 'Password',
            type: 'text',
            format: (value) => value || 'Not available',
          },
          {
            key: 'role',
            label: 'Role',
            type: 'badge',
            badgeVariant: 'secondary',
            format: (value) => {
              const roleOption = roleOptions.find(option => option.value === value);
              return roleOption?.label || value;
            },
          },
          {
            key: 'status',
            label: 'Status',
            type: 'status',
          },
          {
            key: 'is_active',
            label: 'Active',
            type: 'badge',
            badgeVariant: 'outline',
            format: (value) => value ? 'Yes' : 'No',
          },
          {
            key: 'created_at',
            label: 'Created At',
            type: 'date',
          },
          {
            key: 'updated_at',
            label: 'Last Updated',
            type: 'date',
          },
        ]}
      />
    </div>
  );
};

export default UsersPageComponent;