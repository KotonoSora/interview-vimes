import { Activity, FileSpreadsheet, PackagePlus, Plus } from "lucide-react";
import { Link } from "react-router";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export function QuickActions() {
  const actions = [
    {
      title: "Lập Phiếu Nhập Kho Mới",
      description: "Tạo chứng từ Mẫu 01-VT chuẩn TT 200",
      href: "/goods-receipts/new",
      icon: Plus,
      isPrimary: true,
    },
    {
      title: "Khai Báo Vật Tư Mới",
      description: "Thêm mã hàng, quy cách và ĐVT",
      href: "/master-data/products",
      icon: PackagePlus,
      isPrimary: false,
    },
    {
      title: "Tra Cứu Sổ Nhập Kho",
      description: "Xem toàn bộ danh sách & in ấn",
      href: "/goods-receipts",
      icon: FileSpreadsheet,
      isPrimary: false,
    },
    {
      title: "Kiểm Tra Trạng Thái Server",
      description: "Xem kết nối DB pool & API probes",
      href: "/system/status",
      icon: Activity,
      isPrimary: false,
    },
  ];

  return (
    <Card className="col-span-1">
      <CardHeader className="py-4 px-6 border-b">
        <CardTitle className="text-base font-semibold">
          Thao Tác Nhanh
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <Link
              key={idx}
              to={action.href}
              className={`w-full flex items-start gap-3 rounded-md p-3 text-left transition-colors border ${
                action.isPrimary
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary"
                  : "bg-card hover:bg-accent hover:text-accent-foreground border-border"
              }`}
            >
              <div className="p-1 rounded bg-background/20 mt-0.5 shrink-0">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium text-xs leading-tight">
                  {action.title}
                </div>
                <div
                  className={`text-[11px] mt-0.5 leading-snug ${
                    action.isPrimary
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground"
                  }`}
                >
                  {action.description}
                </div>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
