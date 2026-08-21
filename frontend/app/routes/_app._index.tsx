import { useLoaderData } from "react-router";

import type { Route } from "./+types/_app._index";

import { MetricOverviewCards } from "~/components/dashboard/metric-overview-cards";
import { QuickActions } from "~/components/dashboard/quick-actions";
import { RecentReceiptsTable } from "~/components/dashboard/recent-receipts-table";
import {
  requestIdContext,
  traceAndAuthMiddleware,
} from "~/middleware/auth-trace.server";
import { receiptService } from "~/services/receipt.service";

export const middleware = [traceAndAuthMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
  const requestId = context.get(requestIdContext) || crypto.randomUUID();

  const receiptsRes = await receiptService.getReceipts(
    { page: 1, limit: 10 },
    requestId,
  );
  const receipts = receiptsRes.data || [];

  const totalReceiptsMonth = receipts.length;
  const totalValueMonth = receipts
    .filter((r) => r.status === "CONFIRMED")
    .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  const pendingDraftCount = receipts.filter((r) => r.status === "DRAFT").length;

  return {
    metrics: {
      totalReceiptsMonth,
      totalValueMonth,
      pendingDraftCount,
      lowStockAlertCount: 0,
    },
    recentReceipts: receipts,
  };
}

export default function DashboardRoute() {
  const { metrics, recentReceipts } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold tracking-tight">
          Bảng Điều Khiển Quản Lý Kho
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Tổng quan chỉ số nhập kho, trạng thái chứng từ Mẫu 01-VT và luồng phê
          duyệt
        </p>
      </div>

      <MetricOverviewCards metrics={metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <RecentReceiptsTable receipts={recentReceipts} />
        <QuickActions />
      </div>
    </div>
  );
}
