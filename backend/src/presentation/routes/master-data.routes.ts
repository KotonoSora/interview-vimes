// src/presentation/routes/master-data.routes.ts
import { Router } from "express";
import { PostgresMasterDataRepository } from "#/infrastructure/repositories/postgres-master-data.repository";
import { GetOrganizationsUseCase } from "#/application/use-cases/get-organizations.use-case";
import { GetWarehousesUseCase } from "#/application/use-cases/get-warehouses.use-case";
import { GetProductsUseCase } from "#/application/use-cases/get-products.use-case";
import { MasterDataController } from "#/presentation/controllers/master-data.controller";

const masterDataRouter = Router();

const repository = new PostgresMasterDataRepository();
const getOrganizationsUseCase = new GetOrganizationsUseCase(repository);
const getWarehousesUseCase = new GetWarehousesUseCase(repository);
const getProductsUseCase = new GetProductsUseCase(repository);

const controller = new MasterDataController(
  getOrganizationsUseCase,
  getWarehousesUseCase,
  getProductsUseCase,
);

masterDataRouter.get("/organizations", controller.getOrganizations);
masterDataRouter.get("/warehouses", controller.getWarehouses);
masterDataRouter.get("/products", controller.getProducts);

export default masterDataRouter;
