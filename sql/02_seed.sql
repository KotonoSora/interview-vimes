-- sql/02_seed.sql
-- ============================================================================
-- VIMES INVENTORY - COMPREHENSIVE SEED DATA (Mẫu 01 - VT)
-- Căn cứ pháp lý: Thông tư 200/2014/TT-BTC & Luật Kế toán 2015
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. SEED ĐƠN VỊ / CHI NHÁNH / PHÒNG BAN (organizations)
-- ----------------------------------------------------------------------------
INSERT INTO organizations (id, code, name, department)
SELECT 
    gen_random_uuid(),
    'VIMES-' || lpad(i::text, 3, '0'),
    CASE (i % 3)
        WHEN 0 THEN 'CÔNG TY CỔ PHẦN VIMES - HÀ NỘI ' || i
        WHEN 1 THEN 'CHI NHÁNH TỔNG CÔNG TY VIMES ĐÀ NẴNG ' || i
        ELSE 'CÔNG TY TNHH VẬT TƯ VIMES MIỀN NAM ' || i
    END,
    CASE (i % 3)
        WHEN 0 THEN 'Phòng Kế toán - Quản lý Vật tư'
        WHEN 1 THEN 'Phòng Quản trị Dự án Miền Trung'
        ELSE 'Ban Vật tư & Cung ứng Công trường'
    END
FROM generate_series(1, 45) AS s(i)
ON CONFLICT (code) DO UPDATE 
SET name = EXCLUDED.name, department = EXCLUDED.department;


-- ----------------------------------------------------------------------------
-- 2. SEED DANH MỤC KHO BÃI TIẾP NHẬN (warehouses)
-- ----------------------------------------------------------------------------
INSERT INTO warehouses (id, organization_id, code, name, location, is_active)
SELECT 
    gen_random_uuid(),
    org.id,
    'KHO-' || lpad(row_number() OVER ()::text, 3, '0'),
    CASE (row_number() OVER () % 4)
        WHEN 0 THEN 'Kho Tổng Hà Nội ' || row_number() OVER ()
        WHEN 1 THEN 'Kho Vật liệu Xây dựng Gia Lâm ' || row_number() OVER ()
        WHEN 2 THEN 'Kho Trung chuyển Hòa Cầm ' || row_number() OVER ()
        ELSE 'Kho Cơ giới & Thiết bị Cát Lái ' || row_number() OVER ()
    END,
    CASE (row_number() OVER () % 4)
        WHEN 0 THEN 'KCN Sài Đồng, Long Biên, Hà Nội'
        WHEN 1 THEN 'Km 12 Quốc lộ 5, Gia Lâm, Hà Nội'
        WHEN 2 THEN 'Đường số 3, KCN Hòa Cầm, Cẩm Lệ, Đà Nẵng'
        ELSE 'Cụm Cảng Cát Lái, TP. Thủ Đức, TP. Hồ Chí Minh'
    END,
    true
FROM organizations org
ON CONFLICT (code) DO UPDATE 
SET name = EXCLUDED.name, location = EXCLUDED.location, is_active = EXCLUDED.is_active;


-- ----------------------------------------------------------------------------
-- 3. SEED DANH MỤC VẬT TƯ / HÀNG HÓA MASTER (products)
-- ----------------------------------------------------------------------------
INSERT INTO products (id, code, name, unit, default_price, is_active)
SELECT 
    gen_random_uuid(),
    'VT' || lpad(i::text, 3, '0'),
    CASE (i % 8)
        WHEN 0 THEN 'Thép cuộn Phi 6 Hòa Phát'
        WHEN 1 THEN 'Xi măng Portland hỗn hợp PCB40'
        WHEN 2 THEN 'Cát vàng xây trát tiêu chuẩn'
        WHEN 3 THEN 'Đá dăm 1x2 bê tông'
        WHEN 4 THEN 'Gạch tuy-nen 2 lỗ 4x8x19'
        WHEN 5 THEN 'Ống nhựa uPVC Tiền Phong D110'
        WHEN 6 THEN 'Sơn lót kháng kiềm ngoại thất Dulux'
        ELSE 'Que hàn chịu lực Kim Tín KT-421 (3.2mm)'
    END,
    CASE (i % 8)
        WHEN 0 THEN 'Kg'
        WHEN 1 THEN 'Bao'
        WHEN 2 THEN 'm3'
        WHEN 3 THEN 'm3'
        WHEN 4 THEN 'Viên'
        WHEN 5 THEN 'Cây'
        WHEN 6 THEN 'Thùng'
        ELSE 'Hộp'
    END,
    CASE (i % 8)
        WHEN 0 THEN 15000.00
        WHEN 1 THEN 85000.00
        WHEN 2 THEN 220000.00
        WHEN 3 THEN 310000.00
        WHEN 4 THEN 1200.00
        WHEN 5 THEN 185000.00
        WHEN 6 THEN 1450000.00
        ELSE 95000.00
    END,
    true
