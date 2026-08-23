import {
  Activity,
  Boxes,
  Building2,
  FileText,
  LayoutDashboard,
  Package,
  Warehouse,
} from "lucide-react";
import { Link, useLocation } from "react-router";

export function AppSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const mainNav = [
    { title: "Bảng Tổng Quan", href: "/", icon: LayoutDashboard },
    { title: "Sổ Phiếu Nhập Kho", href: "/goods-receipts", icon: FileText },
  ];

  const masterNav = [
    { title: "Danh Mục Vật Tư", href: "/master-data/products", icon: Package },
    {
      title: "Danh Mục Kho Bãi",
      href: "/master-data/warehouses",
      icon: Warehouse,
    },
    {
      title: "Danh Mục Đơn Vị",
      href: "/master-data/organizations",
      icon: Building2,
    },
  ];

  const systemNav = [
    { title: "Giám Sát Hệ Thống", href: "/system/status", icon: Activity },
  ];

  return (
    <aside className="w-60 shrink-0 border-r bg-card min-h-screen flex flex-col justify-between hidden md:flex">
      <div>
        {/* Header Logo */}
        <div className="border-b p-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-primary hover:opacity-90"
          >
            <div className="p-1.5 rounded-md bg-primary text-primary-foreground">
              <Boxes className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="leading-tight font-bold text-xs tracking-tight">
                VIMES INVENTORY
              </span>
              <span className="text-[10px] font-normal text-muted-foreground">
                Hệ Thống Quản Lý Nhập Kho
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Groups */}
        <div className="p-2 space-y-4 text-xs">
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase px-2 mb-1">
              Nghiệp Vụ Nhập Kho
            </p>
            <nav className="space-y-0.5">
              {mainNav.map((item) => {
                const isActive =
                  item.href === "/"
                    ? currentPath === "/"
                    : currentPath.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
            <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase px-2 mb-1">
              Danh Mục Dùng Chung
            </p>
            <nav className="space-y-0.5">
              {masterNav.map((item) => {
                const isActive = currentPath.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
            <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase px-2 mb-1">
              Hệ Thống
            </p>
            <nav className="space-y-0.5">
              {systemNav.map((item) => {
                const isActive = currentPath.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      <div className="border-t p-2 text-center text-[10px] text-muted-foreground font-mono">
        VIMES Inventory v1.0
      </div>
    </aside>
  );
}
