// src/presentation/controllers/master-data.controller.ts
import { Request, Response, NextFunction } from "express";
import { GetOrganizationsUseCase } from "#/application/use-cases/get-organizations.use-case";
import { GetWarehousesUseCase } from "#/application/use-cases/get-warehouses.use-case";
import { GetProductsUseCase } from "#/application/use-cases/get-products.use-case";

export class MasterDataController {
  constructor(
    private readonly getOrganizationsUseCase: GetOrganizationsUseCase,
    private readonly getWarehousesUseCase: GetWarehousesUseCase,
    private readonly getProductsUseCase: GetProductsUseCase,
  ) {}

  public getOrganizations = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.getOrganizationsUseCase.execute();
      res.status(200).json({
        success: true,
        requestId: req.id,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  public getWarehouses = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.getWarehousesUseCase.execute();
      res.status(200).json({
        success: true,
        requestId: req.id,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  public getProducts = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const searchQuery =
        typeof req.query.search === "string" ? req.query.search : undefined;
      const data = await this.getProductsUseCase.execute(searchQuery);
      res.status(200).json({
        success: true,
        requestId: req.id,
        data,
      });
    } catch (error) {
      next(error);
    }
  };
}
