---
tags:
  - "#interview"
  - "#home-test"
  - "#2026-08-18"
---
# Tài Liệu Kỹ Thuật & Hướng Dẫn Bảo Trì Cơ Sở Dữ Liệu Quản Lý Phiếu Nhập Kho (Mẫu 01 - VT)

Hệ thống cơ sở dữ liệu được thiết kế nhằm đáp ứng chuẩn mực kế toán Việt Nam (**Mẫu 01 - VT ban hành theo Thông tư 200/2014/TT-BTC** và **Điều 24, Điều 25 Luật Kế toán 2015**), đảm bảo tính toàn vẹn dữ liệu kế toán, lưu vết kiểm toán (Audit Trail), hỗ trợ mở rộng quy mô đa chi nhánh và tích hợp các tiêu chuẩn bảo mật dữ liệu cấp doanh nghiệp (**Enterprise Data Security & Anti-Exfiltration**).

  

## PHẦN 1: HỆ THỐNG CƠ SỞ DỮ LIỆU QUAN HỆ (SQL - POSTGRESQL)

Thiết kế SQL chuẩn hóa 3NF (Third Normal Form) kết hợp các ràng buộc khóa ngoại (Foreign Keys), kiểm tra hợp lệ (Check Constraints), cơ chế khóa dòng giao dịch (Row-Level Locking) và phân quyền theo nguyên tắc đặc quyền tối thiểu (**Principle of Least Privilege**).

  

### 1. Bảng Từ Điển Dữ Liệu Tối Giản (Data Dictionary)

**Bảng: `organizations` (Đơn vị chủ quản & Bộ phận nhập kho)**

  

|**Cột**|**Kiểu Dữ Liệu**|**Ràng Buộc**|**Null**|**Mô Tả**|
|---|---|---|---|---|
|`id`|`UUID`|`PK, DEFAULT gen_random_uuid()`|No|Định danh duy nhất đơn vị|
|`code`|`VARCHAR(50)`|`UNIQUE`|No|Mã định danh đơn vị (VD: VIMES-HN)|
|`name`|`VARCHAR(255)`||No|Tên doanh nghiệp / đơn vị cấp trên|
|`department`|`VARCHAR(255)`||Yes|Tên bộ phận lập/nhập (Mua hàng, Xưởng SX...)|
|`created_at`|`TIMESTAMPTZ`|`DEFAULT now()`|No|Thời điểm khởi tạo|

**Bảng: `warehouses` (Kho bãi lưu trữ)**

  

|**Cột**|**Kiểu Dữ Liệu**|**Ràng Buộc**|**Null**|**Mô Tả**|
|---|---|---|---|---|
|`id`|`UUID`|`PK, DEFAULT gen_random_uuid()`|No|Định danh duy nhất kho|
|`organization_id`|`UUID`|`FK -> organizations(id)`|No|Thuộc đơn vị quản lý nào|
|`code`|`VARCHAR(50)`|`UNIQUE`|No|Mã kho (VD: KHO-TONG-01)|
|`name`|`VARCHAR(255)`||No|Tên kho tiếp nhận hàng|
|`location`|`VARCHAR(500)`||Yes|Địa điểm kho chi tiết|
|`is_active`|`BOOLEAN`|`DEFAULT true`|No|Trạng thái sử dụng|

**Bảng: `products` (Danh mục vật tư, công cụ, sản phẩm, hàng hóa)**

  

|**Cột**|**Kiểu Dữ Liệu**|**Ràng Buộc**|**Null**|**Mô Tả**|
|---|---|---|---|---|
|`id`|`UUID`|`PK, DEFAULT gen_random_uuid()`|No|Định danh sản phẩm|
|`code`|`VARCHAR(50)`|`UNIQUE`|No|Mã số vật tư (Cột C trên biểu mẫu)|
|`name`|`VARCHAR(255)`||No|Tên, quy cách phẩm chất (Cột B)|
|`unit`|`VARCHAR(50)`||No|Đơn vị tính (Cột D: Kg, Mét, Bộ, Cái...)|
|`default_price`|`NUMERIC(15,2)`|`CHECK (default_price >= 0)`|No|Đơn giá niêm yết tham chiếu|
|`is_active`|`BOOLEAN`|`DEFAULT true`|No|Trạng thái kích hoạt|
|`created_at`|`TIMESTAMPTZ`|`DEFAULT now()`|No|Thời điểm tạo bản ghi|

**Bảng: `goods_receipts` (Phiếu Nhập Kho - Master Header)**

  

