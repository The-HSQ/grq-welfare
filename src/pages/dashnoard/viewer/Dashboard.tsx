import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, ArrowRight, Building2, Calendar } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const DashboardViewer = () => {
  return (
    <div className="flex flex-col gap-4 sm:gap-6 text-primary">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">
            Viewer Dashboard
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Read-only overview of system modules and patient activity
          </p>
        </div>
        <Badge variant="outline" className="text-primary text-sm w-fit">
          <Activity className="h-4 w-4 mr-1" />
          System Overview
        </Badge>
      </div>

      {/* Dashboard Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Doctor Appointments */}
        <Card className="group border border-primary/30 hover:shadow-lg transition-shadow shadow-primary/10 bg-card/80">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-primary/10 p-2">
                <Calendar className="h-6 w-6 text-primary" />
              </span>
              <CardTitle className="text-lg font-semibold">
                Doctor Appointments
              </CardTitle>
            </div>
            <CardDescription>
              View upcoming and past appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="block text-sm text-muted-foreground">
                  Appointments
                </span>
                <span className="block text-sm font-medium">
                  Read-only appointment details
                </span>
              </div>
              <Link
                to="/dialysis-center/doctor-appointment"
                className="mt-2 sm:mt-0 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold shadow-sm hover:bg-primary/90 transition-all"
              >
                View Appointments <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Patients */}
        <Card className="group border border-primary/30 hover:shadow-lg transition-shadow shadow-primary/10 bg-card/80">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-primary/10 p-2">
                <Calendar className="h-6 w-6 text-primary" />
              </span>
              <CardTitle className="text-lg font-semibold">Patients</CardTitle>
            </div>
            <CardDescription>
              View registered patients and basic information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="block text-sm text-muted-foreground">
                  Patient Records
                </span>
                <span className="block text-sm font-medium">
                  View patient details
                </span>
              </div>
              <Link
                to="/dialysis-center/patients"
                className="mt-2 sm:mt-0 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold shadow-sm hover:bg-primary/90 transition-all"
              >
                View Patients <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Dialysis */}
        <Card className="group border border-primary/30 hover:shadow-lg transition-shadow shadow-primary/10 bg-card/80">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-primary/10 p-2">
                <Calendar className="h-6 w-6 text-primary" />
              </span>
              <CardTitle className="text-lg font-semibold">
                Dialysis Sessions
              </CardTitle>
            </div>
            <CardDescription>Monitor dialysis session records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="block text-sm text-muted-foreground">
                  Dialysis Data
                </span>
                <span className="block text-sm font-medium">
                  View session history
                </span>
              </div>
              <Link
                to="/dialysis-center/dialysis"
                className="mt-2 sm:mt-0 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold shadow-sm hover:bg-primary/90 transition-all"
              >
                View Sessions <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Today Dialysis */}
        <Card className="group border border-primary/30 hover:shadow-lg transition-shadow shadow-primary/10 bg-card/80">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-primary/10 p-2">
                <Calendar className="h-6 w-6 text-primary" />
              </span>
              <CardTitle className="text-lg font-semibold">
                Today’s Dialysis
              </CardTitle>
            </div>
            <CardDescription>
              View today’s scheduled dialysis sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="block text-sm text-muted-foreground">
                  Today
                </span>
                <span className="block text-sm font-medium">
                  Ongoing & scheduled sessions
                </span>
              </div>
              <Link
                to="/dialysis-center/today-dialysis"
                className="mt-2 sm:mt-0 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold shadow-sm hover:bg-primary/90 transition-all"
              >
                View Today <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Dialysis */}
        <Card className="group border border-primary/30 hover:shadow-lg transition-shadow shadow-primary/10 bg-card/80">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-primary/10 p-2">
                <Building2 className="h-6 w-6 text-primary" />
              </span>
              <CardTitle className="text-lg font-semibold">
                Upcoming Dialysis
              </CardTitle>
            </div>
            <CardDescription>
              Preview upcoming dialysis schedules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="block text-sm text-muted-foreground">
                  Upcoming
                </span>
                <span className="block text-sm font-medium">
                  Future scheduled sessions
                </span>
              </div>
              <Link
                to="/dialysis-center/upcoming-patients-dialysis"
                className="mt-2 sm:mt-0 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold shadow-sm hover:bg-primary/90 transition-all"
              >
                View Schedule <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardViewer;
