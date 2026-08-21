-- ============================================================================
-- VIMES INVENTORY - COMPREHENSIVE SEED DATA (Mẫu 01 - VT)
-- Căn cứ pháp lý: Thông tư 200/2014/TT-BTC & Luật Kế toán 2015
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. SEED ĐƠN VỊ / CHI NHÁNH / PHÒNG BAN (organizations)
-- ----------------------------------------------------------------------------
INSERT INTO organizations (id, code, name, department)
VALUES 
    (
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        'VIMES-HN',
        'CÔNG TY CỔ PHẦN VIMES - HÀ NỘI',
        'Phòng Kế toán - Quản lý Vật tư'
    ),
    (
        'a18bc23e-67df-4190-b32c-9d01e4a5f678',
        'VIMES-DN',
        'CHI NHÁNH TỔNG CÔNG TY VIMES ĐÀ NẴNG',
        'Phòng Quản trị Dự án Miền Trung'
    ),
    (
        'b29cd34f-78ea-4201-c43d-0e12f5b6a789',
        'VIMES-HCM',
        'CÔNG TY TNHH VẬT TƯ VIMES MIỀN NAM',
        'Ban Vật tư & Cung ứng Công trường'
    )
ON CONFLICT (code) DO UPDATE 
SET name = EXCLUDED.name, department = EXCLUDED.department;


-- ----------------------------------------------------------------------------
-- 2. SEED DANH MỤC KHO BÃI TIẾP NHẬN (warehouses)
-- ----------------------------------------------------------------------------
INSERT INTO warehouses (id, organization_id, code, name, location, is_active)
VALUES 
    (
        'c9a646d3-9c61-4cd7-bf5b-9b4dc257850a',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        'KHO-TONG-HN',
        'Kho Tổng Hà Nội',
        'KCN Sài Đồng, Long Biên, Hà Nội',
        true
    ),
    (
        'd0b757e4-0d72-4de8-c06c-0c5ed368961b',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        'KHO-PHU-HN',
        'Kho Vật liệu Xây dựng Gia Lâm',
        'Km 12 Quốc lộ 5, Gia Lâm, Hà Nội',
        true
    ),
    (
        'e1c868f5-1e83-4ef9-d17d-1d6fe479a72c',
        'a18bc23e-67df-4190-b32c-9d01e4a5f678',
        'KHO-DN-01',
        'Kho Trung chuyển Hòa Cầm',
        'Đường số 3, KCN Hòa Cầm, Cẩm Lệ, Đà Nẵng',
        true
    ),
    (
        'f2d979a6-2f94-4f0a-e28e-2e70f580b83d',
        'b29cd34f-78ea-4201-c43d-0e12f5b6a789',
        'KHO-HCM-01',
        'Kho Cơ giới & Thiết bị Cát Lái',
        'Cụm Cảng Cát Lái, TP. Thủ Đức, TP. Hồ Chí Minh',
        true
    )
ON CONFLICT (code) DO UPDATE 
SET name = EXCLUDED.name, location = EXCLUDED.location, is_active = EXCLUDED.is_active;


