import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import {
  fetchExpenseCategories,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
  clearErrors,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  setSelectedExpenseCategory,
  type ExpenseCategory,
} from '@/store/slices/expenseCategorySlice';
import {
  expenseCategoryTypeOptions,
  type CreateExpenseCategoryFormData,
  type EditExpenseCategoryFormData,
} from '@/lib/schemas';
import {
  createExpenseCategoryFormSchema,
  editExpenseCategoryFormSchema,
} from './formSchemas';
import { PageHeader } from '@/components/common/PageHeader';
import { FilterBar, type FilterOption } from '@/components/common/FilterBar';
import { DataTable, type Column } from '@/components/common/DataTable';
import { ResponsiveAddDialog } from '@/components/common';
import { ResponsiveEditDialog } from '@/components/common';
import { ResponsiveDeleteDialog } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const ExpenseCategoryComponent = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    expenseCategories,
    loading,
    error,
    createLoading,
    createError,
    updateLoading,
    updateError,
    deleteLoading,
    deleteError,
    selectedExpenseCategory,
  } = useSelector((state: RootState) => state.expenseCategories);

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    category_type: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchExpenseCategories());
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

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
  }, [error, dispatch]);

  // Filter options
  const filterOptions: FilterOption[] = [
    {
      key: 'category_type',
      label: 'Category Type',
      type: 'select',
      options: [
        { value: '', label: 'All Types' },
        ...expenseCategoryTypeOptions,
      ],
    },
  ];

  // Table columns
  const columns: Column<ExpenseCategory>[] = [
    {
      key: 'name',
      header: 'NAME',
      sortable: true,
    },
    {
      key: 'description',
      header: 'DESCRIPTION',
      sortable: true,
      render: (value: string) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      ),
    },
    {
      key: 'category_type',
      header: 'CATEGORY TYPE',
      sortable: true,
      render: (value: string) => {
        const option = expenseCategoryTypeOptions.find(opt => opt.value === value);
        return (
          <Badge variant="secondary">
            {option?.label || value}
          </Badge>
        );
      },
    },
    {
      key: 'created_at',
      header: 'CREATED AT',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  // Filter data
  const filteredData = expenseCategories.filter((category) => {
    const matchesSearch = searchTerm === '' || 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategoryType = filters.category_type === '' || 
      category.category_type === filters.category_type;

    return matchesSearch && matchesCategoryType;
  });

  // Handlers
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      category_type: '',
    });
    setSearchTerm('');
  };

  const handleAdd = () => {
    setAddDialogOpen(true);
  };

  const handleEdit = (category: ExpenseCategory) => {
    dispatch(setSelectedExpenseCategory(category));
    setEditDialogOpen(true);
  };

  const handleDelete = (category: ExpenseCategory) => {
    dispatch(setSelectedExpenseCategory(category));
    setDeleteDialogOpen(true);
  };

  const handleCreateSubmit = (data: CreateExpenseCategoryFormData) => {
    dispatch(createExpenseCategory(data))
      .unwrap()
      .then(() => {
        toast.success('Expense category created successfully');
        setAddDialogOpen(false);
      })
      .catch((error) => {
        console.error('Create error:', error);
      });
  };

  const handleUpdateSubmit = (data: EditExpenseCategoryFormData) => {
    if (selectedExpenseCategory) {
      dispatch(updateExpenseCategory({
        categoryId: selectedExpenseCategory.id,
        expenseCategoryData: data,
      }))
        .unwrap()
        .then(() => {
          toast.success('Expense category updated successfully');
          setEditDialogOpen(false);
          dispatch(setSelectedExpenseCategory(null));
        })
        .catch((error) => {
          console.error('Update error:', error);
        });
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedExpenseCategory) {
      dispatch(deleteExpenseCategory(selectedExpenseCategory.id))
        .unwrap()
        .then(() => {
          toast.success('Expense category deleted successfully');
          setDeleteDialogOpen(false);
          dispatch(setSelectedExpenseCategory(null));
        })
        .catch((error) => {
          console.error('Delete error:', error);
        });
    }
  };

  const handleAddDialogClose = () => {
    setAddDialogOpen(false);
    dispatch(clearCreateError());
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    dispatch(setSelectedExpenseCategory(null));
    dispatch(clearUpdateError());
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    dispatch(setSelectedExpenseCategory(null));
    dispatch(clearDeleteError());
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Expense Categories"
        description="Manage expense categories for different types of expenses"
      >
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Add Category
        </Button>
      </PageHeader>

      {/* Filters */}
      <FilterBar
        filters={filterOptions}
        values={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        searchKey="name"
        searchPlaceholder="Search categories..."
        onSearchChange={setSearchTerm}
        searchValue={searchTerm}
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
        data={filteredData}
        columns={columns}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No expense categories found"
        pagination={true}
        pageSize={10}
      />

      {/* Add Dialog */}
      <ResponsiveAddDialog
        open={addDialogOpen}
        onOpenChange={handleAddDialogClose}
        title="Add Expense Category"
        description="Create a new expense category"
        schema={createExpenseCategoryFormSchema}
        onSubmit={handleCreateSubmit}
        loading={createLoading}
        error={createError}
      />

      {/* Edit Dialog */}
      {selectedExpenseCategory && (
        <ResponsiveEditDialog
          open={editDialogOpen}
          onOpenChange={handleEditDialogClose}
          title="Edit Expense Category"
          description="Update expense category information"
          schema={editExpenseCategoryFormSchema}
          defaultValues={{
            name: selectedExpenseCategory.name,
            description: selectedExpenseCategory.description,
            category_type: selectedExpenseCategory.category_type,
          }}
          onSubmit={handleUpdateSubmit}
          loading={updateLoading}
          error={updateError}
        />
      )}

      {/* Delete Dialog */}
      {selectedExpenseCategory && (
        <ResponsiveDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={handleDeleteDialogClose}
          title="Delete Expense Category"
          description="Are you sure you want to delete this expense category?"
          itemName={selectedExpenseCategory.name}
          onConfirm={handleDeleteConfirm}
          loading={deleteLoading}
          error={deleteError}
        />
      )}
    </div>
  );
};

export default ExpenseCategoryComponent;
