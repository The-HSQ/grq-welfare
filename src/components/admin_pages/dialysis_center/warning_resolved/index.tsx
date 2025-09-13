import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterBar } from "@/components/common/FilterBar";
import { DataTable } from "@/components/common/DataTable";
import type { Column } from "@/components/common/DataTable";
import { AddDialog } from "@/components/common/AddDialog";
import { EditDialog } from "@/components/common/EditDialog";
import { DeleteDialog } from "@/components/common/DeleteDialog";
import { Spinner } from "@/components/ui/spinner";
import {
  fetchWarningFixes,
  createWarningFix,
  updateWarningFix,
  deleteWarningFix,
  resolveWarning,
  fetchWarnings,
  fetchMachines,
  type WarningFix,
} from "@/store/slices/dialysisSlice";
import { addWarningFixSchema, editWarningFixSchema } from "./schemas";
import { createFormSchema } from "@/components/common/FormSchema";
import type { AppDispatch, RootState } from "@/store";

const WarningResolvedPageComponent = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    warningFixes,
    warnings,
    machinesArray,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
  } = useSelector((state: RootState) => state.dialysis);

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedWarningFix, setSelectedWarningFix] =
    useState<WarningFix | null>(null);

  // Filter states
  const [filters, setFilters] = useState({
    machine: "",
    date: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Schema with dynamic options
  const [addSchema, setAddSchema] = useState(addWarningFixSchema);
  const [editSchema, setEditSchema] = useState(editWarningFixSchema);

  useEffect(() => {
    dispatch(fetchWarningFixes());
    dispatch(fetchWarnings());
    dispatch(fetchMachines());
  }, [dispatch]);

  useEffect(() => {
    // Update schema options when warnings data is available
    if (warnings) {
      const warningOptions = warnings.map((warning) => ({
        value: warning.id,
        label: `Warning: ${warning.warning_description.substring(0, 50)}${
          warning.warning_description.length > 50 ? "..." : ""
        }`,
      }));

      const newAddSchema = createFormSchema({
        ...addWarningFixSchema,
        fields: addWarningFixSchema
          .getFields()
          .map((field: any) =>
            field.name === "warning"
              ? { ...field, options: warningOptions }
              : field
          ),
      });
      setAddSchema(newAddSchema);

      const newEditSchema = createFormSchema({
        ...editWarningFixSchema,
        fields: editWarningFixSchema
          .getFields()
          .map((field: any) =>
            field.name === "warning"
              ? { ...field, options: warningOptions }
              : field
          ),
      });
      setEditSchema(newEditSchema);
    }
  }, [warnings]);

  // Filter options
  const filterOptions = [
    {
      key: "machine",
      label: "Machine",
      type: "select" as const,
      placeholder: "Filter by machine",
      options:
        machinesArray?.map((machine) => ({
          value: machine.id,
          label: machine.machine_name,
        })) || [],
    },
    {
      key: "date",
      label: "Created Date",
      type: "date" as const,
      placeholder: "Filter by date",
    },
  ];

  // Table columns
  const columns: Column<WarningFix>[] = [
    {
      key: "warning",
      header: "Machine",
      sortable: true,
      render: (value) => {
        const warning = warnings?.find((w) => w.id === value);
        const machine = warning
          ? machinesArray?.find((m) => String(m.id) === String(warning.machine))
          : null;
        return machine ? (
          <div className="max-w-xs">
            <p className="text-sm font-medium">{machine.machine_name}</p>
          </div>
        ) : (
          <span className="text-muted-foreground">Unknown Machine</span>
        );
      },
    },
    {
      key: "warning",
      header: "Warning",
      render: (value) => {
        const warning = warnings?.find((w) => w.id === value);
        return warning ? (
          <div className="max-w-xs">
            <p className="text-sm font-medium truncate">
              {warning.warning_description}
            </p>
          </div>
        ) : (
          <span className="text-muted-foreground">Unknown Warning</span>
        );
      },
    },
    {
      key: "fix_warning_description",
      header: "Fix Description",
      render: (value) => (
        <div className="max-w-md">
          <p className="text-sm line-clamp-2">{value}</p>
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Created At",
      sortable: true,
      render: (value) => (
        <span className="text-sm text-muted-foreground">
          {new Date(value).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
  ];

  // Filtered data
  const filteredData =
    warningFixes?.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        item.fix_warning_description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const warning = warnings?.find((w) => w.id === item.warning);
      const matchesMachineFilter =
        !filters.machine || String(warning?.machine) === String(filters.machine);

      const matchesDateFilter =
        !filters.date ||
        new Date(item.created_at).toDateString() ===
          new Date(filters.date).toDateString();

      return matchesSearch && matchesMachineFilter && matchesDateFilter;
    }) || [];

  // Handler functions
  const handleAdd = (data: any) => {
    dispatch(createWarningFix(data)).then((result) => {
      if (createWarningFix.fulfilled.match(result)) {
        dispatch(resolveWarning(data.warning));
      }
    });
    setAddDialogOpen(false);
  };

  const handleEdit = (data: any) => {
    if (selectedWarningFix) {
      dispatch(
        updateWarningFix({ id: selectedWarningFix.id, warningFixData: data })
      ).then((result) => {
        if (updateWarningFix.fulfilled.match(result)) {
          // Also resolve the warning
          dispatch(resolveWarning(data.warning));
        }
      });
      setEditDialogOpen(false);
      setSelectedWarningFix(null);
    }
  };

  const handleDelete = () => {
    if (selectedWarningFix) {
      dispatch(deleteWarningFix(selectedWarningFix.id));
      setDeleteDialogOpen(false);
      setSelectedWarningFix(null);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ machine: "", date: "" });
    setSearchTerm("");
  };

  const openEditDialog = (warningFix: WarningFix) => {
    setSelectedWarningFix(warningFix);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (warningFix: WarningFix) => {
    setSelectedWarningFix(warningFix);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Warning Resolved"
        description="Manage resolved warnings and their fixes"
      >
        <Button onClick={() => setAddDialogOpen(true)} disabled={isCreating}>
          {isCreating ? (
            <div className="flex items-center gap-2">
              <Spinner size="sm" />
              <span>Adding...</span>
            </div>
          ) : (
            <>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Warning Fix
            </>
          )}
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
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        searchKey="fix_warning_description"
        searchPlaceholder="Search by fix description..."
        onSearchChange={setSearchTerm}
        searchValue={searchTerm}
        defaultFiltersVisible={false}
        showToggleButton={true}
      />

      {/* Data Table */}
      <DataTable<WarningFix>
        data={filteredData}
        columns={columns}
        loading={isLoading}
        onEdit={openEditDialog}
        emptyMessage="No warning fixes found"
        pagination={true}
      />

      {/* Add Dialog */}
      <AddDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        title="Add Warning Fix"
        description="Create a new warning fix record"
        schema={addSchema}
        onSubmit={handleAdd}
        loading={isCreating}
        error={error}
      />

      {/* Edit Dialog */}
      <EditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        title="Edit Warning Fix"
        description="Update the warning fix details"
        schema={editSchema}
        defaultValues={selectedWarningFix || {}}
        onSubmit={handleEdit}
        loading={isUpdating}
        error={error}
      />

      {/* Delete Dialog */}
      {/* <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Warning Fix"
        description="Are you sure you want to delete this warning fix? This action cannot be undone."
        itemName={selectedWarningFix?.fix_warning_description}
        onConfirm={handleDelete}
        loading={isDeleting}
      /> */}
    </div>
  );
};

export default WarningResolvedPageComponent;
