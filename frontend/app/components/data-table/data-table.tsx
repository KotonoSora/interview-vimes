import * as React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import { DataTablePagination } from "./data-table-pagination";

export type SortDirection = "asc" | "desc" | false;

export interface ColumnContext<TData> {
  column: {
    id: string;
    getIsSorted: () => SortDirection;
    toggleSorting: (descending?: boolean) => void;
  };
}

export interface ColumnDef<TData> {
  id?: string;
  accessorKey?: keyof TData | string;
  header:
    React.ReactNode | ((context: ColumnContext<TData>) => React.ReactNode);
  cell?: (props: { row: { original: TData } }) => React.ReactNode;
  enableSorting?: boolean;
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  emptyMessage?: string;
  pageSize?: number;
  showPagination?: boolean;
}

export function DataTable<TData>({
  columns,
  data,
  emptyMessage = "Không có dữ liệu.",
  pageSize = 10,
  showPagination = true,
}: DataTableProps<TData>) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [currentPageSize, setCurrentPageSize] = React.useState(pageSize);
  const [sorting, setSorting] = React.useState<{
    id: string;
    desc: boolean;
  } | null>(null);

  const sortedData = React.useMemo(() => {
    if (!sorting) return data;
    const { id, desc } = sorting;
    return [...data].sort((a, b) => {
      const aVal = (a as any)[id];
      const bVal = (b as any)[id];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      const comparison = aVal > bVal ? 1 : -1;
      return desc ? -comparison : comparison;
    });
  }, [data, sorting]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedData.length / currentPageSize),
  );
  const paginatedData = React.useMemo(() => {
    if (!showPagination) return sortedData;
    const start = (currentPage - 1) * currentPageSize;
    return sortedData.slice(start, start + currentPageSize);
  }, [sortedData, currentPage, currentPageSize, showPagination]);

  const toggleSort = (colId: string, desc?: boolean) => {
    if (sorting?.id === colId) {
      if (sorting.desc) {
        setSorting(null);
      } else {
        setSorting({ id: colId, desc: true });
      }
    } else {
      setSorting({ id: colId, desc: !!desc });
    }
  };

  return (
    <div className="w-full space-y-0">
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 text-xs hover:bg-muted/40">
              {columns.map((col, idx) => {
                const colId = col.id || String(col.accessorKey) || String(idx);
                const isSorted: SortDirection =
                  sorting?.id === colId
                    ? sorting.desc
                      ? "desc"
                      : "asc"
                    : false;

                const columnContext: ColumnContext<TData> = {
                  column: {
                    id: colId,
                    getIsSorted: () => isSorted,
                    toggleSorting: (desc) => toggleSort(colId, desc),
                  },
                };

                return (
                  <TableHead
                    key={colId}
                    className="text-xs font-semibold py-2 px-3 whitespace-nowrap"
                  >
                    {typeof col.header === "function"
                      ? col.header(columnContext)
                      : col.header}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length ? (
              paginatedData.map((item, rowIdx) => (
                <TableRow
                  key={(item as any)?.id || rowIdx}
                  className="text-xs hover:bg-muted/20 transition-colors"
                >
                  {columns.map((col, colIdx) => {
                    const cellKey = col.id || String(col.accessorKey) || colIdx;
                    let content: React.ReactNode = null;

                    if (col.cell) {
                      content = col.cell({ row: { original: item } });
                    } else if (col.accessorKey) {
                      content = String((item as any)[col.accessorKey] ?? "");
                    }

                    return (
                      <TableCell key={cellKey} className="py-2.5 px-3">
                        {content}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-xs text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination && (
        <DataTablePagination
          totalCount={sortedData.length}
          pageSize={currentPageSize}
          pageIndex={currentPage - 1}
          pageCount={totalPages}
          onPageChange={(page) => setCurrentPage(page + 1)}
          onPageSizeChange={(size) => {
            setCurrentPageSize(size);
            setCurrentPage(1);
          }}
        />
      )}
    </div>
  );
}
