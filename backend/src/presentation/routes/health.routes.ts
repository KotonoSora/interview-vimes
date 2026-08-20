// src/presentation/routes/health.routes.ts
import { Router } from "express";
import { HealthController } from "#/presentation/controllers/health.controller";

const healthRouter = Router();

healthRouter.get("/healthz", HealthController.liveness);
healthRouter.get("/ready", HealthController.readiness);

export default healthRouter;
