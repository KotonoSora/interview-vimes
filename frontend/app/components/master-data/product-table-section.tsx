import { Edit, Plus, Search } from "lucide-react";
import { useState } from "react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export interface ProductItem {
  id: string;
  code: string;
  name: string;
  unit: string;
  defaultPrice: number;
  isActive?: boolean;
}

interface ProductTableSectionProps {
  products: ProductItem[];
  onOpenCreateModal: () => void;
  onEditProduct: (product: ProductItem) => void;
}

export function ProductTableSection({
  products,
  onOpenCreateModal,
  onEditProduct,
}: ProductTableSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Card>
      <CardHeader className="py-4 px-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-base font-semibold">
            Danh Mục Vật Tư, Hàng Hóa
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản lý mã hàng, quy cách và đơn giá định mức phục vụ Mẫu 01-VT
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo mã hoặc tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>
          <Button size="sm" onClick={onOpenCreateModal}>
            <Plus className="h-4 w-4 mr-1.5" /> Thêm Vật Tư
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-[60px] text-center">STT</TableHead>
              <TableHead className="w-[120px]">Mã vật tư</TableHead>
              <TableHead>Tên, quy cách phẩm chất</TableHead>
              <TableHead className="w-[100px] text-center">ĐVT</TableHead>
              <TableHead className="w-[160px] text-right">
                Đơn giá định mức
              </TableHead>
              <TableHead className="w-[120px] text-center">
                Trạng thái
              </TableHead>
              <TableHead className="w-[80px] text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-muted-foreground text-xs"
                >
                  Không tìm thấy vật tư phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((p, idx) => (
                <TableRow key={p.id}>
                  <TableCell className="text-center text-xs text-muted-foreground">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-semibold text-xs text-primary">
                    {p.code}
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    {p.name}
                  </TableCell>
                  <TableCell className="text-center text-xs">
                    {p.unit}
                  </TableCell>
                  <TableCell className="text-right text-xs font-semibold">
                    {new Intl.NumberFormat("vi-VN").format(p.defaultPrice || 0)}{" "}
                    ₫
                  </TableCell>
                  <TableCell className="text-center">
                    {p.isActive !== false ? (
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]"
                      >
                        Đang dùng
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-muted text-muted-foreground text-[10px]"
                      >
                        Ngừng dùng
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => onEditProduct(p)}
                      title="Chỉnh sửa"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
