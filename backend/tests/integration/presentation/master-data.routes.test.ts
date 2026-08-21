// tests/integration/presentation/master-data.routes.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "#/app";
import { pool } from "#/infrastructure/database/postgres-pool";

vi.mock("#/infrastructure/database/postgres-pool", () => ({
  pool: {
    query: vi.fn(),
  },
}));

describe("[Integration Test] Master Data Routes", () => {
  const mockTraceId = "trace-test-master-data-999";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /api/v1/master-data/organizations: trả về HTTP 200", async () => {
    (pool.query as any).mockResolvedValueOnce({
      rows: [
        {
          id: "org-uuid-1",
          code: "VIMES-01",
          name: "Công ty Cổ phần Y Dược VIMES",
          department: "Ban Quản trị Kho Vận",
          created_at: new Date("2026-08-20T00:00:00.000Z"),
        },
      ],
    });

    const response = await request(app)
      .get("/api/v1/master-data/organizations")
      .set("X-Request-Id", mockTraceId);

    expect(response.status).toBe(200);
    expect(response.body.data[0].code).toBe("VIMES-01");
    expect(response.body.requestId).toBe(mockTraceId);
  });

  it("GET /api/v1/master-data/warehouses: trả về HTTP 200", async () => {
    (pool.query as any).mockResolvedValueOnce({
      rows: [
        {
          id: "wh-uuid-1",
          organization_id: "org-uuid-1",
          code: "KHO-01",
          name: "Kho Dược Trung Tâm",
          location: "Hà Nội",
          is_active: true,
        },
      ],
    });

    const response = await request(app)
      .get("/api/v1/master-data/warehouses")
      .set("X-Request-Id", mockTraceId);

    expect(response.status).toBe(200);
    expect(response.body.data[0].code).toBe("KHO-01");
  });

  it("GET /api/v1/master-data/products: tìm kiếm sản phẩm trả về HTTP 200", async () => {
    (pool.query as any).mockResolvedValueOnce({
      rows: [
        {
          id: "prod-uuid-1",
          code: "VT-001",
          name: "Cồn y tế 70 độ",
          unit: "Chai",
          default_price: "15000.00",
          is_active: true,
          created_at: new Date("2026-08-20T00:00:00.000Z"),
        },
      ],
    });

    const response = await request(app)
      .get("/api/v1/master-data/products?search=C%E1%BB%93n")
      .set("X-Request-Id", mockTraceId);

    expect(response.status).toBe(200);
    expect(response.body.data[0].name).toBe("Cồn y tế 70 độ");
    expect(response.body.data[0].defaultPrice).toBe(15000);
  });
});