|**Cột**|**Kiểu Dữ Liệu**|**Ràng Buộc**|**Null**|**Mô Tả Pháp Lý & Nghiệp Vụ**|
|---|---|---|---|---|
|`id`|`UUID`|`PK, DEFAULT gen_random_uuid()`|No|Định danh chứng từ|
|`receipt_number`|`VARCHAR(50)`|`UNIQUE`|No|Số phiếu nhập (VD: PNK-2026-0001)|
|`receipt_date`|`DATE`||No|Ngày lập phiếu (Bộ phận mua hàng/sản xuất lập)|
|`actual_received_date`|`DATE`||Yes|Ngày thủ kho thực nhận và ghi Thẻ kho|
|`organization_id`|`UUID`|`FK -> organizations(id)`|No|Đơn vị chủ quản lập phiếu|
|`warehouse_id`|`UUID`|`FK -> warehouses(id)`|No|Kho nhập vật lý|
|`receipt_type`|`VARCHAR(50)`|`CHECK IN (...)`|No|Loại nhập: Mua ngoài, Tự SX, Gia công, Góp vốn, Thừa|
|`description`|`TEXT`||Yes|Tóm tắt nội dung nghiệp vụ kinh tế (Đ.24 Luật KT)|
|`deliverer_name`|`VARCHAR(255)`||No|Họ và tên người giao hàng|
|`doc_reference`|`VARCHAR(100)`||Yes|Số hóa đơn hoặc lệnh nhập kho|
|`doc_date`|`DATE`||Yes|Ngày của chứng từ gốc|
|`doc_origin`|`VARCHAR(255)`||Yes|Đơn vị xuất chứng từ gốc|
|`debit_account`|`VARCHAR(50)`||Yes|Tài khoản Nợ tổng hợp (VD: 152, 156)|
|`credit_account`|`VARCHAR(50)`||Yes|Tài khoản Có tổng hợp (VD: 331, 111)|
|`total_amount`|`NUMERIC(15,2)`|`CHECK (total_amount >= 0)`|No|Tổng cộng thành tiền phiếu (Cộng Cột 4)|
|`total_amount_words`|`TEXT`||Yes|Tổng số tiền viết bằng chữ|
|`attached_doc_count`|`VARCHAR(100)`||Yes|Số chứng từ gốc kèm theo|
|`creator_name`|`VARCHAR(255)`||Yes|Họ tên Người lập phiếu ký|
|`storekeeper_name`|`VARCHAR(255)`||Yes|Họ tên Thủ kho ký|
|`chief_accountant_name`|`VARCHAR(255)`||Yes|Họ tên Kế toán trưởng (hoặc Phụ trách bộ phận) ký|
|`status`|`VARCHAR(20)`|`CHECK IN (DRAFT, CONFIRMED, CANCELLED)`|No|Trạng thái vòng đời chứng từ|
|`created_at`|`TIMESTAMPTZ`|`DEFAULT now()`|No|Thời gian tạo trên hệ thống|
|`updated_at`|`TIMESTAMPTZ`|`DEFAULT now()`|No|Thời gian sửa đổi sau cùng|

**Bảng: `goods_receipt_items` (Chi Tiết Vật Tư - Detail Lines)**

  

|**Cột**|**Kiểu Dữ Liệu**|**Ràng Buộc**|**Null**|**Mô Tả Pháp Lý & Nghiệp Vụ**|
|---|---|---|---|---|
|`id`|`UUID`|`PK, DEFAULT gen_random_uuid()`|No|Định danh dòng chi tiết|
|`receipt_id`|`UUID`|`FK -> goods_receipts(id) ON DELETE CASCADE`|No|Khóa ngoại phiếu nhập cha|
|`product_id`|`UUID`|`FK -> products(id) ON DELETE RESTRICT`|No|Khóa ngoại danh mục sản phẩm|
|`line_no`|`INT`|`CHECK (line_no > 0)`|No|Cột A: Số thứ tự dòng (STT)|
|`product_name_snapshot`|`VARCHAR(255)`||No|Cột B: Đóng băng Tên, quy cách lúc nhập|
|`unit_snapshot`|`VARCHAR(50)`||No|Cột D: Đóng băng Đơn vị tính|
|`doc_qty`|`NUMERIC(12,3)`|`CHECK (doc_qty >= 0)`|No|Cột 1: Số lượng theo chứng từ gốc|
|`actual_qty`|`NUMERIC(12,3)`|`CHECK (actual_qty >= 0)`|No|Cột 2: Số lượng thực tế nhập kho|
|`unit_price`|`NUMERIC(15,2)`|`CHECK (unit_price >= 0)`|No|Cột 3: Đơn giá thực nhập / hạch toán|
|`amount`|`NUMERIC(15,2)`|`CHECK (amount >= 0)`|No|Cột 4: Thành tiền (`actual_qty * unit_price`)|
|`debit_account`|`VARCHAR(50)`||Yes|Tài khoản Nợ chi tiết dòng (nếu có phân bổ)|
|`credit_account`|`VARCHAR(50)`||Yes|Tài khoản Có chi tiết dòng|
|`note`|`VARCHAR(255)`||Yes|Ghi chú quy cách/tình trạng|

**Bảng: `inventory_balances` (Sổ Dư Tồn Kho Tức Thời)**

  

|**Cột**|**Kiểu Dữ Liệu**|**Ràng Buộc**|**Null**|**Mô Tả**|
|---|---|---|---|---|
|`warehouse_id`|`UUID`|`PK, FK -> warehouses(id)`|No|Kho lưu trữ hàng|
|`product_id`|`UUID`|`PK, FK -> products(id)`|No|Vật tư lưu trữ|
|`current_stock`|`NUMERIC(12,3)`|`CHECK (current_stock >= 0)`|No|Số lượng tồn kho thực tế|
|`updated_at`|`TIMESTAMPTZ`|`DEFAULT now()`|No|Thời điểm cập nhật sau cùng|

