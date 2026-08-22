import { useLoaderData, Link } from "react-router";
import type { Route } from "./+types/_app.goods-receipts._index";
import { requestIdContext, traceAndAuthMiddleware } from "~/middleware/auth-trace.server";
import { receiptService } from "~/services/receipt.service";
import { masterDataService } from "~/services/master-data.service";
import { PAGE_ROUTES } from "~/constants/navigation.constants";
import { ReceiptFilterToolbar } from "~/components/goods-receipt/receipt-filter-toolbar";
import { ReceiptTable } from "~/components/goods-receipt/receipt-table";
import { Button } from "~/components/ui/button";
import { Plus, FileSpreadsheet } from "lucide-react";

export function meta() {
  return [
    { title: PAGE_ROUTES.GOODS_RECEIPTS.metaTitle },
    { name: "description", content: PAGE_ROUTES.GOODS_RECEIPTS.description },
  ];
}

export const middleware = [traceAndAuthMiddleware];

export async function loader({ request, context }: Route.LoaderArgs) {
  const requestId = context.get(requestIdContext) || crypto.randomUUID();
  const url = new URL(request.url);

  // Đọc query parameters linh hoạt (hỗ trợ cả search và q)
  const search = url.searchParams.get("search") || url.searchParams.get("q") || "";
  const warehouseId = url.searchParams.get("warehouseId") || "";
  const status = url.searchParams.get("status") || "";
  const fromDate = url.searchParams.get("fromDate") || "";
  const toDate = url.searchParams.get("toDate") || "";
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.max(1, parseInt(url.searchParams.get("limit") || "10", 10));

  const [receiptsRes, warehousesRes] = await Promise.all([
    receiptService.getReceipts(
      {
        search: search || undefined,
        warehouseId: warehouseId && warehouseId !== "all" ? warehouseId : undefined,
        status: status && status !== "all" ? (status as any) : undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        page,
        limit,
      },
      requestId
    ),
    masterDataService.getWarehouses(requestId),
  ]);

  return {
    receipts: receiptsRes.data || [],
    pagination: receiptsRes.pagination || { page, limit, total: 0, totalPages: 1 },
    warehouses: warehousesRes.data || [],
    currentFilters: {
      search,
      warehouseId,
      status,
      fromDate,
      toDate,
    },
  };
}

export default function GoodsReceiptsListRoute() {
  const { receipts, pagination, warehouses, currentFilters } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto pb-12 pt-1">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" /> Sổ Phiếu Nhập Kho (Mẫu 01-VT)
          </h2>
          <p className="text-xs text-muted-foreground">
            Quản lý và theo dõi toàn bộ chứng từ nhập kho vật tư, hàng hóa phát sinh.
          </p>
        </div>
        <Link to="/goods-receipts/new">
          <Button className="h-9 font-semibold shadow-sm">
            <Plus className="h-4 w-4 mr-1.5" /> Lập Phiếu Mới (F2)
          </Button>
        </Link>
      </div>

      {/* Toolbar bộ lọc & tìm kiếm */}
      <ReceiptFilterToolbar warehouses={warehouses} currentFilters={currentFilters} />

      {/* Danh sách bảng chứng từ */}
      <ReceiptTable receipts={receipts} pagination={pagination} />
    </div>
  );
}
