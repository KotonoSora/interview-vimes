import { Database, Hourglass, PauseCircle, Zap } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface DbPoolMetricsCardProps {
  poolTotal?: number;
  poolIdle?: number;
  poolWaiting?: number;
}

export function DbPoolMetricsCard({
  poolTotal = 10,
  poolIdle = 8,
  poolWaiting = 0,
}: DbPoolMetricsCardProps) {
  const poolActive = Math.max(0, poolTotal - poolIdle);
  const activePercentage =
    poolTotal > 0 ? Math.round((poolActive / poolTotal) * 100) : 0;

  return (
    <Card>
      <CardHeader className="py-4 px-6 border-b flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          <CardTitle className="text-base font-semibold">
            PostgreSQL Connection Pool
          </CardTitle>
        </div>
        <span className="text-xs font-mono text-muted-foreground">
          Max Pool: {poolTotal}
        </span>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Progress Bar thể hiện tỷ lệ sử dụng Pool */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span>Độ bão hòa Connection Pool</span>
            <span>{activePercentage}%</span>
          </div>
          <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden flex">
            <div
              className={`h-full transition-all duration-500 ${
                activePercentage > 80
                  ? "bg-rose-500"
                  : activePercentage > 50
                    ? "bg-amber-500"
                    : "bg-primary"
              }`}
              style={{ width: `${activePercentage}%` }}
            />
          </div>
        </div>

        {/* 3 Thẻ Metric nhỏ */}
        <div className="grid grid-cols-3 gap-3">
          <div className="border rounded-md p-3 text-center bg-muted/10 space-y-1">
            <div className="flex justify-center text-primary">
              <Zap className="h-4 w-4" />
            </div>
            <div className="text-lg font-bold">{poolActive}</div>
            <div className="text-[11px] text-muted-foreground">
              Active (Đang dùng)
            </div>
          </div>

          <div className="border rounded-md p-3 text-center bg-muted/10 space-y-1">
            <div className="flex justify-center text-emerald-600">
              <PauseCircle className="h-4 w-4" />
            </div>
            <div className="text-lg font-bold">{poolIdle}</div>
            <div className="text-[11px] text-muted-foreground">
              Idle (Sẵn sàng)
            </div>
          </div>

          <div className="border rounded-md p-3 text-center bg-muted/10 space-y-1">
            <div className="flex justify-center text-amber-600">
              <Hourglass className="h-4 w-4" />
            </div>
            <div className="text-lg font-bold">{poolWaiting}</div>
            <div className="text-[11px] text-muted-foreground">
              Waiting (Hàng đợi)
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
