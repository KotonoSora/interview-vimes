// src/domain/exceptions/domain.exception.ts
/**
 * Base abstract class cho toàn bộ ngoại lệ cấp Domain trong kiến trúc DDD
 */
export abstract class DomainException extends Error {
  public readonly status: number;

  constructor(message: string, status: number = 422) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;

    Object.setPrototypeOf(this, new.target.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Lỗi vi phạm bất biến (Invariant) hoặc quy tắc nghiệp vụ của Domain Entity/Aggregate Root (HTTP 422)
 */
export class DomainValidationError extends DomainException {
  constructor(message: string) {
    super(message, 422);
  }
}

/**
 * Lỗi không tìm thấy Entity/Aggregate trong nghiệp vụ (HTTP 404)
 */
export class EntityNotFoundError extends DomainException {
  constructor(entityName: string = "phiếu nhập kho", identifier?: string) {
    super(
      identifier
        ? `Không tìm thấy ${entityName} với ID đã cung cấp.`
        : `Không tìm thấy ${entityName} với ID đã cung cấp.`,
      404,
    );
  }
}

/**
 * Lỗi xung đột dữ liệu / Trùng mã chứng từ (HTTP 409)
 */
export class DomainConflictError extends DomainException {
  constructor(message: string) {
    super(message, 409);
  }
}

/**
 * Lỗi xung đột dữ liệu/khóa bi quan hoặc lạc quan (HTTP 409)
 */
export class ConcurrencyConflictError extends DomainException {
  constructor(
    message: string = "Dữ liệu đã bị thay đổi bởi giao dịch khác. Vui lòng tải lại trang.",
  ) {
    super(message, 409);
  }
}

/**
 * Lỗi thực thể không thể xử lý / Vi phạm trạng thái vòng đời (HTTP 422)
 */
export class DomainUnprocessableError extends DomainException {
  constructor(message: string) {
    super(message, 422);
  }
}
