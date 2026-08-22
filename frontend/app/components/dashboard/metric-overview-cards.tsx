import { Ban, CheckCircle2, Clock, FileText } from "lucide-react";

import { Card, CardContent } from "~/components/ui/card";

interface MetricProps {
  totalReceipts: number;
  draftCount: number;
  confirmedCount: number;
  cancelledCount: number;
}

export function MetricOverviewCards({ metrics }: { metrics: MetricProps }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tổng chứng từ */}
      <Card className="border shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Tổng Chứng Từ Phát Sinh
            </p>
            <p className="text-2xl font-bold font-mono text-foreground">
              {metrics.totalReceipts}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Phiếu Nhập Kho (Mẫu 01 - VT)
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Đã nhập kho */}
      <Card className="border shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Đã Nhập Kho (CONFIRMED)
            </p>
            <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {metrics.confirmedCount}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Chứng từ hợp lệ đã ghi sổ
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Phiếu nháp */}
      <Card
        className={`border shadow-sm ${metrics.draftCount > 0 ? "border-amber-500/40 bg-amber-500/5" : ""}`}
      >
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Bản Nháp (DRAFT)
            </p>
            <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {metrics.draftCount}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {metrics.draftCount > 0
                ? "Cần kiểm đếm & hoàn tất"
                : "Không có phiếu tồn"}
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Phiếu đã hủy */}
      <Card className="border shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Đã Hủy (CANCELLED)
            </p>
            <p className="text-2xl font-bold font-mono text-muted-foreground">
              {metrics.cancelledCount}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Chứng từ vô hiệu hóa
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0">
            <Ban className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
