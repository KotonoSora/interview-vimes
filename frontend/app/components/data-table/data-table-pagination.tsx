import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface DataTablePaginationProps {
  totalCount: number;
  pageSize: number;
  pageIndex: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function DataTablePagination({
  totalCount,
  pageSize,
  pageIndex,
  pageCount,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-2.5 border-t bg-muted/20 text-xs">
      <div className="text-muted-foreground text-xs">
        Tổng cộng: <strong className="text-foreground font-mono font-semibold">{totalCount}</strong> bản ghi
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Hiển thị:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(val: string | null) => {
              if (val) onPageSizeChange(Number(val));
            }}
          >
            <SelectTrigger className="h-7 w-[75px] text-xs bg-background">
              <SelectValue placeholder={String(pageSize)} />
            </SelectTrigger>
            <SelectContent side="top" className="min-w-[75px]">
              {[10, 20, 30, 50, 100].map((size) => (
                <SelectItem key={size} value={String(size)} className="text-xs">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-center text-xs font-medium text-muted-foreground whitespace-nowrap">
          Trang <span className="font-mono text-foreground font-semibold mx-1">{pageIndex + 1}</span> / {pageCount}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            className="hidden h-7 w-7 p-0 lg:flex"
            onClick={() => onPageChange(0)}
            disabled={pageIndex <= 0}
          >
            <span className="sr-only">Trang đầu</span>
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            className="h-7 w-7 p-0"
            onClick={() => onPageChange(pageIndex - 1)}
            disabled={pageIndex <= 0}
          >
            <span className="sr-only">Trang trước</span>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            className="h-7 w-7 p-0"
            onClick={() => onPageChange(pageIndex + 1)}
            disabled={pageIndex >= pageCount - 1}
          >
            <span className="sr-only">Trang sau</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-7 w-7 p-0 lg:flex"
            onClick={() => onPageChange(pageCount - 1)}
            disabled={pageIndex >= pageCount - 1}
          >
            <span className="sr-only">Trang cuối</span>
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
