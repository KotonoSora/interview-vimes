// src/application/use-cases/get-goods-receipt-detail.use-case.ts
import { IGoodsReceiptRepository } from "#/domain/repositories/goods-receipt.repository.interface";
import { EntityNotFoundError } from "#/domain/exceptions/domain.exception";

export class GetGoodsReceiptDetailUseCase {
  constructor(private readonly goodsReceiptRepo: IGoodsReceiptRepository) {}

  public async execute(id: string): Promise<any> {
    if (!id || !id.trim()) {
      throw new EntityNotFoundError("Phiếu nhập kho", id);
    }

    const receipt = await this.goodsReceiptRepo.findById(id);

    if (!receipt) {
      throw new EntityNotFoundError("Phiếu nhập kho", id);
    }

    return receipt;
  }
}
