import { Boxes } from "lucide-react";
import { Link, useLocation } from "react-router";

export function AppHeader() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean);

  const getBreadcrumbLabel = (seg: string) => {
    switch (seg) {
      case "goods-receipts":
        return "Phiếu Nhập Kho";
      case "new":
        return "Lập Phiếu Mới";
      case "edit":
        return "Chỉnh Sửa";
      case "master-data":
        return "Danh Mục";
      case "products":
        return "Vật Tư & Hàng Hóa";
      case "warehouses":
        return "Kho Bãi Tiếp Nhận";
      case "organizations":
        return "Đơn Vị & Phòng Ban";
      case "system":
        return "Hệ Thống";
      case "status":
        return "Giám Sát Vận Hành";
      default:
        return seg;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-12 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Breadcrumbs điều hướng */}
      <div className="flex items-center gap-2 text-xs">
        <Link
          to="/"
          className="flex items-center gap-1.5 font-semibold text-primary hover:opacity-80"
        >
          <Boxes className="h-4 w-4" />
          <span className="hidden sm:inline">Trang Chủ</span>
        </Link>
        {pathnames.length > 0 && (
          <span className="text-muted-foreground">/</span>
        )}
        {pathnames.map((seg, idx) => {
          const to = `/${pathnames.slice(0, idx + 1).join("/")}`;
          const isLast = idx === pathnames.length - 1;
          const label = getBreadcrumbLabel(seg);
          return (
            <div key={to} className="flex items-center gap-2">
              {isLast ? (
                <span className="font-medium text-foreground truncate max-w-[200px]">
                  {label}
                </span>
              ) : (
                <Link
                  to={to}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {label}
                </Link>
              )}
              {!isLast && <span className="text-muted-foreground">/</span>}
            </div>
          );
        })}
      </div>

      {/* Thông tin chuẩn mẫu kế toán */}
      <div className="flex items-center gap-2 text-xs">
        <span className="bg-muted px-2.5 py-1 rounded text-[11px] font-mono font-semibold text-muted-foreground">
          Mẫu số 01 - VT (TT 200/2014/TT-BTC)
        </span>
      </div>
    </header>
  );
}
