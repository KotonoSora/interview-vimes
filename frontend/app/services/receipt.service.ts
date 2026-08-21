// app/services/receipt.service.ts
import type { ReceiptStatus, ReceiptType } from "~/constants/receipt.constants";
import type { BaseApiResponse, PaginatedApiResponse } from "~/types/api.types";
import type { GoodsReceiptFormData } from "~/types/goods-receipt.types";

import { apiClient } from "~/lib/api-client";

export interface GoodsReceiptListItem {
  id: string;
  receiptNumber: string;
  receiptDate: string;
  receiptType: ReceiptType | string;
  warehouseName?: string;
  warehouse?: { id: string; name: string };
  delivererName: string;
  docReference?: string;
  debitAccount?: string;
  creditAccount?: string;
  totalAmount: number;
  status: ReceiptStatus | string;
}

export interface GetReceiptsParams {
  search?: string;
  warehouseId?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  [key: string]: string | number | boolean | undefined | null;
}

export interface GoodsReceiptDetail extends Omit<
  GoodsReceiptFormData,
  "items"
> {
  id: string;
  organization?: {
    id: string;
    name: string;
    department?: string;
    taxCode?: string;
    address?: string;
  };
  warehouse?: { id: string; name: string; code?: string; location?: string };
  signatures?: {
    creatorName?: string;
    storekeeperName?: string;
    chiefAccountantName?: string;
  };
  items: Array<{
    id: string;
    lineNo?: number;
    productId: string;
    productCode?: string;
    productName: string;
    unit: string;
    docQty: number;
    actualQty: number;
    unitPrice: number;
    amount: number;
    debitAccount?: string;
    creditAccount?: string;
    note?: string;
  }>;
}

export const receiptService = {
  async getReceipts(params?: GetReceiptsParams, requestId?: string) {
    return apiClient<PaginatedApiResponse<GoodsReceiptListItem>>(
      "/goods-receipts",
      {
        method: "GET",
        params,
        requestId,
      },
    );
  },

  async getReceiptById(id: string, requestId?: string) {
    return apiClient<BaseApiResponse<GoodsReceiptDetail>>(
      `/goods-receipts/${id}`,
      {
        method: "GET",
        requestId,
      },
    );
  },

  async createReceipt(data: GoodsReceiptFormData, requestId?: string) {
    return apiClient<BaseApiResponse<{ receiptId: string }>>(
      "/goods-receipts",
      {
        method: "POST",
        body: JSON.stringify(data),
        requestId,
      },
    );
  },

  async updateReceipt(
    id: string,
    data: GoodsReceiptFormData,
    requestId?: string,
  ) {
    return apiClient<BaseApiResponse<void>>(`/goods-receipts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      requestId,
    });
  },
};
