// src/application/dtos/update-goods-receipt.dto.ts
import { z } from "zod";

import { GoodsReceiptItemInputSchema } from "#/application/dtos/create-goods-receipt.dto";

export const UpdateGoodsReceiptSchema = z.object({
  receiptDate: z.coerce.date().optional(),
  actualReceivedDate: z.coerce.date().optional().nullable(),
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
  docDate: z.coerce.date().optional().nullable(),
  docOrigin: z.string().optional().nullable(),
  debitAccount: z.string().optional().nullable(),
  creditAccount: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  totalAmountWords: z.string().optional().nullable(),
  attachedDocCount: z.union([z.string(), z.number()]).optional().nullable(),
  creatorName: z.string().optional().nullable(),
  storekeeperName: z.string().optional().nullable(),
  chiefAccountantName: z.string().optional().nullable(),
  items: z.array(GoodsReceiptItemInputSchema).min(1).optional(),
});

export type UpdateGoodsReceiptDTO = z.infer<typeof UpdateGoodsReceiptSchema>;