**Bảng: `security_audit_logs` (Nhật Ký Bảo Mật & Kiểm Toán Giao Dịch)**

  

|**Cột**|**Kiểu Dữ Liệu**|**Ràng Buộc**|**Null**|**Mô Tả**|
|---|---|---|---|---|
|`id`|`UUID`|`PK, DEFAULT gen_random_uuid()`|No|Mã định danh log|
|`request_id`|`VARCHAR(64)`||No|Mã Correlation ID (`X-Request-Id`) từ API|
|`action`|`VARCHAR(50)`||No|Hành động: `CREATE_RECEIPT`, `CANCEL_RECEIPT`...|
|`entity_name`|`VARCHAR(50)`||No|Bảng bị tác động (`goods_receipts`)|
|`entity_id`|`UUID`||Yes|ID bản ghi bị tác động|
|`client_ip`|`VARCHAR(45)`||Yes|Địa chỉ IP thực tế của client|
|`user_agent`|`TEXT`||Yes|Thông tin thiết bị / trình duyệt|
|`payload_hash`|`VARCHAR(64)`||Yes|SHA-256 hash của request payload|
|`created_at`|`TIMESTAMPTZ`|`DEFAULT now()`|No|Thời điểm ghi nhận sự kiện|

### 2. Mã Nguồn Khởi Tạo Bảng & Phân Quyền Bảo Mật (Full DDL SQL)

SQL

```SQL
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Bảng Đơn vị / Phòng ban
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Bảng Kho bãi
CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- 3. Danh mục Sản phẩm / Vật tư
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    default_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (default_price >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Bảng Master: Phiếu Nhập Kho (Mẫu 01 - VT & Điều 24 Luật Kế toán)
CREATE TABLE goods_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number VARCHAR(50) NOT NULL UNIQUE,
    receipt_date DATE NOT NULL,
    actual_received_date DATE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    receipt_type VARCHAR(50) NOT NULL DEFAULT 'PURCHASE' CHECK (
        receipt_type IN (
            'PURCHASE',
            'INTERNAL_PRODUCTION',
            'OUTSOURCED_PROCESSING',
            'CAPITAL_CONTRIBUTION',
            'INVENTORY_SURPLUS'
        )
    ),
    description TEXT,
    deliverer_name VARCHAR(255) NOT NULL,
    doc_reference VARCHAR(100),
    doc_date DATE,
    doc_origin VARCHAR(255),
    debit_account VARCHAR(50),
    credit_account VARCHAR(50),
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    total_amount_words TEXT,
    attached_doc_count VARCHAR(100),
    creator_name VARCHAR(255),
    storekeeper_name VARCHAR(255),
    chief_accountant_name VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'CONFIRMED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Bảng Detail: Chi tiết từng dòng hàng hóa
CREATE TABLE goods_receipt_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id UUID NOT NULL REFERENCES goods_receipts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    line_no INT NOT NULL CHECK (line_no > 0),
    product_name_snapshot VARCHAR(255) NOT NULL,
    unit_snapshot VARCHAR(50) NOT NULL,
    doc_qty NUMERIC(12, 3) NOT NULL DEFAULT 0.000 CHECK (doc_qty >= 0),
    actual_qty NUMERIC(12, 3) NOT NULL DEFAULT 0.000 CHECK (actual_qty >= 0),
    unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (unit_price >= 0),
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (amount >= 0),
    debit_account VARCHAR(50),
    credit_account VARCHAR(50),
    note VARCHAR(255),
    CONSTRAINT uk_receipt_item_line UNIQUE (receipt_id, line_no)
);

-- 6. Bảng Tồn kho tức thời (Thẻ kho realtime)
CREATE TABLE inventory_balances (
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    current_stock NUMERIC(12, 3) NOT NULL DEFAULT 0.000 CHECK (current_stock >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (warehouse_id, product_id)
);

-- 7. Bảng Nhật ký kiểm toán bảo mật (Security Audit Log)
CREATE TABLE security_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id VARCHAR(64) NOT NULL,
    action VARCHAR(50) NOT NULL,
    entity_name VARCHAR(50) NOT NULL,
    entity_id UUID,
    client_ip VARCHAR(45),
    user_agent TEXT,
    payload_hash VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================================
-- THIẾT LẬP BẢO MẬT & PHÂN QUYỀN (PRINCIPLE OF LEAST PRIVILEGE)
-- =========================================================================

-- Tạo User ứng dụng riêng biệt, không dùng tài khoản Superuser 'postgres'
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'vimes_app_user') THEN
    CREATE USER vimes_app_user WITH PASSWORD 'VimesApp_Prod_SecPass_2026!@#';
  END IF;
END $$;

-- Thu hồi toàn bộ quyền tạo bảng, xóa schema từ PUBLIC
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO vimes_app_user;

-- Chỉ cấp quyền DML (SELECT, INSERT, UPDATE, DELETE), TUYỆT ĐỐI KHÔNG CẤP DDL (DROP, ALTER, TRUNCATE)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO vimes_app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO vimes_app_user;
```

### 3. Phân Tích Chuyên Sâu Nghiệp Vụ, Kiến Trúc & Bảo Mật SQL

