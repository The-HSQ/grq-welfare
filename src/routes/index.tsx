import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import DashboardLayout from '../components/dashboardLayout/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import Login from '../pages/Login';
import Dashboard from '../pages/dashnoard/Dashboard';
import Profile from '../pages/dashnoard/Profile';
import Settings from '../pages/dashnoard/Settings';
import NotFound from '../pages/NotFound';
import Users from '../pages/dashnoard/users/Users';
import { Patients } from '../pages/dashnoard/dialysis_center/patients/page';
import DialysisDashboard from '../pages/dashnoard/dialysis_center/dashboard/page';
import ItemsPage from '../pages/dashnoard/dialysis_center/items/page';
import ItemDetail from '../components/admin_pages/dialysis_center/items/ItemDetail';
import MachinePage from '../pages/dashnoard/dialysis_center/machines/page';
import WardsPage from '../pages/dashnoard/dialysis_center/wards/page';
import BedsPage from '../pages/dashnoard/dialysis_center/beds/page';
import ShiftsPage from '../pages/dashnoard/dialysis_center/shifts/page';
import WarningPage from '../pages/dashnoard/dialysis_center/warning/page';
import WarningResolvedPage from '../pages/dashnoard/dialysis_center/warning_resolved/page';
import { PatientDetail } from '../components/admin_pages/dialysis_center/patients/PatientDetail';
import DialysisPage from '../pages/dashnoard/dialysis_center/dialysis/page';
import DialysisDetail from '../components/admin_pages/dialysis_center/dialysis/DialysisDetail';
import TodayDialysis from '@/pages/dashnoard/dialysis_center/today_dialysis';
import UpcomingPatientsDialysis from '@/pages/dashnoard/dialysis_center/upcoming_patients_dialysis';

// Placeholder components for missing dashboards
const OfficeManagementDashboard = () => (
  <div className="flex flex-col gap-4 sm:gap-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
          Office Management Dashboard
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage office operations, staff, and administrative tasks
        </p>
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      <div className="p-6 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Staff Management</h3>
        <p className="text-muted-foreground">Manage office staff and schedules</p>
      </div>
      <div className="p-6 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Office Reports</h3>
        <p className="text-muted-foreground">Generate and view office reports</p>
      </div>
      <div className="p-6 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Document Management</h3>
        <p className="text-muted-foreground">Handle office documents and files</p>
      </div>
      <div className="p-6 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Communication</h3>
        <p className="text-muted-foreground">Internal communication tools</p>
      </div>
    </div>
  </div>
);

const StaffManagementDashboard = () => (
  <div className="flex flex-col gap-4 sm:gap-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
          Staff Management Dashboard
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage staff information, schedules, and performance
        </p>
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      <div className="p-6 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Staff Directory</h3>
        <p className="text-muted-foreground">View and manage staff profiles</p>
      </div>
      <div className="p-6 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Schedule Management</h3>
        <p className="text-muted-foreground">Manage staff schedules and shifts</p>
      </div>
      <div className="p-6 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Performance Tracking</h3>
        <p className="text-muted-foreground">Track staff performance metrics</p>
      </div>
      <div className="p-6 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Training & Development</h3>
        <p className="text-muted-foreground">Staff training and development programs</p>
      </div>
    </div>
  </div>
);

const OfficeReportsDashboard = () => (
  <div className="flex flex-col gap-4 sm:gap-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
          Office Reports Dashboard
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Generate and analyze office performance reports
        </p>
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      <div className="p-6 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Financial Reports</h3>
        <p className="text-muted-foreground">Revenue, expenses, and financial analysis</p>
      </div>
      <div className="p-6 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Operational Reports</h3>
        <p className="text-muted-foreground">Daily operations and efficiency metrics</p>
      </div>
      <div className="p-6 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Staff Reports</h3>
        <p className="text-muted-foreground">Staff performance and attendance reports</p>
      </div>
      <div className="p-6 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Analytics</h3>
        <p className="text-muted-foreground">Advanced analytics and insights</p>
      </div>
    </div>
  </div>
);

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      // Main dashboard - accessible to all authenticated users
      {
        index: true,
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      
      // Admin-specific routes
      {
        path: 'users',
        element: (
          <ProtectedRoute requiredRole="admin">
            <Users />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        ),
      },
      
      // Dialysis Center routes - accessible to admin, medical_admin, and accountant_medical
      {
        path: 'dialysis-center',
        element: (
          <ProtectedRoute requiredRole={['admin', 'medical_admin', 'accountant_medical']}>
            <DialysisDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dialysis-center/items',
        element: (
          <ProtectedRoute requiredRole={['admin', 'medical_admin']}>
            <ItemsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dialysis-center/items/:id',
        element: (
          <ProtectedRoute requiredRole={['admin', 'medical_admin']}>
            <ItemDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dialysis-center/machines',
        element: (
          <ProtectedRoute requiredRole={['admin', 'medical_admin']}>
            <MachinePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dialysis-center/warning',
        element: (
          <ProtectedRoute requiredRole={['admin', 'medical_admin', 'accountant_medical']}>
            <WarningPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dialysis-center/warning-resolved',
        element: (
          <ProtectedRoute requiredRole={['admin', 'medical_admin', 'accountant_medical']}>
            <WarningResolvedPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dialysis-center/wards',
        element: (
          <ProtectedRoute requiredRole={['admin', 'medical_admin']}>
            <WardsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dialysis-center/beds',
        element: (
          <ProtectedRoute requiredRole={['admin', 'medical_admin']}>
            <BedsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dialysis-center/shifts',
        element: (
          <ProtectedRoute requiredRole={['admin', 'medical_admin']}>
            <ShiftsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dialysis-center/patients',
        element: (
          <ProtectedRoute requiredRole={['admin', 'medical_admin', 'accountant_medical']}>
            <Patients />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dialysis-center/patients/:id',
        element: (
          <ProtectedRoute requiredRole={['admin', 'medical_admin', 'accountant_medical']}>
            <PatientDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dialysis-center/dialysis',
        element: (
          <ProtectedRoute requiredRole={['admin', 'medical_admin', 'accountant_medical']}>
            <DialysisPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dialysis-center/dialysis/:id',
        element: (
          <ProtectedRoute requiredRole={['admin', 'medical_admin', 'accountant_medical']}>
            <DialysisDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dialysis-center/today-dialysis',
        element: (
          <ProtectedRoute requiredRole={['admin', 'medical_admin', 'accountant_medical']}>
            <TodayDialysis />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dialysis-center/upcoming-patients-dialysis',
        element: (
          <ProtectedRoute requiredRole={['admin', 'medical_admin', 'accountant_medical']}>
            <UpcomingPatientsDialysis />
          </ProtectedRoute>
        ),
      },
      
      // Office Management routes - accessible to admin and office_admin
      {
        path: 'office-management',
        element: (
          <ProtectedRoute requiredRole={['admin', 'office_admin']}>
            <OfficeManagementDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'staff',
        element: (
          <ProtectedRoute requiredRole={['admin', 'office_admin']}>
            <StaffManagementDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'office-reports',
        element: (
          <ProtectedRoute requiredRole={['admin', 'office_admin']}>
            <OfficeReportsDashboard />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
