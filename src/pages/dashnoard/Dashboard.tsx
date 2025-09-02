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
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Main Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Overview of all system modules and quick access to dashboards
          </p>
        </div>
        <Badge variant="outline" className="text-sm w-fit">
          <Activity className="h-4 w-4 mr-1" />
          System Overview
        </Badge>
      </div>

      {/* Dashboard Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Dashboard Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Home className="h-5 w-5 text-blue-600" />
              <span>Main Dashboard</span>
            </CardTitle>
            <CardDescription>
              System overview and administration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Users</span>
                <span className="text-sm font-medium">Manage all users</span>
              </div>
              <Link 
                to="/users" 
                className="flex items-center justify-between text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                <span>View Users</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Dialysis Center Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-green-600" />
              <span>Dialysis Center</span>
            </CardTitle>
            <CardDescription>
              Patient care and machine management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Operational
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Patients</span>
                <span className="text-sm font-medium">Active care</span>
              </div>
              <Link 
                to="/dialysis-center" 
                className="flex items-center justify-between text-sm text-green-600 hover:text-green-800 transition-colors"
              >
                <span>View Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Office Management Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <span>Office Management</span>
            </CardTitle>
            <CardDescription>
              Staff and administrative operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  Available
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Staff</span>
                <span className="text-sm font-medium">Management tools</span>
              </div>
              <Link 
                to="/office-management" 
                className="flex items-center justify-between text-sm text-purple-600 hover:text-purple-800 transition-colors"
              >
                <span>View Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
