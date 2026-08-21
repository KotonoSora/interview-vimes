import { Plus } from "lucide-react";
import { Link, useLoaderData } from "react-router";

import type { Route } from "./+types/_app._index";

import type { GoodsReceiptListItem } from "~/services/receipt.service";

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

  try {
    const res = await receiptService.getReceipts(
      { page: 1, limit: 10 },
      requestId,
    );
    const list: GoodsReceiptListItem[] = res.data || [];

    const totalAmount = list
      .filter((r) => r.status === "CONFIRMED")
      .reduce((sum, r) => sum + Number(r.totalAmount || 0), 0);

    const totalCount = res.pagination?.totalItems ?? list.length;
    const confirmedCount = list.filter((r) => r.status === "CONFIRMED").length;
    const draftCount = list.filter((r) => r.status === "DRAFT").length;

    return {
      metrics: {
        totalReceiptsMonth: totalCount,
        totalValueMonth: totalAmount,
        pendingDraftCount: draftCount,
        lowStockAlertCount: 0,
        totalReceipts: totalCount,
        confirmedCount,
        draftCount,
        totalAmount,
      },
      recentReceipts: list,
    };
  } catch (error) {
    console.error("Lỗi tải dữ liệu Dashboard:", error);
    return {
      metrics: {
        totalReceiptsMonth: 0,
        totalValueMonth: 0,
        pendingDraftCount: 0,
        lowStockAlertCount: 0,
        totalReceipts: 0,
        confirmedCount: 0,
        draftCount: 0,
        totalAmount: 0,
      },
      recentReceipts: [],
    };
  }
}

export default function DashboardIndexRoute() {
  const { metrics, recentReceipts } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Không lặp lại title h1, chỉ có action bar nhanh nếu cần */}
      <div className="flex justify-end items-center">
        <Link
          to="/goods-receipts/new"
          className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-xs font-medium shadow hover:bg-primary/90 transition-colors h-8"
        >
          <Plus className="h-3.5 w-3.5" /> Lập Phiếu Mới
        </Link>
      </div>

      <MetricOverviewCards metrics={metrics} />
      <RecentReceiptsTable receipts={recentReceipts} />
    </div>
  );
}