-- ----------------------------------------------------------------------------
-- 3. SEED DANH MỤC VẬT TƯ / HÀNG HÓA MASTER (products)
-- ----------------------------------------------------------------------------
INSERT INTO products (id, code, name, unit, default_price, is_active)
VALUES 
    (
        'e7d2b8a0-1234-4567-89ab-cdef01234567',
        'VT001',
        'Thép cuộn Phi 6 Hòa Phát',
        'Kg',
        15000.00,
        true
    ),
    (
        'a1a2a3a4-1234-4567-89ab-cdef01234567',
        'VT002',
        'Xi măng Portland hỗn hợp PCB40',
        'Bao',
        85000.00,
        true
    ),
    (
        'b2b3b4b5-1234-4567-89ab-cdef01234567',
        'VT003',
        'Cát vàng xây trát tiêu chuẩn',
        'm3',
        220000.00,
        true
    ),
    (
        'c3c4c5c6-1234-4567-89ab-cdef01234567',
        'VT004',
        'Đá dăm 1x2 bê tông',
        'm3',
        310000.00,
        true
    ),
    (
        'd4d5d6d7-1234-4567-89ab-cdef01234567',
        'VT005',
        'Gạch tuy-nen 2 lỗ 4x8x19',
        'Viên',
        1200.00,
        true
    ),
    (
        'e5e6e7e8-1234-4567-89ab-cdef01234567',
        'VT006',
        'Ống nhựa uPVC Tiền Phong D110',
        'Cây',
        185000.00,
        true
    ),
    (
        'f6f7f8f9-1234-4567-89ab-cdef01234567',
        'VT007',
        'Sơn lót kháng kiềm ngoại thất Dulux',
        'Thùng',
        1450000.00,
        true
    ),
    (
        'a7b8c9d0-1234-4567-89ab-cdef01234567',
        'VT008',
        'Que hàn chịu lực Kim Tín KT-421 (3.2mm)',
        'Hộp',
        95000.00,
        true
    )
ON CONFLICT (code) DO UPDATE 
SET name = EXCLUDED.name, unit = EXCLUDED.unit, default_price = EXCLUDED.default_price;


