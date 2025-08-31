import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { fetchTodayDialysis, TodayDialysisSession } from '../../../store/slices/dialysisSlice';
import { PageHeader } from '../../../components/common/PageHeader';
import { FilterBar, FilterOption } from '../../../components/common/FilterBar';
import { DataTable, Column } from '../../../components/common/DataTable';
import { Spinner } from '../../../components/ui/spinner';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';

import { RefreshCw, Calendar, Users, Clock } from 'lucide-react';

const TodayDialysis = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { todayDialysis, isLoading, error } = useSelector((state: RootState) => state.dialysis);
  
  const [selectedShift, setSelectedShift] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchTodayDialysis());
  }, [dispatch]);

  // Get all sessions from all shifts
  const allSessions = useMemo(() => {
    if (!todayDialysis?.sessions_by_shift) return [];
    
    const sessions: (TodayDialysisSession & { shift_name: string })[] = [];
    Object.entries(todayDialysis.sessions_by_shift).forEach(([shiftName, shiftSessions]) => {
      shiftSessions.forEach(session => {
        sessions.push({
          ...session,
          shift_name: shiftName // Add shift name to each session for filtering
        });
      });
    });
    return sessions;
  }, [todayDialysis]);

  // Filter sessions based on selected shift and search term
  const filteredSessions = useMemo(() => {
    let filtered = allSessions;

    // Filter by shift
    if (selectedShift !== 'all') {
      filtered = filtered.filter(session => 
        todayDialysis?.sessions_by_shift[selectedShift]?.some(s => s.dialysis_id === session.dialysis_id)
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(session =>
        session.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.patient_nic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.bed_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.ward_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.machine_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [allSessions, selectedShift, searchTerm, todayDialysis]);

  // Get available shifts for filter
  const availableShifts = useMemo(() => {
    if (!todayDialysis?.sessions_by_shift) return [];
    return Object.keys(todayDialysis.sessions_by_shift);
  }, [todayDialysis]);

  // Filter options for FilterBar
  const filterOptions: FilterOption[] = [
    {
      key: 'shift',
      label: 'Shift',
      type: 'select',
      placeholder: 'Select shift',
      options: [
        { value: 'all', label: 'All Shifts' },
        ...availableShifts.map(shift => ({ value: shift, label: shift }))
      ]
    }
  ];

  // Filter values
  const filterValues = {
    shift: selectedShift
  };

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    if (key === 'shift') {
      setSelectedShift(value);
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedShift('all');
    setSearchTerm('');
  };

  // Refresh data
  const handleRefresh = () => {
    dispatch(fetchTodayDialysis());
  };

  // Table columns
  const columns: Column<TodayDialysisSession & { shift_name?: string }>[] = [
    {
      key: 'patient_name' as keyof (TodayDialysisSession & { shift_name?: string }),
      header: 'Patient Name',
      sortable: true,
      render: (value, row) => (
        <div className="font-medium">{value}</div>
      )
    },
    {
      key: 'patient_nic' as keyof (TodayDialysisSession & { shift_name?: string }),
      header: 'NIC',
      sortable: true,
      render: (value) => (
        <div className="text-sm text-muted-foreground">{value}</div>
      )
    },
    {
      key: 'bed_name' as keyof (TodayDialysisSession & { shift_name?: string }),
      header: 'Bed',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Badge variant="outline">{value}</Badge>
          <span className="text-sm text-muted-foreground">({row.ward_name})</span>
        </div>
      )
    },
    {
      key: 'machine_name' as keyof (TodayDialysisSession & { shift_name?: string }),
      header: 'Machine',
      sortable: true,
      render: (value) => (
        <Badge variant="secondary">{value}</Badge>
      )
    },
    {
      key: 'start_time' as keyof (TodayDialysisSession & { shift_name?: string }),
      header: 'Start Time',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm">{value}</span>
        </div>
      )
    },
    {
      key: 'end_time' as keyof (TodayDialysisSession & { shift_name?: string }),
      header: 'End Time',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm">{value}</span>
        </div>
      )
    },
    {
      key: 'blood_pressure' as keyof (TodayDialysisSession & { shift_name?: string }),
      header: 'Blood Pressure',
      sortable: true,
      render: (value) => (
        <div className="text-sm">{value || '-'}</div>
      )
    },
    {
      key: 'weight' as keyof (TodayDialysisSession & { shift_name?: string }),
      header: 'Weight',
      sortable: true,
      render: (value) => (
        <div className="text-sm">{value || '-'}</div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Today's Dialysis Sessions"
        description={`Managing dialysis sessions for ${todayDialysis?.date || 'today'}`}
      >
        <Button
          onClick={handleRefresh}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          {isLoading ? (
            <Spinner size="sm" className="mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </PageHeader>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      {todayDialysis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayDialysis.total_sessions}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Shifts</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availableShifts.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Date</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayDialysis.date}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <FilterBar
        filters={filterOptions}
        values={filterValues}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        searchKey="patient_name"
        searchPlaceholder="Search patients, NIC, bed, ward, or machine..."
        onSearchChange={setSearchTerm}
        searchValue={searchTerm}
      />

      {/* Data Table */}
      <DataTable
        data={filteredSessions}
        columns={columns}
        loading={isLoading}
        emptyMessage="No dialysis sessions found for today"
        pagination={true}
        pageSize={10}
      />
    </div>
  );
};

export default TodayDialysis;