- **Tách biệt Ngày Lập (`receipt_date`) và Ngày Thực Nhập (`actual_received_date`):** Hướng dẫn Thông tư 200 quy định phiếu do phòng mua hàng hoặc xưởng sản xuất lập (ngày lập phiếu). Khi hàng về đến cổng kho, thủ kho tiến hành kiểm đếm, ghi ngày tháng thực nhận và ký tên trước khi ghi Thẻ kho. Thiết kế tách 2 trường ngày phản ánh đúng quy trình luân chuyển chứng từ.
    
      
    
- **Snapshot Bất Biến (Immutability Pattern):** Hai trường `product_name_snapshot` và `unit_snapshot` trong `goods_receipt_items` lưu lại chính xác tên và đơn vị tính tại thời điểm giao dịch. Kể cả khi danh mục `products` sửa đổi quy cách, chứng từ kế toán trong quá khứ không bị sai lệch thông tin khi in lại hay thanh tra thuế.
    
      
    
- **Số Lượng Thực Nhập Quyết Định Giá Trị:** Mẫu 01-VT quy định rõ `Cột 4 (Thành tiền) = Cột 2 (Thực nhập) * Cột 3 (Đơn giá)`. Tồn kho và giá trị tài sản ghi nhận chỉ tăng theo `actual_qty`. Cột `doc_qty` (chứng từ gốc) dùng đối soát công nợ hao hụt với nhà cung cấp.
    
      
    
- **Audit Trail 4 Vai Trò Ký Tên:** Lưu trữ đầy đủ danh tính của Người lập, Người giao, Thủ kho và Kế toán trưởng để đáp ứng yêu cầu pháp lý về chứng từ kế toán.
    
      
    
- **Triệt Tiêu 100% Lỗ Hổng SQL Injection:** Mọi thao tác I/O trong ứng dụng bắt buộc sử dụng cơ chế Parameterized Queries (`$1`, `$2`, ...). Driver `pg` của Node.js sẽ gửi riêng biệt câu lệnh SQL và tham số dữ liệu tới PostgreSQL Engine qua giao thức nhị phân (Binary Protocol), biến mọi ký tự escape độc hại (`'`, `"`, `;`, `--`, `UNION SELECT`) thành chuỗi dữ liệu thuần túy.
    
      
    
- **Phòng Chống Race Condition & Deadlock Trong Transaction:** Khi nhiều giao dịch nhập/xuất kho diễn ra cùng lúc trên cùng 1 mặt hàng, sử dụng cú pháp `ON CONFLICT ... DO UPDATE` để tăng số dư tồn kho tức thời mà không gây xung đột khóa dòng hoặc Lost Update.
    
      
    

### 4. Câu Lệnh Vận Hành Thực Tế Đầy Đủ (Production-Grade SQL Operations)

#### Quy trình ghi nhận phiếu nhập kho, tăng tồn kho và ghi audit log trong Database Transaction

SQL

```SQL
BEGIN;

-- 1. Thêm mới Master Header
INSERT INTO goods_receipts (
    id, receipt_number, receipt_date, actual_received_date, organization_id, warehouse_id, 
    receipt_type, description, deliverer_name, doc_reference, doc_date, doc_origin, 
    debit_account, credit_account, total_amount, total_amount_words, 
    attached_doc_count, creator_name, storekeeper_name, chief_accountant_name, status
) VALUES (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'PNK-2026-0001',
    '2026-08-18',
    '2026-08-18',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'c9a646d3-9c61-4cd7-bf5b-9b4dc257850a',
    'PURCHASE',
    'Nhập kho thép cuộn phục vụ dự án VIMES Tower theo hóa đơn số 99882',
    'Nguyễn Văn A',
    'HĐ-99882',
    '2026-08-17',
    'Công ty Thép Việt Nhật',
    '152',
    '331',
    1477500.00,
    'Một triệu bốn trăm bảy mươi bảy nghìn năm trăm đồng',
    '1 hóa đơn GTGT gốc',
    'Lê Văn Lập',
    'Trần Văn Kho',
    'Phạm Thị Trưởng',
    'CONFIRMED'
);

-- 2. Thêm dòng chi tiết hàng hóa (Cột 1, 2, 3, 4)
INSERT INTO goods_receipt_items (
    id, receipt_id, product_id, line_no, product_name_snapshot, unit_snapshot,
    doc_qty, actual_qty, unit_price, amount, debit_account, credit_account, note
) VALUES (
    'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'e7d2b8a0-1234-4567-89ab-cdef01234567',
    1,
    'Thép cuộn Phi 6',
    'Kg',
    100.000,
    98.500,
    15000.00,
    1477500.00,
    '152',
    '331',
    'Hao hụt 1.5kg do vận chuyển'
);

-- 3. Cập nhật số dư tồn kho tức thời (An toàn Concurrency)
INSERT INTO inventory_balances (warehouse_id, product_id, current_stock, updated_at)
VALUES (
    'c9a646d3-9c61-4cd7-bf5b-9b4dc257850a',
    'e7d2b8a0-1234-4567-89ab-cdef01234567',
    98.500,
    now()
)
ON CONFLICT (warehouse_id, product_id) 
DO UPDATE SET 
    current_stock = inventory_balances.current_stock + EXCLUDED.current_stock,
    updated_at = now();

-- 4. Ghi nhật ký bảo mật giao dịch (Security Audit Trail)
INSERT INTO security_audit_logs (
    request_id, action, entity_name, entity_id, client_ip, user_agent, payload_hash
) VALUES (
    '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    'CREATE_RECEIPT',
    'goods_receipts',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    '14.241.120.45',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
);

COMMIT;
```

