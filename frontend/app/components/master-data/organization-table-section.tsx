import { useMemo } from "react";

import type { ColumnDef } from "~/components/data-table/data-table";
import type { MasterOrganization } from "~/services/master-data.service";

import { DataTable } from "~/components/data-table/data-table";
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header";

export function OrganizationTableSection({
  organizations = [],
}: {
  organizations: MasterOrganization[];
}) {
  const columns: ColumnDef<MasterOrganization>[] = useMemo(
    () => [
      {
        accessorKey: "code",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Mã đơn vị" />
        ),
        cell: ({ row }) => (
          <span className="font-mono font-semibold text-primary">
            {row.original.code || row.original.id.slice(0, 8)}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="Tên pháp nhân / Đơn vị"
          />
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "department",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Bộ phận trực thuộc" />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.department || "—"}
          </span>
        ),
      },
    ],
    [],
  );

  return <DataTable columns={columns} data={organizations} pageSize={15} />;
}
