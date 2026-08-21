// src/infrastructure/repositories/postgres-goods-receipt.repository.ts
import { GoodsReceipt } from "#/domain/entities/goods-receipt.entity";
import { ReceiptItem } from "#/domain/entities/receipt-item.entity";
import {
  DomainValidationError,
  EntityNotFoundError,
} from "#/domain/exceptions/domain.exception";
import {
  IGoodsReceiptRepository,
  PaginatedResult,
  PaginationQuery,
} from "#/domain/repositories/goods-receipt.repository.interface";
import { pool } from "#/infrastructure/database/postgres-pool";

export class PostgresGoodsReceiptRepository implements IGoodsReceiptRepository {
  /**
   * Lưu phiếu nhập kho kèm Transaction và cập nhật tồn kho (Stock In)
   */
  async saveWithTransaction(entity: GoodsReceipt): Promise<GoodsReceipt> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const totalAmount = entity.calculateTotalAmount().value;

      const insertHeaderSql = `
        INSERT INTO goods_receipts (
          receipt_number, organization_id, warehouse_id, receipt_date,
          actual_received_date, receipt_type, deliverer_name, doc_reference,
          doc_date, doc_origin, debit_account, credit_account, description,
          total_amount, total_amount_words, attached_doc_count, creator_name,
          storekeeper_name, chief_accountant_name, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        RETURNING id, created_at, updated_at;
      `;

      const headerValues = [
        entity.receiptNumber,
        entity.organizationId,
        entity.warehouseId,
        entity.receiptDate,
        entity.actualReceivedDate ?? null,
        entity.receiptType,
        entity.delivererName,
        entity.docReference ?? null,
        entity.docDate ?? null,
        entity.docOrigin ?? null,
        entity.debitAccount ?? null,
        entity.creditAccount ?? null,
        entity.description ?? null,
        totalAmount,
        entity.totalAmountWords ?? null,
        entity.attachedDocCount ? String(entity.attachedDocCount) : null,
        entity.creatorName ?? null,
        entity.storekeeperName ?? null,
        entity.chiefAccountantName ?? null,
        entity.status,
      ];

      const headerResult = await client.query(insertHeaderSql, headerValues);
      const insertedRow = headerResult.rows[0];

      const itemsWithIds: ReceiptItem[] = [];

      for (const item of entity.items) {
        const itemAmount = item.calculateAmount().value;
        const insertItemSql = `
          INSERT INTO goods_receipt_items (
            receipt_id, line_no, product_id, product_name_snapshot,
            unit_snapshot, doc_qty, actual_qty, unit_price, amount,
            debit_account, credit_account, note
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING id;
        `;

        const itemRes = await client.query(insertItemSql, [
          insertedRow.id,
          item.lineNo,
          item.productId,
          item.productNameSnapshot,
          item.unitSnapshot,
          item.docQty.value,
          item.actualQty.value,
          item.unitPrice.value,
          itemAmount,
          item.debitAccount ?? null,
          item.creditAccount ?? null,
          item.note ?? null,
        ]);

        itemsWithIds.push(
          new ReceiptItem({
            id: itemRes.rows[0].id,
            lineNo: item.lineNo,
            productId: item.productId,
            productNameSnapshot: item.productNameSnapshot,
            unitSnapshot: item.unitSnapshot,
            docQty: item.docQty,
            actualQty: item.actualQty,
            unitPrice: item.unitPrice,
            debitAccount: item.debitAccount,
            creditAccount: item.creditAccount,
            note: item.note,
          }),
        );

        if (entity.status === "CONFIRMED") {
          const updateStockSql = `
            INSERT INTO inventory_balances (warehouse_id, product_id, current_stock, updated_at)
            VALUES ($1, $2, $3, NOW())
            ON CONFLICT (warehouse_id, product_id)
            DO UPDATE SET current_stock = inventory_balances.current_stock + EXCLUDED.current_stock, updated_at = NOW();
          `;
          await client.query(updateStockSql, [
            entity.warehouseId,
            item.productId,
            item.actualQty.value,
          ]);
        }
      }

      await client.query("COMMIT");

