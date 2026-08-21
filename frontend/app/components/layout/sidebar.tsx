import {
  Activity,
  Boxes,
  Building2,
  FileSpreadsheet,
  LayoutDashboard,
  Package,
  Warehouse,
} from "lucide-react";
import { NavLink } from "react-router";

import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { PAGE_ROUTES } from "~/constants/navigation.constants";

const mainNavItems = [
  {
    title: PAGE_ROUTES.HOME.title,
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: PAGE_ROUTES.GOODS_RECEIPTS.title,
    href: "/goods-receipts",
    icon: FileSpreadsheet,
    badge: PAGE_ROUTES.GOODS_RECEIPTS.badge,
  },
];

const masterDataItems = [
  {
    title: PAGE_ROUTES.MASTER_PRODUCTS.title,
    href: "/master-data/products",
    icon: Package,
  },
  {
    title: PAGE_ROUTES.MASTER_WAREHOUSES.title,
    href: "/master-data/warehouses",
    icon: Warehouse,
  },
  {
    title: PAGE_ROUTES.MASTER_ORGANIZATIONS.title,
    href: "/master-data/organizations",
    icon: Building2,
  },
];

const systemItems = [
  {
    title: PAGE_ROUTES.SYSTEM_STATUS.title,
    href: "/system/status",
    icon: Activity,
  },
];

export function Sidebar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
      isActive
        ? "bg-primary text-primary-foreground shadow-sm"
        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    }`;

  return (
    <aside className="w-64 border-r bg-card h-screen flex flex-col shrink-0 sticky top-0">
      <div className="h-16 flex items-center gap-3 px-6 border-b">
        <div className="p-1.5 bg-primary rounded-md text-primary-foreground">
          <Boxes className="h-5 w-5" />
        </div>
        <div>
          <div className="font-bold text-sm tracking-tight">
            VIMES INVENTORY
          </div>
          <div className="text-[11px] text-muted-foreground">
            Quản lý kho & Kế toán
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <div className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Nghiệp vụ chứng từ
          </div>
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={linkClass}
                  end={item.href === "/"}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 h-4"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <Separator />

        <div>
          <div className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Danh mục dùng chung
          </div>
          <nav className="space-y-1">
            {masterDataItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.href} to={item.href} className={linkClass}>
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </div>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <Separator />

        <div>
          <div className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Hệ thống & Vận hành
          </div>
          <nav className="space-y-1">
            {systemItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.href} to={item.href} className={linkClass}>
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </div>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}
