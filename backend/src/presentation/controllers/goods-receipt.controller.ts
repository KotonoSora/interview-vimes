// src/presentation/controllers/goods-receipt.controller.ts
import { Response, NextFunction } from "express";
import { RequestWithId } from "#/presentation/middlewares/request-id.middleware";
import { CreateGoodsReceiptUseCase } from "#/application/use-cases/create-goods-receipt.use-case";
import { UpdateGoodsReceiptUseCase } from "#/application/use-cases/update-goods-receipt.use-case";
import { DeleteGoodsReceiptUseCase } from "#/application/use-cases/delete-goods-receipt.use-case";
import { CreateGoodsReceiptSchema } from "#/application/dtos/create-goods-receipt.dto";
import { UpdateGoodsReceiptSchema } from "#/application/dtos/update-goods-receipt.dto";
import { pool } from "#/infrastructure/database/postgres-pool";

export class GoodsReceiptController {
  constructor(
    private readonly createUseCase: CreateGoodsReceiptUseCase,
    private readonly updateUseCase: UpdateGoodsReceiptUseCase,
    private readonly deleteUseCase: DeleteGoodsReceiptUseCase,
  ) {}

  public create = async (
    req: RequestWithId,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const validatedDTO = CreateGoodsReceiptSchema.parse(req.body);
      const result = await this.createUseCase.execute(validatedDTO, req.id);

      res.status(201).json({
        success: true,
        message: "Lập phiếu nhập kho thành công (Mẫu 01 - VT)",
        requestId: req.id,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public getDetail = async (
    req: RequestWithId,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = req.params.id as string;
      const sql = `
        SELECT 
          gr.id, gr.receipt_number, gr.receipt_date, gr.actual_received_date, gr.receipt_type,
          gr.description, gr.deliverer_name, gr.doc_reference, gr.doc_date, gr.doc_origin,
          gr.debit_account, gr.credit_account, gr.total_amount, gr.total_amount_words,
          gr.attached_doc_count, gr.creator_name, gr.storekeeper_name, gr.chief_accountant_name, gr.status,
          json_build_object('id', org.id, 'name', org.name, 'department', org.department) AS organization,
          json_build_object('id', wh.id, 'name', wh.name, 'location', wh.location) AS warehouse,
          COALESCE(
            json_agg(
              json_build_object(
                'id', gri.id, 'lineNo', gri.line_no, 'productId', gri.product_id,
                'productCode', p.code, 'productName', gri.product_name_snapshot,
                'unit', gri.unit_snapshot, 'docQty', gri.doc_qty, 'actualQty', gri.actual_qty,
                'unitPrice', gri.unit_price, 'amount', gri.amount,
                'debitAccount', gri.debit_account, 'creditAccount', gri.credit_account, 'note', gri.note
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
      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy phiếu nhập kho với ID đã cung cấp.",
          requestId: req.id,
        });
        return;
      }

      res.status(200).json({
        success: true,
        requestId: req.id,
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  };

  public update = async (
    req: RequestWithId,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = req.params.id as string;
      const validatedDTO = UpdateGoodsReceiptSchema.parse(req.body);
      const result = await this.updateUseCase.execute(id, validatedDTO, req.id);

      res.status(200).json({
        success: true,
        message: "Cập nhật phiếu nhập kho và điều chỉnh tồn kho thành công",
        requestId: req.id,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (
    req: RequestWithId,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = req.params.id as string;
      const result = await this.deleteUseCase.execute(id, req.id);

      res.status(200).json({
        success: true,
        message:
          result.action === "HARD_DELETED"
            ? "Đã xóa bản ghi nháp thành công"
            : "Đã hủy chứng từ nhập kho và hoàn trả tồn kho thành công (Stock Reversal)",
        requestId: req.id,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