-- ----------------------------------------------------------------------------
-- 4. SEED PHIẾU NHẬP KHO MASTER (goods_receipts)
-- Đa dạng: PURCHASE, INTERNAL_PRODUCTION, OUTSOURCED_PROCESSING, CAPITAL_CONTRIBUTION, INVENTORY_SURPLUS
-- Trạng thái: CONFIRMED, DRAFT, CANCELLED
-- ----------------------------------------------------------------------------
INSERT INTO goods_receipts (
    id, receipt_number, receipt_date, actual_received_date, organization_id, warehouse_id,
    receipt_type, description, deliverer_name, doc_reference, doc_date, doc_origin,
    debit_account, credit_account, total_amount, total_amount_words, attached_doc_count,
    creator_name, storekeeper_name, chief_accountant_name, status, created_at, updated_at
)
VALUES 
    -- 1. Phiếu nhập mua ngoài thương mại (CONFIRMED)
    (
        '10000000-0000-0000-0000-000000000001',
        'PNK-2026-0001',
        '2026-08-18',
        '2026-08-18',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        'c9a646d3-9c61-4cd7-bf5b-9b4dc257850a',
        'PURCHASE',
        'Nhập kho thép cuộn và xi măng phục vụ công trình Tòa nhà VIMES Center theo HĐ 99882',
        'Nguyễn Văn An',
        'HĐ-GTGT-99882',
        '2026-08-17',
        'Công ty TNHH Thương mại Thép Việt Nhật',
        '152',
        '331',
        2327500.00,
        'Hai triệu ba trăm hai mươi bảy nghìn năm trăm đồng chẵn',
        '1 hóa đơn GTGT gốc, 1 phiếu xuất kho kiêm vận chuyển nội bộ',
        'Lê Văn Lập',
        'Trần Văn Kho',
        'Phạm Thị Trưởng',
        'CONFIRMED',
        '2026-08-18 08:30:00+07',
        '2026-08-18 08:30:00+07'
    ),

    -- 2. Phiếu nhập tự sản xuất hoàn thành nhập kho (CONFIRMED)
    (
        '10000000-0000-0000-0000-000000000002',
        'PNK-2026-0002',
        '2026-08-19',
        '2026-08-19',
        'a18bc23e-67df-4190-b32c-9d01e4a5f678',
        'e1c868f5-1e83-4ef9-d17d-1d6fe479a72c',
        'INTERNAL_PRODUCTION',
        'Nhập kho gạch tuy-nen tự sản xuất từ Xưởng Chế tạo số 2 chuyển về kho trung chuyển',
        'Trần Đình Trọng',
        'LNK-SX-084',
        '2026-08-19',
        'Xưởng Sản xuất Cấu kiện Bê tông & Gạch VIMES',
        '155',
        '154',
        6000000.00,
        'Sáu triệu đồng chẵn',
        '1 biên bản nghiệm thu chất lượng sản phẩm xuất xưởng',
        'Nguyễn Văn Lập',
        'Hoàng Văn Lưu',
        'Đặng Thu Thảo',
        'CONFIRMED',
        '2026-08-19 09:15:00+07',
        '2026-08-19 09:15:00+07'
    ),

    -- 3. Phiếu nhập gia công hoàn thành (CONFIRMED)
    (
        '10000000-0000-0000-0000-000000000003',
        'PNK-2026-0003',
        '2026-08-20',
        '2026-08-20',
        'b29cd34f-78ea-4201-c43d-0e12f5b6a789',
        'f2d979a6-2f94-4f0a-e28e-2e70f580b83d',
        'OUTSOURCED_PROCESSING',
        'Nhập kho ống nhựa và vật tư phụ gia công hoàn thiện bề mặt theo biên bản giao nhận',
        'Phan Minh Đức',
        'BBGN-GC-412',
        '2026-08-20',
        'Công ty CP Cơ khí & Nhựa Công nghiệp Sài Gòn',
        '152',
        '154',
        9250000.00,
        'Chín triệu hai trăm năm mươi nghìn đồng chẵn',
        '1 phiếu giao nhận hàng gia công, 1 hóa đơn dịch vụ gia công',
        'Võ Thị Ngọc',
        'Lê Hữu Phúc',
        'Bùi Quang Vinh',
        'CONFIRMED',
        '2026-08-20 14:00:00+07',
        '2026-08-20 14:00:00+07'
    ),

    -- 4. Phiếu nhập nhận vốn góp liên doanh (CONFIRMED)
    (
        '10000000-0000-0000-0000-000000000004',
        'PNK-2026-0004',
        '2026-08-21',
        '2026-08-21',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        'd0b757e4-0d72-4de8-c06c-0c5ed368961b',
        'CAPITAL_CONTRIBUTION',
        'Tiếp nhận tài sản góp vốn bằng vật tư sơn lót cao cấp từ đối tác AkzoNobel',
        'Đoàn Quốc Hưng',
        'BB-GOPVON-01',
        '2026-08-20',
        'Công ty Sơn AkzoNobel Việt Nam',
        '152',
        '411',
        29000000.00,
        'Hai mươi chín triệu đồng chẵn',
        '1 biên bản định giá tài sản của Hội đồng thành viên',
        'Lê Văn Lập',
        'Trần Văn Kho',
        'Phạm Thị Trưởng',
        'CONFIRMED',
        '2026-08-21 10:00:00+07',
        '2026-08-21 10:00:00+07'
    ),

    -- 5. Phiếu nhập thừa sau kiểm kê (CONFIRMED)
    (
        '10000000-0000-0000-0000-000000000005',
        'PNK-2026-0005',
        '2026-08-21',
        '2026-08-21',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        'c9a646d3-9c61-4cd7-bf5b-9b4dc257850a',
        'INVENTORY_SURPLUS',
        'Ghi tăng tồn kho que hàn phát hiện thừa chưa rõ nguyên nhân sau kiểm kê định kỳ tháng 8/2026',
        'Trần Văn Kho',
        'BB-KK-T08/2026',
        '2026-08-21',
        'Hội đồng kiểm kê kho Tổng Hà Nội',
        '152',
        '3381',
        1900000.00,
        'Một triệu chín trăm nghìn đồng chẵn',
        '1 biên bản kiểm kê quỹ và hàng tồn kho số 08/KK',
        'Lê Văn Lập',
        'Trần Văn Kho',
        'Phạm Thị Trưởng',
        'CONFIRMED',
        '2026-08-21 16:30:00+07',
        '2026-08-21 16:30:00+07'
    ),

    -- 6. Phiếu nhập đang soạn thảo - Bản nháp (DRAFT)
    (
        '10000000-0000-0000-0000-000000000006',
        'PNK-2026-0006',
        '2026-08-21',
        NULL,
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        'c9a646d3-9c61-4cd7-bf5b-9b4dc257850a',
        'PURCHASE',
        'Dự thảo nhập cát vàng và đá dăm từ Nhà cung cấp Miền Bắc đang chờ xe hạ tải',
        'Vũ Đình Tùng',
        'HĐ-99912',
        '2026-08-21',
        'Công ty Cổ phần Khai thác Khoáng sản Miền Bắc',
        '152',
        '331',
        11000000.00,
        'Mười một triệu đồng chẵn',
        '1 hóa đơn nháp điện tử',
        'Lê Văn Lập',
        'Trần Văn Kho',
        'Phạm Thị Trưởng',
        'DRAFT',
        '2026-08-21 17:00:00+07',
        '2026-08-21 17:00:00+07'
    ),

    -- 7. Phiếu nhập đã bị hủy / hoàn kho do sai quy cách (CANCELLED)
    (
        '10000000-0000-0000-0000-000000000007',
        'PNK-2026-0007',
        '2026-08-15',
        '2026-08-15',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        'c9a646d3-9c61-4cd7-bf5b-9b4dc257850a',
        'PURCHASE',
        'Chứng từ nhập lô thép cuộn lỗi - Đã lập biên bản hủy và xuất trả NCC Việt Nhật',
        'Nguyễn Văn An',
        'HĐ-GTGT-99710',
        '2026-08-14',
        'Công ty TNHH Thương mại Thép Việt Nhật',
        '152',
        '331',
        3000000.00,
        'Ba triệu đồng chẵn',
        '1 biên bản từ chối nhận hàng do sai dung sai kỹ thuật',
        'Lê Văn Lập',
        'Trần Văn Kho',
        'Phạm Thị Trưởng',
        'CANCELLED',
        '2026-08-15 11:00:00+07',
        '2026-08-16 09:00:00+07'
    )
