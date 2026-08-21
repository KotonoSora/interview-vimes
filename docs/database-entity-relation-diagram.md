---
tags:
  - "#interview"
  - "#home-test"
  - "#2026-08-18"
  - "#mermaid"
  - "#er-chart"
---
# Tài Liệu Kỹ Thuật & Mô Hình Quan Hệ Cơ Sở Dữ Liệu Quản Lý Phiếu Nhập Kho (Mẫu 01 - VT)

Tài liệu này tổng hợp toàn bộ mô hình quan hệ thực thể (**Entity-Relationship Diagram - ERD**), luồng xử lý giao dịch dữ liệu (**Transaction & Concurrency Flow**), kiến trúc bảo mật truy cập (**Security & Access Boundary**), và vòng đời trạng thái chứng từ (**State Machine**) của cơ sở dữ liệu Quản lý Phiếu Nhập Kho, tuân thủ chuẩn mực kế toán Việt Nam (**Mẫu 01 - VT theo Thông tư 200/2014/TT-BTC** và **Điều 24, Điều 25 Luật Kế toán 2015**) cùng các chuẩn bảo mật, kiểm toán vận hành mức doanh nghiệp (Enterprise Audit & Security Standards).

## 1. Sơ Đồ Thực Thể Quan Hệ (Relational Entity-Relationship Diagram - ERD)

Mô hình dữ liệu quan hệ được chuẩn hóa 3NF kết hợp các ràng buộc khóa ngoại (Foreign Keys), ràng buộc kiểm tra (Check Constraints), bảng ghi nhận số dư tồn kho thời gian thực và bảng lưu vết kiểm toán bảo mật (`security_audit_logs`). Toàn bộ cú pháp đã được chuẩn hóa để hiển thị tốt trên mọi trình đọc Markdown (GitHub, GitLab, Obsidian, Notion).

Đoạn mã

