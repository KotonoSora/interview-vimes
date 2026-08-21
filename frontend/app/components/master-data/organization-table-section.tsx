import type { MasterOrganization } from "~/services/master-data.service";

import { Badge } from "~/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export interface OrganizationTableSectionProps {
  organizations: MasterOrganization[];
}

export function OrganizationTableSection({
  organizations = [],
}: OrganizationTableSectionProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/40">
          <TableHead className="w-[140px] font-semibold">
            Mã định danh
          </TableHead>
          <TableHead className="font-semibold">
            Tên đơn vị / Chi nhánh
          </TableHead>
          <TableHead className="font-semibold">Phòng ban / Bộ phận</TableHead>
          <TableHead className="w-[130px] text-center font-semibold">
            Trạng thái
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {organizations.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={4}
              className="h-32 text-center text-xs text-muted-foreground"
            >
              Chưa có dữ liệu đơn vị / phòng ban nào.
            </TableCell>
          </TableRow>
        ) : (
          organizations.map((org) => (
            <TableRow key={org.id} className="hover:bg-muted/30">
              <TableCell className="font-mono font-semibold text-xs text-primary">
                {org.code || org.id.slice(0, 8)}
              </TableCell>
              <TableCell className="text-xs font-semibold">
                {org.name}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {org.department || "Phòng Kế toán - Vật tư"}
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
  );
}
