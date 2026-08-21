import type { MasterOrganization } from "~/services/master-data.service";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export function OrganizationTableSection({
  organizations = [],
}: {
  organizations: MasterOrganization[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/40 text-xs">
          <TableHead className="w-32">Mã</TableHead>
          <TableHead className="w-64">Tên đơn vị</TableHead>
          <TableHead>Bộ phận</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {organizations.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={3}
              className="h-24 text-center text-xs text-muted-foreground"
            >
              Không có dữ liệu.
            </TableCell>
          </TableRow>
        ) : (
          organizations.map((o) => (
            <TableRow key={o.id} className="text-xs">
              <TableCell className="font-mono font-semibold text-primary">
                {o.code || o.id.slice(0, 8)}
              </TableCell>
              <TableCell className="font-medium">{o.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {o.department || "—"}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
