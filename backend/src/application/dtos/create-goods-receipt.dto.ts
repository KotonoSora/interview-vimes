// src/application/dtos/create-goods-receipt.dto.ts
import { z } from "zod";

const dateSchema = z.preprocess(
  (arg) => {
    if (arg instanceof Date) return arg;
    if (typeof arg === "string") {
      // Bắt buộc chuỗi phải có định dạng YYYY-MM-DD hoặc ISO string bắt đầu bằng YYYY-MM-DD
      if (/^\d{2}-\d{2}-\d{4}$/.test(arg)) {
        return new Date(NaN);
      }
      if (/^\d{4}-\d{2}-\d{2}/.test(arg)) {
        return new Date(arg);
      }
      return new Date(NaN);
    }
    return arg;
  },
  z
    .date({ message: "Ngày lập phiếu không hợp lệ" })
    .refine((d) => !isNaN(d.getTime()), "Ngày lập phiếu không hợp lệ"),
);

const optionalDateSchema = z.preprocess(
  (arg) => {
    if (!arg) return undefined;
    if (arg instanceof Date) return arg;
    if (typeof arg === "string") {
      if (/^\d{2}-\d{2}-\d{4}$/.test(arg)) {
        return new Date(NaN);
      }
      if (/^\d{4}-\d{2}-\d{2}/.test(arg)) {
        return new Date(arg);
      }
      return new Date(NaN);
    }
    return arg;
  },
  z
    .date()
    .refine((d) => !isNaN(d.getTime()), "Ngày không hợp lệ")
    .optional()
    .nullable(),
);

export const GoodsReceiptItemInputSchema = z
  .object({
    lineNo: z
      .number()
      .int()
      .positive("Số thứ tự dòng phải là số nguyên dương")
      .optional(),
    productId: z.string().uuid("ID vật tư/hàng hóa không đúng định dạng UUID"),
    productNameSnapshot: z
      .string()
      .min(1, "Tên vật tư hàng hóa không được để trống"),
    unitSnapshot: z.string().min(1, "Đơn vị tính không được để trống"),
    docQty: z.number().nonnegative("Số lượng theo chứng từ không được âm"),
    actualQty: z.number().nonnegative("Số lượng thực nhập không được âm"),
    unitPrice: z.number().nonnegative("Đơn giá không được âm"),
    amount: z.number().nonnegative("Thành tiền không được âm").optional(),
    debitAccount: z.string().optional().nullable(),
    creditAccount: z.string().optional().nullable(),
    note: z.string().optional().nullable(),
  })
  .strict();

export const ReceiptItemInputSchema = GoodsReceiptItemInputSchema;

export const CreateGoodsReceiptSchema = z
  .object({
    receiptNumber: z.string().min(1, "Số phiếu nhập không được để trống"),
    organizationId: z.string().uuid("ID đơn vị không hợp lệ"),
    warehouseId: z.string().uuid("ID kho bãi không hợp lệ"),
    receiptDate: dateSchema,
    actualReceivedDate: optionalDateSchema,
    receiptType: z.enum([
      "PURCHASE",
      "INTERNAL_PRODUCTION",
      "OUTSOURCED_PROCESSING",
      "CAPITAL_CONTRIBUTION",
      "INVENTORY_SURPLUS",
    ]),
    delivererName: z.string().min(1, "Họ tên người giao không được để trống"),
    docReference: z.string().optional().nullable(),
    docDate: optionalDateSchema,
    docOrigin: z.string().optional().nullable(),
    debitAccount: z.string().optional().nullable(),
    creditAccount: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    totalAmountWords: z.string().optional().nullable(),
    attachedDocCount: z.union([z.string(), z.number()]).optional().nullable(),
    creatorName: z.string().optional().nullable(),
    storekeeperName: z.string().optional().nullable(),
    chiefAccountantName: z.string().optional().nullable(),
    status: z.enum(["DRAFT", "CONFIRMED"]).default("CONFIRMED"),
    items: z
      .array(GoodsReceiptItemInputSchema)
      .min(1, "Phiếu nhập phải có ít nhất 01 mặt hàng"),
  })
  .strict();

export type CreateGoodsReceiptDTO = z.infer<typeof CreateGoodsReceiptSchema>;
