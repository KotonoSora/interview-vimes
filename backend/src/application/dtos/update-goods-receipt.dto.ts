// src/application/dtos/update-goods-receipt.dto.ts
import { z } from "zod";
import { ReceiptItemInputSchema } from "#/application/dtos/create-goods-receipt.dto";

export const UpdateGoodsReceiptSchema = z
  .object({
    receiptDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    actualReceivedDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    organizationId: z.string().uuid(),
    warehouseId: z.string().uuid(),
    receiptType: z
      .enum([
        "PURCHASE",
        "INTERNAL_PRODUCTION",
        "OUTSOURCED_PROCESSING",
        "CAPITAL_CONTRIBUTION",
        "INVENTORY_SURPLUS",
      ])
      .optional(),
    description: z.string().optional(),
    delivererName: z.string().min(1),
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
    status: z.enum(["DRAFT", "CONFIRMED"]).optional(),
    items: z.array(ReceiptItemInputSchema).min(1),
  })
  .strict();

export type UpdateGoodsReceiptDTO = z.infer<typeof UpdateGoodsReceiptSchema>;
