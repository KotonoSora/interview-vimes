-- sql/01_schema.sql
-- Kích hoạt tiện ích sinh UUID ngẫu nhiên chuẩn v4
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Bảng Đơn vị / Doanh nghiệp (Phát sinh nghiệp vụ)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Bảng Kho bãi tiếp nhận vật lý
CREATE TABLE IF NOT EXISTS warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- 3. Bảng Danh mục Vật tư / Hàng hóa Gốc (Master Catalog)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    default_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (default_price >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Bảng Phiếu Nhập Kho Master (Mẫu 01 - VT theo TT 200 & Luật Kế toán 2015)
CREATE TABLE IF NOT EXISTS goods_receipts (
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

-- 5. Bảng Dòng Chi Tiết Hàng Hóa Nhập Kho (Snapshot Pattern Cột B, Cột D)
CREATE TABLE IF NOT EXISTS goods_receipt_items (
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

-- 6. Bảng Số Dư Tồn Kho Thời Gian Thực (Theo dõi số dư nguyên tử tại kho)
CREATE TABLE IF NOT EXISTS inventory_balances (
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    current_stock NUMERIC(12, 3) NOT NULL DEFAULT 0.000 CHECK (current_stock >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (warehouse_id, product_id)
);

-- 7. Bảng Nhật Ký Kiểm Toán Bảo Mật (Security Audit Logs phục vụ thanh tra tài chính)
CREATE TABLE IF NOT EXISTS security_audit_logs (
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

-- Tạo Index tăng tốc truy vấn tìm kiếm và báo cáo
CREATE INDEX IF NOT EXISTS idx_goods_receipts_date ON goods_receipts(receipt_date);
CREATE INDEX IF NOT EXISTS idx_goods_receipts_wh ON goods_receipts(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipts_status ON goods_receipts(status);
CREATE INDEX IF NOT EXISTS idx_items_receipt_id ON goods_receipt_items(receipt_id);
CREATE INDEX IF NOT EXISTS idx_audit_request_id ON security_audit_logs(request_id);