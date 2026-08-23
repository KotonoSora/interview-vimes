import { Activity } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export interface PerformanceMetricsCardProps {
  metricsText?: string;
  rawMetricsText?: string;
}

export function PerformanceMetricsCard({
  metricsText,
  rawMetricsText,
}: PerformanceMetricsCardProps) {
  const text = metricsText || rawMetricsText || "# Không có dữ liệu metrics";
  return (
    <Card>
      <CardHeader className="py-3 px-4 border-b">
        <CardTitle className="text-xs font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" /> Prometheus Metrics
          (OpenMetrics Format)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <pre className="p-4 bg-muted/30 text-[11px] font-mono overflow-x-auto max-h-96 whitespace-pre text-muted-foreground">
          {text}
        </pre>
      </CardContent>
    </Card>
  );
}