#### Truy vấn lấy trọn vẹn chứng từ phiếu nhập chuẩn mẫu TT 200 (Single-Query JSON Aggregation)

SQL

```SQL
SELECT 
    gr.id,
    gr.receipt_number,
    gr.receipt_date,
    gr.actual_received_date,
    gr.receipt_type,
    gr.description,
    gr.deliverer_name,
    gr.doc_reference,
    gr.doc_date,
    gr.doc_origin,
    gr.debit_account,
    gr.credit_account,
    gr.total_amount,
    gr.total_amount_words,
    gr.attached_doc_count,
    gr.creator_name,
    gr.storekeeper_name,
    gr.chief_accountant_name,
    gr.status,
    org.name AS organization_name,
    org.department AS department_name,
    wh.name AS warehouse_name,
    wh.location AS warehouse_location,
    COALESCE(
        json_agg(
            json_build_object(
                'line_no', gri.line_no,
                'product_code', p.code,
                'product_name', gri.product_name_snapshot,
                'unit', gri.unit_snapshot,
                'doc_qty', gri.doc_qty,
                'actual_qty', gri.actual_qty,
                'unit_price', gri.unit_price,
                'amount', gri.amount,
                'debit_account', gri.debit_account,
                'credit_account', gri.credit_account,
                'note', gri.note
            ) ORDER BY gri.line_no ASC
        ) FILTER (WHERE gri.id IS NOT NULL), '[]'::json
    ) AS items
FROM goods_receipts gr
INNER JOIN organizations org ON gr.organization_id = org.id
INNER JOIN warehouses wh ON gr.warehouse_id = wh.id
LEFT JOIN goods_receipt_items gri ON gr.id = gri.receipt_id
LEFT JOIN products p ON gri.product_id = p.id
WHERE gr.receipt_number = 'PNK-2026-0001'
GROUP BY gr.id, org.id, wh.id;
```

#### Thiết lập hệ thống Index tối ưu hiệu năng & chống suy giảm dịch vụ (Anti-DoS Indexes)

SQL

```SQL
-- Khóa duy nhất và chỉ mục tìm kiếm nhanh
CREATE UNIQUE INDEX idx_receipts_receipt_number ON goods_receipts(receipt_number);
CREATE UNIQUE INDEX idx_products_code ON products(code);
CREATE UNIQUE INDEX idx_warehouses_code ON warehouses(code);
CREATE UNIQUE INDEX idx_organizations_code ON organizations(code);

-- Tối ưu Foreign Key và JOIN giữa Master-Detail
CREATE INDEX idx_receipt_items_receipt_id ON goods_receipt_items(receipt_id);
CREATE INDEX idx_receipt_items_product_id ON goods_receipt_items(product_id);

-- Tối ưu bộ lọc báo cáo theo thời gian, kho và loại nhập
CREATE INDEX idx_receipts_date_warehouse ON goods_receipts(receipt_date DESC, warehouse_id);
CREATE INDEX idx_receipts_type ON goods_receipts(receipt_type);

-- Partial Index tối ưu tra cứu danh sách phiếu đang ở trạng thái DRAFT
CREATE INDEX idx_receipts_draft_status ON goods_receipts(receipt_date DESC) 
WHERE status = 'DRAFT';

-- Chỉ mục cho bảng kiểm toán bảo mật
CREATE INDEX idx_audit_request_id ON security_audit_logs(request_id);
CREATE INDEX idx_audit_created_at ON security_audit_logs(created_at DESC);
```

### 5. Hướng Dẫn Mở Rộng Hệ Thống SQL (Extensibility Guide)

- **Sổ Kế Toán Chi Tiết & Sổ Cái (General Ledger Integration):** Theo Điều 24 Luật Kế toán, hệ thống có thể tạo thêm bảng `general_ledger_entries (id, entry_date, doc_id, doc_type, account_no, debit_amount, credit_amount, description)` để trích xuất tự động các dòng định khoản Nợ/Có từ `goods_receipt_items` sang sổ cái kế toán tổng hợp.
    
      
    
- **Quản lý Lô & Hạn Sử Dụng (FEFO/FIFO):** Bổ sung các cột `lot_number VARCHAR(100)`, `manufacturing_date DATE`, `expiry_date DATE` vào `goods_receipt_items` để quản lý hạn dùng hàng nhập.
    
      
    
- **Phân Vùng Bảng Lớn (Declarative Partitioning):** Khi số lượng chứng từ vượt 10 triệu bản ghi, áp dụng Range Partitioning trên `goods_receipts` theo `receipt_date` (chia partition theo năm `goods_receipts_2026`, `goods_receipts_2027`) giúp tối ưu truy vấn báo cáo tài chính hàng năm và thu hẹp phạm vi quét bảng.
    
      
    
