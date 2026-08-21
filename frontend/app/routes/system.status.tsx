import { useLoaderData } from "react-router";

import { DbPoolMetricsCard } from "~/components/system/db-pool-metrics-card";
import { PerformanceMetricsCard } from "~/components/system/performance-metrics-card";
import { ServiceHealthCard } from "~/components/system/service-health-card";
import { withLoaderContext } from "~/lib/route-middleware.server";
import { systemService } from "~/services/system.service";

export const loader = withLoaderContext(async () => {
  const overview = await systemService.getSystemOverview();
  return {
    health: overview.health,
    readiness: overview.readiness,
    rawMetrics: overview.rawMetrics,
  };
});

export default function SystemStatusRoute() {
  const { health, readiness, rawMetrics } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-xl font-bold tracking-tight">
          Giám Sát Vận Hành Hệ Thống (Observability)
        </h1>
        <p className="text-xs text-muted-foreground">
          Theo dõi trực tiếp Liveness/Readiness probes, PostgreSQL Connection
          Pool và Prometheus Metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ServiceHealthCard
          health={health as any}
          readiness={readiness as any}
        />
        <DbPoolMetricsCard
          poolTotal={readiness?.checks?.poolTotal || 10}
          poolIdle={readiness?.checks?.poolIdle || 8}
          poolWaiting={readiness?.checks?.poolWaiting || 0}
        />
      </div>

      <PerformanceMetricsCard rawMetricsText={rawMetrics} />
    </div>
  );
}
