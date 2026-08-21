// tests/e2e/03-goods-receipts.e2e.test.ts
import { describe, it, expect, beforeAll } from "vitest";
import { BASE_URL, CLIENT_TRACE_ID, parseJson } from "./e2e-helper";

describe("[E2E] 3. Goods Receipts Lifecycle & Business Rules", () => {
  let createdReceiptId: string;
  let testOrgId: string;
  let testWarehouseId: string;
  let testProductId: string;

  const testReceiptNumber = `PNK-E2E-${Date.now()}`;

  beforeAll(async () => {
    const [orgRes, whRes, prodRes] = await Promise.all([
      fetch(`${BASE_URL}/master-data/organizations`, {
        headers: { "X-Request-Id": CLIENT_TRACE_ID },
      }),
      fetch(`${BASE_URL}/master-data/warehouses`, {
        headers: { "X-Request-Id": CLIENT_TRACE_ID },
      }),
      fetch(`${BASE_URL}/master-data/products`, {
        headers: { "X-Request-Id": CLIENT_TRACE_ID },
      }),
    ]);

    const orgData = await parseJson(orgRes);
    const whData = await parseJson(whRes);
    const prodData = await parseJson(prodRes);

    testOrgId = orgData.data[0].id;
    testWarehouseId = whData.data[0].id;
    testProductId = prodData.data[0].id;
  });

  it("POST /goods-receipts: should create receipt, calculate exact totalAmount and return HTTP 201", async () => {
    const payload = {
      receiptNumber: testReceiptNumber,
      receiptDate: "2026-08-18",
      actualReceivedDate: "2026-08-18",
      organizationId: testOrgId,
      warehouseId: testWarehouseId,
      receiptType: "PURCHASE",
      description: "Nhập kho theo OpenAPI E2E Test Suite",
      delivererName: "Nguyễn Văn Giao Hàng",
      docReference: "HĐ-E2E-99882",
      docDate: "2026-08-17",
      docOrigin: "Công ty Cổ phần Thép Việt Nhật",
      debitAccount: "152",
      creditAccount: "331",
      totalAmountWords: "Một triệu bốn trăm bảy mươi bảy nghìn năm trăm đồng",
      attachedDocCount: "1 hóa đơn GTGT gốc",
      creatorName: "Lê Văn Lập",
      storekeeperName: "Trần Văn Kho",
      chiefAccountantName: "Phạm Thị Trưởng",
      status: "CONFIRMED",
      items: [
        {
          productId: testProductId,
          productNameSnapshot: "Thép cuộn Phi 6",
          unitSnapshot: "Kg",
          docQty: 100.0,
          actualQty: 98.5,
          unitPrice: 15000.0,
          debitAccount: "152",
          creditAccount: "331",
          note: "Hao hụt 1.5kg do vận chuyển",
        },
      ],
    };

    const res = await fetch(`${BASE_URL}/goods-receipts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Request-Id": CLIENT_TRACE_ID,
      },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(201);
    const body = await parseJson(res);
    expect(body.success).toBe(true);
    createdReceiptId = body.data.receiptId || body.data.id;
    expect(createdReceiptId).toBeDefined();
    expect(body.data.totalAmount).toBe(1477500);
  });

  it("POST /goods-receipts: should return HTTP 409 Conflict when receiptNumber already exists", async () => {
    const duplicatePayload = {
      receiptNumber: testReceiptNumber,
      receiptDate: "2026-08-18",
      organizationId: testOrgId,
      warehouseId: testWarehouseId,
      receiptType: "PURCHASE",
      delivererName: "Nguyễn Văn B",
      items: [
        {
          productId: testProductId,
          productNameSnapshot: "Thép cuộn",
          unitSnapshot: "Kg",
          docQty: 10,
          actualQty: 10,
          unitPrice: 10000,
        },
      ],
    };

    const res = await fetch(`${BASE_URL}/goods-receipts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Request-Id": CLIENT_TRACE_ID,
      },
      body: JSON.stringify(duplicatePayload),
    });

    expect(res.status).toBe(409);
    const body = await parseJson(res);
    expect(body.success).toBe(false);
    expect(body.message).toContain("đã tồn tại");
  });

  it("POST /goods-receipts: should return HTTP 400 when body fails Zod Schema Validation", async () => {
    const invalidPayload = {
      receiptNumber: "",
      organizationId: "not-a-uuid",
    };

    const res = await fetch(`${BASE_URL}/goods-receipts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Request-Id": CLIENT_TRACE_ID,
      },
      body: JSON.stringify(invalidPayload),
    });

    expect(res.status).toBe(400);
    const body = await parseJson(res);
    expect(body.success).toBe(false);
    expect(body.errors).toBeDefined();
  });

  it("GET /goods-receipts/{id}: should return structured detail matching GoodsReceiptDetailResponse", async () => {
    const res = await fetch(`${BASE_URL}/goods-receipts/${createdReceiptId}`, {
      headers: { "X-Request-Id": CLIENT_TRACE_ID },
    });

    expect(res.status).toBe(200);
    const body = await parseJson(res);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(createdReceiptId);

    const actualReceiptNumber =
      body.data.receiptNumber || body.data.receipt_number;
    expect(actualReceiptNumber).toBe(testReceiptNumber);
    expect(body.data.organization).toBeDefined();
    expect(body.data.warehouse).toBeDefined();
    expect(body.data.items).toHaveLength(1);
  });

  it("GET /goods-receipts/{id}: should return HTTP 404 when ID does not exist", async () => {
    const nonExistingId = "00000000-0000-0000-0000-000000000000";
    const res = await fetch(`${BASE_URL}/goods-receipts/${nonExistingId}`, {
      headers: { "X-Request-Id": CLIENT_TRACE_ID },
    });

    expect(res.status).toBe(404);
    const body = await parseJson(res);
    expect(body.success).toBe(false);
    expect(body.message).toContain("Không tìm thấy");
  });

  it("GET /goods-receipts: should return paginated list matching GoodsReceiptListResponse", async () => {
    const res = await fetch(`${BASE_URL}/goods-receipts?page=1&limit=10`, {
      headers: { "X-Request-Id": CLIENT_TRACE_ID },
    });

    expect(res.status).toBe(200);
    const body = await parseJson(res);
    expect(body.success).toBe(true);
    expect(body.pagination).toBeDefined();
    expect(body.pagination.page).toBe(1);
    expect(body.pagination.limit).toBe(10);
    expect(Array.isArray(body.data)).toBe(true);
  });

  it("PUT /goods-receipts/{id}: should update voucher, recalculate stock and return HTTP 200", async () => {
    const updatePayload = {
      delivererName: "Nguyễn Văn Giao Hàng (Đã cập nhật)",
      items: [
        {
          productId: testProductId,
          productNameSnapshot: "Thép cuộn Phi 6",
          unitSnapshot: "Kg",
          docQty: 100.0,
          actualQty: 100.0,
          unitPrice: 15000.0,
          debitAccount: "152",
          creditAccount: "331",
          note: "Đã giao đủ 100kg",
        },
      ],
    };

    const res = await fetch(`${BASE_URL}/goods-receipts/${createdReceiptId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Request-Id": CLIENT_TRACE_ID,
      },
      body: JSON.stringify(updatePayload),
    });

    expect(res.status).toBe(200);
    const body = await parseJson(res);
    expect(body.success).toBe(true);
    expect(body.data.receiptId || body.data.id).toBe(createdReceiptId);
    expect(body.data.totalAmount).toBe(1500000);
  });

  it("DELETE /goods-receipts/{id}: should reverse inventory stock and mark voucher as CANCELLED", async () => {
    const res = await fetch(`${BASE_URL}/goods-receipts/${createdReceiptId}`, {
      method: "DELETE",
      headers: { "X-Request-Id": CLIENT_TRACE_ID },
    });

    expect(res.status).toBe(200);
    const body = await parseJson(res);
    expect(body.success).toBe(true);
    expect(body.data.receiptId || body.data.id).toBe(createdReceiptId);
    expect(body.data.action).toBe("CANCELLED_AND_REVERSED");
  });

  it("PUT /goods-receipts/{id}: should return HTTP 422 when attempting to edit a CANCELLED voucher", async () => {
    const editCancelledPayload = {
      delivererName: "Không thể sửa phiếu đã hủy",
      items: [
        {
          productId: testProductId,
          productNameSnapshot: "Thép cuộn",
          unitSnapshot: "Kg",
          docQty: 50,
          actualQty: 50,
          unitPrice: 10000,
        },
      ],
    };

    const res = await fetch(`${BASE_URL}/goods-receipts/${createdReceiptId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Request-Id": CLIENT_TRACE_ID,
      },
      body: JSON.stringify(editCancelledPayload),
    });

    expect(res.status).toBe(422);
    const body = await parseJson(res);
    expect(body.success).toBe(false);
    expect(body.message).toContain("CANCELLED");
  });
});