```mermaid
erDiagram
    ORGANIZATIONS ||--o{ WAREHOUSES : "quản lý"
    ORGANIZATIONS ||--o{ GOODS_RECEIPTS : "phát sinh nghiệp vụ"
    WAREHOUSES ||--o{ GOODS_RECEIPTS : "tiếp nhận lưu trữ"
    WAREHOUSES ||--o{ INVENTORY_BALANCES : "ghi nhận số dư"
    PRODUCTS ||--o{ INVENTORY_BALANCES : "theo dõi tồn kho"
    PRODUCTS ||--o{ GOODS_RECEIPTS_ITEMS : "được tham chiếu"
    GOODS_RECEIPTS ||--|{ GOODS_RECEIPTS_ITEMS : "chứa các dòng chi tiết"
    GOODS_RECEIPTS ||--o{ SECURITY_AUDIT_LOGS : "ghi vết kiểm toán"

    ORGANIZATIONS {
        uuid id PK "Định danh duy nhất đơn vị"
        varchar code UK "Mã định danh đơn vị"
        varchar name "Tên doanh nghiệp hoặc đơn vị"
        varchar department "Bộ phận lập phiếu"
        timestamptz created_at "Thời điểm khởi tạo"
    }

    WAREHOUSES {
        uuid id PK "Định danh duy nhất kho"
        uuid organization_id FK "Thuộc đơn vị quản lý"
        varchar code UK "Mã kho tiếp nhận"
        varchar name "Tên kho tiếp nhận"
        varchar location "Địa điểm kho chi tiết"
        boolean is_active "Trạng thái sử dụng"
    }

    PRODUCTS {
        uuid id PK "Định danh duy nhất sản phẩm"
        varchar code UK "Cột C Mã số vật tư"
        varchar name "Cột B Tên quy cách phẩm chất"
        varchar unit "Cột D Đơn vị tính"
        numeric default_price "Đơn giá niêm yết tham chiếu"
        boolean is_active "Trạng thái kích hoạt"
        timestamptz created_at "Thời điểm tạo bản ghi"
    }

    GOODS_RECEIPTS {
        uuid id PK "Định danh chứng từ"
        varchar receipt_number UK "Số phiếu nhập kho duy nhất"
        date receipt_date "Ngày lập phiếu mua hàng hoặc sản xuất"
        date actual_received_date "Ngày thủ kho thực nhận và ghi thẻ kho"
        uuid organization_id FK "Đơn vị phát sinh nghiệp vụ"
        uuid warehouse_id FK "Kho nhập vật lý"
        varchar receipt_type "Phân loại nghiệp vụ nhập kho"
        text description "Nội dung kinh tế theo Điều 24 Luật Kế toán"
        varchar deliverer_name "Họ và tên người giao hàng"
        varchar doc_reference "Số hóa đơn hoặc chứng từ gốc"
        date doc_date "Ngày phát hành chứng từ gốc"
        varchar doc_origin "Đơn vị cấp chứng từ gốc"
        varchar debit_account "Tài khoản Nợ tổng hợp"
        varchar credit_account "Tài khoản Có tổng hợp"
        numeric total_amount "Cộng thành tiền Cột 4"
        text total_amount_words "Tổng số tiền viết bằng chữ"
        varchar attached_doc_count "Số chứng từ gốc kèm theo"
        varchar creator_name "Người lập phiếu ký"
        varchar storekeeper_name "Thủ kho ký"
        varchar chief_accountant_name "Kế toán trưởng ký"
        varchar status "Trạng thái DRAFT hoặc CONFIRMED hoặc CANCELLED"
        timestamptz created_at "Thời gian tạo trên hệ thống"
        timestamptz updated_at "Thời gian sửa đổi sau cùng"
    }

    GOODS_RECEIPTS_ITEMS {
        uuid id PK "Định danh dòng chi tiết"
        uuid receipt_id FK "Khóa ngoại phiếu nhập cha"
        uuid product_id FK "Khóa ngoại danh mục sản phẩm"
        int line_no "Cột A Số thứ tự dòng"
        varchar product_name_snapshot "Cột B Đóng băng tên quy cách lúc nhập"
        varchar unit_snapshot "Cột D Đóng băng đơn vị tính lúc nhập"
        numeric doc_qty "Cột 1 Số lượng theo chứng từ gốc"
        numeric actual_qty "Cột 2 Số lượng thực tế nhập kho"
        numeric unit_price "Cột 3 Đơn giá thực nhập hoặc hạch toán"
        numeric amount "Cột 4 Thành tiền thực nhập nhân đơn giá"
        varchar debit_account "Tài khoản Nợ chi tiết dòng"
        varchar credit_account "Tài khoản Có chi tiết dòng"
        varchar note "Ghi chú quy cách hoặc hao hụt"
    }

    INVENTORY_BALANCES {
        uuid warehouse_id PK,FK "Khóa ngoại kho lưu trữ"
        uuid product_id PK,FK "Khóa ngoại vật tư lưu trữ"
        numeric current_stock "Số lượng tồn kho thực tế"
        timestamptz updated_at "Thời điểm cập nhật sau cùng"
    }

    SECURITY_AUDIT_LOGS {
        uuid id PK "Định danh nhật ký kiểm toán"
        varchar request_id "Mã truy vết yêu cầu"
        varchar action "Hành động thực thi"
        varchar entity_name "Tên bảng chịu tác động"
        uuid entity_id "Mã định danh bản ghi liên quan"
        varchar client_ip "Địa chỉ IP của máy khách"
        text user_agent "Thông tin ứng dụng máy khách"
        varchar payload_hash "Mã băm nội dung yêu cầu"
        timestamptz created_at "Thời điểm phát sinh nhật ký"
    }
```

## 2. Luồng Xử Lý Giao Dịch Cơ Sở Dữ Liệu (ACID Database Transaction Flow)

Mô hình tuần tự (Sequence Diagram) mô tả chi tiết quy trình ghi nhận Master-Detail, bảo vệ tính toàn vẹn số học, cập nhật thẻ kho và lưu vết kiểm toán trong một Database Transaction duy nhất.

Đoạn mã

```mermaid
sequenceDiagram
    autonumber
    actor Client as Ứng dụng Máy khách
    participant GW as Cổng đảo chiều Nginx WAF
    participant API as Dịch vụ Backend Nodejs Express
    participant DB as Máy chủ Cơ sở dữ liệu PostgreSQL
    participant Audit as Hàng đợi Sự kiện Bất đồng bộ

    Client->>GW: Gửi yêu cầu lập phiếu nhập kho kèm mã truy vết
    Note over GW: Giới hạn tần suất và kiểm tra dung lượng yêu cầu
    GW->>API: Chuyển tiếp yêu cầu hợp lệ
    
    Note over API: Kiểm tra tính hợp lệ dữ liệu bằng Zod Schema<br/>Tính Thành tiền bằng Số lượng thực nhập nhân Đơn giá<br/>Tính Tổng cộng bằng tổng các dòng Thành tiền

    API->>DB: Bắt đầu giao dịch dữ liệu mức Read Committed
    
    API->>DB: Bước 1 Kiểm tra trùng lặp số phiếu nhập kho
    alt Số phiếu đã tồn tại trong hệ thống
        DB-->>API: Trả về bản ghi đã tồn tại
        API->>DB: Hủy bỏ toàn bộ giao dịch
        API-->>Client: Phản hồi lỗi 409 Số phiếu nhập đã tồn tại
    else Số phiếu hợp lệ chưa từng sử dụng
        DB-->>API: Xác nhận số phiếu chưa tồn tại
        API->>DB: Bước 2 Thêm mới dòng thông tin chung phiếu nhập kho
        DB-->>API: Trả về mã định danh phiếu vừa tạo

        loop Lặp qua từng dòng hàng hóa chi tiết
            API->>DB: Bước 3 Thêm mới dòng hàng hóa chi tiết đóng băng tên và đơn vị tính
            API->>DB: Bước 4 Cập nhật tăng số dư tồn kho thời gian thực
        end

        API->>DB: Bước 5 Ghi nhận nhật ký kiểm toán bảo mật giao dịch
        
        API->>DB: Xác nhận và chốt toàn bộ giao dịch thành công
        DB-->>API: Giao dịch hoàn tất đảm bảo tính toàn vẹn
        
        par Phát sự kiện phân tích bất đồng bộ
            API->>Audit: Đẩy sự kiện phiếu nhập đã tạo vào hàng đợi
        and Phản hồi cho máy khách
            API-->>Client: Phản hồi thành công mã 201 kèm mã phiếu và tổng tiền
        end
    end
```

