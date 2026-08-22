import { z } from "zod";

import type { ReceiptStatus, ReceiptType } from "~/constants/receipt.constants";

import { RECEIPT_STATUS, RECEIPT_TYPES } from "~/constants/receipt.constants";

export { RECEIPT_TYPES, RECEIPT_STATUS };
export type { ReceiptType, ReceiptStatus };

const receiptTypeValues = Object.keys(RECEIPT_TYPES) as [
  ReceiptType,
  ...ReceiptType[],
];
const receiptStatusValues = Object.keys(RECEIPT_STATUS) as [
  ReceiptStatus,
  ...ReceiptStatus[],
];

export const ReceiptItemInputSchema = z.object({
  id: z.string().optional(),
  productId: z.string().min(1, "Vui lòng chọn vật tư"),
  productNameSnapshot: z.string().min(1, "Tên vật tư không được để trống"),
  unitSnapshot: z.string().min(1, "Đơn vị tính không được để trống"),
  docQty: z.number().min(0, "Số lượng chứng từ phải >= 0"),
  actualQty: z.number().min(0.0001, "Số lượng thực nhập phải > 0"),
  unitPrice: z.number().min(0, "Đơn giá phải >= 0"),
  debitAccount: z.string().nullable().optional(),
  creditAccount: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
});
export type ReceiptItemInput = z.infer<typeof ReceiptItemInputSchema>;
export type GoodsReceiptItem = ReceiptItemInput & {
  productCodeSnapshot?: string | null;
  productName?: string;
  unit?: string;
};

export const CreateGoodsReceiptSchema = z.object({
  receiptNumber: z.string().min(1, "Số phiếu nhập không được để trống"),
  receiptDate: z.string().min(1, "Ngày lập phiếu không được để trống"),
  actualReceivedDate: z.string().nullable().optional(),
  organizationId: z.string().min(1, "Vui lòng chọn đơn vị"),
  warehouseId: z.string().min(1, "Vui lòng chọn kho tiếp nhận"),
  receiptType: z.enum(receiptTypeValues).default("PURCHASE"),
  description: z.string().nullable().optional(),
  delivererName: z
    .string()
    .min(1, "Họ tên người giao hàng không được để trống"),
  docReference: z.string().nullable().optional(),
  docDate: z.string().nullable().optional(),
  docOrigin: z.string().nullable().optional(),
  debitAccount: z.string().nullable().optional(),
  creditAccount: z.string().nullable().optional(),
  totalAmountWords: z.string().nullable().optional(),
  attachedDocCount: z.string().nullable().optional(),
  creatorName: z.string().nullable().optional(),
  storekeeperName: z.string().nullable().optional(),
  chiefAccountantName: z.string().nullable().optional(),
  status: z.enum(receiptStatusValues).default("CONFIRMED"),
  items: z
    .array(ReceiptItemInputSchema)
    .min(1, "Phiếu nhập phải có ít nhất 1 dòng vật tư"),
});
export type CreateGoodsReceiptRequest = z.infer<
  typeof CreateGoodsReceiptSchema
>;
export const GoodsReceiptFormSchema = CreateGoodsReceiptSchema;
export type GoodsReceiptFormData = CreateGoodsReceiptRequest;

export const UpdateGoodsReceiptSchema = z.object({
  receiptDate: z.string().optional(),
  actualReceivedDate: z.string().nullable().optional(),
  organizationId: z.string().min(1, "Vui lòng chọn đơn vị"),
  warehouseId: z.string().min(1, "Vui lòng chọn kho tiếp nhận"),
  receiptType: z.enum(receiptTypeValues).optional(),
  description: z.string().nullable().optional(),
  delivererName: z
    .string()
    .min(1, "Họ tên người giao hàng không được để trống"),
  docReference: z.string().nullable().optional(),
  docDate: z.string().nullable().optional(),
  docOrigin: z.string().nullable().optional(),
  debitAccount: z.string().nullable().optional(),
  creditAccount: z.string().nullable().optional(),
  totalAmountWords: z.string().nullable().optional(),
  attachedDocCount: z.string().nullable().optional(),
  creatorName: z.string().nullable().optional(),
  storekeeperName: z.string().nullable().optional(),
  chiefAccountantName: z.string().nullable().optional(),
  status: z.enum(receiptStatusValues).optional(),
  items: z
    .array(ReceiptItemInputSchema)
    .min(1, "Phiếu nhập phải có ít nhất 1 dòng vật tư"),
});
export type UpdateGoodsReceiptRequest = z.infer<
  typeof UpdateGoodsReceiptSchema
>;

export interface GoodsReceipt {
  id: string;
  receiptNumber: string;
  receiptDate: string;
  actualReceivedDate?: string | null;
  organizationId?: string;
  organization?: {
    id: string;
    code?: string | null;
    name: string;
  } | null;
  warehouseId?: string;
  warehouse?: {
    id: string;
    code?: string | null;
    name: string;
  } | null;
  receiptType: ReceiptType;
  delivererName: string;
  docReference?: string | null;
  docDate?: string | null;
  docOrigin?: string | null;
  description?: string | null;
  debitAccount?: string | null;
  creditAccount?: string | null;
  totalAmount: number;
  totalAmountWords?: string | null;
  attachedDocCount?: string | null;
  creatorName?: string | null;
  storekeeperName?: string | null;
  chiefAccountantName?: string | null;
  status: ReceiptStatus;
  createdAt?: string;
  updatedAt?: string;
  items: GoodsReceiptItem[];
}

export type GoodsReceiptDetail = GoodsReceipt;
