import { useSubmit } from "react-router";
import type { MasterWarehouse } from "~/services/master-data.service";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { DatePicker } from "~/components/ui/date-picker";
import { Search } from "lucide-react";

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

export function ReceiptFilterToolbar({ warehouses, currentFilters }: Props) {
  const submit = useSubmit();

  const handleFilterChange = (key: string, value: string | null) => {
    const params = new URLSearchParams(window.location.search);
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    submit(params, { method: "get" });
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5 p-2.5 bg-card border rounded-lg shadow-sm">
      {/* Search Box */}
      <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Tìm theo số phiếu, người giao, CT gốc..."
          defaultValue={currentFilters.search}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "" || val.length >= 2) {
              handleFilterChange("search", val);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleFilterChange("search", (e.target as HTMLInputElement).value);
            }
          }}
          className="pl-8 h-8 text-xs bg-background"
        />
      </div>

      {/* Kho tiếp nhận */}
      <div className="min-w-[220px] max-w-[280px]">
        <Select
          defaultValue={currentFilters.warehouseId || "all"}
          onValueChange={(val: string | null) => handleFilterChange("warehouseId", val)}
        >
          <SelectTrigger className="h-8 text-xs bg-background w-full">
            <SelectValue placeholder="Tất cả kho tiếp nhận" />
          </SelectTrigger>
          <SelectContent className="min-w-[260px]">
            <SelectItem value="all" className="text-xs">Tất cả kho tiếp nhận</SelectItem>
            {warehouses.map((w) => (
              <SelectItem key={w.id} value={w.id} className="text-xs">
                {w.code ? `[${w.code}] ` : ""}{w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Trạng thái */}
      <div className="min-w-[150px]">
        <Select
          defaultValue={currentFilters.status || "all"}
          onValueChange={(val: string | null) => handleFilterChange("status", val)}
        >
          <SelectTrigger className="h-8 text-xs bg-background w-full">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent className="min-w-[160px]">
            <SelectItem value="all" className="text-xs">Mọi trạng thái</SelectItem>
            <SelectItem value="CONFIRMED" className="text-xs">Đã nhập kho</SelectItem>
            <SelectItem value="DRAFT" className="text-xs">Bản nháp</SelectItem>
            <SelectItem value="CANCELLED" className="text-xs">Đã hủy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* DatePicker */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="w-[135px]">
          <DatePicker
            value={currentFilters.fromDate}
            onChange={(val) => handleFilterChange("fromDate", val || null)}
            placeholder="Từ ngày"
          />
        </div>
        <span className="text-xs text-muted-foreground">-</span>
        <div className="w-[135px]">
          <DatePicker
            value={currentFilters.toDate}
            onChange={(val) => handleFilterChange("toDate", val || null)}
            placeholder="Đến ngày"
          />
        </div>
      </div>
    </div>
  );
}
