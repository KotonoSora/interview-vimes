import { Search } from "lucide-react";
import { Form, useNavigation } from "react-router";

import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface WarehouseOption {
  id: string;
  name: string;
}

interface ReceiptFilterToolbarProps {
  warehouses: WarehouseOption[];
  currentFilters: {
    search: string;
    warehouseId: string;
    status: string;
    fromDate?: string;
    toDate?: string;
  };
}

export function ReceiptFilterToolbar({
  warehouses,
  currentFilters,
}: ReceiptFilterToolbarProps) {
  const navigation = useNavigation();
  const isFiltering = navigation.state === "loading";

  return (
    <Card>
      <CardContent className="p-4">
        <Form
          method="get"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
        >
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              name="search"
              placeholder="Số phiếu, người giao..."
              defaultValue={currentFilters.search}
              className="pl-8 text-sm"
            />
          </div>

          <Select
            name="warehouseId"
            defaultValue={currentFilters.warehouseId || "all"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn kho nhập" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả các kho</SelectItem>
              {warehouses.map((wh) => (
                <SelectItem key={wh.id} value={wh.id}>
                  {wh.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select name="status" defaultValue={currentFilters.status || "all"}>
            <SelectTrigger>
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="CONFIRMED">Đã nhập kho (CONFIRMED)</SelectItem>
              <SelectItem value="DRAFT">Bản nháp (DRAFT)</SelectItem>
              <SelectItem value="CANCELLED">Đã hủy (CANCELLED)</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Input
              type="date"
              name="fromDate"
              defaultValue={currentFilters.fromDate}
              className="text-xs px-2"
              title="Từ ngày"
            />
            <Input
              type="date"
              name="toDate"
              defaultValue={currentFilters.toDate}
              className="text-xs px-2"
              title="Đến ngày"
            />
          </div>

          <Button
            type="submit"
            variant="secondary"
            disabled={isFiltering}
            className="w-full"
          >
            {isFiltering ? "Đang lọc..." : "Áp dụng lọc"}
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
}
