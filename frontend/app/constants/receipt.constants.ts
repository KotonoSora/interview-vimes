// app/constants/receipt.constants.ts

export const RECEIPT_TYPES = {
  PURCHASE: "PURCHASE",
  INTERNAL_PRODUCTION: "INTERNAL_PRODUCTION",
  OUTSOURCED_PROCESSING: "OUTSOURCED_PROCESSING",
  CAPITAL_CONTRIBUTION: "CAPITAL_CONTRIBUTION",
  INVENTORY_SURPLUS: "INVENTORY_SURPLUS",
} as const;

export type ReceiptType = keyof typeof RECEIPT_TYPES;

export const RECEIPT_TYPE_LABELS: Record<ReceiptType, string> = {
  PURCHASE: "Mua ngoài",
  INTERNAL_PRODUCTION: "Tự sản xuất",
  OUTSOURCED_PROCESSING: "Gia công về",
  CAPITAL_CONTRIBUTION: "Góp vốn",
  INVENTORY_SURPLUS: "Kiểm kê thừa",
};

export const RECEIPT_STATUS = {
  DRAFT: "DRAFT",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
} as const;

export type ReceiptStatus = keyof typeof RECEIPT_STATUS;

export const RECEIPT_STATUS_LABELS: Record<ReceiptStatus, string> = {
  DRAFT: "Bản nháp",
  CONFIRMED: "Đã nhập kho",
  CANCELLED: "Đã hủy",
};
