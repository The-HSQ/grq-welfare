import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DashboardLayout from "../components/dashboardLayout/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../pages/Login";
import Dashboard from "../pages/dashnoard/Dashboard";
import NotFound from "../pages/NotFound";
import Users from "../pages/dashnoard/users/Users";
import { Patients } from "../pages/dashnoard/dialysis_center/patients/page";
import DialysisDashboard from "../pages/dashnoard/dialysis_center/dashboard/page";
import ItemsPage from "../pages/dashnoard/dialysis_center/items/page";
import ItemDetail from "../components/admin_pages/dialysis_center/items/ItemDetail";
import MachinePage from "../pages/dashnoard/dialysis_center/machines/page";
import WardsPage from "../pages/dashnoard/dialysis_center/wards/page";
import BedsPage from "../pages/dashnoard/dialysis_center/beds/page";
import ShiftsPage from "../pages/dashnoard/dialysis_center/shifts/page";
import WarningPage from "../pages/dashnoard/dialysis_center/warning/page";
import WarningResolvedPage from "../pages/dashnoard/dialysis_center/warning_resolved/page";
import { PatientDetail } from "../components/admin_pages/dialysis_center/patients/PatientDetail";
import DialysisPage from "../pages/dashnoard/dialysis_center/dialysis/page";
import DialysisDetail from "../components/admin_pages/dialysis_center/dialysis/DialysisDetail";
import TodayDialysis from "@/pages/dashnoard/dialysis_center/today_dialysis";
import UpcomingPatientsDialysis from "@/pages/dashnoard/dialysis_center/upcoming_patients_dialysis";
import DonorPage from "@/pages/dashnoard/donor_donation/donor/page";
import DonorDetail from "../pages/dashnoard/donor_donation/donor/DonorDetail";
import DonationPage from "@/pages/dashnoard/donor_donation/donation/page";
import VendorPage from "@/pages/dashnoard/vendor_expense/vendor/page";
import VendorDetailPage from "@/pages/dashnoard/vendor_expense/vendor/detail";
import ExpenseCategoryPage from "@/pages/dashnoard/vendor_expense/expense_category/page";
import ExpensePage from "@/pages/dashnoard/vendor_expense/expense/page";
import ExpenseDetailPage from "@/pages/dashnoard/vendor_expense/expense/ExpenseDetail";
import VehiclesPage from "@/pages/dashnoard/vehicles/vehicles/page";
import VehiclesUsagePage from "@/pages/dashnoard/vehicles/vehicles_usage/page";
import DoctorAppointmentPage from "@/pages/dashnoard/dialysis_center/doctor_appointment/page";
import InventoryPage from "@/pages/dashnoard/inventory/items/page";
import InventoryDetail from "../components/admin_pages/inventory/items/InventoryDetail";
import OfficeManagementDashboard from "@/pages/dashnoard/office/page";
import TrackingItemsPage from "@/pages/dashnoard/inventory/tracking_items/page";
import DashboardViewer from "@/pages/dashnoard/viewer/Dashboard";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
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
          <ProtectedRoute requiredRole={["admin"]}>
            <Dashboard />
          </ProtectedRoute>
        ),
      },

      // Admin-specific routes
      {
        path: "users",
        element: (
          <ProtectedRoute requiredRole="admin">
            <Users />
          </ProtectedRoute>
        ),
      },

      {
        path: "viewer",
        element: (
          <ProtectedRoute requiredRole="viewer">
            <DashboardViewer />
          </ProtectedRoute>
        ),
      },

      // Dialysis Center routes - accessible to admin, medical_admin, and accountant_medical
      {
        path: "dialysis-center",
        element: (
          <ProtectedRoute
            requiredRole={["admin", "medical_admin", "accountant_medical"]}
          >
            <DialysisDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "dialysis-center/doctor-appointment",
        element: (
          <ProtectedRoute
            requiredRole={[
              "admin",
              "medical_admin",
              "accountant_medical",
              "viewer",
            ]}
          >
            <DoctorAppointmentPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "dialysis-center/items",
        element: (
          <ProtectedRoute requiredRole={["admin", "medical_admin"]}>
            <ItemsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "dialysis-center/items/:id",
        element: (
          <ProtectedRoute requiredRole={["admin", "medical_admin"]}>
            <ItemDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "dialysis-center/machines",
        element: (
          <ProtectedRoute requiredRole={["admin", "medical_admin"]}>
            <MachinePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "dialysis-center/warning",
        element: (
          <ProtectedRoute
            requiredRole={["admin", "medical_admin", "accountant_medical"]}
          >
            <WarningPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "dialysis-center/warning-resolved",
        element: (
          <ProtectedRoute
            requiredRole={["admin", "medical_admin", "accountant_medical"]}
          >
            <WarningResolvedPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "dialysis-center/wards",
        element: (
          <ProtectedRoute requiredRole={["admin", "medical_admin"]}>
            <WardsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "dialysis-center/beds",
        element: (
          <ProtectedRoute requiredRole={["admin", "medical_admin"]}>
            <BedsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "dialysis-center/shifts",
        element: (
          <ProtectedRoute requiredRole={["admin", "medical_admin"]}>
            <ShiftsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "dialysis-center/patients",
        element: (
          <ProtectedRoute
            requiredRole={[
              "admin",
              "medical_admin",
              "accountant_medical",
              "viewer",
            ]}
          >
            <Patients />
          </ProtectedRoute>
        ),
      },
      {
        path: "dialysis-center/patients/:id",
        element: (
          <ProtectedRoute
            requiredRole={[
              "admin",
              "medical_admin",
              "accountant_medical",
              "viewer",
            ]}
          >
            <PatientDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "dialysis-center/dialysis",
        element: (
          <ProtectedRoute
            requiredRole={[
              "admin",
              "medical_admin",
              "accountant_medical",
              "viewer",
            ]}
          >
            <DialysisPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "dialysis-center/dialysis/:id",
        element: (
          <ProtectedRoute
            requiredRole={[
              "admin",
              "medical_admin",
              "accountant_medical",
              "viewer",
            ]}
          >
            <DialysisDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "dialysis-center/today-dialysis",
        element: (
          <ProtectedRoute
            requiredRole={[
              "admin",
              "medical_admin",
              "accountant_medical",
              "viewer",
            ]}
          >
            <TodayDialysis />
          </ProtectedRoute>
        ),
      },
      {
        path: "dialysis-center/upcoming-patients-dialysis",
        element: (
          <ProtectedRoute
            requiredRole={[
              "admin",
              "medical_admin",
              "accountant_medical",
              "viewer",
            ]}
          >
            <UpcomingPatientsDialysis />
          </ProtectedRoute>
        ),
      },

      // Office Management routes - accessible to admin and office_admin
      {
        path: "office-management",
        element: (
          <ProtectedRoute requiredRole={["admin", "office_admin"]}>
            <OfficeManagementDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "office-management/inventory",
        element: (
          <ProtectedRoute requiredRole={["admin", "office_admin"]}>
            <InventoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "office-management/inventory/:id",
        element: (
          <ProtectedRoute requiredRole={["admin", "office_admin"]}>
            <InventoryDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "office-management/inventory/tracking-items",
        element: (
          <ProtectedRoute
            requiredRole={["admin", "office_admin", "lab_accountant"]}
          >
            <TrackingItemsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "office-management/donors",
        element: (
          <ProtectedRoute requiredRole={["admin", "office_admin"]}>
            <DonorPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "office-management/donors/:id",
        element: (
          <ProtectedRoute requiredRole={["admin", "office_admin"]}>
            <DonorDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "office-management/donations",
        element: (
          <ProtectedRoute requiredRole={["admin", "office_admin"]}>
            <DonationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "office-management/vendor",
        element: (
          <ProtectedRoute requiredRole={["admin", "office_admin"]}>
            <VendorPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "office-management/vendor/:id",
        element: (
          <ProtectedRoute requiredRole={["admin", "office_admin"]}>
            <VendorDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "office-management/expense-category",
        element: (
          <ProtectedRoute requiredRole={["admin", "office_admin"]}>
            <ExpenseCategoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "office-management/expense",
        element: (
          <ProtectedRoute requiredRole={["admin", "office_admin"]}>
            <ExpensePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "office-management/expense/:id",
        element: (
          <ProtectedRoute requiredRole={["admin", "office_admin"]}>
            <ExpenseDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "office-management/vehicles",
        element: (
          <ProtectedRoute requiredRole={["admin", "office_admin"]}>
            <VehiclesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "office-management/vehicles-usage",
        element: (
          <ProtectedRoute
            requiredRole={["admin", "office_admin", "vehicle_user"]}
          >
            <VehiclesUsagePage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
