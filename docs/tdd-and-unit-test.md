---
tags:
  - "#interview"
  - "#home-test"
  - "#2026-08-20"
  - "#tdd"
---
# Tài Liệu Kỹ Thuật & Kiểm Thử Quản Lý Phiếu Nhập Kho (Mẫu 01 - VT)

Khi áp dụng quy trình **Test-Driven Development (TDD)** cho kiến trúc **Domain-Driven Design (DDD)** của hệ thống Quản lý Phiếu Nhập Kho (Mẫu 01 - VT), các Unit Test được chia theo từng tầng độc lập (từ trong ra ngoài) nhằm đảm bảo 100% Invariants và Business Rules được kiểm chứng trước khi viết code thực thi.

  

Dưới đây là danh mục chi tiết **toàn bộ các Unit Test Cases cần viết**:

  

## TẦNG 1: DOMAIN LAYER (CORE INVARIANTS & BUSINESS RULES)

### 1. `Money` Value Object Test Suite (`money.vo.test.ts`)

- **TC-VO-MONEY-01:** Phải khởi tạo thành công khi số tiền là số dương hợp lệ.
    
      
    
- **TC-VO-MONEY-02:** Phải khởi tạo thành công khi số tiền bằng `0`.
    
      
    
- **TC-VO-MONEY-03:** Phải ném lỗi (`Error`) khi khởi tạo với số tiền âm (`amount < 0`).
    
      
    
- **TC-VO-MONEY-04:** Phải ném lỗi (`Error`) khi khởi tạo với giá trị `NaN` hoặc không hợp lệ.
    
      
    
- **TC-VO-MONEY-05:** Phải làm tròn chính xác 2 chữ số thập phân khi khởi tạo (ví dụ: `15000.556` $\rightarrow$`15000.56`).
    
      
    
- **TC-VO-MONEY-06:** Phương thức `add()` phải cộng chính xác hai đối tượng `Money` mà không bị sai số floating-point (`0.1 + 0.2 = 0.3`).
    
      
    
- **TC-VO-MONEY-07:** Phương thức `multiply()` phải nhân chính xác số tiền với một hệ số số lượng và làm tròn 2 chữ số thập phân.
    
      
    

### 2. `Quantity` Value Object Test Suite (`quantity.vo.test.ts`)

- **TC-VO-QTY-01:** Phải khởi tạo thành công khi số lượng là số dương hợp lệ.
    
      
    
- **TC-VO-QTY-02:** Phải khởi tạo thành công khi số lượng bằng `0`.
    
      
    
- **TC-VO-QTY-03:** Phải ném lỗi (`Error`) khi số lượng là số âm (`value < 0`).
    
      
    
- **TC-VO-QTY-04:** Phải ném lỗi (`Error`) khi số lượng là `NaN`.
    
      
    
- **TC-VO-QTY-05:** Phải làm tròn chính xác 3 chữ số thập phân cho đơn vị đo lường (ví dụ: `98.5556` $\rightarrow$`98.556`).
    
      
    

### 3. `ReceiptItem` Entity Test Suite (`receipt-item.entity.test.ts`)

- **TC-ENT-ITEM-01:** Phải tạo thành công thực thể `ReceiptItem` khi truyền đầy đủ các thuộc tính hợp lệ.
    
      
    
- **TC-ENT-ITEM-02:** Phải ném lỗi khi `productNameSnapshot` rỗng hoặc chỉ chứa khoảng trắng.
    
      
    
- **TC-ENT-ITEM-03:** Phải ném lỗi khi `unitSnapshot` rỗng hoặc chỉ chứa khoảng trắng.
    
      
    
- **TC-ENT-ITEM-04:** Phương thức `calculateAmount()` phải tính chính xác:
    
      
    
    $$\text{Cột 4 (Thành tiền)} = \text{Cột 2 (SL Thực nhập)} \times \text{Cột 3 (Đơn giá)}$$
    
- **TC-ENT-ITEM-05:** Phương thức `calculateAmount()` **không được** lấy `docQty` (SL Chứng từ) để tính thành tiền kể cả khi `docQty` khác `actualQty`.
    
      
    

### 4. `GoodsReceipt` Aggregate Root Test Suite (`goods-receipt.entity.test.ts`)

- **TC-AGG-GR-01:** Phải tạo thành công `GoodsReceipt` khi có đầy đủ Header và tối thiểu 1 dòng `items`.
    
      
    
- **TC-AGG-GR-02:** Phải ném lỗi khi `receiptNumber` rỗng hoặc chỉ chứa khoảng trắng.
    
      
    
- **TC-AGG-GR-03:** Phải ném lỗi khi `delivererName` rỗng hoặc chỉ chứa khoảng trắng.
    
      
    
