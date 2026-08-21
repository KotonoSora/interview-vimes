import { useLocation } from "react-router";

import { getPageMetaByPath } from "~/constants/navigation.constants";

export function Header() {
  const location = useLocation();
  const { title, subtitle } = getPageMetaByPath(location.pathname);

  return (
    <header className="h-14 border-b bg-card px-6 flex items-center sticky top-0 z-10 w-full">
      <div className="flex items-center gap-2">
        <h1 className="text-sm font-bold text-foreground">{title}</h1>
        {subtitle && (
          <span className="text-xs font-normal text-muted-foreground hidden sm:inline">
            — {subtitle}
          </span>
        )}
      </div>
    </header>
  );
}
