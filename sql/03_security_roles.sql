-- sql/03_security_roles.sql
-- Tạo role ứng dụng nghiệp vụ nếu chưa tồn tại
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'app_user') THEN
        CREATE ROLE app_user WITH LOGIN PASSWORD 'app_secure_password_2026';
    END IF;
END
$$;

-- Cấp quyền kết nối vào database
GRANT CONNECT ON DATABASE vimes_inventory TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;

-- Cấp quyền DML (SELECT, INSERT, UPDATE, DELETE) trên các bảng dữ liệu
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;

-- Cấp quyền sử dụng Sequences (nếu có)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO app_user;