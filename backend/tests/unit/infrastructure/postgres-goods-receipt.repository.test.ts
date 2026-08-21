// tests/unit/infrastructure/postgres-goods-receipt.repository.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PostgresGoodsReceiptRepository } from "#/infrastructure/repositories/postgres-goods-receipt.repository";
import { pool } from "#/infrastructure/database/postgres-pool";
import { GoodsReceipt } from "#/domain/entities/goods-receipt.entity";
import { ReceiptItem } from "#/domain/entities/receipt-item.entity";
import { Money } from "#/domain/value-objects/money.vo";
import { Quantity } from "#/domain/value-objects/quantity.vo";

vi.mock("#/infrastructure/database/postgres-pool", () => ({
  pool: {
    query: vi.fn(),
    connect: vi.fn(),
  },
}));

describe("[Unit Test] PostgresGoodsReceiptRepository", () => {
  let repo: PostgresGoodsReceiptRepository;
  const mockClient = {
    query: vi.fn(),
    release: vi.fn(),
  };

  const sampleReceipt = new GoodsReceipt({
    id: "receipt-1",
    receiptNumber: "PNK-001",
    receiptDate: new Date("2026-08-20"),
    organizationId: "org-1",
    warehouseId: "wh-1",
    receiptType: "PURCHASE",
    delivererName: "Nguyễn Văn A",
    status: "CONFIRMED",
    items: [
      new ReceiptItem({
        lineNo: 1,
        productId: "prod-1",
        productNameSnapshot: "Vật tư",
        unitSnapshot: "Cái",
        docQty: new Quantity(10),
        actualQty: new Quantity(10),
        unitPrice: new Money(1000),
      }),
    ],
  });

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new PostgresGoodsReceiptRepository();
    (pool.connect as any).mockResolvedValue(mockClient);
  });

  it("TC-REPO-01: Phải rollback transaction khi saveWithTransaction gặp lỗi DB", async () => {
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockRejectedValueOnce(new Error("Database connection lost")); // INSERT error

    await expect(repo.saveWithTransaction(sampleReceipt)).rejects.toThrow(
      "Database connection lost",
    );
    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalled();
  });

  it("TC-REPO-02: Phải rollback transaction khi updateWithTransaction gặp lỗi DB", async () => {
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({
        rows: [{ id: "receipt-1", status: "CONFIRMED", warehouse_id: "wh-1" }],
      }) // SELECT FOR UPDATE
      .mockRejectedValueOnce(new Error("Update failed"));

    await expect(repo.updateWithTransaction(sampleReceipt)).rejects.toThrow(
      "Update failed",
    );
    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalled();
  });

  it("TC-REPO-03: Phải rollback khi deleteOrCancel gặp lỗi", async () => {
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockRejectedValueOnce(new Error("Query error"));

    await expect(repo.deleteOrCancel("receipt-1")).rejects.toThrow(
      "Query error",
    );
    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalled();
  });

  it("TC-REPO-04: Phải thực thi deleteById và update đúng cách", async () => {
    vi.spyOn(repo, "deleteOrCancel").mockResolvedValueOnce({
      action: "HARD_DELETED",
    });
    await repo.deleteById("receipt-1");
    expect(repo.deleteOrCancel).toHaveBeenCalledWith("receipt-1");

    vi.spyOn(repo, "updateWithTransaction").mockResolvedValueOnce(
      sampleReceipt,
    );
    await repo.update("receipt-1", sampleReceipt);
    expect(repo.updateWithTransaction).toHaveBeenCalled();
  });

  it("TC-REPO-05: Phải trả về null khi findByReceiptNumber không tìm thấy dữ liệu", async () => {
    (pool.query as any).mockResolvedValueOnce({ rows: [] });
    const res = await repo.findByReceiptNumber("NON_EXIST");
    expect(res).toBeNull();
  });

  it("TC-REPO-PAGINATION: Phải áp dụng đầy đủ các query param filters (fromDate, toDate, warehouseId, status, search)", async () => {
    (pool.query as any)
      .mockResolvedValueOnce({ rows: [{ total: "5" }] }) // count query
      .mockResolvedValueOnce({ rows: [{ id: "gr-1" }] }); // data query

    const result = await repo.findPaginated({
      page: 1,
      limit: 10,
      fromDate: "2026-08-01",
      toDate: "2026-08-30",
      warehouseId: "wh-1",
      status: "CONFIRMED",
      search: "PNK-001",
    });

    expect(result.totalItems).toBe(5);
    expect(result.data).toHaveLength(1);
    expect(pool.query).toHaveBeenCalledTimes(2);
  });

  it("TC-REPO-BRANCH-01: saveWithTransaction phải xử lý đúng khi status là DRAFT (không cộng dồn tồn kho)", async () => {
    const draftReceipt = new GoodsReceipt({
      receiptNumber: "PNK-DRAFT-01",
      receiptDate: new Date("2026-08-20"),
      organizationId: "org-1",
      warehouseId: "wh-1",
      receiptType: "PURCHASE",
      delivererName: "Nguyễn Văn A",
      status: "DRAFT",
      items: [
        new ReceiptItem({
          lineNo: 1,
          productId: "prod-1",
          productNameSnapshot: "Vật tư",
          unitSnapshot: "Cái",
          docQty: new Quantity(10),
          actualQty: new Quantity(10),
          unitPrice: new Money(1000),
        }),
      ],
    });

    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: "gr-draft-1" }] }) // INSERT header
      .mockResolvedValueOnce({ rows: [{ id: "item-1" }] }) // INSERT item
      .mockResolvedValueOnce({}); // COMMIT

    const result = await repo.saveWithTransaction(draftReceipt);
    expect(result.id).toBe("gr-draft-1");
    // Không chạy INSERT INTO inventory_balances
    expect(mockClient.query).toHaveBeenCalledTimes(4);
  });

  it("TC-REPO-BRANCH-02: updateWithTransaction phải ném DomainValidationError khi entity không có id", async () => {
    const entityNoId = new GoodsReceipt({
      receiptNumber: "PNK-001",
      receiptDate: new Date("2026-08-20"),
      organizationId: "org-1",
      warehouseId: "wh-1",
      receiptType: "PURCHASE",
      delivererName: "Nguyễn Văn A",
      status: "CONFIRMED",
      items: [
        new ReceiptItem({
          lineNo: 1,
          productId: "prod-1",
          productNameSnapshot: "Vật tư",
          unitSnapshot: "Cái",
          docQty: new Quantity(10),
          actualQty: new Quantity(10),
          unitPrice: new Money(1000),
        }),
      ],
    });

    await expect(repo.updateWithTransaction(entityNoId)).rejects.toThrow(
      "Không thể cập nhật",
    );
  });

  it("TC-REPO-BRANCH-03: updateWithTransaction phải ném EntityNotFoundError khi bản ghi không tồn tại trong DB", async () => {
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rows: [] }); // SELECT FOR UPDATE trả về rỗng

    await expect(repo.updateWithTransaction(sampleReceipt)).rejects.toThrow();
    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
  });

  it("TC-REPO-BRANCH-04: deleteOrCancel phải xử lý xóa cứng khi phiếu ở trạng thái DRAFT", async () => {
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({
        rows: [{ id: "receipt-1", status: "DRAFT", warehouse_id: "wh-1" }],
      }) // SELECT
      .mockResolvedValueOnce({}) // DELETE items
      .mockResolvedValueOnce({}) // DELETE receipts
      .mockResolvedValueOnce({}); // COMMIT

    const res = await repo.deleteOrCancel("receipt-1");
    expect(res.action).toBe("HARD_DELETED");
  });
});
