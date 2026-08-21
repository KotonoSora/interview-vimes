import { apiClient } from "~/lib/api-client";

export interface LivenessResponse {
  status: "UP" | "DOWN";
  uptime: number;
  timestamp: string;
}

export interface ReadinessResponse {
  status: "READY" | "UNHEALTHY";
  checks: {
    database: "HEALTHY" | "DOWN";
    poolTotal: number;
    poolIdle: number;
    poolWaiting: number;
    error?: string;
  };
  timestamp: string;
}

export const systemService = {
  // Liveness Probe
  checkLiveness: async (requestId?: string) => {
    return apiClient<LivenessResponse>("/healthz", {
      method: "GET",
      requestId,
    });
  },

  // Readiness Probe (Kiểm tra kết nối CSDL và Pool)
  checkReadiness: async (requestId?: string) => {
    return apiClient<ReadinessResponse>("/ready", {
      method: "GET",
      requestId,
    });
  },

  // Prometheus Metrics Exporter
  getPrometheusMetrics: async (requestId?: string) => {
    return apiClient<string>("/metrics", {
      method: "GET",
      requestId,
    });
  },

  // Tải đồng thời toàn bộ chỉ số hệ thống phục vụ Dashboard Giám sát
  getSystemOverview: async () => {
    const [liveness, readiness, rawMetrics] = await Promise.allSettled([
      systemService.checkLiveness(),
      systemService.checkReadiness(),
      systemService.getPrometheusMetrics(),
    ]);

    return {
      health: liveness.status === "fulfilled" ? liveness.value : undefined,
      readiness: readiness.status === "fulfilled" ? readiness.value : undefined,
      rawMetrics:
        rawMetrics.status === "fulfilled" ? rawMetrics.value : undefined,
    };
  },
};
