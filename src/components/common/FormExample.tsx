import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import {
  PageHeader,
  DataTable,
  AddDialog,
  EditDialog,
  DeleteDialog,
  FilterBar,
  type Column,
  type FilterOption,
  createFormSchema
} from './index';

// Example data type
interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: 'active' | 'inactive';
  department: string;
  salary: number;
  hireDate: string;
  isManager: boolean;
  description: string;
}

// Example data
const mockUsers: User[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    role: 'Admin',
    status: 'active',
    department: 'IT',
    salary: 75000,
    hireDate: '2024-01-15',
    isManager: true,
    description: 'Senior administrator with 5 years of experience'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1234567891',
    role: 'User',
    status: 'active',
    department: 'HR',
    salary: 65000,
    hireDate: '2024-01-20',
    isManager: false,
    description: 'HR specialist focused on recruitment'
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    phone: '+1234567892',
    role: 'User',
    status: 'inactive',
    department: 'Sales',
    salary: 55000,
    hireDate: '2024-01-25',
    isManager: false,
    description: 'Sales representative'
  }
];

// Create form schema for User
const userFormSchema = createFormSchema({
  fields: [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      placeholder: 'Enter name',
      required: true,
      validation: {
        minLength: 2,
        maxLength: 50
      }
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'Enter email address',
      required: true,
      validation: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      }
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'tel',
      placeholder: 'Enter phone number',
      required: false,
      validation: {
        pattern: /^[\+]?[1-9][\d]{0,15}$/
      }
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      required: true,
      options: [
        { value: 'Admin', label: 'Administrator' },
        { value: 'Manager', label: 'Manager' },
        { value: 'User', label: 'User' }
      ]
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]
    },
    {
      name: 'department',
      label: 'Department',
      type: 'select',
      required: true,
      options: [
        { value: 'IT', label: 'Information Technology' },
        { value: 'HR', label: 'Human Resources' },
        { value: 'Sales', label: 'Sales' },
        { value: 'Marketing', label: 'Marketing' },
        { value: 'Finance', label: 'Finance' }
      ]
    },
    {
      name: 'salary',
      label: 'Salary',
      type: 'number',
      placeholder: 'Enter salary',
      required: true,
      min: 30000,
      max: 200000,
      validation: {
        min: 30000,
        max: 200000
      }
    },
    {
      name: 'hireDate',
      label: 'Hire Date',
      type: 'date',
      required: true
    },
    {
      name: 'isManager',
      label: 'Is Manager',
      type: 'checkbox',
      required: false
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Enter description',
      required: false,
      rows: 4,
      validation: {
        maxLength: 500
      }
    }
  ],
  layout: 'two-column'
});

export const FormExample: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);

  // Table columns
  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
    },
    {
      key: 'phone',
      header: 'Phone',
      sortable: true,
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: 'salary',
      header: 'Salary',
      sortable: true,
      render: (value) => `$${value.toLocaleString()}`,
    },
    {
      key: 'isManager',
      header: 'Manager',
      sortable: true,
      render: (value) => value ? 'Yes' : 'No',
    },
  ];

  // Filter options
  const filterOptions: FilterOption[] = [
    {
      key: 'role',
      label: 'Role',
      type: 'select',
      options: [
        { value: 'Admin', label: 'Administrator' },
        { value: 'Manager', label: 'Manager' },
        { value: 'User', label: 'User' },
      ],
    },
    {
      key: 'department',
      label: 'Department',
      type: 'select',
      options: [
        { value: 'IT', label: 'Information Technology' },
        { value: 'HR', label: 'Human Resources' },
        { value: 'Sales', label: 'Sales' },
        { value: 'Marketing', label: 'Marketing' },
        { value: 'Finance', label: 'Finance' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
    {
      key: 'hireDate',
      label: 'Hire Date',
      type: 'date',
    },
  ];

  // Handlers
  const handleAdd = () => {
    setAddDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleAddSubmit = (data: any) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const newUser: User = {
        id: users.length + 1,
        ...data,
        hireDate: data.hireDate || new Date().toISOString().split('T')[0]
      };
      setUsers([...users, newUser]);
      setAddDialogOpen(false);
      setLoading(false);
    }, 1000);
  };

  const handleEditSubmit = (data: any) => {
    if (!selectedUser) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, ...data }
          : user
      ));
      setEditDialogOpen(false);
      setLoading(false);
    }, 1000);
  };

  const handleDeleteConfirm = () => {
    if (!selectedUser) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUsers(users.filter(user => user.id !== selectedUser.id));
      setDeleteDialogOpen(false);
      setLoading(false);
    }, 1000);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilterValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleClearFilters = () => {
    setFilterValues({});
    setSearchValue('');
  };

  // Filter data based on filter values
  const filteredUsers = users.filter(user => {
    if (filterValues.role && user.role !== filterValues.role) return false;
    if (filterValues.department && user.department !== filterValues.department) return false;
    if (filterValues.status && user.status !== filterValues.status) return false;
    if (filterValues.hireDate && user.hireDate !== filterValues.hireDate) return false;
    if (searchValue && !user.name.toLowerCase().includes(searchValue.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <PageHeader
        title="Employee Management"
        description="Manage your organization's employees and their information"
      >
        <Button onClick={handleAdd}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </PageHeader>

      {/* Filter Bar */}
      <FilterBar
        filters={filterOptions}
        values={filterValues}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        searchKey="name"
        searchPlaceholder="Search employees..."
        onSearchChange={setSearchValue}
        searchValue={searchValue}
      />

      {/* Data Table */}
      <DataTable
        data={filteredUsers}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        emptyMessage="No employees found"
      />

      {/* Add Dialog */}
      <AddDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        title="Add New Employee"
        description="Create a new employee record"
        schema={userFormSchema}
        onSubmit={handleAddSubmit}
        loading={loading}
        submitText="Add Employee"
      />

      {/* Edit Dialog */}
      <EditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        title="Edit Employee"
        description="Update employee information"
        schema={userFormSchema}
        defaultValues={selectedUser || {}}
        onSubmit={handleEditSubmit}
        loading={loading}
        submitText="Save Changes"
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Employee"
        itemName={selectedUser?.name}
        onConfirm={handleDeleteConfirm}
        loading={loading}
      />
    </div>
  );
};
