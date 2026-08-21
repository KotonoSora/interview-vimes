import { z } from "zod";

export const GoodsReceiptItemSchema = z.object({
  productId: z.string().min(1, "Mã sản phẩm không được để trống"),
  productNameSnapshot: z.string().min(1, "Tên sản phẩm không được để trống"),
  unitSnapshot: z.string().min(1, "Đơn vị tính không được để trống"),
  docQty: z.number().min(0, "Số lượng chứng từ phải >= 0"),
  actualQty: z.number().min(0, "Số lượng thực nhập phải >= 0"),
  unitPrice: z.number().min(0, "Đơn giá phải >= 0"),
  debitAccount: z.string().optional(),
  creditAccount: z.string().optional(),
  note: z.string().optional(),
});

export const GoodsReceiptFormSchema = z.object({
  organizationId: z.string().min(1, "Vui lòng chọn đơn vị"),
  receiptNumber: z.string().min(1, "Số phiếu không được để trống"),
  receiptDate: z.string().min(1, "Ngày lập phiếu không được để trống"),
  receiptType: z.enum([
    "PURCHASE",
    "INTERNAL_PRODUCTION",
    "OUTSOURCED_PROCESSING",
    "CAPITAL_CONTRIBUTION",
    "INVENTORY_SURPLUS",
  ]),
  debitAccount: z.string().optional(),
  creditAccount: z.string().optional(),
  warehouseId: z.string().min(1, "Vui lòng chọn kho tiếp nhận"),
  delivererName: z.string().min(1, "Họ tên người giao không được để trống"),
  actualReceivedDate: z.string().optional(),
  docReference: z.string().optional(),
  docDate: z.string().optional(),
  docOrigin: z.string().optional(),
  description: z.string().optional(),
  attachedDocCount: z.string().optional(),
  creatorName: z.string().optional(),
  storekeeperName: z.string().optional(),
  chiefAccountantName: z.string().optional(),
  totalAmountWords: z.string().optional(),
  status: z.enum(["DRAFT", "CONFIRMED", "CANCELLED"]).default("DRAFT"),
  items: z
    .array(GoodsReceiptItemSchema)
    .min(1, "Phiếu nhập phải có ít nhất 1 mặt hàng"),
});

export type GoodsReceiptFormData = z.infer<typeof GoodsReceiptFormSchema>;
export type GoodsReceiptItemData = z.infer<typeof GoodsReceiptItemSchema>;
