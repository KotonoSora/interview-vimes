// src/app.ts
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import healthRouter from "#/presentation/routes/health.routes";
import goodsReceiptRouter from "#/presentation/routes/goods-receipt.routes";
import { requestIdMiddleware } from "#/presentation/middlewares/request-id.middleware";
import { configureSecurityMiddlewares } from "#/presentation/middlewares/security.middleware";
import { metricsMiddleware } from "#/infrastructure/monitoring/metrics";
import client from "prom-client";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

// 1. Phân tích cú pháp JSON Body
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// 2. Middleware ghi nhận Request ID và Log
app.use(requestIdMiddleware);
app.use(morgan("combined"));

// 3. Cấu hình bảo mật (Helmet, CORS, HPP, Rate Limit)
configureSecurityMiddlewares(app);

// 4. Monitoring Prometheus Metrics
app.use(metricsMiddleware);
app.get("/metrics", async (_req, res) => {
  res.setHeader("Content-Type", client.register.contentType);
  res.send(await client.register.metrics());
});

// 5. Health Check Probes (Root level cho Docker & K8s)
app.use("/", healthRouter);

// 6. API Nghiệp vụ Quản lý Phiếu Nhập Kho (Mẫu 01 - VT)
app.use("/api/v1/goods-receipts", goodsReceiptRouter);

// 7. Global Error Handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    const isProduction = process.env.NODE_ENV === "production";
    const statusCode = typeof err.status === "number" ? err.status : 500;

    res.status(statusCode).json({
      success: false,
      message:
        isProduction && statusCode === 500
          ? "Đã xảy ra lỗi trong quá trình xử lý chứng từ."
          : err.message || "Lỗi xử lý nội bộ hệ thống",
      requestId: req.id,
    });
  },
);

// 8. Khởi động HTTP Server
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, HOST, () => {
    console.log(
      `[VIMES Inventory API] Server running on http://${HOST}:${PORT}`,
    );
  });
}

export default app;
