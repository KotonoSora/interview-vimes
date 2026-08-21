import { ChevronRight } from "lucide-react";

import { Badge } from "~/components/ui/badge";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({
  title = "Hệ Thống Quản Lý Kho & Vật Tư",
  subtitle = "Thông tư 200/2014/TT-BTC & Luật Kế toán 2015",
}: HeaderProps) {
  return (
    <header className="h-16 border-b bg-card px-6 flex items-center justify-between sticky top-0 z-10">
      {/* Title / Breadcrumb Area */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>VIMES</span>
          <ChevronRight className="h-3 w-3" />
          <span>Inventory Module</span>
        </div>
        <div className="text-sm font-semibold text-foreground flex items-center gap-2">
          {title}
          <span className="text-xs font-normal text-muted-foreground hidden sm:inline">
            — {subtitle}
          </span>
        </div>
      </div>

      {/* Right Action Tools - Chỉ giữ thông tin tài chính chuẩn */}
      <div className="flex items-center gap-3">
        <Badge
          variant="outline"
          className="text-xs bg-muted/50 font-mono font-medium"
        >
          Năm tài chính: 2026
        </Badge>
        <Badge variant="secondary" className="text-[11px] font-mono">
          Mẫu số 01 - VT
        </Badge>
      </div>
    </header>
  );
}
