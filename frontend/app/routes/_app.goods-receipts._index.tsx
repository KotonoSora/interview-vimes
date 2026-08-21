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
  const page = Number(url.searchParams.get("page")) || 1;

  const [receiptsRes, warehousesRes] = await Promise.all([
    receiptService.getReceipts(
      { search, warehouseId, status, fromDate, toDate, page, limit: 50 },
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
    <div className="space-y-4 max-w-[1400px] mx-auto px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b">
        <div>
          <h1 className="text-lg font-bold">Sổ Theo Dõi Phiếu Nhập Kho</h1>
          <p className="text-xs text-muted-foreground">
            Mẫu số 01 - VT ban hành theo Thông tư 200/2014/TT-BTC
          </p>
        </div>
        <Link
          to="/goods-receipts/new"
          className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-xs font-medium shadow hover:bg-primary/90"
        >
          <Plus className="h-3.5 w-3.5" /> Lập Phiếu Mới
        </Link>
      </div>

      <ReceiptFilterToolbar
        warehouses={warehouses}
        currentFilters={currentFilters}
      />

      <Card>
        <CardHeader className="py-2.5 px-4 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> Danh Sách Chứng Từ (
            {receipts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 text-xs">
                <TableHead className="w-28 font-semibold">Số phiếu</TableHead>
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
                <TableHead className="w-20 text-center font-semibold"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="h-28 text-center text-xs text-muted-foreground"
                  >
                    Không có chứng từ nào.
                  </TableCell>
                </TableRow>
              ) : (
                receipts.map((r) => (
                  <TableRow key={r.id} className="text-xs hover:bg-muted/20">
                    <TableCell className="font-semibold text-primary font-mono">
                      <Link
                        to={`/goods-receipts/${r.id}`}
                        className="hover:underline"
                      >
                        {r.receiptNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.receiptDate}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {RECEIPT_TYPE_LABELS[r.receiptType as ReceiptType] ||
                        r.receiptType ||
                        "Mua ngoài"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {r.warehouseName || "—"}
                    </TableCell>
                    <TableCell>{r.delivererName}</TableCell>
                    <TableCell className="text-center font-mono text-[11px]">
                      <span className="text-blue-600">
                        N:{r.debitAccount || "152"}
                      </span>{" "}
                      /{" "}
                      <span className="text-amber-600">
                        C:{r.creditAccount || "331"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      {formatCurrencyVND(r.totalAmount || 0)}
                    </TableCell>
                    <TableCell className="text-center">
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
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          to={`/goods-receipts/${r.id}`}
                          className="p-1 text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                          to={`/goods-receipts/${r.id}/edit`}
                          className="p-1 text-muted-foreground hover:text-foreground"
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
