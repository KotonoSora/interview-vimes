import { Edit, Eye, FileText, Plus } from "lucide-react";
import { useMemo } from "react";
import { Link, useLoaderData } from "react-router";

import type { Route } from "./+types/_app.goods-receipts._index";

import type { ColumnDef } from "~/components/data-table/data-table";
import type { ReceiptType } from "~/constants/receipt.constants";
import type {
  GetReceiptsQuery,
  GoodsReceiptListItem,
} from "~/services/receipt.service";

import { DataTable } from "~/components/data-table/data-table";
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header";
import { ReceiptFilterToolbar } from "~/components/goods-receipt/receipt-filter-toolbar";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { RECEIPT_TYPE_LABELS } from "~/constants/receipt.constants";
import { formatCurrencyVND } from "~/lib/formatters";
import {
  requestIdContext,
  traceAndAuthMiddleware,
} from "~/middleware/auth-trace.server";
import { masterDataService } from "~/services/master-data.service";
import { receiptService } from "~/services/receipt.service";

export function meta() {
  return [
    { title: "Sổ Theo Dõi Phiếu Nhập Kho | VIMES Inventory" },
    {
      name: "description",
      content: "Danh sách, tìm kiếm và lọc chứng từ Phiếu Nhập Kho Mẫu 01-VT.",
    },
  ];
}

export const middleware = [traceAndAuthMiddleware];

export async function loader({ request, context }: Route.LoaderArgs) {
  const requestId = context.get(requestIdContext) || crypto.randomUUID();
  const url = new URL(request.url);

  const search = url.searchParams.get("search") || undefined;
  const rawWarehouseId = url.searchParams.get("warehouseId");
  const warehouseId =
    rawWarehouseId && rawWarehouseId !== "all" ? rawWarehouseId : undefined;
  const rawStatus = url.searchParams.get("status");
  const status =
    rawStatus && ["DRAFT", "CONFIRMED", "CANCELLED"].includes(rawStatus)
      ? (rawStatus as GetReceiptsQuery["status"])
      : undefined;
  const fromDate = url.searchParams.get("fromDate") || undefined;
  const toDate = url.searchParams.get("toDate") || undefined;

  const [receiptsRes, warehousesRes] = await Promise.all([
    receiptService.getReceipts(
      { search, warehouseId, status, fromDate, toDate, limit: 100 },
      requestId,
    ),
    masterDataService.getWarehouses(requestId),
  ]);

  return {
    receipts: receiptsRes.data || [],
    warehouses: warehousesRes.data || [],
    currentFilters: {
      search: search || "",
      warehouseId: rawWarehouseId || "",
      status: rawStatus || "",
      fromDate: fromDate || "",
      toDate: toDate || "",
    },
  };
}

export default function GoodsReceiptsIndexRoute() {
  const { receipts, warehouses, currentFilters } =
    useLoaderData<typeof loader>();

  const columns: ColumnDef<GoodsReceiptListItem>[] = useMemo(
    () => [
      {
        accessorKey: "receiptNumber",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Số phiếu" />
        ),
        cell: ({ row }) => (
          <Link
            to={`/goods-receipts/${row.original.id}`}
            className="font-semibold text-primary font-mono hover:underline whitespace-nowrap"
          >
            {row.original.receiptNumber}
          </Link>
        ),
      },
      {
        accessorKey: "receiptDate",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Ngày lập" />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground whitespace-nowrap">
            {row.original.receiptDate}
          </span>
        ),
      },
      {
        accessorKey: "receiptType",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Loại nhập" />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground whitespace-nowrap">
            {RECEIPT_TYPE_LABELS[row.original.receiptType as ReceiptType] ||
              row.original.receiptType ||
              "Mua ngoài"}
          </span>
        ),
      },
      {
        accessorKey: "warehouseName",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Kho nhập" />
        ),
        cell: ({ row }) => (
          <span className="font-medium whitespace-nowrap">
            {row.original.warehouseName || row.original.warehouse?.name || "—"}
          </span>
        ),
      },
      {
        accessorKey: "delivererName",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Người giao hàng" />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap">
            {row.original.delivererName}
          </span>
        ),
      },
      {
        id: "accounts",
        header: () => <div className="text-center">Bút toán</div>,
        cell: ({ row }) => (
          <div className="text-center font-mono text-[11px] whitespace-nowrap">
            <span className="text-blue-600 dark:text-blue-400">
              N:{row.original.debitAccount || "152"}
            </span>
            {" / "}
            <span className="text-amber-600 dark:text-amber-400">
              C:{row.original.creditAccount || "331"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "totalAmount",
        header: ({ column }) => (
          <div className="text-right">
            <DataTableColumnHeader
              column={column}
              title="Tổng tiền"
              className="justify-end"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-right font-mono font-semibold whitespace-nowrap text-foreground">
            {formatCurrencyVND(row.original.totalAmount || 0)}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <div className="text-center">
            <DataTableColumnHeader
              column={column}
              title="Trạng thái"
              className="justify-center"
            />
          </div>
        ),
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <div className="text-center whitespace-nowrap">
              <Badge
                variant={
                  status === "CONFIRMED"
                    ? "default"
                    : status === "DRAFT"
                      ? "secondary"
                      : "destructive"
                }
                className="text-[10px] px-2 py-0.5"
              >
                {status === "CONFIRMED"
                  ? "Đã nhập"
                  : status === "DRAFT"
                    ? "Nháp"
                    : "Đã hủy"}
              </Badge>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-center">Thao tác</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-1">
            <Link
              to={`/goods-receipts/${row.original.id}`}
              title="Xem chi tiết & In"
              className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
            >
              <Eye className="h-3.5 w-3.5" />
            </Link>
            {row.original.status !== "CANCELLED" && (
              <Link
                to={`/goods-receipts/${row.original.id}/edit`}
                title="Chỉnh sửa"
                className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
              >
                <Edit className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-3 max-w-[1500px] mx-auto">
      <ReceiptFilterToolbar
        warehouses={warehouses}
        currentFilters={currentFilters}
      />

      <Card className="shadow-sm border">
        <CardHeader className="py-2.5 px-4 border-b flex flex-row items-center justify-between bg-card">
          <CardTitle className="text-xs font-semibold flex items-center gap-2 text-foreground">
            <FileText className="h-4 w-4 text-primary" />
            Danh Sách Chứng Từ ({receipts.length})
          </CardTitle>
          <Link
            to="/goods-receipts/new"
            className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1 rounded text-xs font-medium shadow-sm hover:bg-primary/90 transition-colors h-7"
          >
            <Plus className="h-3.5 w-3.5" /> Lập Phiếu Mới
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          <DataTable columns={columns} data={receipts} pageSize={20} />
        </CardContent>
      </Card>
    </div>
  );
}
