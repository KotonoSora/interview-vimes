import { CheckCircle2, Clock, DollarSign, FileText } from "lucide-react";

import { Card, CardContent } from "~/components/ui/card";
import { formatCurrencyVND } from "~/lib/formatters";

export interface MetricsData {
  totalReceiptsMonth?: number;
  totalValueMonth?: number;
  pendingDraftCount?: number;
  lowStockAlertCount?: number;
  totalReceipts?: number;
  confirmedCount?: number;
  draftCount?: number;
  totalAmount?: number;
}

export interface MetricOverviewCardsProps {
  metrics?: MetricsData;
}

export function MetricOverviewCards({ metrics }: MetricOverviewCardsProps) {
  const totalCount = metrics?.totalReceiptsMonth ?? metrics?.totalReceipts ?? 0;
  const totalValue = metrics?.totalValueMonth ?? metrics?.totalAmount ?? 0;
  const confirmed =
    metrics?.confirmedCount ??
    totalCount - (metrics?.pendingDraftCount ?? metrics?.draftCount ?? 0);
  const draft = metrics?.pendingDraftCount ?? metrics?.draftCount ?? 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Card className="shadow-sm">
        <CardContent className="p-3.5 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-medium text-muted-foreground">
              Tổng chứng từ
            </p>
            <p className="text-lg font-bold font-mono text-foreground">
              {totalCount}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            <FileText className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-3.5 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-medium text-muted-foreground">
              Tổng giá trị (VNĐ)
            </p>
            <p className="text-base font-bold font-mono text-primary">
              {formatCurrencyVND(totalValue)}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <DollarSign className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-3.5 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-medium text-muted-foreground">
              Đã nhập kho
            </p>
            <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {confirmed}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-3.5 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-medium text-muted-foreground">
              Chờ xử lý / Nháp
            </p>
            <p className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
              {draft}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
            <Clock className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
