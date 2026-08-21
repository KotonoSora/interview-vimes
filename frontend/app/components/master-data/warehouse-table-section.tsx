import type { MasterWarehouse } from "~/services/master-data.service";

import { Badge } from "~/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export interface WarehouseTableSectionProps {
  warehouses: MasterWarehouse[];
}

export function WarehouseTableSection({
  warehouses = [],
}: WarehouseTableSectionProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/40">
          <TableHead className="w-[140px] font-semibold">Mã kho</TableHead>
          <TableHead className="w-[220px] font-semibold">
            Tên kho tiếp nhận
          </TableHead>
          <TableHead className="font-semibold">
            Địa chỉ / Vị trí lưu kho
          </TableHead>
          <TableHead className="w-[130px] text-center font-semibold">
            Trạng thái
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {warehouses.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={4}
              className="h-32 text-center text-xs text-muted-foreground"
            >
              Chưa có dữ liệu kho bãi tiếp nhận.
            </TableCell>
          </TableRow>
        ) : (
          warehouses.map((wh) => (
            <TableRow key={wh.id} className="hover:bg-muted/30">
              <TableCell className="font-mono font-semibold text-xs text-primary">
                {wh.code}
              </TableCell>
              <TableCell className="text-xs font-semibold">{wh.name}</TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {wh.location || "Địa chỉ mặc định theo đơn vị chủ quản"}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="secondary" className="text-[10px]">
                  Sẵn sàng
                </Badge>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
