import { Clock, DollarSign, FileCheck } from "lucide-react";

import { Card, CardContent } from "~/components/ui/card";
import { formatCurrencyVND } from "~/lib/formatters";

interface MetricProps {
  totalValue: number;
  totalReceipts: number;
  draftCount: number;
  confirmedCount: number;
}

export function MetricOverviewCards({ metrics }: { metrics: MetricProps }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* 1. Tổng giá trị đã nhập kho thực tế */}
      <Card className="border shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Tổng Giá Trị Đã Nhập Kho
            </p>
            <p className="text-xl font-bold font-mono text-primary">
              {formatCurrencyVND(metrics.totalValue)}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Từ{" "}
              <span className="font-semibold text-foreground">
                {metrics.confirmedCount}
              </span>{" "}
              chứng từ hoàn tất (CONFIRMED)
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Tổng chứng từ trong hệ thống */}
      <Card className="border shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Tổng Chứng Từ Nhập Kho
            </p>
            <p className="text-xl font-bold font-mono text-foreground">
              {metrics.totalReceipts}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                phiếu
              </span>
            </p>
            <p className="text-[11px] text-muted-foreground">
              Mẫu số 01 - VT (TT 200/2014/TT-BTC)
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <FileCheck className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Chứng từ nháp tồn đọng */}
      <Card
        className={`border shadow-sm ${metrics.draftCount > 0 ? "border-amber-500/40 bg-amber-500/5" : ""}`}
      >
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Phiếu Nháp Chờ Hoàn Tất
            </p>
            <p className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {metrics.draftCount}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                bản nháp (DRAFT)
              </span>
            </p>
            <p className="text-[11px] text-muted-foreground">
              {metrics.draftCount > 0
                ? "Chưa tính vào tổng giá trị kho"
                : "Không có phiếu tồn đọng"}
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
