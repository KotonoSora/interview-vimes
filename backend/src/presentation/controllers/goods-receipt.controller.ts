// src/presentation/controllers/goods-receipt.controller.ts
import { Request, Response, NextFunction } from "express";
import { CreateGoodsReceiptUseCase } from "#/application/use-cases/create-goods-receipt.use-case";
import { UpdateGoodsReceiptUseCase } from "#/application/use-cases/update-goods-receipt.use-case";
import { DeleteGoodsReceiptUseCase } from "#/application/use-cases/delete-goods-receipt.use-case";
import { ListGoodsReceiptsUseCase } from "#/application/use-cases/list-goods-receipts.use-case";
import { GetGoodsReceiptDetailUseCase } from "#/application/use-cases/get-goods-receipt-detail.use-case";
import { CreateGoodsReceiptSchema } from "#/application/dtos/create-goods-receipt.dto";
import { UpdateGoodsReceiptSchema } from "#/application/dtos/update-goods-receipt.dto";

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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await this.listUseCase.execute(page, limit);

      res.status(200).json({
        success: true,
        requestId: req.id,
        pagination: {
          page: result.page,
          limit: result.limit,
          totalItems: result.totalItems,
          totalPages: result.totalPages,
        },
        data: result.data,
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
        data: result,
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
        message: "Cập nhật phiếu nhập kho thành công",
        requestId: req.id,
        data: result,
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
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
