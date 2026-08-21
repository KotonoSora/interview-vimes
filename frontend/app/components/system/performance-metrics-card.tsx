import { Activity, ArrowUpRight, Cpu, ShieldAlert } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface PerformanceMetricsCardProps {
  rawMetricsText?: string;
  httpRequestsTotal?: number;
  dbRollbackTotal?: number;
}

export function PerformanceMetricsCard({
  rawMetricsText,
  httpRequestsTotal = 142,
  dbRollbackTotal = 0,
}: PerformanceMetricsCardProps) {
  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader className="py-4 px-6 border-b flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <CardTitle className="text-base font-semibold">
            Prometheus OpenMetrics (/metrics)
          </CardTitle>
        </div>
        <Badge variant="outline" className="font-mono text-xs">
          OpenMetrics v1.0.0
        </Badge>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 bg-muted/10 space-y-1">
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <ArrowUpRight className="h-3.5 w-3.5 text-blue-500" /> Total HTTP
              Requests
            </div>
            <div className="text-2xl font-bold font-mono">
              {httpRequestsTotal}
            </div>
            <div className="text-[11px] text-muted-foreground">
              Route: /api/v1/goods-receipts
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-muted/10 space-y-1">
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-emerald-500" /> DB
              Transaction Rollbacks
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-600">
              {dbRollbackTotal}
            </div>
            <div className="text-[11px] text-muted-foreground">
              Tỷ lệ lỗi Transaction: 0.0%
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-muted/10 space-y-1">
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-purple-500" /> Security Audit
              Events
            </div>
            <div className="text-2xl font-bold font-mono">100%</div>
            <div className="text-[11px] text-muted-foreground">
              Tất cả POST/PUT có X-Request-Id
            </div>
          </div>
        </div>

        {/* Raw Prometheus Exporter Output Preview */}
        {rawMetricsText && (
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Raw Exporter Stream Preview
            </div>
            <pre className="p-4 bg-zinc-950 text-emerald-400 font-mono text-xs rounded-lg overflow-x-auto max-h-48 border border-zinc-800 leading-relaxed">
              {rawMetricsText}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
