// tests/unit/presentation/health.controller.test.ts
import { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { pool } from "#/infrastructure/database/postgres-pool";
import { HealthController } from "#/presentation/controllers/health.controller";

vi.mock("#/infrastructure/database/postgres-pool", () => ({
  pool: {
    query: vi.fn(),
    totalCount: 10,
    idleCount: 8,
    waitingCount: 0,
  },
}));

describe("[Presentation - Controller] HealthController", () => {
  let req: Request;
  let res: Response;
  let statusMock: any;
  let jsonMock: any;

  beforeEach(() => {
    req = {} as Request;
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    res = {
      status: statusMock,
      json: jsonMock,
    } as unknown as Response;
    vi.clearAllMocks();
  });

  it('TC-CTRL-HLTH-01 (/healthz): Phải trả về HTTP 200, status "UP", uptime và timestamp', () => {
    HealthController.liveness(req, res);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "UP",
        uptime: expect.any(Number),
        timestamp: expect.any(String),
      }),
    );
  });

  it('TC-CTRL-HLTH-02 (/ready - Success): Khi Database kết nối bình thường, phải trả về HTTP 200 và status "READY"', () => {
    vi.mocked(pool.query).mockResolvedValueOnce({
      rows: [{ "?column?": 1 }],
    } as any);

    return HealthController.readiness(req, res).then(() => {
      expect(pool.query).toHaveBeenCalledWith("SELECT 1");
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "READY",
          checks: {
            database: "HEALTHY",
            poolTotal: 10,
            poolIdle: 8,
            poolWaiting: 0,
          },
          timestamp: expect.any(String),
        }),
      );
    });
  });

  it('TC-CTRL-HLTH-03 (/ready - Failure): Khi Mock Database query ném lỗi, phải trả về HTTP 503 và status "UNHEALTHY"', () => {
    vi.mocked(pool.query).mockRejectedValueOnce(
      new Error("Connection terminated unexpectedly"),
    );

    return HealthController.readiness(req, res).then(() => {
      expect(pool.query).toHaveBeenCalledWith("SELECT 1");
      expect(statusMock).toHaveBeenCalledWith(503);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "UNHEALTHY",
          checks: {
            database: "DOWN",
            error: "Connection terminated unexpectedly",
          },
          timestamp: expect.any(String),
        }),
      );
    });
  });
});
