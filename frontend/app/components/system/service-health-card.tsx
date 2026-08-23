import { Activity } from "lucide-react";

import type { LivenessResponse } from "~/services/system.service";

import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export interface HealthData {
  status: "UP" | "DOWN";
  uptime?: number;
  timestamp?: string;
}

export interface ServiceHealthCardProps {
  health?: HealthData | LivenessResponse;
}

export function ServiceHealthCard({ health }: ServiceHealthCardProps) {
  const isUp = health?.status === "UP";
  const uptimeHours = health?.uptime
    ? (health.uptime / 3600).toFixed(1)
    : "0.0";

  return (
    <Card>
      <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" /> API Server Status
          (Liveness Probe)
        </CardTitle>
        <Badge
          variant={isUp ? "default" : "destructive"}
          className="text-[10px]"
        >
          {isUp ? "UP" : "DOWN"}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 grid grid-cols-2 gap-2 text-center">
        <div className="p-2 rounded bg-muted/40">
          <p className="text-[10px] text-muted-foreground">Uptime</p>
          <p className="text-sm font-bold font-mono text-foreground">
            {uptimeHours} hrs
          </p>
        </div>
        <div className="p-2 rounded bg-muted/40">
          <p className="text-[10px] text-muted-foreground">Last Check</p>
          <p className="text-xs font-medium font-mono text-muted-foreground truncate">
            {health?.timestamp
              ? new Date(health.timestamp).toLocaleTimeString("vi-VN")
              : "—"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
