import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchUpcomingPatients, UpcomingPatient } from '@/store/slices/dialysisSlice';
import { PageHeader } from '@/components/common/PageHeader';
import { FilterBar, FilterOption } from '@/components/common/FilterBar';
import { DataTable, Column } from '@/components/common/DataTable';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Calendar, Users, Clock } from 'lucide-react';

// Simple date formatting function
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  });
};

const UpcomingPatientsDialysis = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { upcomingPatients, isLoading, error } = useSelector((state: RootState) => state.dialysis);
  
  const [filters, setFilters] = useState<Record<string, any>>({
    zakat_eligible: '',
    dialysis_per_week: '',
    days_until_dialysis: '',
  });
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchUpcomingPatients());
  }, [dispatch]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      zakat_eligible: '',
      dialysis_per_week: '',
      days_until_dialysis: '',
    });
    setSearchTerm('');
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const filterOptions: FilterOption[] = [
    {
      key: 'zakat_eligible',
      label: 'Zakat Eligible',
      type: 'select',
      placeholder: 'Select eligibility',
      options: [
        { value: '', label: 'All' },
        { value: 'true', label: 'Eligible' },
        { value: 'false', label: 'Not Eligible' },
      ]
    },
    {
      key: 'dialysis_per_week',
      label: 'Dialysis per Week',
      type: 'select',
      placeholder: 'Select frequency',
      options: [
        { value: '', label: 'All' },
        { value: '1', label: '1 time' },
        { value: '2', label: '2 times' },
        { value: '3', label: '3 times' },
        { value: '4', label: '4 times' },
        { value: '5', label: '5 times' },
        { value: '6', label: '6 times' },
        { value: '7', label: '7 times' },
      ]
    },
    {
      key: 'days_until_dialysis',
      label: 'Days Until Dialysis',
      type: 'select',
      placeholder: 'Select days',
      options: [
        { value: '', label: 'All' },
        { value: '0', label: 'Today' },
        { value: '1', label: 'Tomorrow' },
        { value: '2', label: 'In 2 days' },
        { value: '3', label: 'In 3 days' },
        { value: '4', label: 'In 4 days' },
        { value: '5', label: 'In 5 days' },
        { value: '6', label: 'In 6 days' },
        { value: '7', label: 'In 7 days' },
      ]
    }
  ];

  const filteredPatients = upcomingPatients?.upcoming_patients?.filter(patient => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!patient.name.toLowerCase().includes(searchLower) &&
          !patient.nic.toLowerCase().includes(searchLower) &&
          !patient.phone.toLowerCase().includes(searchLower) &&
          !patient.address.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Zakat eligible filter
    if (filters.zakat_eligible && filters.zakat_eligible !== '') {
      if (patient.zakat_eligible.toString() !== filters.zakat_eligible) {
        return false;
      }
    }

    // Dialysis per week filter
    if (filters.dialysis_per_week && filters.dialysis_per_week !== '') {
      if (patient.dialysis_per_week.toString() !== filters.dialysis_per_week) {
        return false;
      }
    }

    // Days until dialysis filter
    if (filters.days_until_dialysis && filters.days_until_dialysis !== '') {
      if (patient.days_until_dialysis.toString() !== filters.days_until_dialysis) {
        return false;
      }
    }

    return true;
  }) || [];

  const columns: Column<UpcomingPatient>[] = [
    {
      key: 'name',
      header: 'Patient Name',
      sortable: true,
      render: (value, row) => (
        <div className="font-medium">{value}</div>
      )
    },
    {
      key: 'nic',
      header: 'NIC',
      sortable: true,
    },
    {
      key: 'phone',
      header: 'Phone',
      sortable: true,
    },
    {
      key: 'address',
      header: 'Address',
      sortable: true,
      render: (value) => (
        <div className="max-w-[200px] truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'dialysis_per_week',
      header: 'Dialysis/Week',
      sortable: true,
      render: (value) => (
        <Badge variant="secondary" className={value > 1 ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'}>
          {value} time{value > 1 ? 's' : ''}
        </Badge>
      )
    },
    {
      key: 'next_dialysis_date',
      header: 'Next Dialysis',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{formatDate(value)}</span>
        </div>
      )
    },
    {
      key: 'days_until_dialysis',
      header: 'Days Until',
      sortable: true,
      render: (value) => {
        let variant: "default" | "secondary" | "destructive" | "outline" = "default";
        if (value === 0) variant = "destructive";
        else if (value <= 2) variant = "secondary";
        
        return (
          <Badge variant={variant} className={variant === 'destructive' ? 'bg-red-500 text-white' : variant === 'secondary' ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'}>
            {value === 0 ? 'Today' : value === 1 ? 'Tomorrow' : `In ${value} days`}
          </Badge>
        );
      }
    },
    {
      key: 'zakat_eligible',
      header: 'Zakat Eligible',
      sortable: true,
      render: (value) => (
        <Badge variant={value ? "secondary" : "destructive"} className={value ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
          {value ? 'Eligible' : 'Not Eligible'}
        </Badge>
      )
    }
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Upcoming Patients Dialysis"
          description="View and manage upcoming dialysis patients"
        />
        <div className="bg-destructive/15 border border-destructive/25 text-destructive px-4 py-3 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Upcoming Patients Dialysis"
        description="View and manage upcoming dialysis patients"
      >
        <div className="flex items-center gap-4">
          {upcomingPatients && (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{upcomingPatients.total_patients} Total Patients</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{upcomingPatients.upcoming_patients_count} Upcoming</span>
              </div>
            </>
          )}
          {isLoading && <Spinner size="sm" />}
        </div>
      </PageHeader>

      <FilterBar
        filters={filterOptions}
        values={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        searchKey="name"
        searchPlaceholder="Search patients..."
        onSearchChange={handleSearchChange}
        searchValue={searchTerm}
      />

      <DataTable
        data={filteredPatients}
        columns={columns}
        loading={isLoading}
        emptyMessage="No upcoming patients found"
        pagination={true}
        pageSize={10}
      />
    </div>
  );
};

export default UpcomingPatientsDialysis;