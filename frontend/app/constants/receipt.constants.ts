export const RECEIPT_TYPES = {
  PURCHASE: "PURCHASE",
  INTERNAL_PRODUCTION: "INTERNAL_PRODUCTION",
  OUTSOURCED_PROCESSING: "OUTSOURCED_PROCESSING",
  CAPITAL_CONTRIBUTION: "CAPITAL_CONTRIBUTION",
  INVENTORY_SURPLUS: "INVENTORY_SURPLUS",
} as const;

export const RECEIPT_TYPE_LABELS: Record<keyof typeof RECEIPT_TYPES, string> = {
  PURCHASE: "Mua ngoài (Lập 2 liên)",
  INTERNAL_PRODUCTION: "Tự sản xuất (Lập 3 liên)",
  OUTSOURCED_PROCESSING: "Thuê ngoài gia công",
  CAPITAL_CONTRIBUTION: "Nhận góp vốn",
  INVENTORY_SURPLUS: "Thừa phát hiện trong kiểm kê",
};

export const RECEIPT_STATUS = {
  DRAFT: "DRAFT",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
} as const;

export const RECEIPT_STATUS_LABELS: Record<
  keyof typeof RECEIPT_STATUS,
  string
> = {
  DRAFT: "Bản nháp",
  CONFIRMED: "Đã nhập kho",
  CANCELLED: "Đã hủy / Hoàn kho",
};

export const DEFAULT_ACCOUNTS = {
  DEBIT: "152", // Nguyên liệu, vật liệu
  CREDIT: "331", // Phải trả cho người bán
};