- **Mã Hóa Dữ Liệu Nhạy Cảm (Data Encryption at Rest):** Sử dụng hàm `pgp_sym_encrypt()` của extension `pgcrypto`để mã hóa các trường giá trị hợp đồng nhạy cảm trước khi ghi xuống đĩa cứng.
    
      
    

## PHẦN 2: HỆ THỐNG CƠ SỞ DỮ LIỆU TÀI LIỆU (NOSQL - CLOUD FIRESTORE / MONGODB)

Mô hình Document NoSQL áp dụng cấu trúc **Denormalization** và **Embedded Document** nhằm tối ưu chi phí đọc và hỗ trợ truy vấn nhanh toàn bộ chứng từ trên các ứng dụng Flutter/Mobile.

  

### 1. Cấu Trúc Tài Liệu Tối Giản (Document Schema)

**Collection: `products`**

  

|**Trường**|**Kiểu Dữ Liệu**|**Bắt Buộc**|**Mô Tả**|
|---|---|---|---|
|`_id`|`String`|Có|ID định danh sản phẩm (SKU/Auto-ID)|
|`code`|`String`|Có|Mã số vật tư (Cột C)|
|`name`|`String`|Có|Tên quy cách phẩm chất (Cột B)|
|`unit`|`String`|Có|Đơn vị tính (Cột D)|
|`defaultPrice`|`Number`|Có|Giá niêm yết tham khảo|
|`isActive`|`Boolean`|Có|Trạng thái hoạt động|
|`createdAt`|`Timestamp`|Có|Thời gian khởi tạo|

**Collection: `goods_receipts`**

  

|**Trường**|**Kiểu Dữ Liệu**|**Bắt Buộc**|**Mô Tả**|
|---|---|---|---|
|`_id`|`String`|Có|ID định danh phiếu|
|`receiptNumber`|`String`|Có|Số phiếu nhập kho (Unique index)|
|`receiptDate`|`Timestamp`|Có|Ngày lập chứng từ|
|`actualReceivedDate`|`Timestamp`|Không|Ngày thủ kho thực nhận và ghi Thẻ kho|
|`receiptType`|`String`|Có|`PURCHASE`, `INTERNAL_PRODUCTION`, `OUTSOURCED_PROCESSING`...|
|`description`|`String`|Không|Tóm tắt nội dung nghiệp vụ kinh tế|
|`organization`|`Map/Object`|Có|Nhúng `{ code, name, department }`|
|`warehouse`|`Map/Object`|Có|Nhúng `{ id, code, name, location }`|
|`delivery`|`Map/Object`|Có|Nhúng `{ delivererName, docReference, docDate, docOrigin }`|
|`accounting`|`Map/Object`|Có|Nhúng `{ debitAccount, creditAccount }`|
|`items`|`Array<Map>`|Có|Mảng danh sách các mặt hàng thực nhập|
|`totalAmount`|`Number`|Có|Tổng tiền thanh toán toàn phiếu|
|`totalAmountWords`|`String`|Không|Tổng số tiền viết bằng chữ|
|`attachedDocCount`|`String`|Không|Số chứng từ gốc kèm theo|
|`signatures`|`Map/Object`|Không|Nhúng `{ creatorName, storekeeperName, chiefAccountantName }`|
|`auditMeta`|`Map/Object`|Có|Nhúng `{ createdByIp, userAgent, requestId }` phục vụ bảo mật|
|`status`|`String`|Có|`DRAFT`, `CONFIRMED`, `CANCELLED`|
|`createdAt`|`Timestamp`|Có|Thời gian tạo trên hệ thống|
|`updatedAt`|`Timestamp`|Có|Thời gian cập nhật sau cùng|

**Cấu trúc từng phần tử trong mảng `items`:**

  

|**Thuộc Tính Con**|**Kiểu Dữ Liệu**|**Bắt Buộc**|**Mô Tả**|
|---|---|---|---|
|`productId`|`String`|Có|Tham chiếu collection `products`|
|`lineNo`|`Number`|Có|Cột A: Số thứ tự dòng (STT)|
|`productCode`|`String`|Có|Cột C: Mã số vật tư|
|`productName`|`String`|Có|Cột B: Tên quy cách snapshot|
|`unit`|`String`|Có|Cột D: Đơn vị tính snapshot|
|`docQty`|`Number`|Có|Cột 1: Số lượng theo chứng từ|
|`actualQty`|`Number`|Có|Cột 2: Số lượng thực nhập|
|`unitPrice`|`Number`|Có|Cột 3: Đơn giá thực nhập|
|`amount`|`Number`|Có|Cột 4: Thành tiền (`actualQty * unitPrice`)|
|`debitAccount`|`String`|Không|Tài khoản Nợ chi tiết dòng|
|`creditAccount`|`String`|Không|Tài khoản Có chi tiết dòng|
|`note`|`String`|Không|Ghi chú dòng|

### 2. Định Nghĩa Dữ Liệu JSON Chuẩn (Canonical JSON Schema)

JSON