ON CONFLICT (receipt_number) DO NOTHING;


-- ----------------------------------------------------------------------------
-- 5. SEED DÒNG CHI TIẾT HÀNG HÓA NHẬP KHO (goods_receipt_items)
-- Snapshot dữ liệu Cột B (product_name_snapshot), Cột D (unit_snapshot)
-- ----------------------------------------------------------------------------
INSERT INTO goods_receipt_items (
    id, receipt_id, product_id, line_no, product_name_snapshot, unit_snapshot,
    doc_qty, actual_qty, unit_price, amount, debit_account, credit_account, note
)
VALUES 
    -- Chi tiết PNK-2026-0001 (Tổng: 2,327,500đ)
    (
        '20000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000001',
        'e7d2b8a0-1234-4567-89ab-cdef01234567',
        1,
        'Thép cuộn Phi 6 Hòa Phát',
        'Kg',
        100.000,
        98.500,
        15000.00,
        1477500.00,
        '152',
        '331',
        'Hao hụt 1.5kg do vận chuyển và cắt mẫu thí nghiệm kéo'
    ),
    (
        '20000000-0000-0000-0000-000000000002',
        '10000000-0000-0000-0000-000000000001',
        'a1a2a3a4-1234-4567-89ab-cdef01234567',
        2,
        'Xi măng Portland hỗn hợp PCB40',
        'Bao',
        10.000,
        10.000,
        85000.00,
        850000.00,
        '152',
        '331',
        'Bao bì nguyên vẹn, khô ráo, đạt chứng nhận xuất xưởng'
    ),

    -- Chi tiết PNK-2026-0002 (Tổng: 6,000,000đ)
    (
        '20000000-0000-0000-0000-000000000003',
        '10000000-0000-0000-0000-000000000002',
        'd4d5d6d7-1234-4567-89ab-cdef01234567',
        1,
        'Gạch tuy-nen 2 lỗ 4x8x19',
        'Viên',
        5000.000,
        5000.000,
        1200.00,
        6000000.00,
        '155',
        '154',
        'Gạch nung chín đều, không nứt vỡ, xếp palet tiêu chuẩn'
    ),

    -- Chi tiết PNK-2026-0003 (Tổng: 9,250,000đ)
    (
        '20000000-0000-0000-0000-000000000004',
        '10000000-0000-0000-0000-000000000003',
        'e5e6e7e8-1234-4567-89ab-cdef01234567',
        1,
        'Ống nhựa uPVC Tiền Phong D110',
        'Cây',
        50.000,
        50.000,
        185000.00,
        9250000.00,
        '152',
        '154',
        'Đã dán tem kiểm định chất lượng và đầu nối cao su'
    ),

    -- Chi tiết PNK-2026-0004 (Tổng: 29,000,000đ)
    (
        '20000000-0000-0000-0000-000000000005',
        '10000000-0000-0000-0000-000000000004',
        'f6f7f8f9-1234-4567-89ab-cdef01234567',
        1,
        'Sơn lót kháng kiềm ngoại thất Dulux',
        'Thùng',
        20.000,
        20.000,
        1450000.00,
        29000000.00,
        '152',
        '411',
        'Hàng mới 100%, hạn sử dụng đến tháng 12/2028'
    ),

    -- Chi tiết PNK-2026-0005 (Tổng: 1,900,000đ)
    (
        '20000000-0000-0000-0000-000000000006',
        '10000000-0000-0000-0000-000000000005',
        'a7b8c9d0-1234-4567-89ab-cdef01234567',
        1,
        'Que hàn chịu lực Kim Tín KT-421 (3.2mm)',
        'Hộp',
        20.000,
        20.000,
        95000.00,
        1900000.00,
        '152',
        '3381',
        'Thừa 20 hộp so với số dư sổ cái ngày 21/08/2026'
    ),

    -- Chi tiết PNK-2026-0006 (Bản nháp DRAFT, Tổng: 11,000,000đ)
    (
        '20000000-0000-0000-0000-000000000007',
        '10000000-0000-0000-0000-000000000006',
        'b2b3b4b5-1234-4567-89ab-cdef01234567',
        1,
        'Cát vàng xây trát tiêu chuẩn',
        'm3',
        25.000,
        25.000,
        220000.00,
        5500000.00,
        '152',
        '331',
        'Hàng chuẩn bị cân xe tại cầu cân Long Biên'
    ),
    (
        '20000000-0000-0000-0000-000000000008',
        '10000000-0000-0000-0000-000000000006',
        'c3c4c5c6-1234-4567-89ab-cdef01234567',
        2,
        'Đá dăm 1x2 bê tông',
        'm3',
        17.742,
        17.742,
        310000.00,
        5500020.00,
        '152',
        '331',
        'Dự kiến nhập 1 xe ben 18 tấn'
    ),

    -- Chi tiết PNK-2026-0007 (Đã hủy CANCELLED - không cộng dồn kho)
    (
        '20000000-0000-0000-0000-000000000009',
        '10000000-0000-0000-0000-000000000007',
        'e7d2b8a0-1234-4567-89ab-cdef01234567',
        1,
        'Thép cuộn Phi 6 Hòa Phát',
        'Kg',
        200.000,
        200.000,
        15000.00,
        3000000.00,
        '152',
        '331',
        'Đã hủy phiếu và xuất trả nhà cung cấp'
    )
