import { ChevronRight } from "lucide-react";
import { useLocation } from "react-router";

import { Badge } from "~/components/ui/badge";

export function Header() {
  const location = useLocation();
  const path = location.pathname;

  // Map tiêu đề động theo Route
  const getPageMeta = () => {
    if (path === "/") {
      return {
        title: "Bảng Tổng Quan",
        subtitle: "Chỉ số & luồng chứng từ nhập kho",
      };
    }
    if (path === "/goods-receipts") {
      return {
        title: "Sổ Theo Dõi Phiếu Nhập Kho",
        subtitle: "Mẫu số 01 - VT (Thông tư 200/2014/TT-BTC)",
      };
    }
    if (path === "/goods-receipts/new") {
      return {
        title: "Lập Phiếu Nhập Kho Mới",
        subtitle: "Tạo chứng từ hạch toán Nợ/Có",
      };
    }
    if (path.includes("/goods-receipts/") && path.endsWith("/edit")) {
      return {
        title: "Chỉnh Sửa Chứng Từ",
        subtitle: "Cập nhật thông tin phiếu & dòng hàng",
      };
    }
    if (path.startsWith("/goods-receipts/")) {
      return {
        title: "Chi Tiết Phiếu Nhập Kho",
        subtitle: "Xem & In ấn chứng từ khổ A4",
      };
    }
    if (path === "/master-data/products") {
      return {
        title: "Danh Mục Vật Tư & Hàng Hóa",
        subtitle: "Catalog quy cách và đơn giá chuẩn",
      };
    }
    if (path === "/master-data/warehouses") {
      return {
        title: "Danh Mục Kho Bãi",
        subtitle: "Địa điểm tiếp nhận & lưu kho vật lý",
      };
    }
    if (path === "/master-data/organizations") {
      return {
        title: "Danh Mục Đơn Vị & Phòng Ban",
        subtitle: "Pháp nhân & bộ phận phát sinh nghiệp vụ",
      };
    }
    if (path === "/system/status") {
      return {
        title: "Giám Sát Hệ Thống",
        subtitle: "Liveness/Readiness probes & Prometheus metrics",
      };
    }
    return {
      title: "Hệ Thống Quản Lý Kho & Vật Tư",
      subtitle: "VIMES Inventory",
    };
  };

  const { title, subtitle } = getPageMeta();

  return (
    <header className="h-14 border-b bg-card px-6 flex items-center justify-between sticky top-0 z-10">
      {/* Title Động */}
      <div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span>VIMES</span>
          <ChevronRight className="h-3 w-3" />
          <span>Quản lý Kho</span>
        </div>
        <div className="text-sm font-bold text-foreground flex items-center gap-2">
          {title}
          <span className="text-xs font-normal text-muted-foreground hidden lg:inline">
            — {subtitle}
          </span>
        </div>
      </div>

      {/* Thông tin chuẩn chế độ kế toán */}
      <div className="flex items-center gap-2.5">
        <Badge
          variant="outline"
          className="text-xs bg-muted/40 font-mono font-medium hidden sm:inline-flex"
        >
          Năm: 2026
        </Badge>
        <Badge variant="secondary" className="text-[11px] font-mono">
          Mẫu 01-VT
        </Badge>
      </div>
    </header>
  );
}
