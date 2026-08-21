import { ChevronRight } from "lucide-react";
import { useLocation } from "react-router";

import { Badge } from "~/components/ui/badge";
import { getPageMetaByPath } from "~/constants/navigation.constants";

export function Header() {
  const location = useLocation();
  const { title, subtitle } = getPageMetaByPath(location.pathname);

  return (
    <header className="h-14 border-b bg-card px-6 flex items-center justify-between sticky top-0 z-10">
      <div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span>VIMES</span>
          <ChevronRight className="h-3 w-3" />
          <span>Quản lý kho</span>
        </div>
        <div className="text-sm font-bold text-foreground flex items-center gap-2">
          {title}
          <span className="text-xs font-normal text-muted-foreground hidden sm:inline">
            — {subtitle}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Badge
          variant="outline"
          className="text-xs bg-muted/40 font-mono font-medium hidden sm:inline-flex"
        >
          Năm 2026
        </Badge>
        <Badge variant="secondary" className="text-[11px] font-mono">
          Mẫu 01-VT
        </Badge>
      </div>
    </header>
  );
}