ON CONFLICT (receipt_id, line_no) DO NOTHING;


-- ----------------------------------------------------------------------------
-- 6. SEED SỐ DƯ TỒN KHO THỜI GIAN THỰC (inventory_balances)
-- Chỉ phản ánh số lượng từ các phiếu ở trạng thái 'CONFIRMED'
-- ----------------------------------------------------------------------------
INSERT INTO inventory_balances (warehouse_id, product_id, current_stock, updated_at)
VALUES 
    -- Tại Kho Tổng Hà Nội (c9a646d3-9c61-4cd7-bf5b-9b4dc257850a)
    (
        'c9a646d3-9c61-4cd7-bf5b-9b4dc257850a',
        'e7d2b8a0-1234-4567-89ab-cdef01234567', -- Thép cuộn (từ PNK-2026-0001)
        98.500,
        '2026-08-18 08:30:00+07'
    ),
    (
        'c9a646d3-9c61-4cd7-bf5b-9b4dc257850a',
        'a1a2a3a4-1234-4567-89ab-cdef01234567', -- Xi măng (từ PNK-2026-0001)
        10.000,
        '2026-08-18 08:30:00+07'
    ),
    (
        'c9a646d3-9c61-4cd7-bf5b-9b4dc257850a',
        'a7b8c9d0-1234-4567-89ab-cdef01234567', -- Que hàn (từ PNK-2026-0005)
        20.000,
        '2026-08-21 16:30:00+07'
    ),

    -- Tại Kho Vật liệu Gia Lâm (d0b757e4-0d72-4de8-c06c-0c5ed368961b)
    (
        'd0b757e4-0d72-4de8-c06c-0c5ed368961b',
        'f6f7f8f9-1234-4567-89ab-cdef01234567', -- Sơn Dulux (từ PNK-2026-0004)
        20.000,
        '2026-08-21 10:00:00+07'
    ),

    -- Tại Kho Hòa Cầm Đà Nẵng (e1c868f5-1e83-4ef9-d17d-1d6fe479a72c)
    (
        'e1c868f5-1e83-4ef9-d17d-1d6fe479a72c',
        'd4d5d6d7-1234-4567-89ab-cdef01234567', -- Gạch tuy-nen (từ PNK-2026-0002)
        5000.000,
        '2026-08-19 09:15:00+07'
    ),

    -- Tại Kho Cát Lái TP.HCM (f2d979a6-2f94-4f0a-e28e-2e70f580b83d)
    (
        'f2d979a6-2f94-4f0a-e28e-2e70f580b83d',
        'e5e6e7e8-1234-4567-89ab-cdef01234567', -- Ống uPVC (từ PNK-2026-0003)
        50.000,
        '2026-08-20 14:00:00+07'
    )
