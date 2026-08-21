// src/presentation/routes/goods-receipt.routes.ts
import { Router } from "express";
import { GoodsReceiptController } from "#/presentation/controllers/goods-receipt.controller";
import { CreateGoodsReceiptUseCase } from "#/application/use-cases/create-goods-receipt.use-case";
import { UpdateGoodsReceiptUseCase } from "#/application/use-cases/update-goods-receipt.use-case";
import { DeleteGoodsReceiptUseCase } from "#/application/use-cases/delete-goods-receipt.use-case";
import { ListGoodsReceiptsUseCase } from "#/application/use-cases/list-goods-receipts.use-case";
import { GetGoodsReceiptDetailUseCase } from "#/application/use-cases/get-goods-receipt-detail.use-case";
import { PostgresGoodsReceiptRepository } from "#/infrastructure/repositories/postgres-goods-receipt.repository";

const goodsReceiptRouter = Router();

const repository = new PostgresGoodsReceiptRepository();
const createUseCase = new CreateGoodsReceiptUseCase(repository);
const updateUseCase = new UpdateGoodsReceiptUseCase(repository);
const deleteUseCase = new DeleteGoodsReceiptUseCase(repository);
const listUseCase = new ListGoodsReceiptsUseCase(repository);
const detailUseCase = new GetGoodsReceiptDetailUseCase(repository);

const controller = new GoodsReceiptController(
  createUseCase,
  updateUseCase,
  deleteUseCase,
  listUseCase,
  detailUseCase,
);

goodsReceiptRouter.get("/", controller.getList);
goodsReceiptRouter.post("/", controller.create);
goodsReceiptRouter.get("/:id", controller.getDetail);
goodsReceiptRouter.put("/:id", controller.update);
goodsReceiptRouter.delete("/:id", controller.delete);

export default goodsReceiptRouter;
