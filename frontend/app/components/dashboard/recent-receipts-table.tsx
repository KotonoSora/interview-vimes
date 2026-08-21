import { ArrowRight, Edit, Eye, FileText } from "lucide-react";
import { Link } from "react-router";

import type { ReceiptType } from "~/constants/receipt.constants";
import type { GoodsReceiptListItem } from "~/services/receipt.service";

import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { RECEIPT_TYPE_LABELS } from "~/constants/receipt.constants";
import { formatCurrencyVND } from "~/lib/formatters";

export interface RecentReceiptsTableProps {
  receipts?: GoodsReceiptListItem[];
}

export function RecentReceiptsTable({
  receipts = [],
}: RecentReceiptsTableProps) {
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
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 text-xs">
              <TableHead className="w-32 font-semibold">Số phiếu</TableHead>
              <TableHead className="w-24 font-semibold">Ngày lập</TableHead>
              <TableHead className="w-28 font-semibold">Loại nhập</TableHead>
              <TableHead className="font-semibold">Kho nhập</TableHead>
              <TableHead className="font-semibold">Người giao</TableHead>
              <TableHead className="w-28 font-semibold text-center">
                Bút toán
              </TableHead>
              <TableHead className="w-32 font-semibold text-right">
                Tổng tiền
              </TableHead>
              <TableHead className="w-24 font-semibold text-center">
                Trạng thái
              </TableHead>
              <TableHead className="w-20 text-center font-semibold">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-32 text-center text-xs text-muted-foreground"
                >
                  Chưa có dữ liệu phiếu nhập kho nào gần đây.
                </TableCell>
              </TableRow>
            ) : (
              receipts.slice(0, 10).map((r) => (
                <TableRow key={r.id} className="text-xs hover:bg-muted/20">
                  {/* 1. Số phiếu */}
                  <TableCell className="font-semibold text-primary font-mono whitespace-nowrap">
                    <Link
                      to={`/goods-receipts/${r.id}`}
                      className="hover:underline"
                    >
                      {r.receiptNumber}
                    </Link>
                  </TableCell>

                  {/* 2. Ngày lập */}
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {r.receiptDate}
                  </TableCell>

                  {/* 3. Loại nhập */}
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {RECEIPT_TYPE_LABELS[r.receiptType as ReceiptType] ||
                      r.receiptType ||
                      "Mua ngoài"}
                  </TableCell>

                  {/* 4. Kho nhập */}
                  <TableCell className="font-medium whitespace-nowrap">
                    {r.warehouseName || r.warehouse?.name || "—"}
                  </TableCell>

                  {/* 5. Người giao */}
                  <TableCell className="whitespace-nowrap">
                    {r.delivererName}
                  </TableCell>

                  {/* 6. Bút toán */}
                  <TableCell className="text-center font-mono text-[11px] whitespace-nowrap">
                    <span className="text-blue-600 dark:text-blue-400">
                      N:{r.debitAccount || "152"}
                    </span>
                    {" / "}
                    <span className="text-amber-600 dark:text-amber-400">
                      C:{r.creditAccount || "331"}
                    </span>
                  </TableCell>

                  {/* 7. Tổng tiền */}
                  <TableCell className="text-right font-mono font-semibold text-foreground whitespace-nowrap">
                    {formatCurrencyVND(r.totalAmount || 0)}
                  </TableCell>

                  {/* 8. Trạng thái */}
                  <TableCell className="text-center whitespace-nowrap">
                    <Badge
                      variant={
                        r.status === "CONFIRMED"
                          ? "default"
                          : r.status === "DRAFT"
                            ? "secondary"
                            : "destructive"
                      }
                      className="text-[10px]"
                    >
                      {r.status === "CONFIRMED"
                        ? "Đã nhập"
                        : r.status === "DRAFT"
                          ? "Nháp"
                          : "Đã hủy"}
                    </Badge>
                  </TableCell>

                  {/* 9. Thao tác */}
                  <TableCell className="text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <Link
                        to={`/goods-receipts/${r.id}`}
                        title="Xem chi tiết"
                        className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
                      {r.status !== "CANCELLED" && (
                        <Link
                          to={`/goods-receipts/${r.id}/edit`}
                          title="Chỉnh sửa"
                          className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
