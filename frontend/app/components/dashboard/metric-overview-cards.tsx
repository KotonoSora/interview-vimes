import { AlertTriangle, Clock, DollarSign, FileText } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface MetricsData {
  totalReceiptsMonth: number;
  totalValueMonth: number;
  pendingDraftCount: number;
  lowStockAlertCount: number;
}

interface MetricOverviewCardsProps {
  metrics?: MetricsData;
}

export function MetricOverviewCards({
  metrics = {
    totalReceiptsMonth: 28,
    totalValueMonth: 485920000,
    pendingDraftCount: 3,
    lowStockAlertCount: 2,
  },
}: MetricOverviewCardsProps) {
  const cards = [
    {
      title: "Phiếu Nhập Trong Tháng",
      value: `${metrics.totalReceiptsMonth} phiếu`,
      description: "Tăng 12% so với tháng trước",
      icon: FileText,
      iconColor: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Tổng Giá Trị Nhập Kho",
      value: `${new Intl.NumberFormat("vi-VN").format(metrics.totalValueMonth)} ₫`,
      description: "Tính trên các phiếu đã CONFIRMED",
      icon: DollarSign,
      iconColor: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      title: "Phiếu Nháp Cần Xử Lý",
      value: `${metrics.pendingDraftCount} chứng từ`,
      description: "Chưa hoàn tất xác nhận nhập kho",
      icon: Clock,
      iconColor: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
    },
    {
      title: "Cảnh Báo Tồn Kho Thấp",
      value: `${metrics.lowStockAlertCount} mặt hàng`,
      description: "Dưới mức tồn kho tối thiểu",
      icon: AlertTriangle,
      iconColor: "text-rose-600 bg-rose-100 dark:bg-rose-900/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.iconColor}`}>
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold tracking-tight">
                {card.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
