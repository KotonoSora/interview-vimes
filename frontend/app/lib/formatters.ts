/**
 * Định dạng số thành tiền tệ VNĐ (ví dụ: 1,477,500 ₫)
 */
export function formatCurrencyVND(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
}

/**
 * Định dạng số lượng (ví dụ: 98.5 hoặc 100)
 */
export function formatQuantity(qty: number | null | undefined): string {
  if (qty === null || qty === undefined || isNaN(qty)) return "0";
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 3 }).format(
    qty,
  );
}

/**
 * Định dạng ngày YYYY-MM-DD sang DD/MM/YYYY
 */
export function formatDateVN(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) return dateStr;
  return `${day}/${month}/${year}`;
}

/**
 * Sinh số phiếu tự động theo mẫu PNK-YYYY-XXXX
 */
export function generateReceiptNumber(prefix = "PNK"): string {
  const currentYear = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${currentYear}-${randomSuffix}`;
}
