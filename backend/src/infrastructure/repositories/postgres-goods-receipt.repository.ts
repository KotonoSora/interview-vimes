// src/infrastructure/repositories/postgres-goods-receipt.repository.ts
import { PoolClient } from "pg";
import { pool } from "#/infrastructure/database/postgres-pool";
import { GoodsReceipt } from "#/domain/entities/goods-receipt.entity";
import { ReceiptItem } from "#/domain/entities/receipt-item.entity";
import { Money } from "#/domain/value-objects/money.vo";
import { Quantity } from "#/domain/value-objects/quantity.vo";
import { IGoodsReceiptRepository } from "#/domain/repositories/goods-receipt.repository.interface";
import { dbTransactionErrors } from "#/infrastructure/monitoring/metrics";

export class PostgresGoodsReceiptRepository implements IGoodsReceiptRepository {
  public async findById(id: string): Promise<GoodsReceipt | null> {
    const headerSql = `SELECT * FROM goods_receipts WHERE id = $1 LIMIT 1;`;
    const headerRes = await pool.query(headerSql, [id]);

    if (headerRes.rows.length === 0) {
      return null;
    }

    const h = headerRes.rows[0];
    const itemsSql = `SELECT * FROM goods_receipt_items WHERE receipt_id = $1 ORDER BY line_no ASC;`;
    const itemsRes = await pool.query(itemsSql, [id]);

    const items = itemsRes.rows.map(
      (r: any) =>
        new ReceiptItem({
          id: r.id,
          productId: r.product_id,
          lineNo: r.line_no,
          productNameSnapshot: r.product_name_snapshot,
          unitSnapshot: r.unit_snapshot,
          docQty: new Quantity(Number(r.doc_qty)),
          actualQty: new Quantity(Number(r.actual_qty)),
          unitPrice: new Money(Number(r.unit_price)),
          debitAccount: r.debit_account,
          creditAccount: r.credit_account,
          note: r.note,
        }),
    );

    return new GoodsReceipt({
      id: h.id,
      receiptNumber: h.receipt_number,
      receiptDate: new Date(h.receipt_date),
      actualReceivedDate: h.actual_received_date
        ? new Date(h.actual_received_date)
        : undefined,
      organizationId: h.organization_id,
      warehouseId: h.warehouse_id,
      receiptType: h.receipt_type,
      description: h.description,
      delivererName: h.deliverer_name,
      docReference: h.doc_reference,
      docDate: h.doc_date ? new Date(h.doc_date) : undefined,
      docOrigin: h.doc_origin,
      debitAccount: h.debit_account,
      creditAccount: h.credit_account,
      attachedDocCount: h.attached_doc_count,
      creatorName: h.creator_name,
      storekeeperName: h.storekeeper_name,
      chiefAccountantName: h.chief_accountant_name,
      status: h.status,
      items,
    });
  }

  public async findByReceiptNumber(
    receiptNumber: string,
  ): Promise<GoodsReceipt | null> {
    const query = `SELECT id FROM goods_receipts WHERE receipt_number = $1 LIMIT 1;`;
    const res = await pool.query(query, [receiptNumber]);
    if (res.rows.length === 0) return null;
    return this.findById(res.rows[0].id);
  }

  public async saveWithTransaction(
    receipt: GoodsReceipt,
    totalAmountWords?: string,
  ): Promise<string> {
    const client: PoolClient = await pool.connect();

    try {
      await client.query("BEGIN");

      const insertHeaderSql = `
        INSERT INTO goods_receipts (
          receipt_number, receipt_date, actual_received_date, organization_id, warehouse_id,
          receipt_type, description, deliverer_name, doc_reference, doc_date, doc_origin,
          debit_account, credit_account, total_amount, total_amount_words,
          attached_doc_count, creator_name, storekeeper_name, chief_accountant_name, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        RETURNING id;
      `;

      const headerValues = [
        receipt.receiptNumber,
        receipt.receiptDate,
        receipt.actualReceivedDate || null,
        receipt.organizationId,
        receipt.warehouseId,
        receipt.receiptType,
        receipt.description || null,
        receipt.delivererName,
        receipt.docReference || null,
        receipt.docDate || null,
        receipt.docOrigin || null,
        receipt.debitAccount || null,
        receipt.creditAccount || null,
        receipt.calculateTotalAmount().value,
        totalAmountWords || null,
        receipt.attachedDocCount || null,
        receipt.creatorName || null,
        receipt.storekeeperName || null,
        receipt.chiefAccountantName || null,
        receipt.status,
      ];

      const headerResult = await client.query(insertHeaderSql, headerValues);
      const receiptId = headerResult.rows[0].id;

      for (const item of receipt.items) {
        const insertItemSql = `
          INSERT INTO goods_receipt_items (
            receipt_id, product_id, line_no, product_name_snapshot, unit_snapshot,
            doc_qty, actual_qty, unit_price, amount, debit_account, credit_account, note
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);
        `;
        await client.query(insertItemSql, [
          receiptId,
          item.productId,
          item.lineNo,
          item.productNameSnapshot,
          item.unitSnapshot,
          item.docQty.value,
          item.actualQty.value,
          item.unitPrice.value,
          item.calculateAmount().value,
          item.debitAccount || null,
          item.creditAccount || null,
          item.note || null,
        ]);

        if (receipt.status === "CONFIRMED") {
          const upsertStockSql = `
            INSERT INTO inventory_balances (warehouse_id, product_id, current_stock, updated_at)
            VALUES ($1, $2, $3, now())
            ON CONFLICT (warehouse_id, product_id)
            DO UPDATE SET 
              current_stock = inventory_balances.current_stock + EXCLUDED.current_stock,
              updated_at = now();
          `;
          await client.query(upsertStockSql, [
            receipt.warehouseId,
            item.productId,
            item.actualQty.value,
          ]);
        }
      }

      await client.query("COMMIT");
      return receiptId;
    } catch (error) {
      await client.query("ROLLBACK");
      dbTransactionErrors.inc({ operation: "CREATE_RECEIPT" });
      throw error;
    } finally {
      client.release();
    }
  }

