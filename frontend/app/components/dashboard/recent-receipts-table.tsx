import { ArrowRight, Eye } from "lucide-react";
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

interface RecentReceipt {
  id: string;
  receiptNumber: string;
  receiptDate: string;
  warehouseName: string;
  delivererName: string;
  totalAmount: number;
  status: "DRAFT" | "CONFIRMED" | "CANCELLED";
}

interface RecentReceiptsTableProps {
  receipts?: RecentReceipt[];
}

export function RecentReceiptsTable({
  receipts = [],
}: RecentReceiptsTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <Badge className="bg-emerald-600 hover:bg-emerald-700">
            Đã nhập kho
          </Badge>
        );
      case "DRAFT":
        return <Badge variant="secondary">Bản nháp</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Đã hủy</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b">
        <div>
          <CardTitle className="text-base font-semibold">
            Chứng Từ Nhập Kho Mới Nhất
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Theo dõi luồng phát sinh vật tư trong tuần
          </p>
        </div>
        <Link
          to="/goods-receipts"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground py-1 px-2.5 rounded-md hover:bg-accent"
        >
          Xem tất cả <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[140px]">Số phiếu</TableHead>
              <TableHead className="w-[110px]">Ngày lập</TableHead>
              <TableHead>Kho tiếp nhận</TableHead>
              <TableHead>Người giao hàng</TableHead>
              <TableHead className="text-right">Tổng tiền (VNĐ)</TableHead>
              <TableHead className="text-center w-[120px]">
                Trạng thái
              </TableHead>
              <TableHead className="w-[60px] text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-28 text-center text-muted-foreground text-sm"
                >
                  Chưa có chứng từ nào phát sinh gần đây.
                </TableCell>
              </TableRow>
            ) : (
              receipts.slice(0, 5).map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-semibold text-primary">
                    {row.receiptNumber}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {row.receiptDate}
                  </TableCell>
                  <TableCell>{row.warehouseName || "—"}</TableCell>
                  <TableCell>{row.delivererName}</TableCell>
                  <TableCell className="text-right font-medium">
                    {new Intl.NumberFormat("vi-VN").format(
                      row.totalAmount || 0,
                    )}{" "}
                    ₫
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(row.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      to={`/goods-receipts/${row.id}`}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
                      title="Xem chi tiết"
                    >
                      <Eye className="h-4 w-4" />
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