## 3. Vòng Đời Trạng Thái Chứng Từ Kế Toán & Xử Lý Hoàn Kho (State Transition & Stock Reversal)

Sơ đồ trạng thái phản ánh quy tắc kiểm toán theo Thông tư 200 và Luật Kế toán: **Chứng từ đã xác nhận (`CONFIRMED`) không được xóa cứng (Hard Delete)** mà chỉ được phép hủy ghi sổ (`CANCELLED`) kèm nghiệp vụ hoàn kho (Stock Reversal).

Đoạn mã

```mermaid
stateDiagram-v2
    [*] --> DRAFT : Người lập tạo bản ghi nháp
    
    DRAFT --> CONFIRMED : Thủ kho kiểm đếm thực tế và ký xác nhận
    note right of CONFIRMED
        Khóa chỉnh sửa số lượng và đơn giá
        Tăng tồn kho tức thời trong thẻ kho
        Ghi nhận nhật ký kiểm toán bảo mật
    end note

    DRAFT --> DELETED : Hủy bỏ bản ghi nháp chưa ký
    note left of DELETED
        Xóa cứng khỏi cơ sở dữ liệu
        Tự động xóa các dòng chi tiết liên quan
        Không làm biến động số lượng tồn kho
    end note
    
    CONFIRMED --> CANCELLED : Hủy chứng từ kế toán hoặc xuất trả hàng
    note right of CANCELLED
        Xóa mềm giữ nguyên chứng từ phục vụ thanh tra
        Trừ ngược lại số lượng tồn kho đã cộng trước đó
        Khóa vĩnh viễn không cho phép sửa đổi lại
    end note

    DELETED --> [*]
    CANCELLED --> [*]
```

## 4. Mô Hình Cấu Trúc Tài Liệu NoSQL (Firestore / MongoDB Schema Flow)

Mô hình cấu trúc phân cấp Document NoSQL được thiết kế phi chuẩn hóa (Denormalization) nhằm tối ưu thao tác đọc đơn lẻ (Single-Document Read) cho ứng dụng di động Flutter.

Đoạn mã

