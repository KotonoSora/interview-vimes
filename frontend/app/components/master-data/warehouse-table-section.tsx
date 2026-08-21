import { Edit, Plus, Warehouse as WarehouseIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export interface WarehouseItem {
  id: string;
  code: string;
  name: string;
  location: string;
  keeperName?: string;
}

interface WarehouseTableSectionProps {
  warehouses: WarehouseItem[];
  onOpenCreateModal: () => void;
  onEditWarehouse: (wh: WarehouseItem) => void;
}

export function WarehouseTableSection({
  warehouses,
  onOpenCreateModal,
  onEditWarehouse,
}: WarehouseTableSectionProps) {
  return (
    <Card>
      <CardHeader className="py-4 px-6 border-b flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-semibold">
            Danh Mục Kho Bãi
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản lý các địa điểm lưu kho và chỉ định thủ kho chịu trách nhiệm
          </p>
        </div>
        <Button size="sm" onClick={onOpenCreateModal}>
          <Plus className="h-4 w-4 mr-1.5" /> Thêm Kho Mới
        </Button>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-[60px] text-center">STT</TableHead>
              <TableHead className="w-[120px]">Mã kho</TableHead>
              <TableHead>Tên kho lưu trữ</TableHead>
              <TableHead>Địa điểm / Địa chỉ vật lý</TableHead>
              <TableHead className="w-[180px]">Thủ kho phụ trách</TableHead>
              <TableHead className="w-[80px] text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {warehouses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground text-xs"
                >
                  Chưa có kho nào được khởi tạo.
                </TableCell>
              </TableRow>
            ) : (
              warehouses.map((wh, idx) => (
                <TableRow key={wh.id}>
                  <TableCell className="text-center text-xs text-muted-foreground">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-semibold text-xs text-primary">
                    {wh.code}
                  </TableCell>
                  <TableCell className="text-xs font-medium flex items-center gap-2">
                    <WarehouseIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    {wh.name}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {wh.location}
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    {wh.keeperName || "Trần Văn Kho"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => onEditWarehouse(wh)}
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
