// src/application/dtos/update-goods-receipt.dto.ts
import { z } from "zod";

import { GoodsReceiptItemInputSchema } from "#/application/dtos/create-goods-receipt.dto";

const optionalIsoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày phải có định dạng YYYY-MM-DD")
  .refine((val) => !isNaN(Date.parse(val)), "Ngày không hợp lệ")
  .optional()
  .nullable();

export const UpdateGoodsReceiptSchema = z
  .object({
    organizationId: z.string().uuid().optional(),
    warehouseId: z.string().uuid().optional(),
    receiptDate: optionalIsoDateString,
    actualReceivedDate: optionalIsoDateString,
    receiptType: z
      .enum([
        "PURCHASE",
        "INTERNAL_PRODUCTION",
        "OUTSOURCED_PROCESSING",
        "CAPITAL_CONTRIBUTION",
        "INVENTORY_SURPLUS",
      ])
      .optional(),
    delivererName: z.string().min(1).optional(),
    docReference: z.string().optional().nullable(),
    docDate: optionalIsoDateString,
    docOrigin: z.string().optional().nullable(),
    debitAccount: z.string().optional().nullable(),
    creditAccount: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    totalAmountWords: z.string().optional().nullable(),
    attachedDocCount: z.union([z.string(), z.number()]).optional().nullable(),
    creatorName: z.string().optional().nullable(),
    storekeeperName: z.string().optional().nullable(),
    chiefAccountantName: z.string().optional().nullable(),
    status: z.enum(["DRAFT", "CONFIRMED", "CANCELLED"]).optional(),
    items: z.array(GoodsReceiptItemInputSchema).min(1).optional(),
  })
  .strict();

export type UpdateGoodsReceiptDTO = z.infer<typeof UpdateGoodsReceiptSchema>;
