import { z } from "zod";

export const ReceiptItemInputSchema = z.object({
  productId: z.string().uuid(),
  productNameSnapshot: z.string().min(1),
  unitSnapshot: z.string().min(1),
  docQty: z.number().min(0),
  actualQty: z.number().min(0),
  unitPrice: z.number().min(0),
  debitAccount: z.string().nullable().optional(),
  creditAccount: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
});
export type ReceiptItemInput = z.infer<typeof ReceiptItemInputSchema>;

export const CreateGoodsReceiptSchema = z.object({
  receiptNumber: z.string().min(1),
  receiptDate: z.string().min(1),
  actualReceivedDate: z.string().nullable().optional(),
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
    .default("PURCHASE"),
  description: z.string().nullable().optional(),
  delivererName: z.string().min(1),
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
  status: z.enum(["DRAFT", "CONFIRMED"]).default("CONFIRMED"),
  items: z.array(ReceiptItemInputSchema).min(1),
});
export type CreateGoodsReceiptRequest = z.infer<
  typeof CreateGoodsReceiptSchema
>;
export const GoodsReceiptFormSchema = CreateGoodsReceiptSchema;
export type GoodsReceiptFormData = CreateGoodsReceiptRequest;

export const UpdateGoodsReceiptSchema = z.object({
  receiptDate: z.string().optional(),
  actualReceivedDate: z.string().nullable().optional(),
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
  description: z.string().nullable().optional(),
  delivererName: z.string().min(1),
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
  status: z.enum(["DRAFT", "CONFIRMED"]).optional(),
  items: z.array(ReceiptItemInputSchema).min(1),
});
export type UpdateGoodsReceiptRequest = z.infer<
  typeof UpdateGoodsReceiptSchema
>;
