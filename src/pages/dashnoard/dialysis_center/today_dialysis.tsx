import { useEffect, useState, useMemo } from "react";
import api from "../../../lib/axios";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import {
  fetchTodayDialysis,
  fetchShifts,
  TodayDialysisSession,
} from "../../../store/slices/dialysisSlice";
import { PageHeader } from "../../../components/common/PageHeader";
import { FilterBar, FilterOption } from "../../../components/common/FilterBar";
import { DataTable, Column } from "../../../components/common/DataTable";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";

import { Calendar, Clock } from "lucide-react";
import { getMediaUrl } from "@/lib/mediaUtils";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import LazyImage from "../../../components/common/LazyImage";

const TodayDialysis = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { todayDialysis, shifts, isLoading, error } = useSelector(
    (state: RootState) => state.dialysis
  );
  const navigate = useNavigate();

  const [selectedShift, setSelectedShift] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWard, setSelectedWard] = useState<string>("all");

  // Fetch data on component mount and set up interval
  useEffect(() => {
    // Initial fetch
    dispatch(fetchTodayDialysis());
    dispatch(fetchShifts());

    // Set up interval to fetch every 1 minute
    const interval = setInterval(() => {
      dispatch(fetchTodayDialysis());
    }, 100000); // 1 Minute

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [dispatch]);

  // Helper function to check if a time falls within a shift's time range
  const isTimeInShiftRange = (
    timeStr: string,
    shiftStartTime: string,
    shiftEndTime: string
  ) => {
    if (!timeStr || !shiftStartTime || !shiftEndTime) return false;

    // Parse time strings (assuming format like "14:30:00" or "14:30")
    const parseTime = (time: string) => {
      const parts = time.split(":");
      return parseInt(parts[0]) * 60 + parseInt(parts[1] || "0"); // Convert to minutes
    };

    const sessionTime = parseTime(timeStr);
    const startTime = parseTime(shiftStartTime);
    const endTime = parseTime(shiftEndTime);

    // Handle overnight shifts (end time is next day)
    if (endTime <= startTime) {
      return sessionTime >= startTime || sessionTime <= endTime;
    }

    return sessionTime >= startTime && sessionTime <= endTime;
  };

  // Get all sessions from all shifts
  const allSessions = useMemo(() => {
    if (!todayDialysis?.sessions_by_shift) return [];

    const sessions: (TodayDialysisSession & { shift_name: string })[] = [];
    Object.entries(todayDialysis.sessions_by_shift).forEach(
      ([shiftName, shiftSessions]) => {
        shiftSessions.forEach((session) => {
          sessions.push({
            ...session,
            shift_name: shiftName, // Add shift name to each session for filtering
          });
        });
      }
    );
    return sessions;
  }, [todayDialysis]);

  // Filter sessions based on selected shift and search term
  const filteredSessions = useMemo(() => {
    let filtered = allSessions;

    // Filter by shift based on time range
    if (selectedShift !== "all" && shifts) {
      const selectedShiftData = shifts.find(
        (shift) => shift.id === selectedShift
      );
      if (
        selectedShiftData &&
        selectedShiftData.start_time &&
        selectedShiftData.end_time
      ) {
        filtered = filtered.filter((session) =>
          isTimeInShiftRange(
            session.start_time,
            selectedShiftData.start_time,
            selectedShiftData.end_time
          )
        );
      }
    }

    // Filter by ward
    if (selectedWard !== "all") {
      filtered = filtered.filter(
        (session) => session.ward_name === selectedWard
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (session) =>
          session.patient_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          session.patient_nic
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          session.bed_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          session.machine_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [
    allSessions,
    selectedShift,
    selectedWard,
    searchTerm,
    todayDialysis,
    shifts,
  ]);

  // Get available shifts for filter
  const availableShifts = useMemo(() => {
    if (!shifts) return [];
    return shifts.filter((shift) => shift.start_time && shift.end_time);
  }, [shifts]);

  // Get all wards for filter
  const [availableWards, setAvailableWards] = useState<string[]>([]);

  useEffect(() => {
    const fetchWards = async () => {
      try {
        const response = await api.get("/medical/wards/");
        const wardNames = response.data
          .map((ward: any) => ward.ward_name)
          .filter(Boolean);
        setAvailableWards(wardNames);
      } catch (error) {
        setAvailableWards([]);
      }
    };

    fetchWards();
  }, []);

  // Filter options for FilterBar
  const filterOptions: FilterOption[] = [
    {
      key: "shift",
      label: "Shift",
      type: "select",
      placeholder: "Select shift",
      options: [
        { value: "all", label: "All Shifts" },
        ...availableShifts.map((shift) => ({
          value: shift.id,
          label: `${shift.shift_no || "Shift"} (${shift.start_time} - ${
            shift.end_time
          })`,
        })),
      ],
    },
    {
      key: "ward",
      label: "Ward",
      type: "select",
      placeholder: "Select ward",
      options: [
        { value: "all", label: "All Wards" },
        ...availableWards.map((ward) => ({ value: ward, label: ward })),
      ],
    },
  ];

  // Filter values
  const filterValues = {
    shift: selectedShift,
    ward: selectedWard,
  };

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    if (key === "shift") {
      setSelectedShift(value);
    } else if (key === "ward") {
      setSelectedWard(value);
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedShift("all");
    setSelectedWard("all");
    setSearchTerm("");
  };

  // Handle view dialysis
  const handleViewDialysis = (session: TodayDialysisSession) => {
    navigate(`/dialysis-center/dialysis/${session.dialysis_id}`);
  };

  // Refresh data
  const handleRefresh = () => {
    dispatch(fetchTodayDialysis());
  };

  // Table columns
  const columns: Column<TodayDialysisSession & { shift_name?: string }>[] = [
    {
      key: "patient_image",
      header: "IMAGE",
      render: (value: string, patient: TodayDialysisSession) => {
        const image = getMediaUrl(patient.patient_image);
        
        return (
          <div className="flex w-full items-center">
            {patient.patient_image ? (
              <LazyImage
                src={image || ''}
                alt={patient.patient_name || 'Patient'}
                className="w-10 h-10 rounded-lg object-cover"
                fallback={
                  <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-xs font-medium">
                      {patient.patient_name
                        ? patient.patient_name.charAt(0).toUpperCase()
                        : "?"}
                    </span>
                  </div>
                }
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-xs font-medium">
                  {patient.patient_name
                    ? patient.patient_name.charAt(0).toUpperCase()
                    : "?"}
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "patient_name" as keyof (TodayDialysisSession & {
        shift_name?: string;
      }),
      header: "PATIENT NAME",
      sortable: true,
      render: (value, row) => <div className="font-medium">{value}</div>,
    },
    {
      key: "patient_nic" as keyof (TodayDialysisSession & {
        shift_name?: string;
      }),
      header: "NIC",
      sortable: true,
      render: (value) => (
        <div className="text-sm text-muted-foreground">{value}</div>
      ),
    },
    {
      key: "bed_name" as keyof (TodayDialysisSession & { shift_name?: string }),
      header: "BED",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Badge variant="outline">{value}</Badge>
          <span className="text-sm text-muted-foreground">
            ({row.ward_name})
          </span>
        </div>
      ),
    },
    {
      key: "machine_name" as keyof (TodayDialysisSession & {
        shift_name?: string;
      }),
      header: "MACHINE",
      sortable: true,
      render: (value) => <Badge variant="secondary">{value}</Badge>,
    },
    {
      key: "start_time" as keyof (TodayDialysisSession & {
        shift_name?: string;
      }),
      header: "START TIME",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm">{value}</span>
        </div>
      ),
    },
    {
      key: "end_time" as keyof (TodayDialysisSession & { shift_name?: string }),
      header: "END TIME",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm">{value}</span>
        </div>
      ),
    },
    {
      key: "blood_pressure" as keyof (TodayDialysisSession & {
        shift_name?: string;
      }),
      header: "BEFORE - AFTER DIALYSIS BP",
      sortable: true,
      render: (value, row) => <div className="text-sm">{value ? `${value} - ${row.last_blood_pressure}` : "-"}</div>,
    },
    {
      key: "weight" as keyof (TodayDialysisSession & { shift_name?: string }),
      header: "BEFORE - AFTER DIALYSIS WEIGHT",
      sortable: true,
      render: (value, row) => <div className="text-sm">{value ? `${value} - ${row.last_weight}` : "-"}</div>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Today's Dialysis Sessions"
        description={`Managing dialysis sessions for ${
          todayDialysis?.date || "today"
        }`}
      >
        <div className="flex flex-col xl:flex-row items-center gap-4">
          <Button onClick={() => navigate("/dialysis-center/dialysis")}>
            <Calendar className="h-4 w-4 mr-2" />
            Total Dialysis
          </Button>

          {/* Stats Cards */}
          {todayDialysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="px-4 py-2 w-[200px] gap-0">
                <CardHeader className="flex flex-row items-center justify-between p-0">
                  <CardTitle className="text-sm font-medium">
                    Total Sessions
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-0">
                  <div className="text-2xl font-bold">
                    {todayDialysis.total_sessions}
                  </div>
                </CardContent>
              </Card>

              <Card className="px-4 py-2 w-[200px] gap-0">
                <CardHeader className="flex flex-row items-center justify-between p-0">
                  <CardTitle className="text-sm font-medium">
                    Active Shifts
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-0">
                  <div className="text-2xl font-bold">
                    {availableShifts.length}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </PageHeader>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Filters */}
      <FilterBar
        filters={filterOptions}
        values={filterValues}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        searchKey="patient_name"
        searchPlaceholder="Search patients, NIC, bed, or machine..."
        onSearchChange={setSearchTerm}
        searchValue={searchTerm}
        showToggleButton={true}
        defaultFiltersVisible={false}
      />

      {/* Data Table */}
      <DataTable
        data={filteredSessions}
        columns={columns}
        loading={isLoading}
        emptyMessage="No dialysis sessions found for today"
        pagination={true}
        pageSize={15}
        onView={handleViewDialysis}
      />
    </div>
  );
};

export default TodayDialysis;
