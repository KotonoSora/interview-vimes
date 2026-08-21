import { z } from "zod";

import { RECEIPT_STATUS, RECEIPT_TYPES } from "~/constants/receipt.constants";

export const ReceiptItemSchema = z.object({
  id: z.string().uuid().optional(),
  lineNo: z.number().int().positive().optional(),
  productId: z.string().uuid("Vui lòng chọn mã vật tư"),
  productCode: z.string().optional(),
  productNameSnapshot: z.string().min(1, "Tên vật tư không được để trống"),
  unitSnapshot: z.string().min(1, "Đơn vị tính không được để trống"),
  docQty: z.coerce.number().min(0, "Số lượng theo chứng từ phải >= 0"),
  actualQty: z.coerce.number().min(0, "Số lượng thực nhập phải >= 0"),
  unitPrice: z.coerce.number().min(0, "Đơn giá phải >= 0"),
  debitAccount: z.string().optional().default("152"),
  creditAccount: z.string().optional().default("331"),
  note: z.string().optional().default(""),
});

export const GoodsReceiptFormSchema = z.object({
  receiptNumber: z.string().min(1, "Số phiếu nhập không được để trống"),
  receiptDate: z.string().min(1, "Ngày lập phiếu bắt buộc"),
  actualReceivedDate: z.string().optional().default(""),
  organizationId: z.string().uuid("Vui lòng chọn đơn vị"),
  warehouseId: z.string().uuid("Vui lòng chọn kho tiếp nhận"),
  receiptType: z.enum([
    RECEIPT_TYPES.PURCHASE,
    RECEIPT_TYPES.INTERNAL_PRODUCTION,
    RECEIPT_TYPES.OUTSOURCED_PROCESSING,
    RECEIPT_TYPES.CAPITAL_CONTRIBUTION,
    RECEIPT_TYPES.INVENTORY_SURPLUS,
  ]),
  description: z.string().optional().default(""),
  delivererName: z.string().min(1, "Họ tên người giao không được để trống"),
  docReference: z.string().optional().default(""),
  docDate: z.string().optional().default(""),
  docOrigin: z.string().optional().default(""),
  debitAccount: z.string().optional().default("152"),
  creditAccount: z.string().optional().default("331"),
  totalAmountWords: z.string().optional().default(""),
  attachedDocCount: z.string().optional().default(""),
  creatorName: z.string().optional().default(""),
  storekeeperName: z.string().optional().default(""),
  chiefAccountantName: z.string().optional().default(""),
  status: z.enum([RECEIPT_STATUS.DRAFT, RECEIPT_STATUS.CONFIRMED]),
  items: z
    .array(ReceiptItemSchema)
    .min(1, "Phiếu nhập phải có ít nhất 1 mặt hàng"),
});

export type ReceiptItem = z.infer<typeof ReceiptItemSchema>;
export type GoodsReceiptFormData = z.infer<typeof GoodsReceiptFormSchema>;