- **TC-AGG-GR-04:** Phải ném lỗi khi mảng `items` rỗng (`items.length === 0`).
    
      
    
- **TC-AGG-GR-05:** Phương thức `calculateTotalAmount()` phải tính tổng chính xác bằng tổng Cột 4 của toàn bộ các dòng hàng trong phiếu.
    
      
    
- **TC-AGG-GR-06:** Phương thức `confirm()` phải chuyển trạng thái từ `DRAFT` sang `CONFIRMED`.
    
      
    
- **TC-AGG-GR-07:** Phương thức `confirm()` phải ném lỗi nếu phiếu đang ở trạng thái `CANCELLED`.
    
      
    
- **TC-AGG-GR-08:** Phương thức `cancel()` phải chuyển trạng thái sang `CANCELLED`.
    
      
    
- **TC-AGG-GR-09:** Phương thức `cancel()` phải ném lỗi nếu phiếu đã ở trạng thái `CANCELLED` trước đó.
    
      
    
- **TC-AGG-GR-10:** Thuộc tính `items` khi lấy ra phải là bản sao bất biến (Immutability check - không cho phép `push`trực tiếp từ bên ngoài làm thay đổi trạng thái Aggregate).
    
      
    

## TẦNG 2: APPLICATION LAYER (USE CASES & DTOS)

### 5. DTO Validation & Strict Schema Test Suite (`create-goods-receipt.dto.test.ts`)

- **TC-DTO-01:** Phải parse thành công khi truyền payload hợp lệ đúng chuẩn schema.
    
      
    
- **TC-DTO-02:** Phải ném lỗi `ZodError` khi thiếu các trường bắt buộc (`receiptNumber`, `receiptDate`, `warehouseId`, `organizationId`, `items`...).
    
      
    
- **TC-DTO-03:** Phải ném lỗi `ZodError` khi `receiptDate` sai định dạng `YYYY-MM-DD`.
    
      
    
- **TC-DTO-04:** Phải ném lỗi `ZodError` khi `productId`, `warehouseId`, `organizationId` không phải định dạng UUID.
    
      
    
- **TC-DTO-05:** Phải ném lỗi `ZodError` khi `docQty`, `actualQty` hoặc `unitPrice` là số âm.
    
      
    
- **TC-DTO-06:** Phải ném lỗi `ZodError` khi `receiptType` không thuộc enum quy định (`PURCHASE`, `INTERNAL_PRODUCTION`, ...).
    
      
    
- **TC-DTO-07:** Phải ném lỗi `ZodError` khi mảng `items` có độ dài bằng `0`.
    
      
    
- **TC-DTO-08 (Security/Anti-Mass Assignment):** Phải ném lỗi khi payload chứa trường lạ không được khai báo nhờ cờ `.strict()`.
    
      
    

### 6. `CreateGoodsReceiptUseCase` Test Suite (`create-goods-receipt.use-case.test.ts`)

_(Sử dụng Mock Repository `IGoodsReceiptRepository` và Mock Service `AuditTrailService`)_

  

- **TC-UC-CREATE-01:** Phải tạo phiếu thành công, gọi `receiptRepo.saveWithTransaction()`, gọi `auditService.logEvent()` và trả về `receiptId` cùng `totalAmount`.
    
      
    
- **TC-UC-CREATE-02:** Phải ném lỗi và dừng xử lý ngay từ đầu nếu `findByReceiptNumber()` phát hiện số phiếu đã tồn tại.
    
      
    
- **TC-UC-CREATE-03:** Phải gán đúng số thứ tự `lineNo` tăng dần từ `1..N` cho từng item trong danh sách.
    
      
    
- **TC-UC-CREATE-04:** Phải ánh xạ đúng trạng thái mặc định là `CONFIRMED` nếu DTO không truyền `status`.
    
      
    
- **TC-UC-CREATE-05:** Phải đảm bảo nếu `saveWithTransaction()` thất bại (ném exception), `auditService.logEvent()`**không được phép** được gọi.
    
      
    

### 7. `UpdateGoodsReceiptUseCase` Test Suite (`update-goods-receipt.use-case.test.ts`)

- **TC-UC-UPDATE-01:** Phải cập nhật thành công khi phiếu tồn tại và đang ở trạng thái `DRAFT`.
    
      
    
- **TC-UC-UPDATE-02:** Phải cập nhật và điều chỉnh tồn kho thành công khi phiếu đang ở trạng thái `CONFIRMED`.
    
      
    
- **TC-UC-UPDATE-03:** Phải ném lỗi khi không tìm thấy `id` phiếu nhập.
    
      
    
- **TC-UC-UPDATE-04:** Phải ném lỗi từ chối cập nhật khi phiếu đang ở trạng thái `CANCELLED`.
    
      
    

