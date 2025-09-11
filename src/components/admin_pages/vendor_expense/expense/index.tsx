import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../store";
import {
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  Expense,
  CreateExpenseData,
  UpdateExpenseData,
} from "../../../../store/slices/expenseSlice";
import { expenseCategoryAPI, vendorAPI } from "../../../../services/api";
import { PageHeader } from "../../../common";
import {
  DataTable,
  Column,
  AddDialog,
  EditDialog,
  DeleteDialog,
  FilterBar,
  FilterOption,
} from "../../../common";
import { getExpenseFormSchema } from "./formSchemas";
import { Button } from "../../../ui/button";
import { FileTextIcon, Plus } from "lucide-react";
import { ExpenseDocumentManager } from "./ExpenseDocumentManager";

const ExpensePageComponent = () => {
  const dispatch = useDispatch();
  const {
    expenses,
    loading,
    error,
    createLoading,
    createError,
    updateLoading,
    updateError,
    deleteLoading,
    deleteError,
  } = useSelector((state: RootState) => state.expenses);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );
  const [vendors, setVendors] = useState<{ id: number; name: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    category: "",
    vendor: "",
    due_balance_to_vendor: "",
    expense_date: "",
    receipt_number: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchExpenses() as any);
    fetchCategoriesAndVendors();
  }, [dispatch]);

  const fetchCategoriesAndVendors = async () => {
    try {
      setLoadingCategories(true);
      setLoadingVendors(true);

      const [categoriesResponse, vendorsResponse] = await Promise.all([
        expenseCategoryAPI.getExpenseCategories(),
        vendorAPI.getVendors(),
      ]);

      setCategories(categoriesResponse.data);
      setVendors(vendorsResponse.data);
    } catch (error) {
      console.error("Error fetching categories and vendors:", error);
    } finally {
      setLoadingCategories(false);
      setLoadingVendors(false);
    }
  };

  const handleAddExpense = async (data: any) => {
    const expenseData: CreateExpenseData = {
      title: data.title,
      description: data.description,
      amount: data.amount,
      category: parseInt(data.category),
      vendor: parseInt(data.vendor),
      expense_date: data.expense_date,
      payment_method: data.payment_method,
      due_balance_to_vendor: data.due_balance_to_vendor,
      notes: data.notes || "",
    };

    try {
      await dispatch(createExpense(expenseData) as any);
      setAddDialogOpen(false);
      dispatch(clearCreateError());
    } catch (error) {
      console.error("Error creating expense:", error);
    }
  };

  const handleEditExpense = async (data: any) => {
    if (!selectedExpense) return;

    const expenseData: UpdateExpenseData = {
      title: data.title,
      description: data.description,
      amount: data.amount,
      category: parseInt(data.category),
      vendor: parseInt(data.vendor),
      expense_date: data.expense_date,
      payment_method: data.payment_method,
      due_balance_to_vendor: data.due_balance_to_vendor,
      notes: data.notes || "",
    };

    try {
      await dispatch(
        updateExpense({ id: selectedExpense.id, expenseData }) as any
      );
      setEditDialogOpen(false);
      setSelectedExpense(null);
      dispatch(clearUpdateError());
    } catch (error) {
      console.error("Error updating expense:", error);
    }
  };

  const handleDeleteExpense = async () => {
    if (!selectedExpense) return;

    try {
      await dispatch(deleteExpense(selectedExpense.id) as any);
      setDeleteDialogOpen(false);
      setSelectedExpense(null);
      dispatch(clearDeleteError());
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  const handleEditClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setDeleteDialogOpen(true);
  };

  const handleViewDocuments = (expense: Expense) => {
    setSelectedExpense(expense);
    setDocumentsModalOpen(true);
  };

  // Filter handling functions
  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      category: "",
      vendor: "",
      due_balance_to_vendor: "",
      expense_date: "",
      receipt_number: "",
    });
    setSearchTerm("");
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  // Filter the expenses based on current filters and search term
  const filteredExpenses = expenses.filter((expense) => {
    // Search by title
    if (
      searchTerm &&
      !expense.title.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Filter by category
    if (filters.category && expense.category.toString() !== filters.category) {
      return false;
    }

    // Filter by vendor
    if (filters.vendor && expense.vendor.toString() !== filters.vendor) {
      return false;
    }

    // Filter by expense date
    if (filters.expense_date && expense.expense_date !== filters.expense_date) {
      return false;
    }

    // Filter by receipt number
    if (filters.receipt_number) {
      const hasMatchingReceipt = expense.receipt_documents?.some((doc: any) =>
        doc.receipt_number?.toLowerCase().includes(filters.receipt_number.toLowerCase())
      );
      if (!hasMatchingReceipt) {
        return false;
      }
    }

    return true;
  });

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const columns: Column<Expense>[] = [
    {
      key: "title",
      header: "Name",
      sortable: true,
      width: "200px",
    },
    {
      key: "category_name",
      header: "Expense Type/Category Type",
      sortable: true,
      width: "150px",
    },
    {
      key: "vendor_name",
      header: "Vendor",
      sortable: true,
      width: "150px",
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      width: "120px",
      render: (value) => formatCurrency(value),
    },
    {
      key: "due_balance_to_vendor",
      header: "Due Balance to Vendor",
      sortable: true,
      width: "120px",
      render: (value) => formatCurrency(value),
    },
    {
      key: "payment_method_display",
      header: "Payment Method",
      sortable: true,
      width: "150px",
    },
    {
      key: "expense_date",
      header: "Date",
      sortable: true,
      width: "120px",
      render: (value) => formatDate(value),
    },
    {
      key: "receipt_documents",
      header: "Documents",
      sortable: true,
      render: (value, expense) => {
        const documentCount = expense.receipt_documents ? expense.receipt_documents.length : 0;
        return (
          <div className="text-gray-600">
            <button
              onClick={() => handleViewDocuments(expense)}
              className="text-blue-600 hover:text-blue-800 border border-blue-600 rounded-md px-2 py-1 flex justify-center items-center gap-2 hover:bg-blue-50 transition-colors"
            >
              <FileTextIcon className="w-4 h-4" />
              {documentCount}
            </button>
          </div>
        );
      },
    },
  ];

  const getFormSchema = () => getExpenseFormSchema(categories, vendors);

  // Filter configuration
  const filterOptions: FilterOption[] = [
    {
      key: "category",
      label: "Category",
      type: "select",
      placeholder: "All Categories",
      options: [
        { value: "", label: "All Categories" },
        ...categories.map((cat) => ({
          value: cat.id.toString(),
          label: cat.name,
        })),
      ],
    },
    {
      key: "vendor",
      label: "Vendor",
      type: "select",
      placeholder: "All Vendors",
      options: [
        { value: "", label: "All Vendors" },
        ...vendors.map((vendor) => ({
          value: vendor.id.toString(),
          label: vendor.name,
        })),
      ],
    },
    {
      key: "expense_date",
      label: "Expense Date",
      type: "date",
    },
    {
      key: "receipt_number",
      label: "Receipt Number",
      type: "text",
      placeholder: "Enter receipt number",
    },
  ];

  const getDefaultValues = () => {
    if (!selectedExpense) return {};

    return {
      title: selectedExpense.title,
      description: selectedExpense.description,
      amount: selectedExpense.amount,
      category: selectedExpense.category.toString(),
      vendor: selectedExpense.vendor.toString(),
      expense_date: selectedExpense.expense_date,
      payment_method: selectedExpense.payment_method,
      due_balance_to_vendor: selectedExpense.due_balance_to_vendor,
      notes: selectedExpense.notes || "",
    };
  };

  const formatApiError = (error: any) => {
    if (typeof error === "string") return error;
    if (error && typeof error === "object") {
      if (error.key && Array.isArray(error.key)) {
        return error.key.join(", ");
      }
      if (error.message) return error.message;
      if (error.detail) return error.detail;
    }
    return "An error occurred";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Manage and track all expenses"
        action={
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        }
      />

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
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        searchKey="title"
        searchPlaceholder="Search expenses by title..."
        onSearchChange={handleSearchChange}
        searchValue={searchTerm}
        showClearButton={true}
        defaultFiltersVisible={false}
        showToggleButton={true}
      />

      <DataTable
        data={filteredExpenses}
        columns={columns}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        loading={loading}
        emptyMessage={
          expenses.length === 0
            ? "No expenses found"
            : "No expenses match the current filters"
        }
        pagination={true}
        pageSize={10}
      />

      {/* Add Dialog */}
      <AddDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        title="Add New Expense"
        description="Create a new expense record"
        schema={getFormSchema()}
        onSubmit={handleAddExpense}
        loading={createLoading}
        error={createError ? formatApiError(createError) : null}
        onCancel={() => dispatch(clearCreateError())}
      />

      {/* Edit Dialog */}
      <EditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        title="Edit Expense"
        description="Update expense information"
        schema={getFormSchema()}
        defaultValues={getDefaultValues()}
        onSubmit={handleEditExpense}
        loading={updateLoading}
        error={updateError ? formatApiError(updateError) : null}
        onCancel={() => {
          setSelectedExpense(null);
          dispatch(clearUpdateError());
        }}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Expense"
        description={`Are you sure you want to delete "${selectedExpense?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteExpense}
        loading={deleteLoading}
        error={deleteError ? formatApiError(deleteError) : null}
        onCancel={() => {
          setSelectedExpense(null);
          dispatch(clearDeleteError());
        }}
      />

      {/* Documents Modal */}
      <ExpenseDocumentManager
        open={documentsModalOpen}
        onOpenChange={setDocumentsModalOpen}
        expense={selectedExpense}
        onDocumentChange={() => {
          // Optionally refresh the expense data to update document counts
          dispatch(fetchExpenses() as any);
        }}
      />
    </div>
  );
};

export default ExpensePageComponent;
