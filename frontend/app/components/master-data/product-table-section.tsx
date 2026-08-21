import { Search } from "lucide-react";
import { useState } from "react";
import { useSubmit } from "react-router";

import type { MasterProduct } from "~/services/master-data.service";

import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { formatCurrencyVND } from "~/lib/formatters";

export function ProductTableSection({
  products = [],
  initialSearch = "",
}: {
  products: MasterProduct[];
  initialSearch?: string;
}) {
  const submit = useSubmit();
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  return (
    <div className="space-y-3">
      <div className="p-3 border-b">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData();
            if (searchTerm.trim()) fd.set("search", searchTerm.trim());
            submit(fd, { method: "get" });
          }}
          className="flex gap-2 max-w-sm"
        >
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Tìm theo mã hoặc tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 text-xs h-8"
            />
          </div>
        </form>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 text-xs">
            <TableHead className="w-28">Mã số</TableHead>
            <TableHead>Tên vật tư / Quy cách</TableHead>
            <TableHead className="w-20 text-center">ĐVT</TableHead>
            <TableHead className="w-36 text-right">Đơn giá chuẩn</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="h-24 text-center text-xs text-muted-foreground"
              >
                Không có dữ liệu.
              </TableCell>
            </TableRow>
          ) : (
            products.map((p) => (
              <TableRow key={p.id} className="text-xs">
                <TableCell className="font-mono font-semibold text-primary">
                  {p.code}
                </TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {p.unit}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrencyVND(p.defaultPrice)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
