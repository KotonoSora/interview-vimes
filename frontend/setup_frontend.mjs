import fs from 'fs';
import path from 'path';

console.log('🚀 Đang cập nhật hệ thống theo chuẩn Base UI (Giữ nguyên tuyệt đối app/components/ui/)...');

const filesToWrite = {
  // 1. DATA TABLE ADAPTER (app/components/data-table/data-table.tsx)
  // Chỉ sử dụng Primitives gốc từ ~/components/ui/table
  'app/components/data-table/data-table.tsx': `import * as React from "react";
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
  header: React.ReactNode | ((context: ColumnContext<TData>) => React.ReactNode);
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
  const [sorting, setSorting] = React.useState<{ id: string; desc: boolean } | null>(null);

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

  const totalPages = Math.max(1, Math.ceil(sortedData.length / currentPageSize));
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
                const isSorted: SortDirection = sorting?.id === colId ? (sorting.desc ? "desc" : "asc") : false;

                const columnContext: ColumnContext<TData> = {
                  column: {
                    id: colId,
                    getIsSorted: () => isSorted,
                    toggleSorting: (desc) => toggleSort(colId, desc),
                  },
                };

                return (
                  <TableHead key={colId} className="text-xs font-semibold py-2 px-3 whitespace-nowrap">
                    {typeof col.header === "function" ? col.header(columnContext) : col.header}
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
                <TableCell colSpan={columns.length} className="h-32 text-center text-xs text-muted-foreground">
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
`,

  // 2. COLUMN HEADER (app/components/data-table/data-table-column-header.tsx)
  'app/components/data-table/data-table-column-header.tsx': `import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

interface DataTableColumnHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  column: {
    getIsSorted: () => "asc" | "desc" | false;
    toggleSorting: (descending?: boolean) => void;
  };
  title: string;
}

export function DataTableColumnHeader({
  column,
  title,
  className,
}: DataTableColumnHeaderProps) {
  const isSorted = column.getIsSorted();

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      <Button
        variant="ghost"
        size="sm"
        type="button"
        className="-ml-3 h-7 text-xs font-semibold hover:bg-muted data-[state=open]:bg-accent"
        onClick={() => column.toggleSorting(isSorted === "asc")}
      >
        <span>{title}</span>
        {isSorted === "desc" ? (
          <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-primary" />
        ) : isSorted === "asc" ? (
          <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-primary" />
        ) : (
          <ChevronsUpDown className="ml-1.5 h-3.5 w-3.5 text-muted-foreground opacity-60" />
        )}
      </Button>
    </div>
  );
}
`,

  // 3. PAGINATION (app/components/data-table/data-table-pagination.tsx)
  'app/components/data-table/data-table-pagination.tsx': `import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface DataTablePaginationProps {
  totalCount: number;
  pageSize: number;
  pageIndex: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function DataTablePagination({
  totalCount,
  pageSize,
  pageIndex,
  pageCount,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-2.5 border-t bg-muted/20 text-xs">
      <div className="text-muted-foreground text-xs">
        Tổng cộng: <strong className="text-foreground font-mono font-semibold">{totalCount}</strong> bản ghi
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Hiển thị:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(val: string | null) => {
              if (val) onPageSizeChange(Number(val));
            }}
          >
            <SelectTrigger className="h-7 w-[75px] text-xs bg-background">
              <SelectValue placeholder={String(pageSize)} />
            </SelectTrigger>
            <SelectContent side="top" className="min-w-[75px]">
              {[10, 20, 30, 50, 100].map((size) => (
                <SelectItem key={size} value={String(size)} className="text-xs">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-center text-xs font-medium text-muted-foreground whitespace-nowrap">
          Trang <span className="font-mono text-foreground font-semibold mx-1">{pageIndex + 1}</span> / {pageCount}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            className="hidden h-7 w-7 p-0 lg:flex"
            onClick={() => onPageChange(0)}
            disabled={pageIndex <= 0}
          >
            <span className="sr-only">Trang đầu</span>
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            className="h-7 w-7 p-0"
            onClick={() => onPageChange(pageIndex - 1)}
            disabled={pageIndex <= 0}
          >
            <span className="sr-only">Trang trước</span>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            className="h-7 w-7 p-0"
            onClick={() => onPageChange(pageIndex + 1)}
            disabled={pageIndex >= pageCount - 1}
          >
            <span className="sr-only">Trang sau</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-7 w-7 p-0 lg:flex"
            onClick={() => onPageChange(pageCount - 1)}
            disabled={pageIndex >= pageCount - 1}
          >
            <span className="sr-only">Trang cuối</span>
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
`,

  // 4. RECEIPT FILTER TOOLBAR (Hỗ trợ Base UI Select onValueChange nullable)
  'app/components/goods-receipt/receipt-filter-toolbar.tsx': `import { useSubmit } from "react-router";
import type { MasterWarehouse } from "~/services/master-data.service";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { DatePicker } from "~/components/ui/date-picker";
import { Search } from "lucide-react";

interface Props {
  warehouses: MasterWarehouse[];
  currentFilters: {
    search: string;
    warehouseId: string;
    status: string;
    fromDate: string;
    toDate: string;
  };
}

export function ReceiptFilterToolbar({ warehouses, currentFilters }: Props) {
  const submit = useSubmit();

  const handleFilterChange = (key: string, value: string | null) => {
    const params = new URLSearchParams(window.location.search);
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    submit(params, { method: "get" });
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5 p-2.5 bg-card border rounded-lg shadow-sm">
      {/* Search Box */}
      <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Tìm theo số phiếu, người giao, CT gốc..."
          defaultValue={currentFilters.search}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "" || val.length >= 2) {
              handleFilterChange("search", val);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleFilterChange("search", (e.target as HTMLInputElement).value);
            }
          }}
          className="pl-8 h-8 text-xs bg-background"
        />
      </div>

      {/* Kho tiếp nhận */}
      <div className="min-w-[220px] max-w-[280px]">
        <Select
          defaultValue={currentFilters.warehouseId || "all"}
          onValueChange={(val: string | null) => handleFilterChange("warehouseId", val)}
        >
          <SelectTrigger className="h-8 text-xs bg-background w-full">
            <SelectValue placeholder="Tất cả kho tiếp nhận" />
          </SelectTrigger>
          <SelectContent className="min-w-[260px]">
            <SelectItem value="all" className="text-xs">Tất cả kho tiếp nhận</SelectItem>
            {warehouses.map((w) => (
              <SelectItem key={w.id} value={w.id} className="text-xs">
                {w.code ? \`[\${w.code}] \` : ""}{w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Trạng thái */}
      <div className="min-w-[150px]">
        <Select
          defaultValue={currentFilters.status || "all"}
          onValueChange={(val: string | null) => handleFilterChange("status", val)}
        >
          <SelectTrigger className="h-8 text-xs bg-background w-full">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent className="min-w-[160px]">
            <SelectItem value="all" className="text-xs">Mọi trạng thái</SelectItem>
            <SelectItem value="CONFIRMED" className="text-xs">Đã nhập kho</SelectItem>
            <SelectItem value="DRAFT" className="text-xs">Bản nháp</SelectItem>
            <SelectItem value="CANCELLED" className="text-xs">Đã hủy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* DatePicker */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="w-[135px]">
          <DatePicker
            value={currentFilters.fromDate}
            onChange={(val) => handleFilterChange("fromDate", val || null)}
            placeholder="Từ ngày"
          />
        </div>
        <span className="text-xs text-muted-foreground">-</span>
        <div className="w-[135px]">
          <DatePicker
            value={currentFilters.toDate}
            onChange={(val) => handleFilterChange("toDate", val || null)}
            placeholder="Đến ngày"
          />
        </div>
      </div>
    </div>
  );
}
`,

  // 5. RECEIPT ITEMS TABLE (Form vật tư hiển thị Tên thay vì ID)
  'app/components/goods-receipt/receipt-items-table.tsx': `import type { MasterProduct } from "~/services/master-data.service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Plus, Trash2, Package } from "lucide-react";
import { formatCurrencyVND } from "~/lib/formatters";

export interface ReceiptItemRow {
  productId: string;
  productNameSnapshot: string;
  unitSnapshot: string;
  docQty: number;
  actualQty: number;
  unitPrice: number;
  debitAccount?: string | null;
  creditAccount?: string | null;
  note?: string | null;
}

interface Props {
  items: ReceiptItemRow[];
  setItems: React.Dispatch<React.SetStateAction<ReceiptItemRow[]>>;
  products: MasterProduct[];
  totalAmountWords?: string | null;
}

export function ReceiptItemsTable({ items, setItems, products, totalAmountWords }: Props) {
  const handleProductChange = (index: number, productId: string | null) => {
    if (!productId) return;
    const selected = products.find((p) => p.id === productId);
    if (!selected) return;
    setItems((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        productId: selected.id,
        productNameSnapshot: selected.name,
        unitSnapshot: selected.unit,
        unitPrice: selected.defaultPrice || 0,
      };
      return next;
    });
  };

  const handleChange = (index: number, field: keyof ReceiptItemRow, value: unknown) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addItem = () => {
    const p = products[0];
    setItems((prev) => [
      ...prev,
      {
        productId: p?.id || "",
        productNameSnapshot: p?.name || "Vật tư",
        unitSnapshot: p?.unit || "Cái",
        docQty: 1,
        actualQty: 1,
        unitPrice: p?.defaultPrice || 0,
        debitAccount: "152",
        creditAccount: "331",
        note: "",
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const total = items.reduce((sum, it) => sum + Number(it.actualQty || 0) * Number(it.unitPrice || 0), 0);

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader className="py-2.5 px-4 border-b flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-semibold flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" /> Danh Sách Vật Tư Thực Nhập ({items.length})
        </CardTitle>
        <Button size="sm" variant="outline" onClick={addItem} type="button" className="h-7 text-xs">
          <Plus className="h-3.5 w-3.5 mr-1" /> Thêm dòng
        </Button>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 text-xs">
              <TableHead className="w-10 text-center font-semibold">STT</TableHead>
              <TableHead className="min-w-[280px] font-semibold">Tên, quy cách vật tư / hàng hóa</TableHead>
              <TableHead className="w-20 text-center font-semibold">ĐVT</TableHead>
              <TableHead className="w-28 text-right font-semibold">SL Chứng từ</TableHead>
              <TableHead className="w-28 text-right font-semibold">SL Thực nhập</TableHead>
              <TableHead className="w-32 text-right font-semibold">Đơn giá (VNĐ)</TableHead>
              <TableHead className="w-36 text-right font-semibold">Thành tiền</TableHead>
              <TableHead className="w-10 text-center"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((row, idx) => {
              const selectedProduct = products.find((p) => p.id === row.productId);
              const displayName = selectedProduct 
                ? \`\${selectedProduct.code ? \`[\${selectedProduct.code}] \` : ""}\${selectedProduct.name}\`
                : row.productNameSnapshot || "Chọn vật tư...";

              return (
                <TableRow key={idx} className="hover:bg-muted/20">
                  <TableCell className="text-center text-xs font-medium">{idx + 1}</TableCell>
                  
                  <TableCell>
                    <Select
                      value={row.productId}
                      onValueChange={(val: string | null) => handleProductChange(idx, val)}
                    >
                      <SelectTrigger className="h-8 text-xs font-medium w-full text-left truncate">
                        <SelectValue placeholder="Chọn vật tư">
                          {displayName}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="max-h-64 min-w-[320px]">
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id} className="text-xs">
                            <span className="font-mono font-semibold text-primary mr-1.5">[{p.code}]</span>
                            <span>{p.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell className="text-center text-xs text-muted-foreground font-medium">
                    {row.unitSnapshot || selectedProduct?.unit || "—"}
                  </TableCell>

                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="0.001"
                      value={row.docQty}
                      onChange={(e) => handleChange(idx, "docQty", Number(e.target.value))}
                      className="h-8 text-xs text-right font-mono"
                    />
                  </TableCell>

                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="0.001"
                      value={row.actualQty}
                      onChange={(e) => handleChange(idx, "actualQty", Number(e.target.value))}
                      className="h-8 text-xs text-right font-mono font-semibold"
                    />
                  </TableCell>

                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="100"
                      value={row.unitPrice}
                      onChange={(e) => handleChange(idx, "unitPrice", Number(e.target.value))}
                      className="h-8 text-xs text-right font-mono"
                    />
                  </TableCell>

                  <TableCell className="text-right font-mono font-bold text-xs text-primary whitespace-nowrap">
                    {formatCurrencyVND(Number(row.actualQty || 0) * Number(row.unitPrice || 0))}
                  </TableCell>

                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => removeItem(idx)}
                      disabled={items.length <= 1}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        <div className="p-3 bg-muted/20 border-t flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
          <div className="italic text-muted-foreground">
            Bằng chữ: <span className="font-semibold text-foreground">{totalAmountWords || "—"}</span>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <span className="font-semibold text-muted-foreground uppercase text-[11px]">Tổng tiền thanh toán:</span>
            <span className="text-sm font-bold text-primary">{formatCurrencyVND(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
`,

  // 6. FORM CREATE (app/routes/_app.goods-receipts.new.tsx)
  'app/routes/_app.goods-receipts.new.tsx': `import { useState, useEffect } from "react";
import { useLoaderData, useFetcher, useNavigate, data } from "react-router";
import type { Route } from "./+types/_app.goods-receipts.new";
import { z } from "zod";
import { requestIdContext, traceAndAuthMiddleware } from "~/middleware/auth-trace.server";
import { masterDataService } from "~/services/master-data.service";
import { receiptService } from "~/services/receipt.service";
import { CreateGoodsReceiptSchema, type CreateGoodsReceiptRequest } from "~/types/goods-receipt.types";
import { RECEIPT_TYPE_LABELS } from "~/constants/receipt.constants";
import { ReceiptItemsTable, type ReceiptItemRow } from "~/components/goods-receipt/receipt-items-table";
import { generateReceiptNumber } from "~/lib/formatters";
import { convertNumberToVietnameseWords } from "~/lib/number-to-words";
import { DatePicker } from "~/components/ui/date-picker";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { toast } from "~/components/ui/toast";
import { ArrowLeft, Save, CheckCircle, Loader2, FileSpreadsheet, AlertCircle } from "lucide-react";

export function meta() {
  return [
    { title: "Lập Phiếu Nhập Kho Mới | VIMES Inventory" },
    { name: "description", content: "Lập mới chứng từ Phiếu Nhập Kho Mẫu 01-VT, hạch toán Nợ/Có và tự động tính tổng tiền." },
  ];
}

export const middleware = [traceAndAuthMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
  const requestId = context.get(requestIdContext) || crypto.randomUUID();
  const [orgsRes, warehousesRes, productsRes] = await Promise.all([
    masterDataService.getOrganizations(requestId),
    masterDataService.getWarehouses(requestId),
    masterDataService.getProducts(undefined, requestId),
  ]);

  return {
    organizations: orgsRes.data || [],
    warehouses: warehousesRes.data || [],
    products: productsRes.data || [],
    defaultReceiptNumber: generateReceiptNumber(),
  };
}

export async function action({ request, context }: Route.ActionArgs) {
  const requestId = context.get(requestIdContext) || crypto.randomUUID();
  try {
    const rawData = await request.json();
    const parsedData = CreateGoodsReceiptSchema.parse(rawData);
    const response = await receiptService.createReceipt(parsedData, requestId);
    return data({ success: true, message: "Lập phiếu nhập kho thành công", receiptId: response.data?.receiptId });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const issueMsgs = error.issues.map((i) => \`\${i.path.join('.')}: \${i.message}\`).join("; ");
      return data({ success: false, message: \`Lỗi xác thực: \${issueMsgs}\` }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Không thể tạo phiếu nhập kho";
    return data({ success: false, message }, { status: 400 });
  }
}

export default function NewGoodsReceiptRoute() {
  const { organizations, warehouses, products, defaultReceiptNumber } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const navigate = useNavigate();

  const [organizationId, setOrganizationId] = useState(organizations[0]?.id || "");
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || "");
  const [receiptNumber, setReceiptNumber] = useState(defaultReceiptNumber);
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split("T")[0]);
  const [receiptType, setReceiptType] = useState<CreateGoodsReceiptRequest["receiptType"]>("PURCHASE");
  const [delivererName, setDelivererName] = useState("");
  const [docReference, setDocReference] = useState("");
  const [debitAccount, setDebitAccount] = useState("152");
  const [creditAccount, setCreditAccount] = useState("331");
  const [description, setDescription] = useState("");

  const [items, setItems] = useState<ReceiptItemRow[]>([
    {
      productId: products[0]?.id || "",
      productNameSnapshot: products[0]?.name || "Vật tư",
      unitSnapshot: products[0]?.unit || "Kg",
      docQty: 1,
      actualQty: 1,
      unitPrice: products[0]?.defaultPrice || 0,
      debitAccount: "152",
      creditAccount: "331",
      note: "",
    },
  ]);

  const totalAmount = items.reduce((acc, it) => acc + Number(it.actualQty || 0) * Number(it.unitPrice || 0), 0);
  const totalAmountWords = convertNumberToVietnameseWords(totalAmount);

  useEffect(() => {
    if (!fetcher.data) return;
    if (fetcher.data.success) {
      toast.add({ type: "success", title: "Thành công", description: \`Chứng từ \${receiptNumber} đã được ghi nhận.\` });
      navigate("/goods-receipts");
    } else {
      toast.add({ type: "error", title: "Lỗi", description: fetcher.data.message || "Vui lòng kiểm tra lại thông tin." });
    }
  }, [fetcher.data, navigate, receiptNumber]);

  const handleSubmit = (status: "DRAFT" | "CONFIRMED") => {
    const finalOrg = organizationId || organizations[0]?.id || "";
    const finalWh = warehouseId || warehouses[0]?.id || "";
    const finalDeliverer = delivererName.trim() || "Người giao hàng";

    if (!finalOrg || !finalWh) {
      toast.add({ type: "error", title: "Thiếu thông tin", description: "Vui lòng chọn Đơn vị và Kho tiếp nhận." });
      return;
    }

    const payload: CreateGoodsReceiptRequest = {
      receiptNumber,
      receiptDate,
      organizationId: finalOrg,
      warehouseId: finalWh,
      receiptType,
      delivererName: finalDeliverer,
      docReference: docReference || null,
      debitAccount: debitAccount || null,
      creditAccount: creditAccount || null,
      description: description || null,
      totalAmountWords: totalAmountWords || null,
      status,
      items: items.map((it) => ({
        productId: it.productId || products[0]?.id || "",
        productNameSnapshot: it.productNameSnapshot || "Vật tư",
        unitSnapshot: it.unitSnapshot || "Cái",
        docQty: Number(it.docQty),
        actualQty: Number(it.actualQty),
        unitPrice: Number(it.unitPrice),
        debitAccount: it.debitAccount || null,
        creditAccount: it.creditAccount || null,
        note: it.note || null,
      })),
    };

    fetcher.submit(payload as any, { method: "POST", encType: "application/json" });
  };

  const isSubmitting = fetcher.state === "submitting" || fetcher.state === "loading";

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-12">
      {fetcher.data && !fetcher.data.success && (
        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-2 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Không thể tạo phiếu nhập kho</p>
            <p>{fetcher.data.message}</p>
          </div>
        </div>
      )}

      <div className="flex flex-row items-center justify-between gap-3 pb-2 border-b">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="h-8 text-xs">
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Quay lại
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" type="button" disabled={isSubmitting} onClick={() => handleSubmit("DRAFT")} className="h-8 text-xs">
            {isSubmitting ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />} Lưu Nháp
          </Button>
          <Button size="sm" type="button" disabled={isSubmitting} onClick={() => handleSubmit("CONFIRMED")} className="h-8 text-xs">
            {isSubmitting ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5 mr-1.5" />} Nhập Kho
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="py-2.5 px-4 border-b">
          <CardTitle className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
            <FileSpreadsheet className="h-4 w-4 text-primary" /> Thông tin chứng từ
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Số phiếu *</Label>
            <Input value={receiptNumber} onChange={(e) => setReceiptNumber(e.target.value)} className="h-8 text-xs font-mono font-semibold text-primary" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Ngày lập *</Label>
            <DatePicker value={receiptDate} onChange={(val) => setReceiptDate(val || "")} className="w-full" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Đơn vị chủ quản *</Label>
            <Select value={organizationId} onValueChange={(val: string | null) => val && setOrganizationId(val)}>
              <SelectTrigger className="h-8 text-xs w-full"><SelectValue placeholder="Chọn đơn vị" /></SelectTrigger>
              <SelectContent className="min-w-[280px]">
                {organizations.map((org) => <SelectItem key={org.id} value={org.id} className="text-xs">{org.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Kho tiếp nhận *</Label>
            <Select value={warehouseId} onValueChange={(val: string | null) => val && setWarehouseId(val)}>
              <SelectTrigger className="h-8 text-xs w-full"><SelectValue placeholder="Chọn kho" /></SelectTrigger>
              <SelectContent className="min-w-[280px]">
                {warehouses.map((wh) => <SelectItem key={wh.id} value={wh.id} className="text-xs">{wh.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Người giao hàng *</Label>
            <Input value={delivererName} onChange={(e) => setDelivererName(e.target.value)} placeholder="Tên người giao" className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Số chứng từ gốc</Label>
            <Input value={docReference} onChange={(e) => setDocReference(e.target.value)} placeholder="HĐ, Lệnh..." className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Loại nghiệp vụ</Label>
            <Select value={receiptType} onValueChange={(val: string | null) => val && setReceiptType(val as CreateGoodsReceiptRequest["receiptType"])}>
              <SelectTrigger className="h-8 text-xs w-full"><SelectValue /></SelectTrigger>
              <SelectContent className="min-w-[240px]">
                {Object.entries(RECEIPT_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Định khoản (Nợ / Có)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input value={debitAccount} onChange={(e) => setDebitAccount(e.target.value)} placeholder="152" className="h-8 text-xs font-mono" />
              <Input value={creditAccount} onChange={(e) => setCreditAccount(e.target.value)} placeholder="331" className="h-8 text-xs font-mono" />
            </div>
          </div>
        </CardContent>
      </Card>

      <ReceiptItemsTable items={items} setItems={setItems} products={products} totalAmountWords={totalAmountWords} />
    </div>
  );
}
`,

  // 7. FORM EDIT (app/routes/_app.goods-receipts.$id_.edit.tsx)
  'app/routes/_app.goods-receipts.$id_.edit.tsx': `import { useState, useEffect } from "react";
import { useLoaderData, useFetcher, useNavigate, data } from "react-router";
import type { Route } from "./+types/_app.goods-receipts.$id_.edit";
import { z } from "zod";
import { requestIdContext, traceAndAuthMiddleware } from "~/middleware/auth-trace.server";
import { masterDataService } from "~/services/master-data.service";
import { receiptService } from "~/services/receipt.service";
import { UpdateGoodsReceiptSchema, type UpdateGoodsReceiptRequest } from "~/types/goods-receipt.types";
import { RECEIPT_TYPE_LABELS } from "~/constants/receipt.constants";
import { ReceiptItemsTable, type ReceiptItemRow } from "~/components/goods-receipt/receipt-items-table";
import { convertNumberToVietnameseWords } from "~/lib/number-to-words";
import { DatePicker } from "~/components/ui/date-picker";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { toast } from "~/components/ui/toast";
import { ArrowLeft, Save, Loader2, FileSpreadsheet, AlertCircle } from "lucide-react";

export function meta({ matches }: Route.MetaArgs) {
  const match = matches?.find((m) => m?.id === "routes/_app.goods-receipts.$id_.edit");
  const d = (match && "loaderData" in match ? match.loaderData : undefined) as { receipt?: { receiptNumber?: string } } | undefined;
  const number = d?.receipt?.receiptNumber || "Chứng Từ";
  return [
    { title: \`Chỉnh Sửa \${number} | VIMES Inventory\` },
    { name: "description", content: "Cập nhật thông tin chứng từ và điều chỉnh số lượng vật tư nhập kho." },
  ];
}

export const middleware = [traceAndAuthMiddleware];

export async function loader({ params, context }: Route.LoaderArgs) {
  const requestId = context.get(requestIdContext) || crypto.randomUUID();
  const id = params.id;
  if (!id) throw new Response("Mã chứng từ không hợp lệ", { status: 400 });

  const [receiptRes, orgsRes, warehousesRes, productsRes] = await Promise.all([
    receiptService.getReceiptById(id, requestId),
    masterDataService.getOrganizations(requestId),
    masterDataService.getWarehouses(requestId),
    masterDataService.getProducts(undefined, requestId),
  ]);

  if (!receiptRes.data) throw new Response("Chứng từ không tồn tại", { status: 404 });
  if (receiptRes.data.status === "CANCELLED") throw new Response("Không thể chỉnh sửa phiếu đã ở trạng thái CANCELLED", { status: 422 });

  return {
    receipt: receiptRes.data,
    organizations: orgsRes.data || [],
    warehouses: warehousesRes.data || [],
    products: productsRes.data || [],
  };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const requestId = context.get(requestIdContext) || crypto.randomUUID();
  const id = params.id;
  if (!id) return data({ success: false, message: "Mã chứng từ không hợp lệ" }, { status: 400 });

  try {
    const rawData = await request.json();
    const parsedData = UpdateGoodsReceiptSchema.parse(rawData);
    await receiptService.updateReceipt(id, parsedData, requestId);
    return data({ success: true, message: "Cập nhật chứng từ thành công" });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const issueMsgs = error.issues.map((i) => \`\${i.path.join('.')}: \${i.message}\`).join("; ");
      return data({ success: false, message: \`Lỗi xác thực: \${issueMsgs}\` }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Không thể cập nhật chứng từ";
    return data({ success: false, message }, { status: 400 });
  }
}

export default function EditGoodsReceiptRoute() {
  const { receipt, organizations, warehouses, products } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const navigate = useNavigate();

  const [organizationId, setOrganizationId] = useState(
    receipt.organizationId || receipt.organization?.id || organizations[0]?.id || ""
  );
  const [warehouseId, setWarehouseId] = useState(
    receipt.warehouseId || receipt.warehouse?.id || warehouses[0]?.id || ""
  );
  const [receiptDate, setReceiptDate] = useState(receipt.receiptDate || new Date().toISOString().split("T")[0]);
  const [receiptType, setReceiptType] = useState<UpdateGoodsReceiptRequest["receiptType"]>(
    receipt.receiptType || "PURCHASE"
  );
  const [delivererName, setDelivererName] = useState(receipt.delivererName || "");
  const [docReference, setDocReference] = useState(receipt.docReference || "");
  const [docDate, setDocDate] = useState(receipt.docDate || "");
  const [docOrigin, setDocOrigin] = useState(receipt.docOrigin || "");
  const [description, setDescription] = useState(receipt.description || "");
  const [debitAccount, setDebitAccount] = useState(receipt.debitAccount || "152");
  const [creditAccount, setCreditAccount] = useState(receipt.creditAccount || "331");

  const [items, setItems] = useState<ReceiptItemRow[]>(() => {
    const rawItems = receipt.items || [];
    if (rawItems.length === 0) {
      const p = products[0];
      return [{
        productId: p?.id || "",
        productNameSnapshot: p?.name || "Vật tư",
        unitSnapshot: p?.unit || "Cái",
        docQty: 1,
        actualQty: 1,
        unitPrice: p?.defaultPrice || 0,
        debitAccount: "152",
        creditAccount: "331",
        note: "",
      }];
    }
    return rawItems.map((i) => ({
      productId: i.productId || products[0]?.id || "",
      productNameSnapshot: i.productNameSnapshot || i.productName || products[0]?.name || "Vật tư",
      unitSnapshot: i.unitSnapshot || i.unit || products[0]?.unit || "Cái",
      docQty: Number(i.docQty) || 0,
      actualQty: Number(i.actualQty) || 0,
      unitPrice: Number(i.unitPrice) || 0,
      debitAccount: i.debitAccount || "152",
      creditAccount: i.creditAccount || "331",
      note: i.note || "",
    }));
  });

  const totalAmount = items.reduce((acc, it) => acc + Number(it.actualQty || 0) * Number(it.unitPrice || 0), 0);
  const totalAmountWords = convertNumberToVietnameseWords(totalAmount);

  useEffect(() => {
    if (!fetcher.data) return;
    if (fetcher.data.success) {
      toast.add({ type: "success", title: "Thành công", description: "Chứng từ đã được cập nhật." });
      navigate(\`/goods-receipts/\${receipt.id}\`);
    } else {
      toast.add({ type: "error", title: "Lỗi lưu dữ liệu", description: fetcher.data.message || "Vui lòng kiểm tra lại." });
    }
  }, [fetcher.data, navigate, receipt.id]);

  const handleUpdate = () => {
    const finalOrgId = organizationId || organizations[0]?.id || "";
    const finalWhId = warehouseId || warehouses[0]?.id || "";
    const finalDeliverer = delivererName.trim() || "Người giao hàng";

    if (!finalOrgId || !finalWhId) {
      toast.add({ type: "error", title: "Thiếu thông tin", description: "Vui lòng chọn Đơn vị và Kho tiếp nhận." });
      return;
    }

    const payload: UpdateGoodsReceiptRequest = {
      receiptDate,
      organizationId: finalOrgId,
      warehouseId: finalWhId,
      receiptType,
      delivererName: finalDeliverer,
      docReference: docReference || null,
      docDate: docDate || null,
      docOrigin: docOrigin || null,
      description: description || null,
      debitAccount: debitAccount || null,
      creditAccount: creditAccount || null,
      totalAmountWords: totalAmountWords || null,
      status: receipt.status as UpdateGoodsReceiptRequest["status"],
      items: items.map((it) => ({
        productId: it.productId || products[0]?.id || "",
        productNameSnapshot: it.productNameSnapshot || "Vật tư",
        unitSnapshot: it.unitSnapshot || "Cái",
        docQty: Number(it.docQty),
        actualQty: Number(it.actualQty),
        unitPrice: Number(it.unitPrice),
        debitAccount: it.debitAccount || null,
        creditAccount: it.creditAccount || null,
        note: it.note || null,
      })),
    };

    fetcher.submit(payload as any, { method: "POST", encType: "application/json" });
  };

  const isSubmitting = fetcher.state === "submitting" || fetcher.state === "loading";

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-12">
      {fetcher.data && !fetcher.data.success && (
        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-2 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Không thể lưu thay đổi</p>
            <p>{fetcher.data.message}</p>
          </div>
        </div>
      )}

      <div className="flex flex-row items-center justify-between gap-3 pb-2 border-b">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="h-8 text-xs">
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Quay lại
        </Button>
        <Button size="sm" type="button" onClick={handleUpdate} disabled={isSubmitting} className="h-8 text-xs">
          {isSubmitting ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
          {isSubmitting ? "Đang lưu..." : "Lưu Thay Đổi"}
        </Button>
      </div>

      <Card>
        <CardHeader className="py-2.5 px-4 border-b">
          <CardTitle className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
            <FileSpreadsheet className="h-4 w-4 text-primary" /> Thông tin chứng từ
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Số phiếu</Label>
            <Input value={receipt.receiptNumber} disabled className="h-8 text-xs font-mono bg-muted text-muted-foreground cursor-not-allowed" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Ngày lập *</Label>
            <DatePicker value={receiptDate} onChange={(val) => setReceiptDate(val || "")} className="w-full" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Đơn vị chủ quản *</Label>
            <Select value={organizationId} onValueChange={(val: string | null) => val && setOrganizationId(val)}>
              <SelectTrigger className="h-8 text-xs w-full"><SelectValue placeholder="Chọn đơn vị" /></SelectTrigger>
              <SelectContent className="min-w-[280px]">
                {organizations.map((org) => <SelectItem key={org.id} value={org.id} className="text-xs">{org.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Kho tiếp nhận *</Label>
            <Select value={warehouseId} onValueChange={(val: string | null) => val && setWarehouseId(val)}>
              <SelectTrigger className="h-8 text-xs w-full"><SelectValue placeholder="Chọn kho" /></SelectTrigger>
              <SelectContent className="min-w-[280px]">
                {warehouses.map((wh) => <SelectItem key={wh.id} value={wh.id} className="text-xs">{wh.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Người giao hàng *</Label>
            <Input value={delivererName} onChange={(e) => setDelivererName(e.target.value)} placeholder="Tên người giao" className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Số chứng từ gốc</Label>
            <Input value={docReference} onChange={(e) => setDocReference(e.target.value)} placeholder="HĐ, Lệnh..." className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Loại nghiệp vụ</Label>
            <Select value={receiptType} onValueChange={(val: string | null) => val && setReceiptType(val as UpdateGoodsReceiptRequest["receiptType"])}>
              <SelectTrigger className="h-8 text-xs w-full"><SelectValue /></SelectTrigger>
              <SelectContent className="min-w-[240px]">
                {Object.entries(RECEIPT_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Định khoản (Nợ / Có)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input value={debitAccount} onChange={(e) => setDebitAccount(e.target.value)} placeholder="152" className="h-8 text-xs font-mono" />
              <Input value={creditAccount} onChange={(e) => setCreditAccount(e.target.value)} placeholder="331" className="h-8 text-xs font-mono" />
            </div>
          </div>
        </CardContent>
      </Card>

      <ReceiptItemsTable items={items} setItems={setItems} products={products} totalAmountWords={totalAmountWords} />
    </div>
  );
}
`
};

Object.entries(filesToWrite).forEach(([filePath, content]) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content.trim() + '\n', 'utf-8');
  console.log(`✅ Đã cập nhật: ${filePath}`);
});

console.log('\n🎉 Hoàn tất! Hãy chạy: node setup_frontend.mjs && npm run typecheck');