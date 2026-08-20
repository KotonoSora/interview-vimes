// src/application/dtos/create-goods-receipt.dto.ts
import { z } from "zod";

export const ReceiptItemInputSchema = z
  .object({
    productId: z.string().uuid("Mã sản phẩm phải là định dạng UUID"),
    productNameSnapshot: z
      .string()
      .min(1, "Tên quy cách vật tư không được để trống"),
    unitSnapshot: z.string().min(1, "Đơn vị tính không được để trống"),
    docQty: z.number().min(0, "Số lượng theo chứng từ không được âm"),
    actualQty: z.number().min(0, "Số lượng thực nhập không được âm"),
    unitPrice: z.number().min(0, "Đơn giá nhập không được âm"),
    debitAccount: z.string().optional(),
    creditAccount: z.string().optional(),
    note: z.string().optional(),
  })
  .strict();

export const CreateGoodsReceiptSchema = z
  .object({
    receiptNumber: z.string().min(1, "Số phiếu nhập không được để trống"),
    receiptDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Định dạng ngày lập phải là YYYY-MM-DD"),
    actualReceivedDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Định dạng ngày nhận phải là YYYY-MM-DD")
      .optional(),
    organizationId: z.string().uuid("Organization ID phải là định dạng UUID"),
    warehouseId: z.string().uuid("Warehouse ID phải là định dạng UUID"),
    receiptType: z
      .enum([
        "PURCHASE",
        "INTERNAL_PRODUCTION",
        "OUTSOURCED_PROCESSING",
        "CAPITAL_CONTRIBUTION",
        "INVENTORY_SURPLUS",
      ])
      .default("PURCHASE"),
    description: z.string().optional(),
    delivererName: z.string().min(1, "Họ tên người giao không được để trống"),
    docReference: z.string().optional(),
    docDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    docOrigin: z.string().optional(),
    debitAccount: z.string().optional(),
    creditAccount: z.string().optional(),
    totalAmountWords: z.string().optional(),
    attachedDocCount: z.string().optional(),
    creatorName: z.string().optional(),
    storekeeperName: z.string().optional(),
    chiefAccountantName: z.string().optional(),
    status: z.enum(["DRAFT", "CONFIRMED"]).default("CONFIRMED"),
    items: z
      .array(ReceiptItemInputSchema)
      .min(1, "Phiếu nhập phải có ít nhất 1 dòng hàng hóa"),
  })
  .strict();

export type CreateGoodsReceiptDTO = z.infer<typeof CreateGoodsReceiptSchema>;
