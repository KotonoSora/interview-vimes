// src/app.ts
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import healthRouter from "#/presentation/routes/health.routes";
import goodsReceiptRouter from "#/presentation/routes/goods-receipt.routes";
import masterDataRouter from "#/presentation/routes/master-data.routes";
import { requestIdMiddleware } from "#/presentation/middlewares/request-id.middleware";
import { configureSecurityMiddlewares } from "#/presentation/middlewares/security.middleware";
import { errorMiddleware } from "#/presentation/middlewares/error.middleware";
import { metricsMiddleware } from "#/infrastructure/monitoring/metrics";
import client from "prom-client";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(requestIdMiddleware);
app.use(morgan("combined"));

configureSecurityMiddlewares(app);

app.use(metricsMiddleware);
app.get("/metrics", async (_req, res) => {
  res.setHeader("Content-Type", client.register.contentType);
  res.send(await client.register.metrics());
});

app.use("/", healthRouter);
app.use("/api/v1/master-data", masterDataRouter);
app.use("/api/v1/goods-receipts", goodsReceiptRouter);

// Đăng ký Error Middleware sau tất cả các routes
app.use(errorMiddleware);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, HOST, () => {
    console.log(
      `[VIMES Inventory API] Server running on http://${HOST}:${PORT}`,
    );
  });
}

export default app;
