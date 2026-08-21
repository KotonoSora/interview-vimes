export interface PageMetaConfig {
  title: string;
  subtitle: string;
  metaTitle: string;
  description: string;
  badge?: string;
}

export const PAGE_ROUTES: Record<string, PageMetaConfig> = {
  HOME: {
    title: "Tổng Quan",
    subtitle: "Chỉ số & cơ cấu nhập kho",
    metaTitle: "Tổng Quan | VIMES Inventory",
    description: "Tổng hợp chỉ số và phân bổ giá trị nhập kho.",
  },
  GOODS_RECEIPTS: {
    title: "Sổ Phiếu Nhập Kho",
    subtitle: "Danh sách chứng từ 01-VT",
    metaTitle: "Sổ Phiếu Nhập Kho | VIMES Inventory",
    description:
      "Theo dõi, tra cứu và lọc danh sách chứng từ nhập kho Mẫu 01-VT.",
    badge: "TT 200",
  },
  GOODS_RECEIPT_NEW: {
    title: "Lập Phiếu Nhập Kho",
    subtitle: "Tạo mới chứng từ 01-VT",
    metaTitle: "Lập Phiếu Nhập Kho | VIMES Inventory",
    description:
      "Lập mới chứng từ nhập kho, hạch toán Nợ/Có và định khoản chi tiết.",
  },
  GOODS_RECEIPT_EDIT: {
    title: "Chỉnh Sửa Phiếu Nhập",
    subtitle: "Cập nhật chứng từ 01-VT",
    metaTitle: "Chỉnh Sửa Chứng Từ | VIMES Inventory",
    description: "Điều chỉnh số lượng thực nhập và thông tin chứng từ gốc.",
  },
  GOODS_RECEIPT_DETAIL: {
    title: "Chi Tiết Phiếu Nhập",
    subtitle: "Xem & in ấn chứng từ 01-VT",
    metaTitle: "Chi Tiết Phiếu Nhập | VIMES Inventory",
    description: "Xem chi tiết chứng từ kế toán Mẫu 01-VT và in khổ A4 chuẩn.",
  },
  MASTER_PRODUCTS: {
    title: "Danh Mục Vật Tư",
    subtitle: "Quy cách & đơn giá chuẩn",
    metaTitle: "Danh Mục Vật Tư | VIMES Inventory",
    description: "Tra cứu danh mục vật tư, đơn vị tính và bảng giá tiêu chuẩn.",
  },
  MASTER_WAREHOUSES: {
    title: "Danh Mục Kho Bãi",
    subtitle: "Địa điểm tiếp nhận & lưu kho",
    metaTitle: "Danh Mục Kho Bãi | VIMES Inventory",
    description: "Danh sách các kho bãi tiếp nhận và vị trí lưu trữ vật tư.",
  },
  MASTER_ORGANIZATIONS: {
    title: "Đơn Vị & Phòng Ban",
    subtitle: "Pháp nhân & bộ phận lập phiếu",
    metaTitle: "Đơn Vị & Phòng Ban | VIMES Inventory",
    description:
      "Danh mục các đơn vị pháp nhân và bộ phận phát sinh nghiệp vụ.",
  },
  SYSTEM_STATUS: {
    title: "Trạng Thái Hệ Thống",
    subtitle: "Giám sát dịch vụ & DB Pool",
    metaTitle: "Trạng Thái Hệ Thống | VIMES Inventory",
    description:
      "Theo dõi tình trạng liveness/readiness và hiệu năng hệ thống.",
  },
};

export const getPageMetaByPath = (pathname: string): PageMetaConfig => {
  if (pathname === "/") return PAGE_ROUTES.HOME;
  if (pathname === "/goods-receipts") return PAGE_ROUTES.GOODS_RECEIPTS;
  if (pathname === "/goods-receipts/new") return PAGE_ROUTES.GOODS_RECEIPT_NEW;
  if (pathname.startsWith("/goods-receipts/") && pathname.endsWith("/edit"))
    return PAGE_ROUTES.GOODS_RECEIPT_EDIT;
  if (pathname.startsWith("/goods-receipts/"))
    return PAGE_ROUTES.GOODS_RECEIPT_DETAIL;
  if (pathname === "/master-data/products") return PAGE_ROUTES.MASTER_PRODUCTS;
  if (pathname === "/master-data/warehouses")
    return PAGE_ROUTES.MASTER_WAREHOUSES;
  if (pathname === "/master-data/organizations")
    return PAGE_ROUTES.MASTER_ORGANIZATIONS;
  if (pathname === "/system/status") return PAGE_ROUTES.SYSTEM_STATUS;

  return {
    title: "Hệ Thống Quản Lý Kho",
    subtitle: "VIMES Inventory Module",
    metaTitle: "VIMES Inventory",
    description:
      "Quản lý chứng từ vật tư và kho bãi theo Thông tư 200/2014/TT-BTC.",
  };
};
