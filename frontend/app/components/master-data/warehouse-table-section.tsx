import type { MasterWarehouse } from "~/services/master-data.service";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export function WarehouseTableSection({
  warehouses = [],
}: {
  warehouses: MasterWarehouse[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/40 text-xs">
          <TableHead className="w-32">Mã kho</TableHead>
          <TableHead className="w-48">Tên kho</TableHead>
          <TableHead>Địa điểm / Vị trí</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {warehouses.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={3}
              className="h-24 text-center text-xs text-muted-foreground"
            >
              Không có dữ liệu.
            </TableCell>
          </TableRow>
        ) : (
          warehouses.map((w) => (
            <TableRow key={w.id} className="text-xs">
              <TableCell className="font-mono font-semibold text-primary">
                {w.code}
              </TableCell>
              <TableCell className="font-medium">{w.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {w.location || "—"}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