### 8. `DeleteGoodsReceiptUseCase` Test Suite (`delete-goods-receipt.use-case.test.ts`)

- **TC-UC-DELETE-01:** Phải thực thi Xóa cứng (Hard Delete) khi phiếu ở trạng thái `DRAFT`.
    
      
    
- **TC-UC-DELETE-02:** Phải thực thi Hủy chứng từ & Hoàn kho (Soft Delete / Stock Reversal) khi phiếu ở trạng thái `CONFIRMED`.
    
      
    
- **TC-UC-DELETE-03:** Phải ném lỗi khi chứng từ không tồn tại.
    
      
    
- **TC-UC-DELETE-04:** Phải ném lỗi khi cố tình hủy phiếu đã ở trạng thái `CANCELLED`.
    
      
    

## TẦNG 3: PRESENTATION & MIDDLEWARE LAYER

### 9. `RequestIdMiddleware` Test Suite (`request-id.middleware.test.ts`)

- **TC-MID-REQID-01:** Phải tự động sinh UUID mới và gắn vào `req.id` cùng Header `X-Request-Id` nếu client không gửi header này.
    
      
    
- **TC-MID-REQID-02:** Phải giữ nguyên và sử dụng `X-Request-Id` do client gửi lên trong header.
    
      
    

### 10. `ErrorMiddleware` Test Suite (`error.middleware.test.ts`)

- **TC-MID-ERR-01:** Khi nhận `ZodError`, phải trả về HTTP `400` kèm mảng chi tiết `errors` và `requestId`.
    
      
    
- **TC-MID-ERR-02:** Khi ở môi trường `production`, lỗi HTTP `500` phải trả về thông báo chung, **tuyệt đối không** để lộ `stack trace` hay chi tiết lỗi DB.
    
      
    
- **TC-MID-ERR-03:** Khi ở môi trường `development`, lỗi HTTP `500` phải trả về message thực tế phục vụ debug.
    
      
    

### 11. `HealthController` Test Suite (`health.controller.test.ts`)

- **TC-CTRL-HLTH-01 (`/healthz`):** Phải trả về HTTP `200`, `status: "UP"`, `uptime` và `timestamp`.
    
      
    
- **TC-CTRL-HLTH-02 (`/ready` - Success):** Khi Database kết nối bình thường, phải trả về HTTP `200` và `status: "READY"`.
    
      
    
- **TC-CTRL-HLTH-03 (`/ready` - Failure):** Khi Mock Database query ném lỗi, phải trả về HTTP `503` và `status: "UNHEALTHY"`.
    

## BẢNG TỔNG KẾT MA TRẬN TEST CASES

| **STT**  | **Tên Suite Test**                      | **Đối tượng kiểm thử**              | **Số lượng Test Cases** | **Mục tiêu Invariant chính**                  |
| -------- | --------------------------------------- | ----------------------------------- | ----------------------- | --------------------------------------------- |
| 1        | `money.vo.test.ts`                      | `Money` Value Object                | 7                       | Không âm, làm tròn 2 số, chặn floating-point  |
| 2        | `quantity.vo.test.ts`                   | `Quantity` Value Object             | 5                       | Không âm, làm tròn 3 số thập phân             |
| 3        | `receipt-item.entity.test.ts`           | `ReceiptItem` Entity                | 5                       | Công thức Cột 4 = Cột 2 $\times$ Cột 3        |
| 4        | `goods-receipt.entity.test.ts`          | `GoodsReceipt`Aggregate             | 10                      | Bắt buộc có dòng hàng, Tổng Cột 4, State lock |
| 5        | `create-goods-receipt.dto.test.ts`      | Zod Schema Validation               | 8                       | Format ngày, UUID, Anti-Mass Assignment       |
| 6        | `create-goods-receipt.use-case.test.ts` | Create Use Case                     | 5                       | Chặn trùng số phiếu, Transaction, Event       |
| 7        | `update-goods-receipt.use-case.test.ts` | Update Use Case                     | 4                       | Xử lý chênh lệch kho, chặn sửa phiếu hủy      |
| 8        | `delete-goods-receipt.use-case.test.ts` | Delete Use Case                     | 4                       | Xóa cứng DRAFT vs Hoàn kho CONFIRMED          |
| 9        | `request-id.middleware.test.ts`         | Tracing Middleware                  | 2                       | Header injection & Propagation                |
| 10       | `error.middleware.test.ts`              | Error Handler                       | 3                       | Format lỗi Zod, Masking Production Stack      |
| 11       | `health.controller.test.ts`             | Health Probes                       | 3                       | Liveness 200, Readiness 200/503               |
| **Tổng** | **11 Test Suites**                      | **Toàn bộ Business & Presentation** | **56 Test Cases**       | **100% Code Coverage trên Domain & App**      |