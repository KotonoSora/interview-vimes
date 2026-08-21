import { Plus } from "lucide-react";
import { Link, useLoaderData } from "react-router";

import type { Route } from "./+types/_app._index";

import { MetricOverviewCards } from "~/components/dashboard/metric-overview-cards";
import { RecentReceiptsTable } from "~/components/dashboard/recent-receipts-table";
import {
  requestIdContext,
  traceAndAuthMiddleware,
} from "~/middleware/auth-trace.server";
import { receiptService } from "~/services/receipt.service";

export function meta() {
  return [
    { title: "Bảng Điều Khiển Tổng Quan | VIMES Inventory" },
    {
      name: "description",
      content: "Tổng quan chỉ số nhập kho và trạng thái chứng từ phát sinh.",
    },
  ];
}

export const middleware = [traceAndAuthMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
  const requestId = context.get(requestIdContext) || crypto.randomUUID();
  const res = await receiptService.getReceipts({ limit: 10 }, requestId);
  const receipts = res.data || [];
  const totalAmount = receipts
    .filter((r) => r.status === "CONFIRMED")
    .reduce((sum, r) => sum + Number(r.totalAmount || 0), 0);

  return {
    metrics: {
      totalReceiptsMonth: res.pagination?.totalItems || receipts.length,
      totalValueMonth: totalAmount,
      pendingDraftCount: receipts.filter((r) => r.status === "DRAFT").length,
      lowStockAlertCount: 0,
      totalReceipts: res.pagination?.totalItems || receipts.length,
      confirmedCount: receipts.filter((r) => r.status === "CONFIRMED").length,
      draftCount: receipts.filter((r) => r.status === "DRAFT").length,
      totalAmount,
    },
    recentReceipts: receipts,
  };
}

export default function DashboardIndexRoute() {
  const { metrics, recentReceipts } = useLoaderData<typeof loader>();
  return (
    <div className="space-y-5 max-w-7xl mx-auto px-2 sm:px-4">
      <div className="flex justify-between items-center pb-2 border-b">
        <div>
          <h1 className="text-lg font-bold">Tổng Quan Nhập Kho</h1>
          <p className="text-xs text-muted-foreground">
            Theo dõi và quản lý dòng luân chuyển vật tư
          </p>
        </div>
        <Link
          to="/goods-receipts/new"
          className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-xs font-medium shadow hover:bg-primary/90"
        >
          <Plus className="h-3.5 w-3.5" /> Lập Phiếu
        </Link>
      </div>
      <MetricOverviewCards metrics={metrics} />
      <RecentReceiptsTable receipts={recentReceipts} />
    </div>
  );
}
