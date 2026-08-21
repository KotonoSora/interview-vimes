import { Building2, Warehouse } from "lucide-react";
import { Link, useLoaderData } from "react-router";

import type { Route } from "./+types/_app._index";

import type { GoodsReceiptListItem } from "~/services/receipt.service";

import { MetricOverviewCards } from "~/components/dashboard/metric-overview-cards";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { PAGE_ROUTES } from "~/constants/navigation.constants";
import { formatCurrencyVND } from "~/lib/formatters";
import {
  requestIdContext,
  traceAndAuthMiddleware,
} from "~/middleware/auth-trace.server";
import { masterDataService } from "~/services/master-data.service";
import { receiptService } from "~/services/receipt.service";

export function meta() {
  return [
    { title: PAGE_ROUTES.HOME.metaTitle },
    { name: "description", content: PAGE_ROUTES.HOME.description },
  ];
}

export const middleware = [traceAndAuthMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
  const requestId = context.get(requestIdContext) || crypto.randomUUID();

  const [receiptsRes, warehousesRes, orgsRes] = await Promise.all([
    receiptService
      .getReceipts({ limit: 500 }, requestId)
      .catch(() => ({ data: [] })),
    masterDataService.getWarehouses(requestId).catch(() => ({ data: [] })),
    masterDataService.getOrganizations(requestId).catch(() => ({ data: [] })),
  ]);

  const list: GoodsReceiptListItem[] = receiptsRes.data || [];
  const warehouses = warehousesRes.data || [];
  const organizations = orgsRes.data || [];

  const confirmedList = list.filter((r) => r.status === "CONFIRMED");
  const draftList = list.filter((r) => r.status === "DRAFT");
  const totalAmount = confirmedList.reduce(
    (sum, r) => sum + Number(r.totalAmount || 0),
    0,
  );

  const warehouseStats = warehouses
    .map((wh) => {
      const whReceipts = list.filter(
        (r) => r.warehouseName === wh.name || r.warehouse?.name === wh.name,
      );
      const whConfirmed = whReceipts.filter((r) => r.status === "CONFIRMED");
      const whTotal = whConfirmed.reduce(
        (sum, r) => sum + Number(r.totalAmount || 0),
        0,
      );
      return {
        id: wh.id,
        name: wh.name,
        code: wh.code,
        location: wh.location,
        totalCount: whReceipts.length,
        confirmedCount: whConfirmed.length,
        totalAmount: whTotal,
      };
    })
    .sort((a, b) => b.totalAmount - a.totalAmount);

  const orgStats = organizations
    .map((org) => {
      const orgReceipts = list.filter(
        (r) =>
          (r as any).organizationId === org.id ||
          (r as any).organization?.id === org.id ||
          (r as any).organizationName === org.name ||
          (r as any).organization?.name === org.name,
      );
      const orgConfirmed = orgReceipts.filter((r) => r.status === "CONFIRMED");
      const orgTotal = orgConfirmed.reduce(
        (sum, r) => sum + Number(r.totalAmount || 0),
        0,
      );
      return {
        id: org.id,
        name: org.name,
        code: org.code,
        department: org.department,
        totalCount: orgReceipts.length,
        totalAmount: orgTotal,
      };
    })
    .sort((a, b) => b.totalAmount - a.totalAmount);

  return {
    metrics: {
      totalReceipts: list.length,
      totalValue: totalAmount,
      draftCount: draftList.length,
      confirmedCount: confirmedList.length,
    },
    warehouseStats,
    orgStats,
  };
}

export default function DashboardIndexRoute() {
  const { metrics, warehouseStats, orgStats } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-5 max-w-[1500px] mx-auto pb-8">
      <MetricOverviewCards metrics={metrics} />

      <Card className="border shadow-sm">
        <CardHeader className="py-3 px-4 border-b bg-card flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-semibold flex items-center gap-2">
            <Warehouse className="h-4 w-4 text-primary" /> Phân Bổ Theo Kho Tiếp
            Nhận
          </CardTitle>
          <span className="text-[11px] text-muted-foreground">
            Theo giá trị đã nhập kho
          </span>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {warehouseStats.map((wh) => {
              const share =
                metrics.totalValue > 0
                  ? Math.round((wh.totalAmount / metrics.totalValue) * 100)
                  : 0;
              return (
                <div
                  key={wh.id}
                  className="p-3.5 rounded-lg border bg-card space-y-2.5 text-xs shadow-xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold text-foreground">
                        {wh.name}
                      </span>
                      {wh.location && (
                        <p className="text-[10px] text-muted-foreground truncate">
                          {wh.location}
                        </p>
                      )}
                    </div>
                    <span className="font-mono text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                      {wh.code || "KHO"}
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1 border-t">
                    <div className="flex justify-between items-baseline font-mono">
                      <span className="text-sm font-bold text-foreground">
                        {formatCurrencyVND(wh.totalAmount)}
                      </span>
                      <span className="text-[11px] font-semibold text-primary">
                        {share}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-500"
                        style={{ width: `${share}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Đã nhập: {wh.confirmedCount} phiếu</span>
                      <span>Tổng phát sinh: {wh.totalCount} phiếu</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader className="py-3 px-4 border-b bg-card flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" /> Phân Bổ Theo Đơn Vị &
            Phòng Ban
          </CardTitle>
          <span className="text-[11px] text-muted-foreground">
            Theo pháp nhân lập phiếu
          </span>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {orgStats.map((org) => {
              const share =
                metrics.totalValue > 0
                  ? Math.round((org.totalAmount / metrics.totalValue) * 100)
                  : 0;
              return (
                <div
                  key={org.id}
                  className="p-3.5 rounded-lg border bg-card space-y-2.5 text-xs shadow-xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold text-foreground">
                        {org.name}
                      </span>
                      {org.department && (
                        <p className="text-[10px] text-muted-foreground truncate">
                          {org.department}
                        </p>
                      )}
                    </div>
                    <span className="font-mono text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {org.code || "DV"}
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1 border-t">
                    <div className="flex justify-between items-baseline font-mono">
                      <span className="text-sm font-bold text-foreground">
                        {formatCurrencyVND(org.totalAmount)}
                      </span>
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        {share}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-muted-foreground h-full rounded-full transition-all duration-500"
                        style={{ width: `${share}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Phát sinh: {org.totalCount} chứng từ</span>
                      <Link
                        to="/goods-receipts"
                        className="text-primary hover:underline"
                      >
                        Xem chứng từ
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
