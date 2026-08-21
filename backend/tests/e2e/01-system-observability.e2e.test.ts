// tests/e2e/01-system-observability.e2e.test.ts
import { describe, it, expect } from "vitest";
import { ROOT_URL, parseJson } from "./e2e-helper";

describe("[E2E] 1. System & Observability Endpoints", () => {
  it("GET /healthz: Liveness Probe should return UP status with uptime", async () => {
    const res = await fetch(`${ROOT_URL}/healthz`);
    expect(res.status).toBe(200);

    const body = await parseJson(res);
    expect(body.status).toBe("UP");
    expect(typeof body.uptime).toBe("number");
    expect(body.timestamp).toBeDefined();
  });

  it("GET /ready: Readiness Probe should return DB & Pool healthy status", async () => {
    const res = await fetch(`${ROOT_URL}/ready`);
    expect(res.status).toBe(200);

    const body = await parseJson(res);
    expect(body.status).toBe("READY");
    expect(body.checks).toBeDefined();
    expect(body.checks.database).toBe("HEALTHY");
  });

  it("GET /metrics: Prometheus Exporter should expose metrics in text/plain format", async () => {
    const res = await fetch(`${ROOT_URL}/metrics`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/plain");

    const text = await res.text();
    expect(text).toContain("http_requests_total");
  });
});
