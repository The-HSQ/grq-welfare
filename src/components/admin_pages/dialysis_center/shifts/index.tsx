import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../store';
import { 
  fetchShifts, 
  createShift, 
  updateShift, 
  deleteShift, 
  setCurrentShift,
  clearError 
} from '../../../../store/slices/dialysisSlice';
import { DataTable } from '../../../common/DataTable';
import type { Column } from '../../../common/DataTable';
import { PageHeader } from '../../../common/PageHeader';
import { FilterBar } from '../../../common/FilterBar';
import { ResponsiveAddDialog } from '@/components/common';
import { ResponsiveEditDialog } from '@/components/common';
import { ResponsiveDeleteDialog } from '@/components/common';
import { Button } from '../../../ui/button';
import { Plus } from 'lucide-react';
import { shiftFormFields } from './schemas';
import type { Shift, CreateShiftData, UpdateShiftData } from './schemas';
import toast from 'react-hot-toast';
import { FormSchema } from '../../../common/FormSchema';

const ShiftsPageComponent = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { shifts, isLoadingShifts, isCreating, isUpdating, isDeleting, error, currentShift } = useSelector(
    (state: RootState) => state.dialysis
  );

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  useEffect(() => {
    dispatch(fetchShifts());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleAdd = (data: CreateShiftData) => {
    dispatch(createShift(data)).then((result) => {
      if (createShift.fulfilled.match(result)) {
        toast.success('Shift created successfully');
        setIsAddDialogOpen(false);
      }
    });
  };

  const handleEdit = (data: UpdateShiftData) => {
    if (selectedShift) {
      dispatch(updateShift({ id: selectedShift.id, shiftData: data })).then((result) => {
        if (updateShift.fulfilled.match(result)) {
          toast.success('Shift updated successfully');
          setIsEditDialogOpen(false);
          setSelectedShift(null);
        }
      });
    }
  };

  const handleDelete = () => {
    if (selectedShift) {
      dispatch(deleteShift(selectedShift.id)).then((result) => {
        if (deleteShift.fulfilled.match(result)) {
          toast.success('Shift deleted successfully');
          setIsDeleteDialogOpen(false);
          setSelectedShift(null);
        }
      });
    }
  };

  const handleEditClick = (shift: Shift) => {
    setSelectedShift(shift);
    dispatch(setCurrentShift(shift));
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (shift: Shift) => {
    setSelectedShift(shift);
    setIsDeleteDialogOpen(true);
  };

  const columns: Column<Shift>[] = [
    {
      key: 'shift_no',
      header: 'SHIFT NUMBER',
      sortable: true,
    },
    {
      key: 'start_time',
      header: 'START TIME',
      sortable: true,
      render: (value) => {
        const time = new Date(`2000-01-01T${value}`);
        return time.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
      },
    },
    {
      key: 'end_time',
      header: 'END TIME',
      sortable: true,
      render: (value) => {
        const time = new Date(`2000-01-01T${value}`);
        return time.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
      },
    },
    {
      key: 'created_at',
      header: 'CREATED AT',
      sortable: true,
      render: (value) => {
        return new Date(value).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      },
    },
  ];

  const shiftSchema = new FormSchema({
    fields: shiftFormFields,
    layout: 'single',
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shifts Management"
        description="Manage dialysis center shifts and schedules"
      >
        <Button onClick={() => setIsAddDialogOpen(true)} disabled={isCreating}>
          <Plus className="h-4 w-4 mr-2" />
          Add Shift
        </Button>
      </PageHeader>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <FilterBar
        filters={[]}
        values={{}}
        onFilterChange={() => {}}
        searchKey="shift_no"
        searchPlaceholder="Search shifts..."
        onSearchChange={() => {}}
        searchValue=""
        defaultFiltersVisible={false}
        showToggleButton={true}
      />

      <DataTable
        data={shifts || []}
        columns={columns}
        loading={isLoadingShifts}
        emptyMessage="No shifts found"
        pagination={true}
        pageSize={10}
        onEdit={handleEditClick}
      />

      <ResponsiveAddDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        title="Add New Shift"
        schema={shiftSchema}
        onSubmit={handleAdd}
        loading={isCreating}
      />

      <ResponsiveEditDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setSelectedShift(null);
            dispatch(setCurrentShift(null));
          }
        }}
        title="Edit Shift"
        schema={shiftSchema}
        defaultValues={currentShift || {}}
        onSubmit={handleEdit}
        loading={isUpdating}
      />

      {/* <ResponsiveDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setSelectedShift(null);
          }
        }}
        title="Delete Shift"
        description={`Are you sure you want to delete the shift "${selectedShift?.shift_no}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        loading={isDeleting}
      /> */}
    </div>
  );
};

export default ShiftsPageComponent;