FROM generate_series(1, 45) AS s(i)
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
SELECT 
    gen_random_uuid(),
    'PNK-2026-' || lpad(i::text, 4, '0'),
    ('2026-08-01'::date + make_interval(days => (i % 25))),
    ('2026-08-01'::date + make_interval(days => (i % 25))),
    w.organization_id,
    w.id,
    CASE (i % 5)
        WHEN 0 THEN 'PURCHASE'
        WHEN 1 THEN 'INTERNAL_PRODUCTION'
        WHEN 2 THEN 'OUTSOURCED_PROCESSING'
        WHEN 3 THEN 'CAPITAL_CONTRIBUTION'
        ELSE 'INVENTORY_SURPLUS'
    END,
    CASE (i % 5)
        WHEN 0 THEN 'Nhập kho thép cuộn và xi măng phục vụ công trình Tòa nhà VIMES Center theo HĐ 99882'
        WHEN 1 THEN 'Nhập kho gạch tuy-nen tự sản xuất từ Xưởng Chế tạo số 2 chuyển về kho trung chuyển'
        WHEN 2 THEN 'Nhập kho ống nhựa và vật tư phụ gia công hoàn thiện bề mặt theo biên bản giao nhận'
        WHEN 3 THEN 'Tiếp nhận tài sản góp vốn bằng vật tư sơn lót cao cấp từ đối tác AkzoNobel'
        ELSE 'Ghi tăng tồn kho que hàn phát hiện thừa chưa rõ nguyên nhân sau kiểm kê định kỳ tháng 8/2026'
    END,
    CASE (i % 5)
        WHEN 0 THEN 'Nguyễn Văn An'
        WHEN 1 THEN 'Trần Đình Trọng'
        WHEN 2 THEN 'Phan Minh Đức'
        WHEN 3 THEN 'Đoàn Quốc Hưng'
        ELSE 'Trần Văn Kho'
    END,
    CASE (i % 5)
        WHEN 0 THEN 'HĐ-GTGT-99882'
        WHEN 1 THEN 'LNK-SX-084'
        WHEN 2 THEN 'BBGN-GC-412'
        WHEN 3 THEN 'BB-GOPVON-01'
        ELSE 'BB-KK-T08/2026'
    END,
    ('2026-08-01'::date + make_interval(days => (i % 25)) - interval '1 day')::date,
    CASE (i % 5)
        WHEN 0 THEN 'Công ty TNHH Thương mại Thép Việt Nhật'
        WHEN 1 THEN 'Xưởng Sản xuất Cấu kiện Bê tông & Gạch VIMES'
        WHEN 2 THEN 'Công ty CP Cơ khí & Nhựa Công nghiệp Sài Gòn'
        WHEN 3 THEN 'Công ty Sơn AkzoNobel Việt Nam'
        ELSE 'Hội đồng kiểm kê kho Tổng Hà Nội'
    END,
    CASE (i % 5) WHEN 1 THEN '155' ELSE '152' END,
    CASE (i % 5)
        WHEN 0 THEN '331'
        WHEN 1 THEN '154'
        WHEN 2 THEN '154'
        WHEN 3 THEN '411'
        ELSE '3381'
    END,
    0.00,
    'Đang cập nhật',
    CASE (i % 5)
        WHEN 0 THEN '1 hóa đơn GTGT gốc, 1 phiếu xuất kho kiêm vận chuyển nội bộ'
        WHEN 1 THEN '1 biên bản nghiệm thu chất lượng sản phẩm xuất xưởng'
        WHEN 2 THEN '1 phiếu giao nhận hàng gia công, 1 hóa đơn dịch vụ gia công'
        WHEN 3 THEN '1 biên bản định giá tài sản của Hội đồng thành viên'
        ELSE '1 biên bản kiểm kê quỹ và hàng tồn kho số 08/KK'
    END,
    'Lê Văn Lập',
    'Trần Văn Kho',
    'Phạm Thị Trưởng',
    CASE 
        WHEN i % 10 = 0 THEN 'CANCELLED'
        WHEN i % 7 = 0 THEN 'DRAFT'
        ELSE 'CONFIRMED'
    END,
    ('2026-08-01 08:00:00+07'::timestamptz + make_interval(days => (i % 25), mins => i)),
    ('2026-08-01 08:00:00+07'::timestamptz + make_interval(days => (i % 25), mins => i))
FROM generate_series(1, 45) AS s(i)
JOIN (
    SELECT id, organization_id, row_number() OVER (ORDER BY code) AS rnum 
    FROM warehouses
) w ON w.rnum = ((s.i - 1) % 45) + 1
ON CONFLICT (receipt_number) DO NOTHING;


