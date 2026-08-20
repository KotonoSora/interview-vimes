// src/infrastructure/monitoring/metrics.ts
import client from "prom-client";
import { Request, Response, NextFunction } from "express";

client.collectDefaultMetrics({ prefix: "vimes_inventory_" });

export const httpRequestsTotal = new client.Counter({
  name: "vimes_http_requests_total",
  help: "Tổng số lượng HTTP Requests",
  labelNames: ["method", "route", "status_code"],
});

export const httpRequestDuration = new client.Histogram({
  name: "vimes_http_request_duration_seconds",
  help: "Thời gian phản hồi API (Latency seconds)",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
});

export const dbTransactionErrors = new client.Counter({
  name: "vimes_db_transaction_errors_total",
  help: "Tổng số giao dịch Database Transaction bị Rollback",
  labelNames: ["operation"],
});

export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const start = process.hrtime();
  res.on("finish", () => {
    const duration = process.hrtime(start);
    const durationInSeconds = duration[0] + duration[1] / 1e9;
    const route = req.route ? req.route.path : req.path;

    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: res.statusCode,
    });

    httpRequestDuration.observe(
      {
        method: req.method,
        route,
        status_code: res.statusCode,
      },
      durationInSeconds,
    );
  });
  next();
}
