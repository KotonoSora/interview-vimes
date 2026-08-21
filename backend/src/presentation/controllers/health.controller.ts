// src/presentation/controllers/health.controller.ts
import { Request, Response } from "express";

import { pool } from "#/infrastructure/database/postgres-pool";

export class HealthController {
  public static liveness(_req: Request, res: Response): void {
    res.status(200).json({
      status: "UP",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }

  public static async readiness(_req: Request, res: Response): Promise<void> {
    try {
      await pool.query("SELECT 1");
      res.status(200).json({
        status: "READY",
        checks: {
          database: "HEALTHY",
          poolTotal: pool.totalCount,
          poolIdle: pool.idleCount,
          poolWaiting: pool.waitingCount,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(503).json({
        status: "UNHEALTHY",
        checks: {
          database: "DOWN",
          error: error.message,
        },
        timestamp: new Date().toISOString(),
      });
    }
  }
}