  public async updateWithTransaction(
    receipt: GoodsReceipt,
    totalAmountWords?: string,
  ): Promise<void> {
    const client: PoolClient = await pool.connect();

    try {
      await client.query("BEGIN");

      const oldHeaderRes = await client.query(
        `SELECT status, warehouse_id FROM goods_receipts WHERE id = $1 FOR UPDATE;`,
        [receipt.id],
      );

      if (oldHeaderRes.rows.length === 0) {
        throw new Error("Không tìm thấy phiếu nhập kho để cập nhật.");
      }

      const oldStatus = oldHeaderRes.rows[0].status;
      const oldWarehouseId = oldHeaderRes.rows[0].warehouse_id;

      // 1. Hoàn lại tồn kho cũ nếu phiếu trước đó đã CONFIRMED
      if (oldStatus === "CONFIRMED") {
        const oldItemsRes = await client.query(
          `SELECT product_id, actual_qty FROM goods_receipt_items WHERE receipt_id = $1;`,
          [receipt.id],
        );

        for (const item of oldItemsRes.rows) {
          await client.query(
            `UPDATE inventory_balances 
             SET current_stock = GREATEST(0, current_stock - $1), updated_at = now()
             WHERE warehouse_id = $2 AND product_id = $3;`,
            [Number(item.actual_qty), oldWarehouseId, item.product_id],
          );
        }
      }

      // 2. Cập nhật Master Header
      const updateHeaderSql = `
        UPDATE goods_receipts SET
          receipt_date = $1,
          actual_received_date = $2,
          organization_id = $3,
          warehouse_id = $4,
          receipt_type = $5,
          description = $6,
          deliverer_name = $7,
          doc_reference = $8,
          doc_date = $9,
          doc_origin = $10,
          debit_account = $11,
          credit_account = $12,
          total_amount = $13,
          total_amount_words = $14,
          attached_doc_count = $15,
          creator_name = $16,
          storekeeper_name = $17,
          chief_accountant_name = $18,
          status = $19,
          updated_at = now()
        WHERE id = $20;
      `;

      await client.query(updateHeaderSql, [
        receipt.receiptDate,
        receipt.actualReceivedDate || null,
        receipt.organizationId,
        receipt.warehouseId,
        receipt.receiptType,
        receipt.description || null,
        receipt.delivererName,
        receipt.docReference || null,
        receipt.docDate || null,
        receipt.docOrigin || null,
        receipt.debitAccount || null,
        receipt.creditAccount || null,
        receipt.calculateTotalAmount().value,
        totalAmountWords || null,
        receipt.attachedDocCount || null,
        receipt.creatorName || null,
        receipt.storekeeperName || null,
        receipt.chiefAccountantName || null,
        receipt.status,
        receipt.id,
      ]);

      // 3. Xóa items cũ và tạo lại danh sách items mới
      await client.query(
        `DELETE FROM goods_receipt_items WHERE receipt_id = $1;`,
        [receipt.id],
      );

      for (const item of receipt.items) {
        await client.query(
          `INSERT INTO goods_receipt_items (
            receipt_id, product_id, line_no, product_name_snapshot, unit_snapshot,
            doc_qty, actual_qty, unit_price, amount, debit_account, credit_account, note
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);`,
          [
            receipt.id,
            item.productId,
            item.lineNo,
            item.productNameSnapshot,
            item.unitSnapshot,
            item.docQty.value,
            item.actualQty.value,
            item.unitPrice.value,
            item.calculateAmount().value,
            item.debitAccount || null,
            item.creditAccount || null,
            item.note || null,
          ],
        );

        // 4. Bù đắp lại tồn kho mới nếu status mới là CONFIRMED
        if (receipt.status === "CONFIRMED") {
          await client.query(
            `INSERT INTO inventory_balances (warehouse_id, product_id, current_stock, updated_at)
             VALUES ($1, $2, $3, now())
             ON CONFLICT (warehouse_id, product_id)
             DO UPDATE SET 
               current_stock = inventory_balances.current_stock + EXCLUDED.current_stock,
               updated_at = now();`,
            [receipt.warehouseId, item.productId, item.actualQty.value],
          );
        }
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      dbTransactionErrors.inc({ operation: "UPDATE_RECEIPT" });
      throw error;
    } finally {
      client.release();
    }
  }

  public async deleteById(id: string): Promise<void> {
    await pool.query(`DELETE FROM goods_receipts WHERE id = $1;`, [id]);
  }
}
