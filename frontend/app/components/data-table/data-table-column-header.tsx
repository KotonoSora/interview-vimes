import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

interface DataTableColumnHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  column: {
    getIsSorted: () => "asc" | "desc" | false;
    toggleSorting: (descending?: boolean) => void;
  };
  title: string;
}

export function DataTableColumnHeader({
  column,
  title,
  className,
}: DataTableColumnHeaderProps) {
  const isSorted = column.getIsSorted();

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      <Button
        variant="ghost"
        size="sm"
        type="button"
        className="-ml-3 h-7 text-xs font-semibold hover:bg-muted data-[state=open]:bg-accent"
        onClick={() => column.toggleSorting(isSorted === "asc")}
      >
        <span>{title}</span>
        {isSorted === "desc" ? (
          <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-primary" />
        ) : isSorted === "asc" ? (
          <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-primary" />
        ) : (
          <ChevronsUpDown className="ml-1.5 h-3.5 w-3.5 text-muted-foreground opacity-60" />
        )}
      </Button>
    </div>
  );
}
