// src/presentation/controllers/master-data.controller.ts
import { Request, Response, NextFunction } from "express";
import { GetOrganizationsUseCase } from "#/application/use-cases/get-organizations.use-case";

export class MasterDataController {
  constructor(
    private readonly getOrganizationsUseCase: GetOrganizationsUseCase,
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
}
