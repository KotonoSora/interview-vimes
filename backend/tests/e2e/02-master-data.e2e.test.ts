// tests/e2e/02-master-data.e2e.test.ts
import { describe, it, expect } from "vitest";
import { BASE_URL, CLIENT_TRACE_ID, parseJson } from "./e2e-helper";

describe("[E2E] 2. Master Data Endpoints", () => {
  it("GET /master-data/organizations: should return list matching OrganizationListResponse", async () => {
    const res = await fetch(`${BASE_URL}/master-data/organizations`, {
      headers: { "X-Request-Id": CLIENT_TRACE_ID },
    });

    expect(res.status).toBe(200);
    const body = await parseJson(res);
    expect(body.success).toBe(true);
    expect(body.requestId).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);

    const org = body.data[0];
    expect(org.id).toBeDefined();
    expect(org.code).toBeDefined();
    expect(org.name).toBeDefined();
  });

  it("GET /master-data/warehouses: should return list matching WarehouseListResponse", async () => {
    const res = await fetch(`${BASE_URL}/master-data/warehouses`, {
      headers: { "X-Request-Id": CLIENT_TRACE_ID },
    });

    expect(res.status).toBe(200);
    const body = await parseJson(res);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);

    const wh = body.data[0];
    expect(wh.id).toBeDefined();
    expect(wh.code).toBeDefined();
    expect(wh.name).toBeDefined();
  });

  it("GET /master-data/products: should return catalog with search support", async () => {
    const res = await fetch(`${BASE_URL}/master-data/products?search=`, {
      headers: { "X-Request-Id": CLIENT_TRACE_ID },
    });

    expect(res.status).toBe(200);
    const body = await parseJson(res);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);

    const prod = body.data[0];
    expect(prod.id).toBeDefined();
    expect(prod.code).toBeDefined();
    expect(prod.name).toBeDefined();
    expect(prod.unit).toBeDefined();
    expect(typeof prod.defaultPrice).toBe("number");
  });
});