-- ----------------------------------------------------------------------------
-- 5. SEED DÒNG CHI TIẾT HÀNG HÓA NHẬP KHO (goods_receipt_items)
-- Snapshot dữ liệu Cột B (product_name_snapshot), Cột D (unit_snapshot)
-- ----------------------------------------------------------------------------
WITH gr_list AS (
    SELECT id, row_number() OVER (ORDER BY receipt_number) AS rnum
    FROM goods_receipts
),
p_list AS (
    SELECT id, name, unit, default_price, row_number() OVER (ORDER BY code) AS rnum
    FROM products
)
INSERT INTO goods_receipt_items (
    id, receipt_id, product_id, line_no, product_name_snapshot, unit_snapshot,
    doc_qty, actual_qty, unit_price, amount, debit_account, credit_account, note
)
SELECT 
    gen_random_uuid(),
    gr.id,
    p.id,
    1,
    p.name,
    p.unit,
    CASE (gr.rnum % 5) WHEN 0 THEN 100.000 WHEN 1 THEN 5000.000 WHEN 2 THEN 50.000 WHEN 3 THEN 20.000 ELSE 20.000 END,
    CASE (gr.rnum % 5) WHEN 0 THEN 98.500 WHEN 1 THEN 5000.000 WHEN 2 THEN 50.000 WHEN 3 THEN 20.000 ELSE 20.000 END,
    p.default_price,
    (CASE (gr.rnum % 5) WHEN 0 THEN 98.500 WHEN 1 THEN 5000.000 WHEN 2 THEN 50.000 WHEN 3 THEN 20.000 ELSE 20.000 END) * p.default_price,
    '152',
    '331',
    CASE (gr.rnum % 5)
        WHEN 0 THEN 'Hao hụt 1.5kg do vận chuyển và cắt mẫu thí nghiệm kéo'
        WHEN 1 THEN 'Gạch nung chín đều, không nứt vỡ, xếp palet tiêu chuẩn'
        WHEN 2 THEN 'Đã dán tem kiểm định chất lượng và đầu nối cao su'
        WHEN 3 THEN 'Hàng mới 100%, hạn sử dụng đến tháng 12/2028'
        ELSE 'Thừa 20 hộp so với số dư sổ cái ngày 21/08/2026'
    END
FROM gr_list gr
JOIN p_list p ON p.rnum = ((gr.rnum - 1) % 45) + 1
ON CONFLICT (receipt_id, line_no) DO NOTHING;

-- Đồng bộ total_amount của goods_receipts khớp chính xác 100% với items
UPDATE goods_receipts gr
SET total_amount = COALESCE((
    SELECT SUM(gri.amount) 
    FROM goods_receipt_items gri 
    WHERE gri.receipt_id = gr.id
), 0.00);


-- ----------------------------------------------------------------------------
-- 6. SEED SỐ DƯ TỒN KHO THỜI GIAN THỰC (inventory_balances)
-- Chỉ phản ánh số lượng từ các phiếu ở trạng thái 'CONFIRMED'
-- ----------------------------------------------------------------------------
INSERT INTO inventory_balances (warehouse_id, product_id, current_stock, updated_at)
SELECT 
    gr.warehouse_id,
    gri.product_id,
    SUM(gri.actual_qty),
    now()
FROM goods_receipts gr
JOIN goods_receipt_items gri ON gri.receipt_id = gr.id
WHERE gr.status = 'CONFIRMED'
GROUP BY gr.warehouse_id, gri.product_id
ON CONFLICT (warehouse_id, product_id) DO UPDATE 
SET current_stock = EXCLUDED.current_stock, updated_at = EXCLUDED.updated_at;


-- ----------------------------------------------------------------------------
-- 7. SEED NHẬT KÝ KIỂM TOÁN BẢO MẬT (security_audit_logs)
-- Lưu vết hành động kiểm toán tài chính và bảo mật hệ thống
-- ----------------------------------------------------------------------------
INSERT INTO security_audit_logs (
    id, request_id, action, entity_name, entity_id, client_ip, user_agent, payload_hash, created_at
)
SELECT 
    gen_random_uuid(),
    gen_random_uuid()::text,
    CASE (gr.rnum % 3)
        WHEN 0 THEN 'CREATE_RECEIPT'
        WHEN 1 THEN 'CREATE_RECEIPT'
        ELSE 'CANCEL_RECEIPT_AND_REVERSE_STOCK'
    END,
    'goods_receipts',
    gr.id,
    '192.168.1.' || (10 + (gr.rnum % 100)),
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    md5(gr.id::text || gr.rnum::text),
    gr.created_at
FROM (
    SELECT id, created_at, row_number() OVER (ORDER BY receipt_number) AS rnum 
    FROM goods_receipts
) gr
ON CONFLICT (id) DO NOTHING;