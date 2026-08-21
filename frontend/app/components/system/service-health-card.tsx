import { CheckCircle2, Clock, Server, XCircle } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface HealthData {
  status: "UP" | "DOWN";
  uptime: number;
  timestamp: string;
}

interface ReadinessData {
  status: "READY" | "UNHEALTHY";
  checks?: {
    database: "HEALTHY" | "DOWN";
    poolTotal: number;
    poolIdle: number;
    poolWaiting: number;
    error?: string;
  };
  timestamp: string;
}

interface ServiceHealthCardProps {
  health?: HealthData;
  readiness?: ReadinessData;
}

export function ServiceHealthCard({
  health = {
    status: "UP",
    uptime: 3600.45,
    timestamp: new Date().toISOString(),
  },
  readiness = {
    status: "READY",
    checks: { database: "HEALTHY", poolTotal: 10, poolIdle: 8, poolWaiting: 0 },
    timestamp: new Date().toISOString(),
  },
}: ServiceHealthCardProps) {
  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d > 0 ? `${d}d ` : ""}${h}h ${m}m ${s}s`;
  };

  const isHealthy = health.status === "UP" && readiness.status === "READY";

  return (
    <Card>
      <CardHeader className="py-4 px-6 border-b flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-primary" />
          <CardTitle className="text-base font-semibold">
            Trạng Thái Dịch Vụ (Health & Probes)
          </CardTitle>
        </div>
        <Badge
          className={
            isHealthy
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
              : "bg-destructive/10 text-destructive border-destructive/20"
          }
          variant="outline"
        >
          {isHealthy ? "Hệ thống bình thường" : "Cảnh báo dịch vụ"}
        </Badge>
      </CardHeader>
      <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Liveness Probe Block */}
        <div className="border rounded-lg p-4 space-y-3 bg-muted/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Liveness Probe (/healthz)
            </span>
            {health.status === "UP" ? (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" /> UP
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-destructive font-medium">
                <XCircle className="h-3.5 w-3.5" /> DOWN
              </span>
            )}
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> Uptime:
              </span>
              <span className="font-mono text-foreground font-medium">
                {formatUptime(health.uptime)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Last Checked:</span>
              <span className="font-mono">
                {new Date(health.timestamp).toLocaleTimeString("vi-VN")}
              </span>
            </div>
          </div>
        </div>

        {/* Readiness Probe Block */}
        <div className="border rounded-lg p-4 space-y-3 bg-muted/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Readiness Probe (/ready)
            </span>
            {readiness.status === "READY" ? (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" /> READY
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-destructive font-medium">
                <XCircle className="h-3.5 w-3.5" /> UNHEALTHY
              </span>
            )}
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Database Connection:</span>
              <span
                className={`font-semibold ${
                  readiness.checks?.database === "HEALTHY"
                    ? "text-emerald-600"
                    : "text-destructive"
                }`}
              >
                {readiness.checks?.database || "UNKNOWN"}
              </span>
            </div>
            {readiness.checks?.error && (
              <div className="text-destructive text-[11px] italic truncate">
                Lỗi: {readiness.checks.error}
              </div>
            )}
            <div className="flex items-center justify-between">
              <span>Last Checked:</span>
              <span className="font-mono">
                {new Date(readiness.timestamp).toLocaleTimeString("vi-VN")}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
