"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { api } from "@/lib/api";
import type { Category, PageResponse } from "@/lib/types";

import { DataTablePagination } from "@/components/datatable/data-table-pagination";
import { DataTableSkeleton } from "@/components/datatable/data-table-skeleton";
import { DataTableToolbar } from "@/components/datatable/data-table-toolbar";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type DataListProps<T> = {
  queryKey: string;
  columns: Array<ColumnDef<T>>;
  filterOptions?: {
    categories?: Array<Category>;
    showTypeFilters?: boolean;
  };
  page?: {
    number: number;
    size: number;
  };
  onRowClick?: (id: string) => void;
  emptyMessage?: string;
  errorMessage?: string;
  defaultSort?: { id: string; desc: boolean };
  accountId?: string;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function DataTable<T extends { id: string }>({
  queryKey,
  columns,
  filterOptions,
  page,
  onRowClick,
  emptyMessage = "No data found",
  errorMessage = "Failed to load data",
  defaultSort,
  accountId,
}: DataListProps<T>) {
  const [sorting, setSorting] = useState<SortingState>(
    defaultSort ? [defaultSort] : [],
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(page?.size || 10);
  const [pageIndex, setPageIndex] = useState(page?.number || 0);

  // Debounced global filter
  const [debouncedGlobalFilter, setDebouncedGlobalFilter] = useState("");

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedGlobalFilter(globalFilter);
    }, 300);
    return () => clearTimeout(handle);
  }, [globalFilter]);

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  const { data, error, isLoading, refetch } = useQuery<PageResponse<T>>({
    queryKey: [
      queryKey,
      "list",
      {
        page: pageIndex,
        size: pageSize,
        search: debouncedGlobalFilter,
        categoryId: categoryFilter,
        type: typeFilter,
        accountId,
      },
    ],
    queryFn: async () => {
      const response = await api.get<PageResponse<T>>(`/${queryKey}`, {
        params: {
          sort: sorting
            .map((s) => `${camelToSnake(s.id)},${s.desc ? "desc" : "asc"}`)
            .join(","),
          page: pageIndex,
          size: pageSize,
          search: debouncedGlobalFilter || undefined,
          categoryId: categoryFilter || undefined,
          type: typeFilter || undefined,
          "account_id.equals": accountId || undefined,
        },
      });

      return response.data;
    },
  });

  // ---------------------------------------------------------------------------
  // Table
  // ---------------------------------------------------------------------------

  /**
   * TanStack Table returns mutable functions.
   * React Compiler must not memoize this.
   */
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: (data?.content ?? []) as T[],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    manualPagination: true,
    pageCount: data?.page?.total_pages ?? -1,
  });

  const totalCount = data?.page?.total_elements ?? 0;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return <DataTableSkeleton columns={columns.length} rows={pageSize} />;
  }

  return (
    <Card>
      <CardHeader>
        <DataTableToolbar
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          filterOptions={filterOptions}
          refetch={refetch}
        />
      </CardHeader>

      <CardContent>
        {error ? (
          <div className="p-4 text-center text-muted-foreground">
            {errorMessage}
          </div>
        ) : (
          <div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>

                <TableBody>
                  {table.getRowModel().rows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-16 text-center text-muted-foreground"
                      >
                        {emptyMessage}
                      </TableCell>
                    </TableRow>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        onClick={() => onRowClick?.(row.original.id)}
                        className={
                          onRowClick ? "cursor-pointer hover:bg-muted/50" : ""
                        }
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <DataTablePagination
              pageIndex={pageIndex}
              pageSize={pageSize}
              totalCount={totalCount}
              setPageIndex={setPageIndex}
              setPageSize={setPageSize}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

function camelToSnake(value: string) {
  return value.replace(/([A-Z])/g, "_$1").toLowerCase();
}
