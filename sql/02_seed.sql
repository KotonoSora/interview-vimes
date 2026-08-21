-- sql/02_seed.sql
-- Khởi tạo Đơn vị / Doanh nghiệp
INSERT INTO organizations (id, code, name, department)
VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'VIMES-HN',
    'CÔNG TY CỔ PHẦN VIMES',
    'Phòng Kế toán - Quản lý Vật tư'
)
ON CONFLICT (code) DO NOTHING;

-- Khởi tạo Kho bãi tiếp nhận
INSERT INTO warehouses (id, organization_id, code, name, location)
VALUES (
    'c9a646d3-9c61-4cd7-bf5b-9b4dc257850a',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'KHO-TONG-HN',
    'Kho Tổng Hà Nội',
    'KCN Sài Đồng, Long Biên, Hà Nội'
)
ON CONFLICT (code) DO NOTHING;

-- Khởi tạo Danh mục Vật tư mẫu
INSERT INTO products (id, code, name, unit, default_price)
VALUES 
    (
        'e7d2b8a0-1234-4567-89ab-cdef01234567',
        'VT001',
        'Thép cuộn Phi 6',
        'Kg',
        15000.00
    ),
    (
        'a1a2a3a4-1234-4567-89ab-cdef01234567',
        'VT002',
        'Xi măng PCB40',
        'Bao',
        50000.00
    ),
    (
        'b2b3b4b5-1234-4567-89ab-cdef01234567',
        'VT003',
        'Cát xây dựng tiêu chuẩn',
        'm3',
        200000.00
    )
ON CONFLICT (code) DO NOTHING;