import { Search } from "lucide-react";
import { useState } from "react";
import { useSubmit } from "react-router";

import type { MasterProduct } from "~/services/master-data.service";

import { Badge } from "~/components/ui/badge";
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

export interface ProductTableSectionProps {
  products: MasterProduct[];
  initialSearch?: string;
}

export function ProductTableSection({
  products = [],
  initialSearch = "",
}: ProductTableSectionProps) {
  const submit = useSubmit();
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    if (searchTerm.trim()) {
      formData.set("search", searchTerm.trim());
    }
    submit(formData, { method: "get" });
  };

  return (
    <div className="space-y-4">
      <div className="p-4 border-b">
        <form onSubmit={handleSearch} className="flex gap-2 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm theo mã hoặc tên vật tư..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 text-xs h-9"
            />
          </div>
        </form>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead className="w-[120px] font-semibold">Mã vật tư</TableHead>
            <TableHead className="font-semibold">
              Tên vật tư / Quy cách
            </TableHead>
            <TableHead className="w-[100px] text-center font-semibold">
              Đơn vị tính
            </TableHead>
            <TableHead className="w-[160px] text-right font-semibold">
              Đơn giá chuẩn (VNĐ)
            </TableHead>
            <TableHead className="w-[130px] text-center font-semibold">
              Trạng thái
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-32 text-center text-xs text-muted-foreground"
              >
                Không tìm thấy vật tư / hàng hóa nào phù hợp.
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.id} className="hover:bg-muted/30">
                <TableCell className="font-mono font-semibold text-xs text-primary">
                  {product.code}
                </TableCell>
                <TableCell className="text-xs font-medium">
                  {product.name}
                </TableCell>
                <TableCell className="text-xs text-center">
                  {product.unit}
                </TableCell>
                <TableCell className="text-xs text-right font-mono">
                  {formatCurrencyVND(product.defaultPrice)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary" className="text-[10px]">
                    Hoạt động
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
