"use client";

import * as React from "react";
import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logoutUser } from "../../store/slices/authSlice";
import { useAuth } from "../../hooks/useAuth";
import {
  Settings,
  LogOut,
  Home,
  Building2,
  Users,
  BarChart3,
  User,
  ChevronDown,
  Package,
  MonitorCog,
  SquaresExclude,
  Building,
  Bed,
  Calendar,
  AlertCircle,
} from "lucide-react";

import { Separator } from "../ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "../ui/sidebar";

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { isAdmin, isMedicalAdmin, isAccountantMedical, isOfficeAdmin } =
    useAuth();

  // State for tracking expanded/collapsed sub-menus (supports multiple levels)
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Toggle sub-menu expansion
  const toggleSubMenu = (menuTitle: string) => {
    setExpandedMenus((prev: Set<string>) => {
      const newSet = new Set(prev);
      if (newSet.has(menuTitle)) {
        newSet.delete(menuTitle);
      } else {
        newSet.add(menuTitle);
      }
      return newSet;
    });
  };

  // Check if a sub-menu is expanded
  const isExpanded = (menuTitle: string) => {
    return expandedMenus.has(menuTitle);
  };

  // Recursive function to render navigation items with multiple levels of nesting
  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const hasSubItems = item.items && item.items.length > 0;
    const expanded = isExpanded(item.title);
    const paddingLeft = level * 16; // 16px padding per level

    if (hasSubItems) {
      return (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            tooltip={item.title}
            className="justify-between"
            onClick={() => toggleSubMenu(item.title)}
            style={{ paddingLeft: `${paddingLeft}px` }}
          >
            <div className="flex items-center">
              {item.icon && <item.icon className="h-4 w-4 mr-2" />}
              <span className="group-has-data-[collapsible=icon]/sidebar-wrapper:hidden">
                {item.title}
              </span>
            </div>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 group-has-data-[collapsible=icon]/sidebar-wrapper:hidden ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </SidebarMenuButton>
          {expanded && (
            <SidebarMenu className="group-has-data-[collapsible=icon]/sidebar-wrapper:pl-0">
              {item.items!.map((subItem) =>
                renderNavigationItem(subItem, level + 1)
              )}
            </SidebarMenu>
          )}
        </SidebarMenuItem>
      );
    }

    // Regular item (no sub-items)
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          asChild
          isActive={item.url ? isActive(item.url) : false}
          tooltip={item.title}
          style={{ paddingLeft: `${paddingLeft}px` }}
        >
          <Link to={item.url || "#"}>
            {item.icon && <item.icon className="h-4 w-4" />}
            <span className="group-has-data-[collapsible=icon]/sidebar-wrapper:hidden">
              {item.title}
            </span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  // Define navigation item types
  interface NavigationItem {
    title: string;
    url?: string;
    icon?: React.ComponentType<{ className?: string }>;
    items?: NavigationItem[];
  }

  // Admin-specific navigation items
  const adminNavigationItems: NavigationItem[] = [
    {
      title: "Main Dashboard",
      url: "/",
      icon: Home,
    },
    {
      title: "User Management",
      url: "/users",
      icon: Users,
    },
    {
      title: "Dialysis Center",
      icon: Building2,
      items: [
        {
          title: "Dashboard",
          url: "/dialysis-center",
          icon: Home,
        },
        {
          title: "Admin",
          icon: Users,
          items: [
            {
              title: "Inventory",
              icon: SquaresExclude,
              items: [
                {
                  title: "Items",
                  url: "/dialysis-center/items",
                  icon: Package,
                },
              ],
            },
            {
              title: "Machines",
              url: "/dialysis-center/machines",
              icon: MonitorCog,
            },
            {
              title: "Warning",
              url: "/dialysis-center/warning",
              icon: AlertCircle,
            },
            {
              title: "Warning Resolved",
              url: "/dialysis-center/warning-resolved",
              icon: AlertCircle,
            },
            {
              title: "Wards",
              url: "/dialysis-center/wards",
              icon: Building,
            },
            {
              title: "Beds",
              url: "/dialysis-center/beds",
              icon: Bed,
            },
            {
              title: "Shifts",
              url: "/dialysis-center/shifts",
              icon: Calendar,
            },
          ],
        },
        {
          title: "Dialysis Accountant",
          icon: Users,
          items: [
            {
              title: "Patients",
              url: "/dialysis-center/patients",
              icon: User,
            },
            {
              title: "Dialysis",
              url: "/dialysis-center/dialysis",
              icon: Calendar,
            },
          ],
        },
      ],
    },
    {
      title: "Office Management",
      icon: Building2,
      items: [
        {
          title: "Dashboard",
          url: "/office-management",
          icon: Home,
        },
        {
          title: "Staff Management",
          url: "/staff",
          icon: Users,
        },
        {
          title: "Office Reports",
          url: "/office-reports",
          icon: BarChart3,
        },
      ],
    },
    {
      title: "Profile",
      url: "/profile",
      icon: User,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ];

  // Medical Admin-specific navigation items
  const medicalAdminNavigationItems: NavigationItem[] = [
    {
      title: "Dashboard",
      url: "/dialysis-center",
      icon: Home,
    },
    {
      title: "Admin",
      icon: Users,
      items: [
        {
          title: "Inventory",
          icon: SquaresExclude,
          items: [
            {
              title: "Items",
              url: "/dialysis-center/items",
              icon: Package,
            },
          ],
        },
        {
          title: "Machines",
          url: "/dialysis-center/machines",
          icon: MonitorCog,
        },
        {
          title: "Warning",
          url: "/dialysis-center/warning",
          icon: AlertCircle,
        },
        {
          title: "Warning Resolved",
          url: "/dialysis-center/warning-resolved",
          icon: AlertCircle,
        },
        {
          title: "Wards",
          url: "/dialysis-center/wards",
          icon: Building,
        },
        {
          title: "Beds",
          url: "/dialysis-center/beds",
          icon: Bed,
        },
        {
          title: "Shifts",
          url: "/dialysis-center/shifts",
          icon: Calendar,
        },
      ],
    },
    {
      title: "Dialysis Accountant",
      icon: Users,
      items: [
        {
          title: "Patients",
          url: "/dialysis-center/patients",
          icon: User,
        },
        {
          title: "Dialysis",
          url: "/dialysis-center/dialysis",
          icon: Calendar,
        },
      ],
    },
  ];

  // Accountant Medical-specific navigation items
  const accountantMedicalNavigationItems: NavigationItem[] = [
    {
      title: "Dashboard",
      url: "/dialysis-center",
      icon: Home,
    },
    {
      title: "Warning",
      url: "/dialysis-center/warning",
      icon: AlertCircle,
    },
    {
      title: "Warning Resolved",
      url: "/dialysis-center/warning-resolved",
      icon: AlertCircle,
    },
    {
      title: "Patients",
      url: "/dialysis-center/patients",
      icon: User,
    },
    {
      title: "Dialysis",
      url: "/dialysis-center/dialysis",
      icon: Calendar,
    },
  ];

  // Office Admin-specific navigation items
  const officeAdminNavigationItems: NavigationItem[] = [
    {
      title: "Office Management",
      url: "/office-management",
      icon: Building2,
    },
    {
      title: "Staff Management",
      url: "/staff",
      icon: Users,
    },
    {
      title: "Office Reports",
      url: "/office-reports",
      icon: BarChart3,
    },
  ];

  // Combine navigation items based on user role
  const getNavigationItems = (): NavigationItem[] => {
    const items: NavigationItem[] = [];

    if (isAdmin()) {
      items.push(...adminNavigationItems);
    }

    if (isMedicalAdmin()) {
      items.push(...medicalAdminNavigationItems);
    }

    if (isAccountantMedical()) {
      items.push(...accountantMedicalNavigationItems);
    }

    if (isOfficeAdmin()) {
      items.push(...officeAdminNavigationItems);
    }

    return items;
  };

  const navigationItems = getNavigationItems();

  const getUrl = () => {
    if(isAdmin()) {
      return `/`;
    }
    if(isMedicalAdmin()) {
      return `/dialysis-center`;
    }
    if(isAccountantMedical()) {
      return `/dialysis-center`;
    }
    if(isOfficeAdmin()) {
      return `/office-management`;
    }
    return `/`;
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:!p-4 "
              >
                <Link to={getUrl()} className="flex items-center gap-2">
                  <span className="text-base font-semibold">
                    Unified Management System
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu className="!p-1.5 overflow-y-auto sidebar-wrapper">
            {navigationItems.map((item) => renderNavigationItem(item))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                tooltip="Logout"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className=" calc(100vw - 16rem)) overflow-x-hidden ">
        <SiteHeader user={user} />
        <div className="flex flex-col w-full">
          <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function SiteHeader({ user }: { user: any }) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sm:h-14 md:h-16 lg:h-18">
      <div className="flex w-full items-center gap-1 px-2 sm:gap-2 sm:px-3 md:gap-3 md:px-4 lg:gap-4 lg:px-6">
        <SidebarTrigger className="-ml-1 h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10" />
        <Separator
          orientation="vertical"
          className="mx-1 h-4 sm:mx-2 sm:h-5 md:mx-3 md:h-6 data-[orientation=vertical]:h-4 sm:data-[orientation=vertical]:h-5 md:data-[orientation=vertical]:h-6"
        />
        <h1 className="text-sm font-medium sm:text-base md:text-lg lg:text-xl xl:text-2xl truncate">
          <span className="hidden sm:inline">Unified Management System</span>
          <span className="sm:hidden">UMS</span>
        </h1>
        <div className="ml-auto flex items-center gap-1 sm:gap-2 md:gap-3">
          <span className="text-xs text-muted-foreground sm:text-sm md:text-base truncate max-w-[120px] sm:max-w-[150px] md:max-w-[200px] lg:max-w-none">
            <span className="hidden sm:inline">Welcome, </span>
            {user?.name || "User"}
          </span>
        </div>
      </div>
    </header>
  );
}