```JSON
{
  "_id": "receipt_2026_0001",
  "receiptNumber": "PNK-2026-0001",
  "receiptDate": "2026-08-18T00:00:00.000Z",
  "actualReceivedDate": "2026-08-18T08:30:00.000Z",
  "receiptType": "PURCHASE",
  "description": "Nhập kho thép cuộn phục vụ dự án VIMES Tower theo hóa đơn số 99882",
  "organization": {
    "code": "VIMES-HN",
    "name": "Công ty Cổ phần VIMES",
    "department": "Phòng Kế toán - Vật tư"
  },
  "warehouse": {
    "id": "wh_hanoi_01",
    "code": "KHO-TONG-HN",
    "name": "Kho Tổng Hà Nội",
    "location": "KCN Sài Đồng, Long Biên, Hà Nội"
  },
  "delivery": {
    "delivererName": "Nguyễn Văn A",
    "docReference": "HĐ-99882",
    "docDate": "2026-08-17T00:00:00.000Z",
    "docOrigin": "Công ty Thép Việt Nhật"
  },
  "accounting": {
    "debitAccount": "152",
    "creditAccount": "331"
  },
  "items": [
    {
      "productId": "prod_steel_06",
      "lineNo": 1,
      "productCode": "VT001",
      "productName": "Thép cuộn Phi 6",
      "unit": "Kg",
      "docQty": 100.0,
      "actualQty": 98.5,
      "unitPrice": 15000.0,
      "amount": 1477500.0,
      "debitAccount": "152",
      "creditAccount": "331",
      "note": "Hao hụt 1.5kg do vận chuyển"
    }
  ],
  "totalAmount": 1477500.0,
  "totalAmountWords": "Một triệu bốn trăm bảy mươi bảy nghìn năm trăm đồng",
  "attachedDocCount": "1 hóa đơn GTGT gốc",
  "signatures": {
    "creatorName": "Lê Văn Lập",
    "storekeeperName": "Trần Văn Kho",
    "chiefAccountantName": "Phạm Thị Trưởng"
  },
  "auditMeta": {
    "requestId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "clientIp": "14.241.120.45",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
  },
  "status": "CONFIRMED",
  "createdAt": "2026-08-18T08:30:00.000Z",
  "updatedAt": "2026-08-18T08:30:00.000Z"
}
```

### 3. Phân Tích Chuyên Sâu Nghiệp Vụ & Kiến Trúc Bảo Mật NoSQL

- **Tối Ưu Single-Document Read:** Toàn bộ thông tin phiếu từ đơn vị, kho, người giao, chữ ký đến mảng các mặt hàng đều nằm gọn trong 1 document duy nhất. Ứng dụng client chỉ tốn đúng 1 Read Operation để hiển thị toàn bộ phiếu, tiết kiệm chi phí Firestore.
    
      
    
- **Đóng Băng Dữ Liệu Lịch Sử:** Các thuộc tính `productName`, `unit` được lưu trực tiếp trong mảng `items`. Nếu thông tin danh mục gốc thay đổi trong tương lai, dữ liệu lịch sử của phiếu nhập vẫn giữ nguyên giá trị kiểm toán.
    
      
    
- **Atomic Inventory Increment (Chống Race Condition):** Sử dụng `FieldValue.increment(actualQty)` đảm bảo việc cập nhật tồn kho diễn ra an toàn, tránh lỗi xung đột (Race Conditions) khi nhiều người cùng thao tác.
    
      
    
- **Bảo Mật Cấp Document (Fine-Grained Security Rules):** Chặn đứng việc can thiệp trực tiếp vào số dư kho từ Client-side. Chỉ cho phép cập nhật tồn kho thông qua Cloud Functions hoặc Backend Admin SDK có xác thực.
    
      
    

### 4. Code Mẫu Vận Hành NoSQL Hoàn Chỉnh (TypeScript + Cloud Firestore)

TypeScript

