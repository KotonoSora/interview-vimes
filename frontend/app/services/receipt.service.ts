import type { BaseApiResponse, PaginatedApiResponse } from "~/types/api.types";
import type {
  CreateGoodsReceiptRequest,
  UpdateGoodsReceiptRequest,
} from "~/types/goods-receipt.types";

import { apiClient } from "~/lib/api-client";

export interface GoodsReceiptListItem {
  id: string;
  receiptNumber: string;
  receiptDate: string;
  receiptType?: string;
  warehouseName?: string;
  delivererName: string;
  docReference?: string | null;
  debitAccount?: string | null;
  creditAccount?: string | null;
  totalAmount: number;
  status: "DRAFT" | "CONFIRMED" | "CANCELLED";
}

export interface GoodsReceiptDetailItem {
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
  debitAccount?: string | null;
  creditAccount?: string | null;
  note?: string | null;
}

export interface GoodsReceiptDetail {
  id: string;
  receiptNumber: string;
  receiptDate: string;
  actualReceivedDate?: string | null;
  receiptType:
    | "PURCHASE"
    | "INTERNAL_PRODUCTION"
    | "OUTSOURCED_PROCESSING"
    | "CAPITAL_CONTRIBUTION"
    | "INVENTORY_SURPLUS";
  description?: string | null;
  organization?: { id: string; name: string; department?: string };
  warehouse?: { id: string; name: string; code?: string; location?: string };
  delivererName: string;
  docReference?: string | null;
  docDate?: string | null;
  docOrigin?: string | null;
  debitAccount?: string | null;
  creditAccount?: string | null;
  totalAmount: number;
  totalAmountWords?: string | null;
  attachedDocCount?: string | null;
  signatures?: {
    creatorName?: string;
    storekeeperName?: string;
    chiefAccountantName?: string;
  };
  status: "DRAFT" | "CONFIRMED" | "CANCELLED";
  items: GoodsReceiptDetailItem[];
}

export interface GetReceiptsQuery {
  search?: string;
  fromDate?: string;
  toDate?: string;
  warehouseId?: string;
  status?: "DRAFT" | "CONFIRMED" | "CANCELLED";
  page?: number;
  limit?: number;
  [key: string]: string | number | boolean | undefined | null;
}

export const receiptService = {
  async getReceipts(params?: GetReceiptsQuery, requestId?: string) {
    return apiClient<PaginatedApiResponse<GoodsReceiptListItem>>(
      "/goods-receipts",
      { method: "GET", params, requestId },
    );
  },
  async getReceiptById(id: string, requestId?: string) {
    return apiClient<BaseApiResponse<GoodsReceiptDetail>>(
      `/goods-receipts/${id}`,
      { method: "GET", requestId },
    );
  },
  async createReceipt(data: CreateGoodsReceiptRequest, requestId?: string) {
    return apiClient<
      BaseApiResponse<{ receiptId: string; totalAmount: number }>
    >("/goods-receipts", {
      method: "POST",
      body: JSON.stringify(data),
      requestId,
    });
  },
  async updateReceipt(
    id: string,
    data: UpdateGoodsReceiptRequest,
    requestId?: string,
  ) {
    return apiClient<
      BaseApiResponse<{ receiptId: string; totalAmount: number }>
    >(`/goods-receipts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      requestId,
    });
  },
  async deleteOrCancelReceipt(id: string, requestId?: string) {
    return apiClient<
      BaseApiResponse<{
        receiptId: string;
        action: "HARD_DELETED" | "CANCELLED_AND_REVERSED";
      }>
    >(`/goods-receipts/${id}`, { method: "DELETE", requestId });
  },
};