ON CONFLICT (warehouse_id, product_id) DO UPDATE 
SET current_stock = EXCLUDED.current_stock, updated_at = EXCLUDED.updated_at;


-- ----------------------------------------------------------------------------
-- 7. SEED NHẬT KÝ KIỂM TOÁN BẢO MẬT (security_audit_logs)
-- Lưu vết hành động kiểm toán tài chính và bảo mật hệ thống
-- ----------------------------------------------------------------------------
INSERT INTO security_audit_logs (
    id, request_id, action, entity_name, entity_id, client_ip, user_agent, payload_hash, created_at
)
VALUES 
    (
        '30000000-0000-0000-0000-000000000001',
        '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        'CREATE_RECEIPT',
        'goods_receipts',
        '10000000-0000-0000-0000-000000000001',
        '192.168.1.45',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
        '2026-08-18 08:30:00+07'
    ),
    (
        '30000000-0000-0000-0000-000000000002',
        'a82deb5e-4c8e-4cae-acee-3c1e8c4eda7e',
        'CREATE_RECEIPT',
        'goods_receipts',
        '10000000-0000-0000-0000-000000000002',
        '192.168.2.102',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef01a',
        '2026-08-19 09:15:00+07'
    ),
    (
        '30000000-0000-0000-0000-000000000003',
        'b93efc6f-5d9f-4dbf-bdff-4d2f9d5feb8f',
        'CANCEL_RECEIPT_AND_REVERSE_STOCK',
        'goods_receipts',
        '10000000-0000-0000-0000-000000000007',
        '192.168.1.12',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef01a2b',
        '2026-08-16 09:00:00+07'
    )
ON CONFLICT (id) DO NOTHING;