```TypeScript
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";

initializeApp();
const db = getFirestore();

interface ReceiptItemInput {
  productId: string;
  productCode: string;
  productName: string;
  unit: string;
  docQty: number;
  actualQty: number;
  unitPrice: number;
  debitAccount?: string;
  creditAccount?: string;
  note?: string;
}

interface CreateReceiptPayload {
  receiptNumber: string;
  receiptDate: Date;
  actualReceivedDate?: Date;
  receiptType: "PURCHASE" | "INTERNAL_PRODUCTION" | "OUTSOURCED_PROCESSING" | "CAPITAL_CONTRIBUTION" | "INVENTORY_SURPLUS";
  description?: string;
  organization: { code: string; name: string; department: string };
  warehouse: { id: string; code: string; name: string; location: string };
  delivery: { delivererName: string; docReference: string; docDate: Date; docOrigin: string };
  accounting: { debitAccount: string; creditAccount: string };
  items: ReceiptItemInput[];
  totalAmountWords: string;
  attachedDocCount: string;
  signatures: { creatorName?: string; storekeeperName?: string; chiefAccountantName?: string };
  auditMeta: { requestId: string; clientIp: string; userAgent: string };
}

export async function createAndConfirmGoodsReceipt(payload: CreateReceiptPayload): Promise<string> {
  const receiptRef = db.collection("goods_receipts").doc();
  
  let calculatedTotalAmount = 0;
  const processedItems = payload.items.map((item, index) => {
    const lineAmount = item.actualQty * item.unitPrice;
    calculatedTotalAmount += lineAmount;
    return {
      ...item,
      lineNo: index + 1,
      amount: lineAmount,
    };
  });

  await db.runTransaction(async (transaction) => {
    // 1. Kiểm tra tính duy nhất của số phiếu
    const existingReceiptQuery = await transaction.get(
      db.collection("goods_receipts").where("receiptNumber", "==", payload.receiptNumber).limit(1)
    );

    if (!existingReceiptQuery.empty) {
      throw new Error(`Số phiếu nhập ${payload.receiptNumber} đã tồn tại trong hệ thống.`);
    }

    // 2. Ghi nhận Document Phiếu Nhập Kho
    transaction.set(receiptRef, {
      receiptNumber: payload.receiptNumber,
      receiptDate: Timestamp.fromDate(payload.receiptDate),
      actualReceivedDate: payload.actualReceivedDate ? Timestamp.fromDate(payload.actualReceivedDate) : Timestamp.fromDate(new Date()),
      receiptType: payload.receiptType,
      description: payload.description || null,
      organization: payload.organization,
      warehouse: payload.warehouse,
      delivery: {
        ...payload.delivery,
        docDate: Timestamp.fromDate(payload.delivery.docDate),
      },
      accounting: payload.accounting,
      items: processedItems,
      totalAmount: calculatedTotalAmount,
      totalAmountWords: payload.totalAmountWords,
      attachedDocCount: payload.attachedDocCount,
      signatures: payload.signatures,
      auditMeta: payload.auditMeta,
      status: "CONFIRMED",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // 3. Tăng tồn kho nguyên tử cho từng sản phẩm theo actualQty
    for (const item of processedItems) {
      const stockBalanceRef = db
        .collection("warehouses")
        .doc(payload.warehouse.id)
        .collection("stocks")
        .doc(item.productId);

      transaction.set(
        stockBalanceRef,
        {
          productId: item.productId,
          productCode: item.productCode,
          currentStock: FieldValue.increment(item.actualQty),
          lastUpdated: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }
  });

  return receiptRef.id;
}
```

#### Quy Tắc Đánh Chỉ Mục (Firestore Indexes Definition)

**File: `firestore.indexes.json`**

  

JSON

```JSON
{
  "indexes": [
    {
      "collectionGroup": "goods_receipts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "warehouse.id", "order": "ASCENDING" },
        { "fieldPath": "receiptDate", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "goods_receipts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "receiptType", "order": "ASCENDING" },
        { "fieldPath": "receiptDate", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "goods_receipts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "receiptDate", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": [
    {
      "collectionGroup": "goods_receipts",
      "fieldPath": "receiptNumber",
      "indexes": [
        { "order": "ASCENDING", "queryScope": "COLLECTION" }
      ]
    }
  ]
}
```

#### Quy Tắc Bảo Mật Cấp Doanh Nghiệp (Firestore Security Rules)

JavaScript

```JavaScript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function hasRole(role) {
      return isAuthenticated() && request.auth.token.role == role;
    }
    
    // Bảo vệ Collection Phiếu Nhập Kho
    match /goods_receipts/{receiptId} {
      allow read: if isAuthenticated();
      
      // Chỉ nhân viên kho hoặc kế toán mới được tạo phiếu
      allow create: if isAuthenticated() 
        && request.resource.data.status in ['DRAFT', 'CONFIRMED']
        && request.resource.data.totalAmount >= 0
        && request.resource.data.items.size() > 0
        && request.resource.data.items.size() <= 200; // Chống DoS Document Overflow
        
      // Chỉ cho phép sửa khi phiếu đang DRAFT
      allow update: if isAuthenticated() 
        && resource.data.status == 'DRAFT'
        && request.resource.data.status in ['DRAFT', 'CONFIRMED', 'CANCELLED'];
        
      // Tuyệt đối không cho phép xóa cứng chứng từ kế toán qua Client SDK
      allow delete: if false;
    }
    
    // Khóa chặt việc ghi trực tiếp vào tồn kho (Chỉ Backend / Cloud Function được cập nhật)
    match /warehouses/{warehouseId}/stocks/{productId} {
      allow read: if isAuthenticated();
      allow write: if false;
    }
  }
}
```

### 5. Hướng Dẫn Mở Rộng Hệ Thống NoSQL (Extensibility Guide)

- **Tách Sub-collection khi vượt quy mô:** Nếu phiếu nhập hàng cảng hoặc container có số dòng vượt quá 200 dòng (tiệm cận giới hạn 1MB/document), chuyển cấu trúc mảng `items: []` thành Sub-collection riêng: `/goods_receipts/{receiptId}/items/{itemId}`.
    
      
    
- **Kiến Trúc Event Sourcing Qua Cloud Functions:** Khi phiếu đổi trạng thái sang `CONFIRMED`, kích hoạt Firebase Cloud Function ghi log giao dịch bất biến vào collection `inventory_ledger` để phục vụ đối soát thẻ kho tự động.
    
      
    
- **Mở Rộng Đa Tiền Tệ & Thuế GTGT:** Bổ sung trường `currency: { code: "USD", rate: 25400 }` vào cấp Root Document và thêm `tax: { vatRate: 10, vatAmount: 147750 }` vào từng item trong mảng `items`.