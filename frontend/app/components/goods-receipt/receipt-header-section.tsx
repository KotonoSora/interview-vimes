import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface OrganizationOption {
  id: string;
  name: string;
  department: string;
}

interface ReceiptHeaderSectionProps {
  organizations: OrganizationOption[];
  organizationId: string;
  setOrganizationId: (val: string) => void;
  receiptNumber: string;
  setReceiptNumber: (val: string) => void;
  receiptDate: string;
  setReceiptDate: (val: string) => void;
  receiptType: string;
  setReceiptType: (val: string) => void;
  debitAccount: string;
  setDebitAccount: (val: string) => void;
  creditAccount: string;
  setCreditAccount: (val: string) => void;
  isReadOnly?: boolean;
}

export function ReceiptHeaderSection({
  organizations,
  organizationId,
  setOrganizationId,
  receiptNumber,
  setReceiptNumber,
  receiptDate,
  setReceiptDate,
  receiptType,
  setReceiptType,
  debitAccount,
  setDebitAccount,
  creditAccount,
  setCreditAccount,
  isReadOnly = false,
}: ReceiptHeaderSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            1. Thông Tin Doanh Nghiệp & Định Khoản (Mục [1], [2] TT 200)
          </CardTitle>
          <Badge
            variant="outline"
            className="bg-primary/5 text-primary border-primary/20"
          >
            Mẫu 01 - VT
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Đơn vị / Phòng ban *</Label>
          <Select
            value={organizationId}
            onValueChange={(val) => setOrganizationId(val || "")}
            disabled={isReadOnly}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn đơn vị" />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name} ({org.department})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Số phiếu nhập kho *</Label>
          <Input
            value={receiptNumber}
            onChange={(e) => setReceiptNumber(e.target.value)}
            disabled={isReadOnly}
            required
            className="font-medium"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Ngày lập phiếu *</Label>
          <Input
            type="date"
            value={receiptDate}
            onChange={(e) => setReceiptDate(e.target.value)}
            disabled={isReadOnly}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Loại nghiệp vụ nhập kho *</Label>
          <Select
            value={receiptType}
            onValueChange={(val) => setReceiptType(val || "PURCHASE")}
            disabled={isReadOnly}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PURCHASE">Mua ngoài (Lập 2 liên)</SelectItem>
              <SelectItem value="INTERNAL_PRODUCTION">
                Tự sản xuất (Lập 3 liên)
              </SelectItem>
              <SelectItem value="OUTSOURCED_PROCESSING">
                Thuê ngoài gia công chế biến
              </SelectItem>
              <SelectItem value="CAPITAL_CONTRIBUTION">Nhận góp vốn</SelectItem>
              <SelectItem value="INVENTORY_SURPLUS">
                Thừa phát hiện trong kiểm kê
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Tài khoản Nợ tổng hợp</Label>
          <Input
            value={debitAccount}
            onChange={(e) => setDebitAccount(e.target.value)}
            disabled={isReadOnly}
            placeholder="152, 153, 156..."
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Tài khoản Có tổng hợp</Label>
          <Input
            value={creditAccount}
            onChange={(e) => setCreditAccount(e.target.value)}
            disabled={isReadOnly}
            placeholder="331, 111, 112..."
          />
        </div>
      </CardContent>
    </Card>
  );
}
