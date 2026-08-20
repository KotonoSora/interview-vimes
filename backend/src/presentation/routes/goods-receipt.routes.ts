// src/presentation/routes/goods-receipt.routes.ts
import { Router } from "express";
import { GoodsReceiptController } from "#/presentation/controllers/goods-receipt.controller";
import { PostgresGoodsReceiptRepository } from "#/infrastructure/repositories/postgres-goods-receipt.repository";
import { AuditTrailService } from "#/infrastructure/analytics/audit-trail.service";
import { CreateGoodsReceiptUseCase } from "#/application/use-cases/create-goods-receipt.use-case";
import { UpdateGoodsReceiptUseCase } from "#/application/use-cases/update-goods-receipt.use-case";
import { DeleteGoodsReceiptUseCase } from "#/application/use-cases/delete-goods-receipt.use-case";

const goodsReceiptRouter = Router();

const repository = new PostgresGoodsReceiptRepository();
const auditService = new AuditTrailService();

const createUseCase = new CreateGoodsReceiptUseCase(repository, auditService);
const updateUseCase = new UpdateGoodsReceiptUseCase(repository, auditService);
const deleteUseCase = new DeleteGoodsReceiptUseCase(repository, auditService);

const controller = new GoodsReceiptController(
  createUseCase,
  updateUseCase,
  deleteUseCase,
);

goodsReceiptRouter.get("/", controller.getList);
goodsReceiptRouter.post("/", controller.create);
goodsReceiptRouter.get("/:id", controller.getDetail);
goodsReceiptRouter.put("/:id", controller.update);
goodsReceiptRouter.delete("/:id", controller.delete);

export default goodsReceiptRouter;