      return new GoodsReceipt({
        ...entity.toProps(),
        id: insertedRow.id,
        items: itemsWithIds,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async save(
    entity: GoodsReceipt,
  ): Promise<{ id: string; receiptNumber: string }> {
    const saved = await this.saveWithTransaction(entity);
    return { id: saved.id!, receiptNumber: saved.receiptNumber };
  }

  /**
   * Cập nhật phiếu nhập kho có xử lý hoàn nguyên tồn kho cũ và cộng dồn tồn kho mới
   */
  async updateWithTransaction(entity: GoodsReceipt): Promise<GoodsReceipt> {
    if (!entity.id) {
      throw new DomainValidationError(
        "Không thể cập nhật chứng từ không có ID.",
      );
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const checkSql = `SELECT id, status, warehouse_id FROM goods_receipts WHERE id = $1 FOR UPDATE;`;
      const checkRes = await client.query(checkSql, [entity.id]);
      if (checkRes.rows.length === 0) {
        throw new EntityNotFoundError("Phiếu nhập kho", entity.id);
      }
      const existing = checkRes.rows[0];

      if (existing.status === "CONFIRMED") {
        const oldItemsRes = await client.query(
          `SELECT product_id, actual_qty FROM goods_receipt_items WHERE receipt_id = $1`,
          [entity.id],
        );
        for (const oldItem of oldItemsRes.rows) {
          await client.query(
            `UPDATE inventory_balances 
             SET current_stock = current_stock - $1, updated_at = NOW() 
             WHERE warehouse_id = $2 AND product_id = $3`,
            [oldItem.actual_qty, existing.warehouse_id, oldItem.product_id],
          );
        }
      }

      const totalAmount = entity.calculateTotalAmount().value;
      const updateHeaderSql = `
        UPDATE goods_receipts SET
          receipt_number = $1, organization_id = $2, warehouse_id = $3, receipt_date = $4,
          actual_received_date = $5, receipt_type = $6, deliverer_name = $7, doc_reference = $8,
          doc_date = $9, doc_origin = $10, debit_account = $11, credit_account = $12,
          description = $13, total_amount = $14, total_amount_words = $15, attached_doc_count = $16,
          creator_name = $17, storekeeper_name = $18, chief_accountant_name = $19,
          status = $20, updated_at = NOW()
        WHERE id = $21;
      `;

      await client.query(updateHeaderSql, [
        entity.receiptNumber,
        entity.organizationId,
        entity.warehouseId,
        entity.receiptDate,
        entity.actualReceivedDate ?? null,
        entity.receiptType,
        entity.delivererName,
        entity.docReference ?? null,
        entity.docDate ?? null,
        entity.docOrigin ?? null,
        entity.debitAccount ?? null,
        entity.creditAccount ?? null,
        entity.description ?? null,
        totalAmount,
        entity.totalAmountWords ?? null,
        entity.attachedDocCount ? String(entity.attachedDocCount) : null,
        entity.creatorName ?? null,
        entity.storekeeperName ?? null,
        entity.chiefAccountantName ?? null,
        entity.status,
        entity.id,
      ]);

      await client.query(
        `DELETE FROM goods_receipt_items WHERE receipt_id = $1;`,
        [entity.id],
      );

      const itemsWithIds: ReceiptItem[] = [];
      for (const item of entity.items) {
        const itemAmount = item.calculateAmount().value;
        const insertItemSql = `
          INSERT INTO goods_receipt_items (
            receipt_id, line_no, product_id, product_name_snapshot,
            unit_snapshot, doc_qty, actual_qty, unit_price, amount,
            debit_account, credit_account, note
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING id;
        `;
        const itemRes = await client.query(insertItemSql, [
          entity.id,
          item.lineNo,
          item.productId,
          item.productNameSnapshot,
          item.unitSnapshot,
          item.docQty.value,
          item.actualQty.value,
          item.unitPrice.value,
          itemAmount,
          item.debitAccount ?? null,
          item.creditAccount ?? null,
          item.note ?? null,
        ]);

        itemsWithIds.push(
          new ReceiptItem({
            id: itemRes.rows[0].id,
            lineNo: item.lineNo,
            productId: item.productId,
            productNameSnapshot: item.productNameSnapshot,
            unitSnapshot: item.unitSnapshot,
            docQty: item.docQty,
            actualQty: item.actualQty,
            unitPrice: item.unitPrice,
            debitAccount: item.debitAccount,
            creditAccount: item.creditAccount,
            note: item.note,
          }),
        );

        if (entity.status === "CONFIRMED") {
          const updateStockSql = `
            INSERT INTO inventory_balances (warehouse_id, product_id, current_stock, updated_at)
            VALUES ($1, $2, $3, NOW())
            ON CONFLICT (warehouse_id, product_id)
            DO UPDATE SET current_stock = inventory_balances.current_stock + EXCLUDED.current_stock, updated_at = NOW();
          `;
          await client.query(updateStockSql, [
            entity.warehouseId,
            item.productId,
            item.actualQty.value,
          ]);
        }
      }

      await client.query("COMMIT");
      return new GoodsReceipt({
        ...entity.toProps(),
        items: itemsWithIds,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async update(id: string, entity: GoodsReceipt): Promise<void> {
    const targetEntity =
      entity.id === id ? entity : new GoodsReceipt({ ...entity.toProps(), id });
    await this.updateWithTransaction(targetEntity);
  }

  /**
   * Tìm kiếm theo số phiếu nhập kho
   */
  async findByReceiptNumber(
    receiptNumber: string,
  ): Promise<GoodsReceipt | null> {
    const result = await pool.query(
      `SELECT id FROM goods_receipts WHERE receipt_number = $1 AND status != 'CANCELLED';`,
      [receiptNumber],
    );
    if (result.rows.length === 0) return null;
    return this.findById(result.rows[0].id);
  }

  /**
   * Xóa chứng từ theo ID
   */
  async deleteById(id: string): Promise<void> {
    await this.deleteOrCancel(id);
  }

  // src/infrastructure/repositories/postgres-goods-receipt.repository.ts
  async findById(id: string): Promise<any | null> {
    const sql = `
      SELECT 
        gr.id, 
        gr.receipt_number AS "receiptNumber", 
        gr.receipt_number,
        gr.organization_id AS "organizationId",
        gr.organization_id,
        gr.warehouse_id AS "warehouseId",
        gr.warehouse_id,
        to_char(gr.receipt_date, 'YYYY-MM-DD') AS "receiptDate", 
        gr.receipt_date,
        to_char(gr.actual_received_date, 'YYYY-MM-DD') AS "actualReceivedDate", 
        gr.actual_received_date,
        gr.receipt_type AS "receiptType",
        gr.receipt_type,
        gr.description, 
        gr.deliverer_name AS "delivererName", 
        gr.deliverer_name,
        gr.doc_reference AS "docReference", 
        gr.doc_reference,
        to_char(gr.doc_date, 'YYYY-MM-DD') AS "docDate", 
        gr.doc_date,
        gr.doc_origin AS "docOrigin",
        gr.doc_origin,
        gr.debit_account AS "debitAccount", 
        gr.debit_account,
        gr.credit_account AS "creditAccount", 
        gr.credit_account,
        gr.total_amount::float AS "totalAmount", 
        gr.total_amount,
        gr.total_amount_words AS "totalAmountWords",
        gr.total_amount_words,
        gr.attached_doc_count AS "attachedDocCount",
        gr.attached_doc_count,
        gr.creator_name AS "creatorName",
        gr.creator_name,
        gr.storekeeper_name AS "storekeeperName",
        gr.storekeeper_name,
        gr.chief_accountant_name AS "chiefAccountantName",
        gr.chief_accountant_name,
        json_build_object(
          'creatorName', gr.creator_name,
          'storekeeperName', gr.storekeeper_name,
          'chiefAccountantName', gr.chief_accountant_name
        ) AS signatures,
        gr.status,
        gr.created_at,
        gr.updated_at,
        json_build_object('id', org.id, 'name', org.name, 'department', org.department) AS organization,
        json_build_object('id', wh.id, 'name', wh.name, 'location', wh.location) AS warehouse,
        COALESCE(
          json_agg(
            json_build_object(
              'id', gri.id, 
              'lineNo', gri.line_no, 
              'productId', gri.product_id,
              'productCode', p.code, 
              'productName', gri.product_name_snapshot,
              'unit', gri.unit_snapshot, 
              'docQty', gri.doc_qty::float, 
              'actualQty', gri.actual_qty::float,
              'unitPrice', gri.unit_price::float, 
              'amount', gri.amount::float,
              'debitAccount', gri.debit_account, 
              'creditAccount', gri.credit_account, 
              'note', gri.note
            ) ORDER BY gri.line_no ASC
          ) FILTER (WHERE gri.id IS NOT NULL), '[]'::json
        ) AS items
      FROM goods_receipts gr
      INNER JOIN organizations org ON gr.organization_id = org.id
      INNER JOIN warehouses wh ON gr.warehouse_id = wh.id
      LEFT JOIN goods_receipt_items gri ON gr.id = gri.receipt_id
      LEFT JOIN products p ON gri.product_id = p.id
      WHERE gr.id = $1
      GROUP BY gr.id, org.id, wh.id;
    `;
    const result = await pool.query(sql, [id]);
    return result.rows.length ? result.rows[0] : null;
  }

  async findPaginated(
    pagination: PaginationQuery,
  ): Promise<PaginatedResult<any>> {
    const offset = (pagination.page - 1) * pagination.limit;
    const countSql = `SELECT COUNT(*) AS total FROM goods_receipts WHERE status != 'CANCELLED';`;
    const dataSql = `
      SELECT 
        gr.id, gr.receipt_number, gr.receipt_date, gr.actual_received_date, gr.receipt_type,
        gr.deliverer_name, gr.total_amount, gr.status, gr.created_at,
        json_build_object('id', org.id, 'name', org.name, 'department', org.department) AS organization,
        json_build_object('id', wh.id, 'name', wh.name, 'location', wh.location) AS warehouse
      FROM goods_receipts gr
      INNER JOIN organizations org ON gr.organization_id = org.id
      INNER JOIN warehouses wh ON gr.warehouse_id = wh.id
      WHERE gr.status != 'CANCELLED'
      ORDER BY gr.created_at DESC
      LIMIT $1 OFFSET $2;
    `;

    const [countRes, dataRes] = await Promise.all([
      pool.query(countSql),
      pool.query(dataSql, [pagination.limit, offset]),
    ]);

    const totalItems = parseInt(countRes.rows[0].total, 10);
    return {
      page: pagination.page,
      limit: pagination.limit,
      totalItems,
      totalPages: Math.ceil(totalItems / pagination.limit),
      data: dataRes.rows,
    };
  }

  async deleteOrCancel(
    id: string,
  ): Promise<{ action: "HARD_DELETED" | "CANCELLED_AND_REVERSED" }> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const checkRes = await client.query(
        "SELECT id, status, warehouse_id FROM goods_receipts WHERE id = $1 FOR UPDATE",
        [id],
      );
      if (checkRes.rows.length === 0) {
        throw new EntityNotFoundError("Phiếu nhập kho", id);
      }

      const receipt = checkRes.rows[0];
      if (receipt.status === "DRAFT") {
        await client.query(
          "DELETE FROM goods_receipt_items WHERE receipt_id = $1",
          [id],
        );
        await client.query("DELETE FROM goods_receipts WHERE id = $1", [id]);
        await client.query("COMMIT");
        return { action: "HARD_DELETED" };
      }

      const itemsRes = await client.query(
        "SELECT product_id, actual_qty FROM goods_receipt_items WHERE receipt_id = $1",
        [id],
      );
      for (const item of itemsRes.rows) {
        await client.query(
          `UPDATE inventory_balances 
           SET current_stock = current_stock - $1, updated_at = NOW() 
           WHERE warehouse_id = $2 AND product_id = $3`,
          [item.actual_qty, receipt.warehouse_id, item.product_id],
        );
      }

      await client.query(
        `UPDATE goods_receipts SET status = 'CANCELLED', updated_at = NOW() WHERE id = $1`,
        [id],
      );
      await client.query("COMMIT");
      return { action: "CANCELLED_AND_REVERSED" };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
