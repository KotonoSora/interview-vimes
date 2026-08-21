import type { BaseApiResponse, PaginatedApiResponse } from "~/types/api.types";
import type { GoodsReceiptFormData } from "~/types/goods-receipt.types";

import { apiClient } from "~/lib/api-client";

export interface GoodsReceiptListItem {
  id: string;
  receiptNumber: string;
  receiptDate: string;
  warehouseName: string;
  delivererName: string;
  totalAmount: number;
  status: "DRAFT" | "CONFIRMED" | "CANCELLED";
}

export interface GoodsReceiptDetailItem {
  id: string;
  lineNo: number;
  productId: string;
  productCode: string;
  productName: string;
  unit: string;
  docQty: number;
  actualQty: number;
  unitPrice: number;
  amount: number;
  debitAccount?: string;
  creditAccount?: string;
  note?: string;
}

export interface GoodsReceiptDetail {
  id: string;
  receiptNumber: string;
  receiptDate: string;
  actualReceivedDate?: string;
  receiptType: string;
  description?: string;
  organization: {
    id: string;
    name: string;
    department: string;
  };
  warehouse: {
    id: string;
    name: string;
    location: string;
  };
  delivererName: string;
  docReference?: string;
  docDate?: string;
  docOrigin?: string;
  debitAccount?: string;
  creditAccount?: string;
  totalAmount: number;
  totalAmountWords?: string;
  attachedDocCount?: string;
  signatures?: {
    creatorName?: string;
    storekeeperName?: string;
    chiefAccountantName?: string;
  };
  status: "DRAFT" | "CONFIRMED" | "CANCELLED";
  items: GoodsReceiptDetailItem[];
}

export interface ReceiptQueryParams {
  search?: string;
  fromDate?: string;
  toDate?: string;
  warehouseId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const receiptService = {
  // Lấy danh sách phiếu nhập kho có phân trang & lọc
  getReceipts: async (params?: ReceiptQueryParams, requestId?: string) => {
    return apiClient<PaginatedApiResponse<GoodsReceiptListItem>>(
      "/goods-receipts",
      {
        method: "GET",
        params: params as Record<string, string | number>,
        requestId,
      },
    );
  },

  // Xem chi tiết phiếu nhập kho gom mảng json_agg
  getReceiptById: async (id: string, requestId?: string) => {
    return apiClient<BaseApiResponse<GoodsReceiptDetail>>(
      `/goods-receipts/${id}`,
      {
        method: "GET",
        requestId,
      },
    );
  },

  // Tạo mới phiếu nhập kho (Mẫu 01-VT)
  createReceipt: async (payload: GoodsReceiptFormData, requestId?: string) => {
    return apiClient<
      BaseApiResponse<{ receiptId: string; totalAmount: number }>
    >("/goods-receipts", {
      method: "POST",
      body: JSON.stringify(payload),
      requestId,
    });
  },

  // Cập nhật phiếu nhập kho / Điều chỉnh bù trừ kho
  updateReceipt: async (
    id: string,
    payload: Partial<GoodsReceiptFormData>,
    requestId?: string,
  ) => {
    return apiClient<
      BaseApiResponse<{ receiptId: string; totalAmount: number }>
    >(`/goods-receipts/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      requestId,
    });
  },

  // Xóa phiếu (DRAFT) hoặc Hủy chứng từ / Hoàn kho (CONFIRMED)
  deleteOrCancelReceipt: async (id: string, requestId?: string) => {
    return apiClient<
      BaseApiResponse<{
        receiptId: string;
        action: "HARD_DELETED" | "CANCELLED_AND_REVERSED";
      }>
    >(`/goods-receipts/${id}`, {
      method: "DELETE",
      requestId,
    });
  },
};
