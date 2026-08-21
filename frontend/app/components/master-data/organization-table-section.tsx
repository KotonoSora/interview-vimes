import { Building, Edit, Plus } from "lucide-react";

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

export interface OrganizationItem {
  id: string;
  name: string;
  department: string;
  taxCode?: string;
  address?: string;
}

interface OrganizationTableSectionProps {
  organizations: OrganizationItem[];
  onOpenCreateModal: () => void;
  onEditOrganization: (org: OrganizationItem) => void;
}

export function OrganizationTableSection({
  organizations,
  onOpenCreateModal,
  onEditOrganization,
}: OrganizationTableSectionProps) {
  return (
    <Card>
      <CardHeader className="py-4 px-6 border-b flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-semibold">
            Danh Mục Đơn Vị / Phòng Ban
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản lý danh sách chi nhánh và bộ phận phát sinh chứng từ kế toán
          </p>
        </div>
        <Button size="sm" onClick={onOpenCreateModal}>
          <Plus className="h-4 w-4 mr-1.5" /> Thêm Đơn Vị
        </Button>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-[60px] text-center">STT</TableHead>
              <TableHead>Tên đơn vị / Pháp nhân</TableHead>
              <TableHead className="w-[200px]">Bộ phận / Phòng ban</TableHead>
              <TableHead className="w-[140px]">Mã số thuế</TableHead>
              <TableHead>Địa chỉ</TableHead>
              <TableHead className="w-[80px] text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizations.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground text-xs"
                >
                  Chưa có đơn vị nào được tạo.
                </TableCell>
              </TableRow>
            ) : (
              organizations.map((org, idx) => (
                <TableRow key={org.id}>
                  <TableCell className="text-center text-xs text-muted-foreground">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-foreground flex items-center gap-2">
                    <Building className="h-3.5 w-3.5 text-muted-foreground" />
                    {org.name}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-primary">
                    {org.department}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {org.taxCode || "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {org.address || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => onEditOrganization(org)}
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
