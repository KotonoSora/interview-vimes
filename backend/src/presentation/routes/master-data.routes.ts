// src/presentation/routes/master-data.routes.ts
import { Router } from "express";
import { MasterDataController } from "#/presentation/controllers/master-data.controller";
import { GetOrganizationsUseCase } from "#/application/use-cases/get-organizations.use-case";
import { PostgresMasterDataRepository } from "#/infrastructure/repositories/postgres-master-data.repository";

const masterDataRouter = Router();

const repository = new PostgresMasterDataRepository();
const getOrganizationsUseCase = new GetOrganizationsUseCase(repository);
const controller = new MasterDataController(getOrganizationsUseCase);

masterDataRouter.get("/organizations", controller.getOrganizations);

export default masterDataRouter;