```mermaid
classDiagram
    %% -------------------------------------------------------------
    %% ROOT COLLECTION: PRODUCTS
    %% -------------------------------------------------------------
    class ProductDocument {
        +String id
        +String code
        +String name
        +String unit
        +Number defaultPrice
        +Boolean isActive
        +Timestamp createdAt
    }

    %% -------------------------------------------------------------
    %% ROOT COLLECTION: GOODS_RECEIPTS
    %% -------------------------------------------------------------
    class GoodsReceiptDocument {
        +String id
        +String receiptNumber
        +Timestamp receiptDate
        +Timestamp actualReceivedDate
        +String receiptType
        +String description
        +OrganizationEmbed organization
        +WarehouseEmbed warehouse
        +DeliveryEmbed delivery
        +AccountingEmbed accounting
        +List~ReceiptItemEmbed~ items
        +Number totalAmount
        +String totalAmountWords
        +String attachedDocCount
        +SignaturesEmbed signatures
        +AuditMetaEmbed auditMeta
        +String status
        +Timestamp createdAt
        +Timestamp updatedAt
    }

    %% -------------------------------------------------------------
    %% SUB-COLLECTION / ROOT: WAREHOUSE STOCKS
    %% -------------------------------------------------------------
    class WarehouseStockDocument {
        +String productId
        +String productCode
        +Number currentStock
        +Timestamp lastUpdated
    }

    %% -------------------------------------------------------------
    %% EMBEDDED OBJECTS INSIDE GOODS_RECEIPTS
    %% -------------------------------------------------------------
    class OrganizationEmbed {
        +String code
        +String name
        +String department
    }

    class WarehouseEmbed {
        +String id
        +String code
        +String name
        +String location
    }

    class DeliveryEmbed {
        +String delivererName
        +String docReference
        +Timestamp docDate
        +String docOrigin
    }

    class AccountingEmbed {
        +String debitAccount
        +String creditAccount
    }

    class ReceiptItemEmbed {
        +String productId
        +Number lineNo
        +String productCode
        +String productName
        +String unit
        +Number docQty
        +Number actualQty
        +Number unitPrice
        +Number amount
        +String debitAccount
        +String creditAccount
        +String note
    }

    class SignaturesEmbed {
        +String creatorName
        +String storekeeperName
        +String chiefAccountantName
    }

    class AuditMetaEmbed {
        +String requestId
        +String clientIp
        +String userAgent
    }

    %% -------------------------------------------------------------
    %% RELATIONSHIPS & EMBEDDINGS
    %% -------------------------------------------------------------
    GoodsReceiptDocument *-- OrganizationEmbed : nhúng thông tin đơn vị
    GoodsReceiptDocument *-- WarehouseEmbed : nhúng thông tin kho bãi
    GoodsReceiptDocument *-- DeliveryEmbed : nhúng thông tin giao nhận
    GoodsReceiptDocument *-- AccountingEmbed : nhúng tài khoản hạch toán
    GoodsReceiptDocument *-- ReceiptItemEmbed : nhúng mảng dòng hàng hóa
    GoodsReceiptDocument *-- SignaturesEmbed : nhúng thông tin chữ ký 4 bên
    GoodsReceiptDocument *-- AuditMetaEmbed : nhúng thông tin kiểm toán bảo mật

    %% Tham chiếu liên Document (Reference Relationships)
    ReceiptItemEmbed ..> ProductDocument : tham chiếu productId
    WarehouseStockDocument ..> ProductDocument : theo dõi productId
    WarehouseEmbed ..> WarehouseStockDocument : sở hữu subcollection stocks
```

## 5. Ranh Giới Bảo Mật & Phân Quyền Cơ Sở Dữ Liệu (Security Boundary & Least Privilege)

Mô hình phân vùng an ninh cơ sở dữ liệu, phân tách rõ quyền hạn giữa các role kết nối nhằm ngăn chặn triệt để hành vi leo thang đặc quyền (Privilege Escalation) và rò rỉ dữ liệu (Data Exfiltration).

Đoạn mã

```mermaid
graph TD
    subgraph InternetZone["Vùng Mạng Công Cộng"]
        UserClient["Ứng dụng Trình duyệt và Thiết bị Di động"]
    end

    subgraph DMZ["Vùng Phân Tuyến và Lọc Lưu Lượng"]
        WAF["Hệ thống Tường lửa Ứng dụng Web"]
        NginxProxy["Cổng Đảo chiều Nginx kiểm soát tần suất"]
    end

    subgraph AppZone["Vùng Dịch Vụ Ứng Dụng"]
        NodeApp["Dịch vụ Backend Express Nodejs bảo mật"]
    end

    subgraph DatabaseZone["Vùng Cơ Sở Dữ Liệu Cách Ly"]
        DBUser["Tài khoản Ứng dụng giới hạn quyền"]
        DBEngine["Hệ quản trị Cơ sở dữ liệu PostgreSQL"]
        
        TablesDML["Các Bảng Dữ Liệu Nghiệp Vụ"]
        SchemaDDL["Cấu Trúc Bảng và Lệnh Thay Đổi Hệ Thống"]
    end

    UserClient -->|Lưu lượng mã hóa an toàn| WAF
    WAF -->|Lưu lượng đã được làm sạch| NginxProxy
    NginxProxy -->|Chuyển tiếp kèm mã truy vết yêu cầu| NodeApp
    NodeApp -->|Kết nối cơ sở dữ liệu an toàn| DBUser
    DBUser -->|Được phép thực hiện truy vấn và thêm sửa xóa dữ liệu| TablesDML
    DBUser -.->|Bị chặn toàn bộ các lệnh xóa hoặc thay đổi cấu trúc bảng| SchemaDDL

    classDef allow fill:#14532d,stroke:#22c55e,stroke-width:2px,color:#fff;
    classDef deny fill:#7f1d1d,stroke:#ef4444,stroke-width:2px,color:#fff;
    classDef app fill:#1e3a8a,stroke:#3b82f6,stroke-width:2px,color:#fff;

    class TablesDML allow;
    class SchemaDDL deny;
    class NodeApp,DBUser app;
```
