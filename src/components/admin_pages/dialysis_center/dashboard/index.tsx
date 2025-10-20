import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../../store";
import { fetchDashboardStats } from "../../../../store/slices/dialysisSlice";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
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
  ArrowBigDown,
  ArrowBigDownDash,
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
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

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-1">
            Dialysis Center Dashboard
          </h1>
          <p className="text-muted-foreground text-base">
            Real-time overview of center operations and patient care
          </p>
        </div>
        <Badge
          variant="outline"
          className="text-sm w-fit text-primary flex items-center gap-1"
        >
          <Activity className="h-4 w-4" />
          Live Data
        </Badge>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
        {/* Total Dialysis */}
        <Card className="bg-card border border-primary/30 hover:shadow-lg shadow-primary/10 rounded-xl flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center gap-2 pb-0">
            <span className="bg-primary/10 rounded-lg p-2">
              <Calendar className="h-5 w-5 text-primary" />
            </span>
            <CardTitle className="text-base font-semibold text-foreground">
              Total Dialysis
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-row items-end justify-between pt-2">
            <div>
              <div className="text-2xl font-bold text-primary">
                {total_dialysis}
              </div>
              <div className="text-xs text-muted-foreground">All dialysis</div>
            </div>
            <Link to="/dialysis-center/dialysis">
              <Button className="bg-primary text-primary-foreground font-semibold">
                <ArrowBigDownDash className="h-4 w-4" />
                View All
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Today's Dialysis */}
        <Card className="bg-card border border-primary/30 hover:shadow-lg shadow-primary/10 rounded-xl flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center gap-2 pb-0">
            <span className="bg-primary/10 rounded-lg p-2">
              <Calendar className="h-5 w-5 text-primary" />
            </span>
            <CardTitle className="text-base font-semibold text-foreground">
              Today's Dialysis
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-row items-end justify-between pt-2">
            <div>
              <div className="text-2xl font-bold text-primary">
                {todays_dialysis}
              </div>
              <div className="text-xs text-muted-foreground">
                Scheduled sessions
              </div>
            </div>
            <Link to="/dialysis-center/today-dialysis">
              <Button className="bg-primary text-primary-foreground font-semibold">
                <ArrowBigDownDash className="h-4 w-4" />
                View All
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Upcoming Dialysis */}
        <Card className="bg-card border border-primary/30 hover:shadow-lg shadow-primary/10 rounded-xl flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center gap-2 pb-0">
            <span className="bg-primary/10 rounded-lg p-2">
              <Clock className="h-5 w-5 text-primary" />
            </span>
            <CardTitle className="text-base font-semibold text-foreground">
              Upcoming Dialysis
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-row items-end justify-between pt-2">
            <div>
              <div className="text-2xl font-bold text-primary">
                {upcoming_dialysis}
              </div>
              <div className="text-xs text-muted-foreground">
                Future sessions
              </div>
            </div>
            <Link to="/dialysis-center/upcoming-patients-dialysis">
              <Button className="bg-primary text-primary-foreground font-semibold">
                <ArrowBigDownDash className="h-4 w-4" />
                View All
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Total Patients */}
        <Card className="bg-card border border-primary/30 hover:shadow-lg shadow-primary/10 rounded-xl flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center gap-2 pb-0">
            <span className="bg-primary/10 rounded-lg p-2">
              <Users className="h-5 w-5 text-primary" />
            </span>
            <CardTitle className="text-base font-semibold text-foreground">
              Total Patients
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-row items-end justify-between pt-2">
            <div>
              <div className="text-2xl font-bold text-primary">
                {total_patients}
              </div>
              <div className="text-xs text-muted-foreground">
                Registered patients
              </div>
            </div>
            <Link to="/dialysis-center/patients">
              <Button className="bg-primary text-primary-foreground font-semibold">
                <ArrowBigDownDash className="h-4 w-4" />
                View All
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Total Warnings */}
        <Card className="bg-card border border-primary/30 hover:shadow-lg shadow-primary/10 rounded-xl flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center gap-2 pb-0">
            <span className="bg-primary/10 rounded-lg p-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
            </span>
            <CardTitle className="text-base font-semibold text-foreground">
              Total Warnings
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-row items-end justify-between pt-2">
            <div>
              <div className="text-2xl font-bold text-primary">
                {total_warnings}
              </div>
              <div className="text-xs text-muted-foreground">All warnings</div>
            </div>
            <Link to="/dialysis-center/warning">
              <Button className="bg-primary text-primary-foreground font-semibold">
                <ArrowBigDownDash className="h-4 w-4" />
                View All
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Active Warnings */}
        <Card className="bg-card border border-primary/30 hover:shadow-lg shadow-primary/10 rounded-xl flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center gap-2 pb-0">
            <span className="bg-destructive/10 rounded-lg p-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </span>
            <CardTitle className="text-base font-semibold text-foreground">
              Active Warnings
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-row items-end justify-between pt-2">
            <div>
              <div className="text-2xl font-bold text-destructive">
                {active_warnings}
              </div>
              <div className="text-xs text-muted-foreground">
                Require attention
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Items */}
        <Card className="bg-card border border-primary/30 hover:shadow-lg shadow-primary/10 rounded-xl flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center gap-2 pb-0">
            <span className="bg-primary/10 rounded-lg p-2">
              <Package className="h-5 w-5 text-primary" />
            </span>
            <CardTitle className="text-base font-semibold text-foreground">
              Total Inventory Items
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-row items-end justify-between pt-2">
            <div>
              <div className="text-2xl font-bold text-primary">
                {total_products}
              </div>
              <div className="text-xs text-muted-foreground">
                Available items
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Machine Types */}
        <Card className="bg-card border border-primary/30 hover:shadow-lg shadow-primary/10 rounded-xl flex flex-col">
          <CardHeader className="flex flex-row items-center gap-2 pb-0">
            <span className="bg-primary/10 rounded-lg p-2">
              <Package className="h-5 w-5 text-primary" />
            </span>
            <CardTitle className="text-sm sm:text-base font-semibold text-foreground">
              Machine Types
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm">Dialysis Machines</span>
              <Badge variant="secondary" className="bg-primary/10 border-primary/20 text-primary text-xs">
                {dialysis_machines}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm">RO Machines</span>
              <Badge variant="secondary" className="bg-primary/10 border-primary/20 text-primary text-xs">
                {ro_machines}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Warnings Overview */}
        <Card className="bg-card border border-primary/30 hover:shadow-lg shadow-primary/10 rounded-xl flex flex-col">
          <CardHeader className="flex flex-row items-center gap-2 pb-0">
            <span className="bg-primary/10 rounded-lg p-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
            </span>
            <CardTitle className="text-sm sm:text-base">
              Warnings Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm">Total Warnings</span>
              <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary text-xs">
                {total_warnings}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm">Active Warnings</span>
              <Badge variant="destructive" className="bg-primary/10 border-primary/20 text-primary text-xs">
                {active_warnings}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm">Resolved Warnings</span>
              <Badge
                variant="default"
                className="bg-primary/10 border-primary/20 text-primary text-xs"
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
