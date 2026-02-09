import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronsUpDownIcon,
  SearchIcon,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getCookie } from "@/lib/getCookie";

export interface Column<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKey?: keyof T;
  searchPlaceholder?: string;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  actions?: (row: T) => React.ReactNode;
  loading?: boolean;
  emptyMessage?: string;
  pagination?: boolean;
  pageSize?: number;
  page?: number; // For API pagination (parent controlled)
  totalPages?: number; // For API pagination (parent controlled)
  totalItems?: number; // For API pagination (parent controlled)
  onPageChange?: (page: number) => void; // For API pagination (parent controlled)
  defaultSort?: {
    key: keyof T;
    direction: "asc" | "desc";
  };
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchKey,
  searchPlaceholder = "Search...",
  onEdit,
  onDelete,
  onView,
  actions,
  loading = false,
  emptyMessage = "No data available",
  pagination = false,
  pageSize = 10,
  page,
  totalPages,
  totalItems,
  onPageChange,
  defaultSort,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: "asc" | "desc";
  }>(defaultSort || { key: null, direction: "asc" });
  const [internalPage, setInternalPage] = useState(1);

  const isViewer = useMemo(() => {
    try {
      const cookie = getCookie("userData");
      if (!cookie) return false;

      const user = JSON.parse(cookie);
      return user?.role === "viewer";
    } catch (err) {
      console.error("Failed to parse userData cookie", err);
      return false;
    }
  }, []);

  console.log("is Viewer: ", isViewer);

  // Choose page for client or controlled
  const activePage =
    typeof page === "number" && typeof onPageChange === "function"
      ? page
      : internalPage;

  // Run page change logic properly
  const doPageChange = (newPage: number) => {
    if (typeof onPageChange === "function") onPageChange(newPage);
    else setInternalPage(newPage);
  };

  // Memo filtered/sorted data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data;
    if (searchTerm && searchKey) {
      filtered = data.filter((item) => {
        const value = item[searchKey];
        return value
          ?.toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      });
    }
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [data, searchTerm, searchKey, sortConfig]);

  // Only slice for client (not API-driven)
  let shownData = filteredAndSortedData;
  if (pagination && !onPageChange) {
    const startIndex = (activePage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    shownData = filteredAndSortedData.slice(startIndex, endIndex);
  } else if (pagination && onPageChange) {
    // If server paginated, always display parent-data as is!
    shownData = data;
  }

  // Only auto-reset page on data change for client mode
  React.useEffect(() => {
    if (!onPageChange) setInternalPage(1);
    // do NOT reset if API driven
  }, [searchTerm, data]);

  // Pagination calculations
  const countTotalItems =
    typeof totalItems === "number" ? totalItems : filteredAndSortedData.length;
  const countTotalPages =
    typeof totalPages === "number"
      ? totalPages
      : Math.ceil(filteredAndSortedData.length / pageSize);

  // Prepare page numbers for buttons (unchanged)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    if (countTotalPages <= 1) {
      pages.push(1);
    } else if (countTotalPages <= maxVisiblePages) {
      for (let i = 1; i <= countTotalPages; i++) pages.push(i);
    } else {
      if (activePage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(countTotalPages);
      } else if (activePage >= countTotalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = countTotalPages - 3; i <= countTotalPages; i++)
          pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = activePage - 1; i <= activePage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(countTotalPages);
      }
    }
    return pages;
  };

  const handleSort = (key: keyof T) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getSortIcon = (key: keyof T) => {
    if (sortConfig.key !== key) {
      return <ChevronsUpDownIcon className="h-4 w-4" />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUpIcon className="h-4 w-4" />
    ) : (
      <ChevronDownIcon className="h-4 w-4" />
    );
  };

  const handlePageChange = (page: number) => {
    doPageChange(page);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        {searchKey && (
          <div className="relative flex-1 max-w-sm">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md overflow-hidden border">
        <Table>
          <TableHeader className="bg-primary/10 rounded-t-md">
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={String(column.key)}
                  className={` text-primary font-semibold text-xs
                    ${column.sortable ? "cursor-pointer" : ""}
                  `}
                  onClick={() => column.sortable && handleSort(column.key)}
                  style={{ minWidth: column.width || "150px" }}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </TableHead>
              ))}
              {!isViewer && (onEdit || onDelete || onView || actions) && (
                <TableHead className="text-primary w-[100px] text-xs font-semibold">
                  ACTIONS
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Show skeleton rows for loading state
              Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {columns.map((column) => (
                    <TableCell key={`skeleton-${index}-${String(column.key)}`}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                  {!isViewer && (onEdit || onDelete || onView || actions) && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : filteredAndSortedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    columns.length +
                    (onEdit || onDelete || onView || actions ? 1 : 0)
                  }
                  className="text-center py-8 text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              shownData.map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={String(column.key)}>
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]?.toString() || "-"}
                    </TableCell>
                  ))}
                  {!isViewer && (onEdit || onDelete || onView || actions) && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {actions && actions(row)}
                        {onView && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView(row)}
                            className="h-8 w-8 p-0"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(row)}
                            className="h-8 w-8 p-0"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(row)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground text-center sm:text-left">
            {countTotalItems === 0
              ? "No results"
              : countTotalPages === 1
                ? `Showing all ${countTotalItems} results`
                : `Showing ${activePage * pageSize - pageSize + 1} to ${Math.min(activePage * pageSize, countTotalItems)} of ${countTotalItems} results`}
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={activePage === 1 || countTotalPages <= 1}
              title="First Page"
              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
            >
              <ChevronsLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(activePage - 1)}
              disabled={activePage === 1 || countTotalPages <= 1}
              title="Previous Page"
              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>

            {getPageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === "..." ? (
                  <span className="px-2 text-muted-foreground">...</span>
                ) : (
                  <Button
                    variant={activePage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page as number)}
                    title={`Go to page ${page}`}
                    className="w-8 h-8 p-0"
                    disabled={countTotalPages <= 1}
                  >
                    {page}
                  </Button>
                )}
              </React.Fragment>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(activePage + 1)}
              disabled={activePage === countTotalPages || countTotalPages <= 1}
              title="Next Page"
              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
            >
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(countTotalPages)}
              disabled={activePage === countTotalPages || countTotalPages <= 1}
              title="Last Page"
              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
            >
              <ChevronsRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
