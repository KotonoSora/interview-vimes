import { ArrowRight, Building2, Package, Warehouse } from "lucide-react";
import { Link } from "react-router";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function MasterDataHubRoute() {
  const hubs = [
    {
      title: "Danh Mục Vật Tư, Hàng Hóa",
      description:
        "Quản lý mã SKU, tên quy cách, đơn vị tính và đơn giá định mức",
      href: "/master-data/products",
      icon: Package,
    },
    {
      title: "Danh Mục Kho Bãi",
      description: "Quản lý các điểm kho vật lý và chỉ định thủ kho phụ trách",
      href: "/master-data/warehouses",
      icon: Warehouse,
    },
    {
      title: "Đơn Vị & Phòng Ban",
      description: "Quản lý chi nhánh, phòng ban phát sinh chứng từ kế toán",
      href: "/master-data/organizations",
      icon: Building2,
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold tracking-tight">
          Danh Mục Dùng Chung (Master Data)
        </h1>
        <p className="text-xs text-muted-foreground">
          Quản lý toàn bộ dữ liệu danh mục cốt lõi phục vụ lập chứng từ theo
          Thông tư 200
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {hubs.map((hub, idx) => {
          const Icon = hub.icon;
          return (
            <Card key={idx} className="hover:border-primary transition-all">
              <CardHeader className="p-5">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary w-fit mb-3">
                  <Icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-base font-semibold">
                  {hub.title}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {hub.description}
                </p>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <Link
                  to={hub.href}
                  className="text-xs font-medium text-primary flex items-center gap-1 hover:underline"
                >
                  Truy cập quản lý <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
