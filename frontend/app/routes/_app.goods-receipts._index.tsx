import { Edit, Eye, FileText, Plus } from "lucide-react";
import { Link, useLoaderData } from "react-router";

import type { Route } from "./+types/_app.goods-receipts._index";

import type { ReceiptType } from "~/constants/receipt.constants";
import type { GetReceiptsQuery } from "~/services/receipt.service";

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
import { RECEIPT_TYPE_LABELS } from "~/constants/receipt.constants";
import { formatCurrencyVND } from "~/lib/formatters";
import {
  requestIdContext,
  traceAndAuthMiddleware,
} from "~/middleware/auth-trace.server";
import { masterDataService } from "~/services/master-data.service";
import { receiptService } from "~/services/receipt.service";

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
  const page = Number(url.searchParams.get("page")) || 1;

  const [receiptsRes, warehousesRes] = await Promise.all([
    receiptService.getReceipts(
      {
        search,
        warehouseId,
        status,
        fromDate,
        toDate,
        page,
        limit: 50,
      },
      requestId,
    ),
    masterDataService.getWarehouses(requestId),
  ]);

  return {
    receipts: receiptsRes.data || [],
    pagination: receiptsRes.pagination,
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

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
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
        <CardHeader className="py-3 px-6 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Danh Sách Chứng Từ Nhập Kho ({receipts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-[120px] font-semibold">
                  Số phiếu
                </TableHead>
                <TableHead className="w-[100px] font-semibold">
                  Ngày lập
                </TableHead>
                <TableHead className="w-[120px] font-semibold">
                  Loại nhập
                </TableHead>
                <TableHead className="min-w-[140px] font-semibold">
                  Kho tiếp nhận
                </TableHead>
                <TableHead className="min-w-[150px] font-semibold">
                  Người giao hàng
                </TableHead>
                <TableHead className="min-w-[120px] font-semibold">
                  Số CT gốc
                </TableHead>
                <TableHead className="w-[110px] font-semibold text-center">
                  Bút toán
                </TableHead>
                <TableHead className="w-[130px] font-semibold text-right">
                  Tổng tiền (VNĐ)
                </TableHead>
                <TableHead className="w-[110px] font-semibold text-center">
                  Trạng thái
                </TableHead>
                <TableHead className="w-[90px] text-center font-semibold">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="h-36 text-center text-xs text-muted-foreground"
                  >
                    Chưa có chứng từ nào được ghi nhận hoặc không tìm thấy theo
                    điều kiện lọc.
                  </TableCell>
                </TableRow>
              ) : (
                receipts.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {/* Số phiếu */}
                    <TableCell className="font-semibold text-xs text-primary whitespace-nowrap">
                      <Link
                        to={`/goods-receipts/${row.id}`}
                        className="hover:underline"
                      >
                        {row.receiptNumber}
                      </Link>
                    </TableCell>

                    {/* Ngày lập */}
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {row.receiptDate}
                    </TableCell>

                    {/* Loại nhập */}
                    <TableCell className="text-xs whitespace-nowrap">
                      <span className="text-muted-foreground">
                        {RECEIPT_TYPE_LABELS[row.receiptType as ReceiptType] ||
                          row.receiptType ||
                          "Mua ngoài"}
                      </span>
                    </TableCell>

                    {/* Kho tiếp nhận */}
                    <TableCell className="text-xs font-medium">
                      {row.warehouseName || "—"}
                    </TableCell>

                    {/* Người giao hàng */}
                    <TableCell className="text-xs text-foreground">
                      {row.delivererName || "—"}
                    </TableCell>

                    {/* Số CT gốc */}
                    <TableCell className="text-xs text-muted-foreground">
                      {row.docReference || "—"}
                    </TableCell>

                    {/* Bút toán Nợ/Có */}
                    <TableCell className="text-xs text-center font-mono whitespace-nowrap">
                      <span className="text-blue-600 dark:text-blue-400">
                        N:{row.debitAccount || "152"}
                      </span>
                      {" / "}
                      <span className="text-amber-600 dark:text-amber-400">
                        C:{row.creditAccount || "331"}
                      </span>
                    </TableCell>

                    {/* Tổng tiền */}
                    <TableCell className="text-right font-semibold text-xs whitespace-nowrap">
                      {formatCurrencyVND(row.totalAmount || 0)}
                    </TableCell>

                    {/* Trạng thái */}
                    <TableCell className="text-center whitespace-nowrap">
                      <Badge
                        variant={
                          row.status === "CONFIRMED"
                            ? "default"
                            : row.status === "DRAFT"
                              ? "secondary"
                              : "destructive"
                        }
                        className="text-[10px] px-2 py-0.5"
                      >
                        {row.status === "CONFIRMED"
                          ? "Đã nhập kho"
                          : row.status === "DRAFT"
                            ? "Bản nháp"
                            : "Đã hủy"}
                      </Badge>
                    </TableCell>

                    {/* Thao tác */}
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          to={`/goods-receipts/${row.id}`}
                          title="Xem chi tiết & In A4"
                          className="inline-flex items-center justify-center h-7 w-7 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                          to={`/goods-receipts/${row.id}/edit`}
                          title="Chỉnh sửa chứng từ"
                          className="inline-flex items-center justify-center h-7 w-7 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Link>
                      </div>
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
