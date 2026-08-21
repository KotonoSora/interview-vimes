import {
  Activity,
  ArrowRight,
  Boxes,
  Building2,
  FileCheck2,
  FileSpreadsheet,
  Package,
  Plus,
  Warehouse,
} from "lucide-react";
import { Link } from "react-router";

import type { Route } from "./+types/_app._index";

import { buttonVariants } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { PAGE_ROUTES } from "~/constants/navigation.constants";
import { traceAndAuthMiddleware } from "~/middleware/auth-trace.server";

export function meta() {
  return [
    { title: PAGE_ROUTES.HOME.metaTitle },
    { name: "description", content: PAGE_ROUTES.HOME.description },
  ];
}

export const middleware = [traceAndAuthMiddleware];

export default function DashboardIndexRoute() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* KHỐI GIỚI THIỆU PHÂN HỆ */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              <Boxes className="h-3.5 w-3.5" />
              Hệ Thống Quản Lý Kho & Kế Toán Vật Tư
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Phân Hệ Quản Lý Phiếu Nhập Kho (Mẫu 01 - VT)
            </h1>
            <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
              Theo dõi biến động nhập vật tư, công cụ, dụng cụ và hàng hóa theo
              quy định của Thông tư 200/2014/TT-BTC. Hỗ trợ lập phiếu, định
              khoản tự động Nợ/Có và xuất in chứng từ chuẩn A4.
            </p>
          </div>
          <div className="shrink-0 flex sm:flex-col gap-2">
            <Link
              to="/goods-receipts/new"
              className={
                buttonVariants({ variant: "default" }) +
                " h-8 text-xs gap-1.5 shadow-sm"
              }
            >
              <Plus className="h-3.5 w-3.5" /> Lập Phiếu Mới
            </Link>
            <Link
              to="/goods-receipts"
              className={
                buttonVariants({ variant: "outline" }) + " h-8 text-xs gap-1.5"
              }
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-muted-foreground" />{" "}
              Xem Sổ Chứng Từ
            </Link>
          </div>
        </div>
      </div>

      {/* CÁC PHÂN HỆ NGHIỆP VỤ CHÍNH */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Phân hệ Chứng từ */}
        <Card className="border shadow-sm">
          <CardHeader className="py-3 px-4 border-b bg-muted/20">
            <CardTitle className="text-xs font-semibold flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-primary" />
              Nghiệp Vụ Chứng Từ Kho
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Quản lý toàn bộ vòng đời chứng từ từ khi lập nháp, kiểm nhận số
              lượng theo chứng từ gốc, đến khi thủ kho và kế toán trưởng hoàn
              tất nhập kho.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Link
                to="/goods-receipts"
                className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
              >
                Mở sổ theo dõi phiếu nhập kho <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Phân hệ Master Data */}
        <Card className="border shadow-sm">
          <CardHeader className="py-3 px-4 border-b bg-muted/20">
            <CardTitle className="text-xs font-semibold flex items-center gap-2">
              <Boxes className="h-4 w-4 text-primary" />
              Danh Mục Dùng Chung
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Quản lý danh mục vật tư, quy cách chuẩn, hệ thống kho bãi tiếp
              nhận và thông tin các đơn vị/phòng ban trực thuộc phục vụ việc lập
              chứng từ.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs">
              <Link
                to="/master-data/products"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                <Package className="h-3 w-3" /> Vật tư
              </Link>
              <Link
                to="/master-data/warehouses"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                <Warehouse className="h-3 w-3" /> Kho bãi
              </Link>
              <Link
                to="/master-data/organizations"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                <Building2 className="h-3 w-3" /> Đơn vị
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* GIÁM SÁT HỆ THỐNG */}
      <Card className="border shadow-sm">
        <CardHeader className="py-3 px-4 border-b bg-muted/20 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Vận Hành & Kết Nối Hệ Thống
          </CardTitle>
          <Link
            to="/system/status"
            className="text-xs text-primary hover:underline inline-flex items-center gap-1"
          >
            Kiểm tra trạng thái <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent className="p-4 text-xs text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>
            Hệ thống giám sát tự động: Liveness, Readiness, Database Connection
            Pool và Prometheus Metrics.
          </span>
          <span className="font-mono text-[11px] bg-muted px-2 py-0.5 rounded shrink-0">
            v1.0.0 — Production
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
