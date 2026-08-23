// src/presentation/controllers/goods-receipt.controller.ts
import { NextFunction, Request, Response } from "express";

import { CreateGoodsReceiptSchema } from "#/application/dtos/create-goods-receipt.dto";
import { UpdateGoodsReceiptSchema } from "#/application/dtos/update-goods-receipt.dto";
import { CreateGoodsReceiptUseCase } from "#/application/use-cases/create-goods-receipt.use-case";
import { DeleteGoodsReceiptUseCase } from "#/application/use-cases/delete-goods-receipt.use-case";
import { GetGoodsReceiptDetailUseCase } from "#/application/use-cases/get-goods-receipt-detail.use-case";
import { ListGoodsReceiptsUseCase } from "#/application/use-cases/list-goods-receipts.use-case";
import { UpdateGoodsReceiptUseCase } from "#/application/use-cases/update-goods-receipt.use-case";
import { EntityNotFoundError } from "#/domain/exceptions/domain.exception";

export class GoodsReceiptController {
  constructor(
    private readonly createUseCase: CreateGoodsReceiptUseCase,
    private readonly updateUseCase: UpdateGoodsReceiptUseCase,
    private readonly deleteUseCase: DeleteGoodsReceiptUseCase,
    private readonly listUseCase: ListGoodsReceiptsUseCase,
    private readonly detailUseCase: GetGoodsReceiptDetailUseCase,
  ) {}

  public getList = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const page = req.query.page
        ? parseInt(req.query.page as string, 10)
        : undefined;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : undefined;
      const search = req.query.search as string | undefined;
      const fromDate = req.query.fromDate as string | undefined;
      const toDate = req.query.toDate as string | undefined;
      const warehouseId = req.query.warehouseId as string | undefined;
      const status = req.query.status as string | undefined;

      const result = await this.listUseCase.execute({
        page,
        limit,
        search,
        fromDate,
        toDate,
        warehouseId,
        status,
      });

      res.status(200).json({
        success: true,
        requestId: req.id,
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          totalItems: result.totalItems,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public getDetail = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = req.params.id as string;
      const data = await this.detailUseCase.execute(id);
      if (!data) {
        throw new EntityNotFoundError("Phiếu nhập kho", id);
      }

      res.status(200).json({
        success: true,
        requestId: req.id,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  public create = async (
    req: Request,
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
        data: {
          receiptId: result.receiptId || result.id,
          totalAmount: result.totalAmount,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public update = async (
    req: Request,
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
        data: {
          receiptId: result.receiptId || id,
          totalAmount: result.totalAmount,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (
    req: Request,
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
        data: {
          receiptId: id,
          action: result.action,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
