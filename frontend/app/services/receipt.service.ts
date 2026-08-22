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
  warehouse?: { name?: string };
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
  productNameSnapshot: string;
  unit: string;
  unitSnapshot: string;
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
  organizationId?: string;
  warehouseId?: string;
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

// Hàm chuẩn hóa dữ liệu dòng danh sách (Hỗ trợ cả snake_case và camelCase từ PostgreSQL / Express)
export function normalizeReceiptListItem(raw: any): GoodsReceiptListItem {
  if (!raw) return raw;
  return {
    id: raw.id || raw.receipt_id || raw.receiptId || "",
    receiptNumber: raw.receiptNumber || raw.receipt_number || raw.code || "—",
    receiptDate:
      raw.receiptDate ||
      raw.receipt_date ||
      (raw.created_at ? String(raw.created_at).split("T")[0] : "—"),
    receiptType: raw.receiptType || raw.receipt_type || "PURCHASE",
    warehouseName:
      raw.warehouseName ||
      raw.warehouse_name ||
      raw.warehouse?.name ||
      raw.warehouse_location ||
      "—",
    warehouse:
      raw.warehouse ||
      (raw.warehouse_name ? { name: raw.warehouse_name } : undefined),
    delivererName: raw.delivererName || raw.deliverer_name || "—",
    docReference: raw.docReference || raw.doc_reference || null,
    debitAccount: raw.debitAccount || raw.debit_account || "152",
    creditAccount: raw.creditAccount || raw.credit_account || "331",
    totalAmount: Number(raw.totalAmount ?? raw.total_amount ?? raw.amount ?? 0),
    status: raw.status || "DRAFT",
  };
}

// Hàm chuẩn hóa dữ liệu chi tiết phiếu
export function normalizeReceiptDetail(raw: any): GoodsReceiptDetail {
  if (!raw) return raw;
  const itemsRaw = Array.isArray(raw.items)
    ? raw.items
    : Array.isArray(raw.goods_receipt_items)
      ? raw.goods_receipt_items
      : [];

  return {
    id: raw.id || raw.receipt_id || raw.receiptId || "",
    receiptNumber: raw.receiptNumber || raw.receipt_number || "",
    receiptDate: raw.receiptDate || raw.receipt_date || "",
    actualReceivedDate:
      raw.actualReceivedDate || raw.actual_received_date || null,
    receiptType: raw.receiptType || raw.receipt_type || "PURCHASE",
    description: raw.description || null,
    organizationId:
      raw.organizationId || raw.organization_id || raw.organization?.id || "",
    warehouseId: raw.warehouseId || raw.warehouse_id || raw.warehouse?.id || "",
    organization:
      raw.organization ||
      (raw.organization_name
        ? {
            id: raw.organization_id || "",
            name: raw.organization_name,
            department: raw.department || raw.organization_department,
          }
        : undefined),
    warehouse:
      raw.warehouse ||
      (raw.warehouse_name
        ? {
            id: raw.warehouse_id || "",
            name: raw.warehouse_name,
            code: raw.warehouse_code,
            location: raw.location || raw.warehouse_location,
          }
        : undefined),
    delivererName: raw.delivererName || raw.deliverer_name || "",
    docReference: raw.docReference || raw.doc_reference || null,
    docDate: raw.docDate || raw.doc_date || null,
    docOrigin: raw.docOrigin || raw.doc_origin || null,
    debitAccount: raw.debitAccount || raw.debit_account || "152",
    creditAccount: raw.creditAccount || raw.credit_account || "331",
    totalAmount: Number(raw.totalAmount ?? raw.total_amount ?? 0),
    totalAmountWords: raw.totalAmountWords || raw.total_amount_words || null,
    attachedDocCount: raw.attachedDocCount || raw.attached_doc_count || null,
    signatures: raw.signatures || {
      creatorName: raw.creatorName || raw.creator_name,
      storekeeperName: raw.storekeeperName || raw.storekeeper_name,
      chiefAccountantName: raw.chiefAccountantName || raw.chief_accountant_name,
    },
    status: raw.status || "DRAFT",
    items: itemsRaw.map((it: any, idx: number) => {
      const pName =
        it.productName ||
        it.product_name ||
        it.productNameSnapshot ||
        it.product_name_snapshot ||
        "Vật tư";
      const uName = it.unit || it.unitSnapshot || it.unit_snapshot || "Cái";
      const dQty = Number(it.docQty ?? it.doc_qty ?? 0);
      const aQty = Number(it.actualQty ?? it.actual_qty ?? 0);
      const uPrice = Number(it.unitPrice ?? it.unit_price ?? 0);
      return {
        id: it.id || String(idx + 1),
        lineNo: Number(it.lineNo ?? it.line_no ?? idx + 1),
        productId: it.productId || it.product_id || "",
        productCode: it.productCode || it.product_code || it.code || "",
        productName: pName,
        productNameSnapshot:
          it.productNameSnapshot || it.product_name_snapshot || pName,
        unit: uName,
        unitSnapshot: it.unitSnapshot || it.unit_snapshot || uName,
        docQty: dQty,
        actualQty: aQty,
        unitPrice: uPrice,
        amount: Number(it.amount ?? aQty * uPrice),
        debitAccount: it.debitAccount || it.debit_account || null,
        creditAccount: it.creditAccount || it.credit_account || null,
        note: it.note || null,
      };
    }),
  };
}

export const receiptService = {
  async getReceipts(params?: GetReceiptsQuery, requestId?: string) {
    const res = await apiClient<any>("/goods-receipts", {
      method: "GET",
      params,
      requestId,
    });
    let rawList: any[] = [];
    if (Array.isArray(res?.data)) rawList = res.data;
    else if (Array.isArray(res?.data?.items)) rawList = res.data.items;
    else if (Array.isArray(res?.data?.receipts)) rawList = res.data.receipts;
    else if (Array.isArray(res)) rawList = res;

    const list = rawList.map(normalizeReceiptListItem);
    return {
      success: res?.success ?? true,
      data: list,
      pagination: res?.pagination ||
        res?.data?.pagination || {
          page: 1,
          limit: 50,
          totalItems: list.length,
          totalPages: 1,
        },
    };
  },

  async getReceiptById(id: string, requestId?: string) {
    const res = await apiClient<any>(`/goods-receipts/${id}`, {
      method: "GET",
      requestId,
    });
    const rawData = res?.data || res;
    return {
      success: res?.success ?? true,
      data: normalizeReceiptDetail(rawData),
    };
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
