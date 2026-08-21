import { Eye, FileText } from "lucide-react";
import { Link } from "react-router";

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
import { formatCurrencyVND } from "~/lib/formatters";

export interface RecentReceipt {
  id: string;
  receiptNumber: string;
  receiptDate: string;
  warehouseName?: string;
  delivererName: string;
  totalAmount: number;
  status: string;
}

export interface RecentReceiptsTableProps {
  receipts?: RecentReceipt[];
}

export function RecentReceiptsTable({
  receipts = [],
}: RecentReceiptsTableProps) {
  return (
    <Card className="lg:col-span-3">
      <CardHeader className="py-4 px-6 border-b flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Phiếu Nhập Kho Gần Đây
        </CardTitle>
        <Link
          to="/goods-receipts"
          className="text-xs text-primary hover:underline font-medium"
        >
          Xem tất cả sổ theo dõi &rarr;
        </Link>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-[130px]">Số phiếu</TableHead>
              <TableHead className="w-[110px]">Ngày lập</TableHead>
              <TableHead>Kho tiếp nhận</TableHead>
              <TableHead>Người giao hàng</TableHead>
              <TableHead className="text-right">Tổng tiền</TableHead>
              <TableHead className="text-center w-[120px]">
                Trạng thái
              </TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-28 text-center text-xs text-muted-foreground"
                >
                  Chưa có dữ liệu phiếu nhập kho nào gần đây.
                </TableCell>
              </TableRow>
            ) : (
              receipts.slice(0, 8).map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-semibold text-xs text-primary">
                    <Link
                      to={`/goods-receipts/${row.id}`}
                      className="hover:underline"
                    >
                      {row.receiptNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {row.receiptDate}
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    {row.warehouseName || "—"}
                  </TableCell>
                  <TableCell className="text-xs">{row.delivererName}</TableCell>
                  <TableCell className="text-right font-semibold text-xs">
                    {formatCurrencyVND(row.totalAmount)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        row.status === "CONFIRMED"
                          ? "default"
                          : row.status === "DRAFT"
                            ? "secondary"
                            : "destructive"
                      }
                      className="text-[10px]"
                    >
                      {row.status === "CONFIRMED"
                        ? "Đã nhập kho"
                        : row.status === "DRAFT"
                          ? "Bản nháp"
                          : "Đã hủy"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      to={`/goods-receipts/${row.id}`}
                      className="inline-flex items-center justify-center h-7 w-7 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Link>
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
