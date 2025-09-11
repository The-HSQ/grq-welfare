import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../../store";
import { fetchDashboardStats } from "../../../../store/slices/dialysisSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Progress } from "../../../../components/ui/progress";
import { Skeleton } from "../../../../components/ui/skeleton";
import {
  Users,
  Activity,
  Bed,
  AlertTriangle,
  Package,
  Calendar,
  XCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const DialysisDashboardComponent = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { dashboardStats, isLoading, error } = useSelector(
    (state: RootState) => state.dialysis
  );

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
          {[...Array(12)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
                <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 sm:h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 sm:p-4 lg:p-6">
        <Card className="border-destructive">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center space-x-2 text-destructive">
              <XCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              <p className="text-sm sm:text-base">
                Error loading dashboard: {error}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardStats) {
    return (
      <div className="p-3 sm:p-4 lg:p-6">
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <p className="text-sm sm:text-base">No dashboard data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    total_patients,
    active_machines,
    working_machines,
    not_working_machines,
    warning_machines,
    available_beds,
    total_beds,
    total_wards,
    available_wards,
    total_warnings,
    active_warnings,
    resolved_warnings,
    total_products,
    dialysis_machines,
    ro_machines,
    todays_dialysis,
    upcoming_dialysis,
    total_dialysis,
  } = dashboardStats;

  const bedUtilization =
    total_beds > 0 ? ((total_beds - available_beds) / total_beds) * 100 : 0;
  const wardUtilization =
    total_wards > 0 ? ((total_wards - available_wards) / total_wards) * 100 : 0;
  const machineUtilization =
    working_machines + not_working_machines + warning_machines > 0
      ? (working_machines /
          (working_machines + not_working_machines + warning_machines)) *
        100
      : 0;

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Dialysis Center Dashboard
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Real-time overview of center operations and patient care
          </p>
        </div>
        <Badge variant="outline" className="text-sm w-fit">
          <Activity className="h-4 w-4 mr-1" />
          Live Data
        </Badge>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {/* Total Dialysis */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Total Dialysis
            </CardTitle>
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-row items-center justify-between">
            <div className="flex flex-col justify-between">
              <div className="text-xl sm:text-2xl font-bold">
                {total_dialysis}
              </div>
              <div className="text-xs text-muted-foreground">All dialysis</div>
            </div>
            <Link to="/dialysis-center/dialysis">
              <Button
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm"
              >
                View All
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Today's Dialysis */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Today's Dialysis
            </CardTitle>
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-row items-center justify-between">
            <div className="flex flex-col justify-between">
              <div className="text-xl sm:text-2xl font-bold">
                {todays_dialysis}
              </div>
              <div className="text-xs text-muted-foreground">
                Scheduled sessions
              </div>
            </div>
            <Link to="/dialysis-center/today-dialysis">
              <Button
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm"
              >
                View All
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Upcoming Dialysis */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Upcoming Dialysis
            </CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-row items-center justify-between">
            <div className="flex flex-col justify-between">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                {upcoming_dialysis}
              </div>
              <div className="text-xs text-muted-foreground">
                Future sessions
              </div>
            </div>
            <Link to="/dialysis-center/upcoming-patients-dialysis">
              <Button
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm"
              >
                View All
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Total Patients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Total Patients
            </CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-row items-center justify-between">
            <div className="flex flex-col justify-between">
              <div className="text-xl sm:text-2xl font-bold">
                {total_patients}
              </div>
              <p className="text-xs text-muted-foreground">
                Registered patients
              </p>
            </div>

            <Link to="/dialysis-center/patients">
              <Button
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm"
              >
                View All
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Total Warnings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Total Warnings
            </CardTitle>
            <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-row items-center justify-between">
            <div className="flex flex-col justify-between">
              <div className="text-xl sm:text-2xl font-bold">
                {total_warnings}
              </div>
              <p className="text-xs text-muted-foreground">All warnings</p>
            </div>

            <Link to="/dialysis-center/warning">
              <Button
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm"
              >
                View All
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Active Warnings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Active Warnings
            </CardTitle>
            <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-destructive">
              {active_warnings}
            </div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        {/* Total Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Total Inventory Items
            </CardTitle>
            <Package className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {total_products}
            </div>
            <p className="text-xs text-muted-foreground">Available items</p>
          </CardContent>
        </Card>
      </div>

      {/* Machine Status Section */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Machine Status</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Current status of dialysis machines
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium">
                    Working
                  </span>
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800 text-xs"
                  >
                    {working_machines}
                  </Badge>
                </div>
                <Progress value={machineUtilization} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium">
                    Warning
                  </span>
                  <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs">
                    {warning_machines}
                  </Badge>
                </div>
                <Progress
                  value={
                    warning_machines > 0
                      ? (warning_machines /
                          (working_machines + not_working_machines + warning_machines)) *
                        100
                      : 0
                  }
                  className="h-2 bg-orange-100"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium">
                    Not Working
                  </span>
                  <Badge variant="destructive" className="text-xs">
                    {not_working_machines}
                  </Badge>
                </div>
                <Progress
                  value={
                    not_working_machines > 0
                      ? (not_working_machines /
                          (working_machines + not_working_machines + warning_machines)) *
                        100
                      : 0
                  }
                  className="h-2 bg-red-100"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-blue-600">
                  {active_machines}
                </div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-orange-600">
                  {warning_machines}
                </div>
                <div className="text-xs text-muted-foreground">Warning</div>
              </div>
            </div>
          </CardContent>
        </Card>

        Bed & Ward Status
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bed className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Bed & Ward Status</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Availability of beds and wards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium">
                    Bed Utilization
                  </span>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    {available_beds}/{total_beds} available
                  </span>
                </div>
                <Progress value={bedUtilization} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium">
                    Ward Utilization
                  </span>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    {available_wards}/{total_wards} available
                  </span>
                </div>
                <Progress value={wardUtilization} className="h-2" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-green-600">
                  {available_beds}
                </div>
                <div className="text-xs text-muted-foreground">
                  Available Beds
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-blue-600">
                  {available_wards}
                </div>
                <div className="text-xs text-muted-foreground">
                  Available Wards
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Additional Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Machine Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Machine Types</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm">Dialysis Machines</span>
              <Badge variant="secondary" className="text-xs">
                {dialysis_machines}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm">RO Machines</span>
              <Badge variant="secondary" className="text-xs">
                {ro_machines}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Total Machines Summary */}
        {/* <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Total Machines</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm">Working</span>
              <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                {working_machines}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm">Warning</span>
              <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs">
                {warning_machines}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm">Not Working</span>
              <Badge variant="destructive" className="text-xs">
                {not_working_machines}
              </Badge>
            </div>
          </CardContent>
        </Card> */}

        {/* Warnings Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Warnings Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm">Total Warnings</span>
              <Badge variant="outline" className="text-xs">
                {total_warnings}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm">Active Warnings</span>
              <Badge variant="destructive" className="text-xs">
                {active_warnings}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm">Resolved Warnings</span>
              <Badge
                variant="default"
                className="bg-green-100 text-green-800 text-xs"
              >
                {resolved_warnings}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DialysisDashboardComponent;
