// tests/integration/presentation/goods-receipt.routes.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "#/app";
import { pool } from "#/infrastructure/database/postgres-pool";

vi.mock("#/infrastructure/database/postgres-pool", () => ({
  pool: {
    query: vi.fn(),
    connect: vi.fn(),
  },
}));

describe("[Integration Test - TDD] Goods Receipt Routes (/api/v1/goods-receipts)", () => {
  const mockTraceId = "trace-uuid-gr-999";
  const sampleReceiptId = "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/v1/goods-receipts", () => {
    it("TC-INT-GR-01: should return paginated list of non-cancelled goods receipts with HTTP 200", async () => {
      const mockCountResult = { rows: [{ total: "1" }] };
      const mockDataResult = {
        rows: [
          {
            id: sampleReceiptId,
            receipt_number: "PNK-2026-001",
            receipt_date: "2026-08-20T00:00:00.000Z",
            actual_received_date: "2026-08-20T00:00:00.000Z",
            receipt_type: "PURCHASE",
            deliverer_name: "Nguyễn Văn Giao",
            total_amount: "15000000",
            status: "CONFIRMED",
            created_at: "2026-08-20T08:00:00.000Z",
            organization: {
              id: "org-1",
              name: "Công ty Cổ phần VIMES",
              department: "Kho Vận",
            },
            warehouse: {
              id: "wh-1",
              name: "Kho Tổng Trung Tâm",
              location: "Hà Nội",
            },
          },
        ],
      };

      (pool.query as any)
        .mockResolvedValueOnce(mockCountResult)
        .mockResolvedValueOnce(mockDataResult);

      const response = await request(app)
        .get("/api/v1/goods-receipts?page=1&limit=10")
        .set("X-Request-Id", mockTraceId);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        requestId: mockTraceId,
        pagination: {
          page: 1,
          limit: 10,
          totalItems: 1,
          totalPages: 1,
        },
        data: mockDataResult.rows,
      });
    });
  });

  describe("GET /api/v1/goods-receipts/:id", () => {
    it("TC-INT-GR-02: should return detailed goods receipt with full item aggregations (Mẫu 01 - VT)", async () => {
      const mockDetailRow = {
        id: sampleReceiptId,
        receipt_number: "PNK-2026-001",
        receipt_date: "2026-08-20T00:00:00.000Z",
        actual_received_date: "2026-08-20T00:00:00.000Z",
        receipt_type: "PURCHASE",
        description: "Nhập kho lô vật tư y tế tháng 8",
        deliverer_name: "Nguyễn Văn Giao",
        doc_reference: "HĐ số 00129",
        doc_date: "2026-08-19T00:00:00.000Z",
        doc_origin: "Công ty Dược Phẩm TW",
        debit_account: "152",
        credit_account: "331",
        total_amount: "15000000",
        total_amount_words: "Mười lăm triệu đồng chẵn",
        attached_doc_count: "2",
        creator_name: "Trần Văn Lập",
        storekeeper_name: "Lê Văn Kho",
        chief_accountant_name: "Phạm Kế Toán",
        status: "CONFIRMED",
        created_at: "2026-08-20T08:00:00.000Z",
        updated_at: "2026-08-20T08:00:00.000Z",
        organization: {
          id: "org-1",
          name: "Công ty Cổ phần VIMES",
          department: "Kho Vận",
        },
        warehouse: {
          id: "wh-1",
          name: "Kho Tổng Trung Tâm",
          location: "Hà Nội",
        },
        items: [
          {
            id: "item-1",
            lineNo: 1,
            productId: "prod-1",
            productCode: "VT-001",
            productName: "Bông băng y tế tiệt trùng",
            unit: "Gói",
            docQty: 100,
            actualQty: 100,
            unitPrice: 150000,
            amount: 15000000,
            debitAccount: "152",
            creditAccount: "331",
            note: "Đạt chuẩn",
          },
        ],
      };

      (pool.query as any).mockResolvedValueOnce({ rows: [mockDetailRow] });

      const response = await request(app)
        .get(`/api/v1/goods-receipts/${sampleReceiptId}`)
        .set("X-Request-Id", mockTraceId);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        requestId: mockTraceId,
        data: mockDetailRow,
      });
    });

    it("TC-INT-GR-03: should return HTTP 404 when goods receipt is not found", async () => {
      (pool.query as any).mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get("/api/v1/goods-receipts/non-existent-uuid")
        .set("X-Request-Id", mockTraceId);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message.toLowerCase()).toContain("không tìm thấy");
    });
  });

  describe("POST /api/v1/goods-receipts", () => {
    it("TC-INT-GR-04: should return HTTP 400 when payload fails Zod schema validation", async () => {
      const invalidPayload = {
        receiptNumber: "",
        organizationId: "not-a-uuid",
      };

      const response = await request(app)
        .post("/api/v1/goods-receipts")
        .set("X-Request-Id", mockTraceId)
        .send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it("TC-INT-GR-05: should return HTTP 201 when creation is executed successfully in transaction", async () => {
      const mockClient = {
        query: vi.fn(),
        release: vi.fn(),
      };

      // Mock findByReceiptNumber trả về null (chưa tồn tại số phiếu)
      (pool.query as any).mockResolvedValueOnce({ rows: [] });
      (pool.connect as any).mockResolvedValueOnce(mockClient);

      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({
          rows: [
            {
              id: sampleReceiptId,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
        }) // INSERT header
        .mockResolvedValueOnce({ rows: [{ id: "item-uuid-1" }] }) // INSERT item
        .mockResolvedValueOnce({}) // UPDATE inventory_balances
        .mockResolvedValueOnce({}); // COMMIT

      const validPayload = {
        receiptNumber: "PNK-2026-002",
        organizationId: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        warehouseId: "8c2deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6e",
        receiptDate: "2026-08-20T00:00:00.000Z",
        actualReceivedDate: "2026-08-20T00:00:00.000Z",
        receiptType: "PURCHASE",
        delivererName: "Nguyễn Văn Giao",
        docReference: "HĐ 002",
        docDate: "2026-08-19T00:00:00.000Z",
        docOrigin: "NCC Dược Phẩm",
        debitAccount: "152",
        creditAccount: "331",
        description: "Nhập thuốc",
        totalAmountWords: "Mười lăm triệu đồng",
        attachedDocCount: "1",
        creatorName: "Lập Viên",
        storekeeperName: "Thủ Kho",
        chiefAccountantName: "Kế Toán",
        status: "CONFIRMED",
        items: [
          {
            lineNo: 1,
            productId: "7a3deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6f",
            productNameSnapshot: "Cồn y tế 70 độ",
            unitSnapshot: "Chai",
            docQty: 100,
            actualQty: 100,
            unitPrice: 150000,
            amount: 15000000,
            debitAccount: "152",
            creditAccount: "331",
          },
        ],
      };

      const response = await request(app)
        .post("/api/v1/goods-receipts")
        .set("X-Request-Id", mockTraceId)
        .send(validPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.receiptId || response.body.data.id).toBe(
        sampleReceiptId,
      );
      expect(response.body.data.totalAmount).toBe(15000000);
      expect(mockClient.release).toHaveBeenCalledTimes(1);
    });
  });

  describe("DELETE /api/v1/goods-receipts/:id", () => {
    it("TC-INT-GR-06: should return HTTP 200 with reversal/cancellation result", async () => {
      const mockClient = {
        query: vi.fn(),
        release: vi.fn(),
      };

      const mockReceiptDetail = {
        id: sampleReceiptId,
        receipt_number: "PNK-2026-001",
        receipt_date: new Date("2026-08-20"),
        organization_id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        warehouse_id: "8c2deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6e",
        receipt_type: "PURCHASE",
        deliverer_name: "Nguyễn Văn Giao",
        status: "CONFIRMED",
        items: [
          {
            id: "item-1",
            lineNo: 1,
            productId: "7a3deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6f",
            productNameSnapshot: "Cồn y tế 70 độ",
            unitSnapshot: "Chai",
            docQty: 100,
            actualQty: 100,
            unitPrice: 150000,
          },
        ],
      };

      // 1. Mock findById trong DeleteGoodsReceiptUseCase
      (pool.query as any).mockResolvedValueOnce({ rows: [mockReceiptDetail] });
      (pool.connect as any).mockResolvedValueOnce(mockClient);

      // 2. Mock chuỗi 8 câu lệnh trong updateWithTransaction
      mockClient.query
        .mockResolvedValueOnce({}) // 1. BEGIN
        .mockResolvedValueOnce({
          rows: [
            { id: sampleReceiptId, status: "CONFIRMED", warehouse_id: "wh-1" },
          ],
        }) // 2. SELECT for update (khóa bản ghi)
        .mockResolvedValueOnce({
          rows: [
            {
              product_id: "7a3deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6f",
              actual_qty: 100,
            },
          ],
        }) // 3. SELECT old items để hoàn kho
        .mockResolvedValueOnce({}) // 4. UPDATE inventory_balances (trừ tồn kho)
        .mockResolvedValueOnce({}) // 5. UPDATE goods_receipts (cập nhật header CANCELLED)
        .mockResolvedValueOnce({}) // 6. DELETE FROM goods_receipt_items
        .mockResolvedValueOnce({ rows: [{ id: "item-1" }] }) // 7. INSERT INTO goods_receipt_items
        .mockResolvedValueOnce({}); // 8. COMMIT

      const response = await request(app)
        .delete(`/api/v1/goods-receipts/${sampleReceiptId}`)
        .set("X-Request-Id", mockTraceId);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.action).toBe("CANCELLED_AND_REVERSED");
      expect(mockClient.release).toHaveBeenCalledTimes(1);
    });
  });
});
