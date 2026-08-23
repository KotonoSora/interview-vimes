import { Database } from "lucide-react";

import type { ReadinessResponse } from "~/services/system.service";

import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export interface DbPoolMetricsCardProps {
  readiness?: ReadinessResponse;
  data?: ReadinessResponse;
}

export function DbPoolMetricsCard({ readiness, data }: DbPoolMetricsCardProps) {
  const r = readiness || data;
  const isHealthy = r?.status === "READY" || r?.checks?.database === "HEALTHY";
  const poolTotal = r?.checks?.poolTotal ?? 10;
  const poolIdle = r?.checks?.poolIdle ?? 8;
  const poolWaiting = r?.checks?.poolWaiting ?? 0;

  return (
    <Card>
      <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-semibold flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" /> PostgreSQL Connection
          Pool
        </CardTitle>
        <Badge
          variant={isHealthy ? "default" : "destructive"}
          className="text-[10px]"
        >
          {isHealthy ? "HEALTHY" : "DOWN"}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded bg-muted/40">
          <p className="text-[10px] text-muted-foreground">Total Connections</p>
          <p className="text-sm font-bold font-mono text-foreground">
            {poolTotal}
          </p>
        </div>
        <div className="p-2 rounded bg-muted/40">
          <p className="text-[10px] text-muted-foreground">Idle Connections</p>
          <p className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {poolIdle}
          </p>
        </div>
        <div className="p-2 rounded bg-muted/40">
          <p className="text-[10px] text-muted-foreground">Waiting Queries</p>
          <p className="text-sm font-bold font-mono text-amber-600 dark:text-amber-400">
            {poolWaiting}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
