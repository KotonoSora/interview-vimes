import { apiClient } from "~/lib/api-client";

export interface LivenessResponse {
  status: "UP" | "DOWN";
  uptime: number;
  timestamp: string;
}

export interface ReadinessResponse {
  status: string;
  checks?: {
    database: string;
    poolTotal?: number;
    poolIdle?: number;
    poolWaiting?: number;
    error?: string;
  };
  timestamp: string;
}

export const systemService = {
  async checkLiveness(requestId?: string): Promise<LivenessResponse> {
    return apiClient<LivenessResponse>("/healthz", {
      method: "GET",
      requestId,
    });
  },
  async checkReadiness(requestId?: string): Promise<ReadinessResponse> {
    return apiClient<ReadinessResponse>("/ready", { method: "GET", requestId });
  },
  async getPrometheusMetrics(requestId?: string): Promise<string> {
    return apiClient<string>("/metrics", { method: "GET", requestId });
  },
  async getLiveness(requestId?: string): Promise<LivenessResponse> {
    return this.checkLiveness(requestId);
  },
  async getReadiness(requestId?: string): Promise<ReadinessResponse> {
    return this.checkReadiness(requestId);
  },
  async getMetrics(requestId?: string): Promise<string> {
    return this.getPrometheusMetrics(requestId);
  },
};
