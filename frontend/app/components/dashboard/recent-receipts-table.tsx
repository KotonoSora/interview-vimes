import { ArrowRight, Edit, Eye, FileText } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router";

import type { ColumnDef } from "~/components/data-table/data-table";
import type { ReceiptType } from "~/constants/receipt.constants";
import type { GoodsReceiptListItem } from "~/services/receipt.service";

import { DataTable } from "~/components/data-table/data-table";
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { RECEIPT_TYPE_LABELS } from "~/constants/receipt.constants";
import { formatCurrencyVND } from "~/lib/formatters";

export interface RecentReceiptsTableProps {
  receipts?: GoodsReceiptListItem[];
}

export function RecentReceiptsTable({
  receipts = [],
}: RecentReceiptsTableProps) {
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
          <DataTableColumnHeader column={column} title="Người giao" />
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
                className="text-[10px]"
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
              title="Xem chi tiết"
              className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
            >
              <Eye className="h-3.5 w-3.5" />
            </Link>
            {row.original.status !== "CANCELLED" && (
              <Link
                to={`/goods-receipts/${row.original.id}/edit`}
                title="Chỉnh sửa"
                className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
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
    <Card className="shadow-sm">
      <CardHeader className="py-3 px-4 sm:px-6 border-b flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Phiếu Nhập Kho Gần Đây ({receipts.length})
        </CardTitle>
        <Link
          to="/goods-receipts"
          className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
        >
          Xem tất cả sổ theo dõi <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <DataTable
          columns={columns}
          data={receipts.slice(0, 10)}
          showPagination={false}
        />
      </CardContent>
    </Card>
  );
}
