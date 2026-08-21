import type { ApiErrorResponse } from "~/types/api.types";

/**
 * Trích xuất thông báo lỗi dễ đọc từ phản hồi API
 */
export function extractApiErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;

  const apiError = error as ApiErrorResponse;
  if (apiError?.errors && apiError.errors.length > 0) {
    return apiError.errors.map((e) => `${e.path}: ${e.message}`).join(", ");
  }

  if (apiError?.message) return apiError.message;

  return "Đã xảy ra lỗi không xác định trong quá trình giao tiếp máy chủ.";
}
