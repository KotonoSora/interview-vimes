import { useMemo } from "react";

import type { ColumnDef } from "~/components/data-table/data-table";
import type { MasterWarehouse } from "~/services/master-data.service";

import { DataTable } from "~/components/data-table/data-table";
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header";

export function WarehouseTableSection({
  warehouses = [],
}: {
  warehouses: MasterWarehouse[];
}) {
  const columns: ColumnDef<MasterWarehouse>[] = useMemo(
    () => [
      {
        accessorKey: "code",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Mã kho" />
        ),
        cell: ({ row }) => (
          <span className="font-mono font-semibold text-primary">
            {row.original.code}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Tên kho tiếp nhận" />
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "location",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Địa điểm / Vị trí" />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.location || "—"}
          </span>
        ),
      },
    ],
    [],
  );

  return <DataTable columns={columns} data={warehouses} pageSize={15} />;
}
