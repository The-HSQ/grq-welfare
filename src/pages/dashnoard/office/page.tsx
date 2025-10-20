import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/hooks/useDashboard";
import {
  Package,
  Heart,
  DollarSign,
  Car,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";


// --- Reusable Components ---
const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = "default",
}: {
  title: string;
  value: number | string;
  icon: React.ComponentType<any>;
  description?: string;
  trend?: "up" | "down" | "neutral";
  color?: "default" | "success" | "warning" | "destructive";
}) => {
  const colorClasses = {
    default: "text-primary",
    success: "text-primary",
    warning: "text-primary",
    destructive: "text-primary",
  };
  const bgColorClasses = {
    default: "bg-primary/10",
    success: "bg-primary/10",
    warning: "bg-primary/10",
    destructive: "bg-primary/10",
  };
  return (
    <Card className="bg-card border border-primary/30 hover:shadow-lg shadow-primary/10 rounded-xl flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm text-primary font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${bgColorClasses[color]}`}>
          <Icon className={`h-4 w-4 ${colorClasses[color]}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-primary"}`}>{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {trend && (
          <div className="flex items-center mt-2">
            {trend === "up" && <TrendingUp className="h-3 w-3 text-green-500 mr-1" />}
            {trend === "down" && <TrendingDown className="h-3 w-3 text-red-500 mr-1" />}
            <span className={`text-xs ${trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-gray-500"}`}>
              {trend === "up" ? "Increased" : trend === "down" ? "Decreased" : "Stable"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const LoadingSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {[...Array(4)].map((_, i) => (
      <Card key={i}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-[60px] mb-2" />
          <Skeleton className="h-3 w-[120px]" />
        </CardContent>
      </Card>
    ))}
  </div>
);

const quickActions = [
  {
    to: "/office-management/inventory",
    icon: Package,
    bg: "bg-primary/10",
    color: "text-primary",
    title: "Manage Inventory",
    desc: "Add or update items",
  },
  {
    to: "/office-management/donations",
    icon: Heart,
    bg: "bg-primary/10",
    color: "text-primary",
    title: "Record Donation",
    desc: "Add new donation",
  },
  {
    to: "/office-management/expense",
    icon: DollarSign,
    bg: "bg-primary/10",
    color: "text-primary",
    title: "Add Expense",
    desc: "Record new expense",
  },
  {
    to: "/office-management/vehicles",
    icon: Car,
    bg: "bg-primary/10",
    color: "text-primary",
    title: "Manage Vehicles",
    desc: "Update vehicle info",
  },
];

const QuickActionCard = ({ to, icon: Icon, bg, color, title, desc }: any) => (
  <Link to={to} className="cursor-pointer">
    <Card className="border-primary/30 hover:shadow-md shadow-primary/10 group transition-shadow">
      <CardContent className="px-4 relative">
        <div className="flex items-center gap-3">
          <div className={`p-2 ${bg} rounded-lg`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
          <div>
            <h3 className="font-medium text-primary">{title}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </div>
        </div>
        <ArrowRight className={`h-5 w-5 ${color} absolute right-6 top-1/2 -translate-y-1/2 group-hover:translate-x-2 transition-transform duration-300`} />
      </CardContent>
    </Card>
  </Link>
);

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function OfficeManagementDashboard() {
  const { data: dashboardData, loading, error } = useDashboard();

  if (loading) {
    return (
      <div className="flex flex-col gap-4 sm:gap-6 text-primary">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Office Management Dashboard</h1>
            <p className="text-muted-foreground mt-2">Overview of your organization's key metrics and statistics</p>
          </div>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col gap-4 sm:gap-6 text-primary">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Office Management Dashboard</h1>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  if (!dashboardData) return null;
  const { total_counts, financial_summary, additional_stats } = dashboardData;

  // Stat cards config
  const totalCountsStats = [
    {
      title: "Inventory Items",
      value: total_counts.inventory,
      icon: Package,
      description: "Total inventory items",
      color: "default" as const,
    },
    {
      title: "Donations",
      value: total_counts.donations,
      icon: Heart,
      description: "Total donations received",
      color: "success" as const,
    },
    {
      title: "Expenses",
      value: total_counts.expenses,
      icon: DollarSign,
      description: "Total expenses recorded",
      color: "warning" as const,
    },
    {
      title: "Vehicles",
      value: total_counts.vehicles,
      icon: Car,
      description: "Total vehicles managed",
      color: "default" as const,
    },
  ];

  const financialStats = [
    {
      title: "Total Donations",
      value: formatCurrency(financial_summary.total_donation_amount),
      icon: TrendingUp,
      description: "Total amount received",
      color: "success" as const,
      trend: "up" as const,
    },
    {
      title: "Total Expenses",
      value: formatCurrency(financial_summary.total_expense_amount),
      icon: TrendingDown,
      description: "Total amount spent",
      color: "destructive" as const,
      trend: "down" as const,
    },
    {
      title: "Net Income",
      value: formatCurrency(financial_summary.net_balance),
      icon: financial_summary.net_balance >= 0 ? TrendingUp : TrendingDown,
      description: "Current financial position",
  color: financial_summary.net_balance >= 0 ? ("success" as "success") : ("destructive" as "destructive"),
  trend: financial_summary.net_balance >= 0 ? ("up" as "up") : ("down" as "down"),
    },
    {
      title: "Total Outstanding Balances for Vendors",
      value: formatCurrency(financial_summary.total_outstanding_balances_for_vendors),
      icon: TrendingDown,
      description: "Total outstanding balances for vendors",
      color: "destructive" as const,
      trend: "down" as const,
    },
  ];

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Header */}
      <div className="text-primary flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Office Management Dashboard</h1>
          <p className="text-muted-foreground mt-2">Overview of your organization's key metrics and statistics</p>
        </div>
        <Badge variant="outline" className="text-primary w-fit">
          <CheckCircle className="h-3 w-3 mr-1" /> Live Data
        </Badge>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-primary">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {quickActions.map((action, i) => (
            <QuickActionCard key={i} {...action} />
          ))}
        </div>
      </div>

      {/* Total Counts Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-primary">Total Counts</h2>
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {totalCountsStats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>
      </div>

      {/* Financial Summary Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-primary">Financial Summary</h2>
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {financialStats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>
      </div>

      {/* Additional Stats Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-primary">Additional Statistics</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-card border border-primary/30 hover:shadow-lg shadow-primary/10 rounded-xl flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center gap-2 pb-0">
              <span className="bg-primary/10 rounded-lg p-2">
                <Package className="h-5 w-5 text-primary" />
              </span>
              <div className="">
              <CardTitle className="text-base">
                Available Inventory
              </CardTitle>
              <CardDescription>Items currently in stock</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{additional_stats.available_inventory_items}</div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Stock Level</span>
                  <span>
                    {Math.round((additional_stats.available_inventory_items / total_counts.inventory) * 100)}%
                  </span>
                </div>
                <Progress value={(additional_stats.available_inventory_items / total_counts.inventory) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border border-primary/30 hover:shadow-lg shadow-primary/10 rounded-xl flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center gap-2 pb-0">
              <span className="bg-primary/10 rounded-lg p-2">
                <Car className="h-5 w-5 text-primary" />
              </span>
              <div className="">
                <CardTitle className="text-base">
                  Donated Vehicles
                </CardTitle>
                <CardDescription>Vehicles received as donations</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{additional_stats.donated_vehicles}</div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Donation Rate</span>
                  <span>
                    {Math.round((additional_stats.donated_vehicles / total_counts.vehicles) * 100)}%
                  </span>
                </div>
                <Progress value={(additional_stats.donated_vehicles / total_counts.vehicles) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
