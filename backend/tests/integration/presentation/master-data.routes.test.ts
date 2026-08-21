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

describe("[TDD - Integration] GET /api/v1/master-data/organizations", () => {
  const mockTraceId = "trace-test-uuid";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TC-API-ORG-01: should return HTTP 200 with standard response structure", async () => {
    const mockDbRows = [
      {
        id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        code: "VIMES-01",
        name: "Công ty Cổ phần Y Dược VIMES",
        department: "Ban Quản trị Kho Vận",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    (pool.query as any).mockResolvedValueOnce({ rows: mockDbRows });

    const response = await request(app)
      .get("/api/v1/master-data/organizations")
      .set("X-Request-Id", mockTraceId);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      requestId: mockTraceId,
      data: [
        {
          id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
          code: "VIMES-01",
          name: "Công ty Cổ phần Y Dược VIMES",
          department: "Ban Quản trị Kho Vận",
        },
      ],
    });
  });
});
