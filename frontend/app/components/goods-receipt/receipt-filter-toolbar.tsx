import * as React from "react";
import { useSearchParams } from "react-router";
import type { MasterWarehouse } from "~/services/master-data.service";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { DatePicker } from "~/components/shared/date-picker";
import { Search, X } from "lucide-react";

interface Props {
  warehouses: MasterWarehouse[];
  currentFilters: {
    search: string;
    warehouseId: string;
    status: string;
    fromDate: string;
    toDate: string;
  };
}

const statusOptions = [
  { value: "all", label: "Mọi trạng thái" },
  { value: "CONFIRMED", label: "Đã nhập kho" },
  { value: "DRAFT", label: "Bản nháp" },
  { value: "CANCELLED", label: "Đã hủy" },
];

export function ReceiptFilterToolbar({ warehouses, currentFilters }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = React.useState(currentFilters.search || "");

  // Đồng bộ local state khi URL params thay đổi từ bên ngoài (Back/Forward)
  React.useEffect(() => {
    setSearchValue(currentFilters.search || "");
  }, [currentFilters.search]);

  const warehouseOptions = React.useMemo(() => {
    return [
      { value: "all", label: "Tất cả kho tiếp nhận" },
      ...warehouses.map((w) => ({
        value: w.id,
        label: w.code ? `[${w.code}] ${w.name}` : w.name,
      })),
    ];
  }, [warehouses]);

  const updateFilters = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value.trim() !== "" && value !== "all") {
        newParams.set(key, value.trim());
      } else {
        newParams.delete(key);
      }
    });
    newParams.set("page", "1"); // Reset về trang 1 khi lọc
    setSearchParams(newParams, { preventScrollReset: true });
  };

  // Debounce tìm kiếm sau 400ms khi gõ
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== (currentFilters.search || "")) {
        updateFilters({ search: searchValue });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      updateFilters({ search: searchValue });
    }
  };

  const handleClearSearch = () => {
    setSearchValue("");
    updateFilters({ search: null });
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5 p-3 bg-card border rounded-lg shadow-sm">
      {/* Ô tìm kiếm từ khóa với Debounce & Clear Button */}
      <div className="relative flex-1 min-w-[260px]">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm theo số phiếu, người giao, CT gốc, diễn giải..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-9 pr-8 h-9 text-sm bg-background shadow-none"
        />
        {searchValue && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClearSearch}
            className="absolute right-1 top-1 h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Lọc theo Kho tiếp nhận */}
      <div className="min-w-[200px] max-w-[260px]">
        <Select
          items={warehouseOptions}
          value={currentFilters.warehouseId || "all"}
          onValueChange={(val: string | null) => updateFilters({ warehouseId: val })}
        >
          <SelectTrigger className="h-9 text-sm bg-background w-full shadow-none text-left truncate">
            <SelectValue placeholder="Tất cả kho tiếp nhận" />
          </SelectTrigger>
          <SelectContent className="min-w-[260px]">
            {warehouseOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-sm">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lọc theo Trạng thái */}
      <div className="min-w-[150px]">
        <Select
          items={statusOptions}
          value={currentFilters.status || "all"}
          onValueChange={(val: string | null) => updateFilters({ status: val })}
        >
          <SelectTrigger className="h-9 text-sm bg-background w-full shadow-none text-left truncate">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent className="min-w-[160px]">
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-sm">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lọc theo Dải ngày lập phiếu */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="w-[140px]">
          <DatePicker
            value={currentFilters.fromDate}
            onChange={(val: string) => updateFilters({ fromDate: val || null })}
            placeholder="Từ ngày"
            className="h-9 text-sm"
          />
        </div>
        <span className="text-xs text-muted-foreground">-</span>
        <div className="w-[140px]">
          <DatePicker
            value={currentFilters.toDate}
            onChange={(val: string) => updateFilters({ toDate: val || null })}
            placeholder="Đến ngày"
            className="h-9 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
