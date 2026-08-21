import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useSubmit } from "react-router";

import type { ColumnDef } from "~/components/data-table/data-table";
import type { MasterProduct } from "~/services/master-data.service";

import { DataTable } from "~/components/data-table/data-table";
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header";
import { Input } from "~/components/ui/input";
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

  const columns: ColumnDef<MasterProduct>[] = useMemo(
    () => [
      {
        accessorKey: "code",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Mã số" />
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
          <DataTableColumnHeader
            column={column}
            title="Tên vật tư / Quy cách"
          />
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "unit",
        header: () => <div className="text-center">ĐVT</div>,
        cell: ({ row }) => (
          <div className="text-center text-muted-foreground">
            {row.original.unit}
          </div>
        ),
      },
      {
        accessorKey: "defaultPrice",
        header: ({ column }) => (
          <div className="text-right">
            <DataTableColumnHeader
              column={column}
              title="Đơn giá chuẩn"
              className="justify-end"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-right font-mono font-medium">
            {formatCurrencyVND(row.original.defaultPrice)}
          </div>
        ),
      },
    ],
    [],
  );

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
              className="pl-8 text-xs h-8 bg-background"
            />
          </div>
        </form>
      </div>
      <DataTable columns={columns} data={products} pageSize={15} />
    </div>
  );
}
