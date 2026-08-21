import { useLoaderData } from "react-router";

import type { Route } from "./+types/_app.system.status";

import type { LivenessResponse } from "~/services/system.service";

import { DbPoolMetricsCard } from "~/components/system/db-pool-metrics-card";
import { PerformanceMetricsCard } from "~/components/system/performance-metrics-card";
import { ServiceHealthCard } from "~/components/system/service-health-card";
import {
  requestIdContext,
  traceAndAuthMiddleware,
} from "~/middleware/auth-trace.server";
import { systemService } from "~/services/system.service";

export function meta() {
  return [
    { title: "Giám Sát Hệ Thống (Observability) | VIMES Inventory" },
    {
      name: "description",
      content: "Theo dõi Liveness/Readiness probes và Prometheus Metrics.",
    },
  ];
}

export const middleware = [traceAndAuthMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
  const requestId = context.get(requestIdContext) || crypto.randomUUID();
  const [health, readiness, metricsText] = await Promise.all([
    systemService.checkLiveness(requestId).catch((): LivenessResponse => ({
      status: "DOWN",
      uptime: 0,
      timestamp: new Date().toISOString(),
    })),
    systemService.checkReadiness(requestId).catch(() => ({
      status: "UNHEALTHY",
      checks: { database: "DOWN", poolTotal: 0, poolIdle: 0, poolWaiting: 0 },
      timestamp: new Date().toISOString(),
    })),
    systemService
      .getPrometheusMetrics(requestId)
      .catch(() => "# Không thể tải metrics"),
  ]);

  return { health, readiness, metricsText };
}

export default function SystemStatusRoute() {
  const { health, readiness, metricsText } = useLoaderData<typeof loader>();
  return (
    <div className="space-y-4 max-w-7xl mx-auto px-2 sm:px-4">
      <div>
        <h1 className="text-lg font-bold">Giám Sát & Vận Hành Hệ Thống</h1>
        <p className="text-xs text-muted-foreground">
          Theo dõi Liveness Probe, PostgreSQL Pool và Prometheus Metrics
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ServiceHealthCard health={health} />
        <DbPoolMetricsCard readiness={readiness} />
      </div>
      <PerformanceMetricsCard metricsText={metricsText} />
    </div>
  );
}
