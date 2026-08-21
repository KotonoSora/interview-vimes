import { useLoaderData } from "react-router";

import { MetricOverviewCards } from "~/components/dashboard/metric-overview-cards";
import { QuickActions } from "~/components/dashboard/quick-actions";
import { RecentReceiptsTable } from "~/components/dashboard/recent-receipts-table";
import { withLoaderContext } from "~/lib/route-middleware.server";
import { receiptService } from "~/services/receipt.service";

export const loader = withLoaderContext(async (_req, { requestId }) => {
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
      lowStockAlertCount: 2,
    },
    recentReceipts: receipts,
  };
});

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
