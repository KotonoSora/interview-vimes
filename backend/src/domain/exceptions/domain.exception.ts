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

    // Đảm bảo prototype chain chính xác khi kế thừa Error trong TypeScript
    Object.setPrototypeOf(this, new.target.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Lỗi vi phạm bất biến (Invariant) hoặc quy tắc nghiệp vụ của Domain Entity/Aggregate Root
 */
export class DomainValidationError extends DomainException {
  constructor(message: string) {
    super(message, 422);
  }
}

/**
 * Lỗi không tìm thấy Entity/Aggregate trong nghiệp vụ
 */
export class EntityNotFoundError extends DomainException {
  constructor(entityName: string, identifier: string) {
    super(`Không tìm thấy ${entityName} với định danh: ${identifier}`, 404);
  }
}

/**
 * Lỗi xung đột dữ liệu/khóa bi quan hoặc lạc quan (Optimistic/Pessimistic Concurrency Conflict)
 */
export class ConcurrencyConflictError extends DomainException {
  constructor(
    message: string = "Dữ liệu đã bị thay đổi bởi giao dịch khác. Vui lòng tải lại trang.",
  ) {
    super(message, 409);
  }
}
