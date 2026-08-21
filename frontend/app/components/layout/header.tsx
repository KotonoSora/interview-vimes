import { Bell, ChevronRight, User } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

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

      {/* Right Action Tools */}
      <div className="flex items-center gap-3">
        <Badge
          variant="outline"
          className="hidden md:inline-flex text-xs bg-muted/50"
        >
          Năm tài chính: 2026
        </Badge>

        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary"></span>
        </Button>

        <div className="flex items-center gap-2 pl-3 border-l">
          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-xs">
            <User className="h-4 w-4" />
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-medium">Kế toán viên</div>
            <div className="text-[10px] text-muted-foreground">
              sa-team@vimes.vn
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
