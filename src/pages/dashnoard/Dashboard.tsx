import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Building2, 
  Users, 
  BarChart3, 
  Activity, 
  AlertTriangle, 
  Calendar,
  ArrowRight
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-4 sm:gap-6 text-primary">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold ">
            Main Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Overview of all system modules and quick access to dashboards
          </p>
        </div>
        <Badge variant="outline" className=" text-primary text-sm w-fit">
          <Activity className="h-4 w-4 mr-1" />
          System Overview
        </Badge>
      </div>

      {/* Dashboard Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Dashboard Card */}
        <Card className="group border border-primary/30 hover:shadow-lg transition-shadow shadow-primary/10 bg-card/80">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-primary/10 p-2"><Home className="h-6 w-6 text-primary" /></span>
              <CardTitle className="text-lg font-semibold">Main Dashboard</CardTitle>
            </div>
            <CardDescription>System overview and administration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="block text-sm text-muted-foreground">Users</span>
                  <span className="block text-sm font-medium">Manage all users</span>
                </div>
                <Link
                  to="/users"
                  className="mt-2 sm:mt-0 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
                >
                  View Users <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dialysis Center Card */}
        <Card className="group border border-primary/30 hover:shadow-lg transition-shadow shadow-primary/10 bg-card/80">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-primary/10 p-2"><Building2 className="h-6 w-6 text-primary" /></span>
              <CardTitle className="text-lg font-semibold">Dialysis Center</CardTitle>
            </div>
            <CardDescription>Patient care and machine management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="block text-sm text-muted-foreground">Patients</span>
                  <span className="block text-sm font-medium">Active care</span>
                </div>
                <Link
                  to="/dialysis-center"
                  className="mt-2 sm:mt-0 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
                >
                  View Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Office Management Card */}
        <Card className="group border border-primary/30 hover:shadow-lg transition-shadow shadow-primary/10 bg-card/80">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-primary/10 p-2"><Users className="h-6 w-6 text-primary" /></span>
              <CardTitle className="text-lg font-semibold">Office Management</CardTitle>
            </div>
            <CardDescription>Staff and administrative operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row flex-wrap sm:items-center sm:justify-between">
                <div>
                  <span className="block text-sm text-muted-foreground">Staff</span>
                  <span className="block text-sm font-medium">Management tools</span>
                </div>
                <Link
                  to="/office-management"
                  className="mt-2 sm:mt-0 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
                >
                  View Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
