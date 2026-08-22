import { Search } from "lucide-react";
import * as React from "react";
import { useSubmit } from "react-router";

import type { MasterWarehouse } from "~/services/master-data.service";

import { DatePicker } from "~/components/shared/date-picker";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

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
  const submit = useSubmit();

  const warehouseOptions = React.useMemo(() => {
    return [
      { value: "all", label: "Tất cả kho tiếp nhận" },
      ...warehouses.map((w) => ({
        value: w.id,
        label: w.code ? `[${w.code}] ${w.name}` : w.name,
      })),
    ];
  }, [warehouses]);

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
              handleFilterChange(
                "search",
                (e.target as HTMLInputElement).value,
              );
            }
          }}
          className="pl-8 h-8 text-xs bg-background"
        />
      </div>

      <div className="min-w-[220px] max-w-[280px]">
        <Select
          items={warehouseOptions}
          defaultValue={currentFilters.warehouseId || "all"}
          onValueChange={(val: string | null) =>
            handleFilterChange("warehouseId", val)
          }
        >
          <SelectTrigger className="h-8 text-xs bg-background w-full">
            <SelectValue placeholder="Tất cả kho tiếp nhận" />
          </SelectTrigger>
          <SelectContent className="min-w-[260px]">
            {warehouseOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[150px]">
        <Select
          items={statusOptions}
          defaultValue={currentFilters.status || "all"}
          onValueChange={(val: string | null) =>
            handleFilterChange("status", val)
          }
        >
          <SelectTrigger className="h-8 text-xs bg-background w-full">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent className="min-w-[160px]">
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <div className="w-[135px]">
          <DatePicker
            value={currentFilters.fromDate}
            onChange={(val: string) =>
              handleFilterChange("fromDate", val || null)
            }
            placeholder="Từ ngày"
            className="h-8 text-xs"
          />
        </div>
        <span className="text-xs text-muted-foreground">-</span>
        <div className="w-[135px]">
          <DatePicker
            value={currentFilters.toDate}
            onChange={(val: string) =>
              handleFilterChange("toDate", val || null)
            }
            placeholder="Đến ngày"
            className="h-8 text-xs"
          />
        </div>
      </div>
    </div>
  );
}
