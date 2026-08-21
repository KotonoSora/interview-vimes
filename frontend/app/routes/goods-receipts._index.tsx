import { Eye, Plus } from "lucide-react";
import { Link, useLoaderData } from "react-router";

import { ReceiptFilterToolbar } from "~/components/goods-receipt/receipt-filter-toolbar";
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
import { withLoaderContext } from "~/lib/route-middleware.server";
import { masterDataService } from "~/services/master-data.service";
import { receiptService } from "~/services/receipt.service";

export const loader = withLoaderContext(async (_req, { requestId, url }) => {
  const search = url.searchParams.get("search") || "";
  const warehouseId = url.searchParams.get("warehouseId") || "";
  const status = url.searchParams.get("status") || "";
  const fromDate = url.searchParams.get("fromDate") || "";
  const toDate = url.searchParams.get("toDate") || "";
  const page = Number(url.searchParams.get("page")) || 1;

  const [receiptsRes, warehousesRes] = await Promise.all([
    receiptService.getReceipts(
      {
        search: search || undefined,
        warehouseId:
          warehouseId === "all" ? undefined : warehouseId || undefined,
        status: status === "all" ? undefined : status || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        page,
        limit: 20,
      },
      requestId,
    ),
    masterDataService.getWarehouses(requestId),
  ]);

  return {
    receipts: receiptsRes.data || [],
    pagination: receiptsRes.pagination,
    warehouses: warehousesRes.data || [],
    currentFilters: { search, warehouseId, status, fromDate, toDate },
  };
});

export default function GoodsReceiptsIndexRoute() {
  const { receipts, warehouses, currentFilters } =
    useLoaderData<typeof loader>();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Sổ Theo Dõi Phiếu Nhập Kho
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Mẫu số 01 - VT ban hành theo Thông tư 200/2014/TT-BTC
          </p>
        </div>
        <Link
          to="/goods-receipts/new"
          className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Lập Phiếu Mới
        </Link>
      </div>

      <ReceiptFilterToolbar
        warehouses={warehouses}
        currentFilters={currentFilters}
      />

      <Card>
        <CardHeader className="py-4 px-6 border-b">
          <CardTitle className="text-sm font-semibold">
            Danh Sách Chứng Từ Phát Sinh
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-[140px]">Số phiếu</TableHead>
                <TableHead className="w-[120px]">Ngày lập</TableHead>
                <TableHead>Kho nhập</TableHead>
                <TableHead>Người giao hàng</TableHead>
                <TableHead className="text-right">Tổng thành tiền</TableHead>
                <TableHead className="text-center w-[130px]">
                  Trạng thái
                </TableHead>
                <TableHead className="w-[70px] text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-xs text-muted-foreground"
                  >
                    Không tìm thấy phiếu nhập kho nào phù hợp điều kiện lọc.
                  </TableCell>
                </TableRow>
              ) : (
                receipts.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-semibold text-xs text-primary">
                      {row.receiptNumber}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {row.receiptDate}
                    </TableCell>
                    <TableCell className="text-xs">
                      {row.warehouseName || "—"}
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      {row.delivererName}
                    </TableCell>
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
                        title="Xem chi tiết & In ấn"
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
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
    </div>
  );
}
