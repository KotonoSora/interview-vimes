import { Building2 } from "lucide-react";

import type { ReceiptType } from "~/constants/receipt.constants";
import type { MasterOrganization } from "~/services/master-data.service";
import type { GoodsReceiptFormData } from "~/types/goods-receipt.types";

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
import { RECEIPT_TYPE_LABELS } from "~/constants/receipt.constants";

export interface OrganizationOption {
  id: string;
  code?: string;
  name: string;
  department?: string;
}

export interface ReceiptHeaderSectionProps {
  organizations: OrganizationOption[] | MasterOrganization[];
  organizationId: string;
  setOrganizationId: (val: string) => void;
  receiptNumber: string;
  setReceiptNumber: (val: string) => void;
  receiptDate: string;
  setReceiptDate: (val: string) => void;
  receiptType: GoodsReceiptFormData["receiptType"];
  setReceiptType: (val: GoodsReceiptFormData["receiptType"]) => void;
  debitAccount: string;
  setDebitAccount: (val: string) => void;
  creditAccount: string;
  setCreditAccount: (val: string) => void;
}

export function ReceiptHeaderSection({
  organizations = [],
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
}: ReceiptHeaderSectionProps) {
  const selectedOrg = organizations.find((o) => o.id === organizationId);

  return (
    <Card>
      <CardHeader className="py-3 px-6 border-b">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          1. Thông Tin Đơn Vị & Định Khoản Chứng Từ
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-xs font-semibold">
              Đơn vị / Phòng ban lập phiếu{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Select
              value={organizationId}
              onValueChange={(val) => {
                if (val) setOrganizationId(val);
              }}
            >
              <SelectTrigger className="text-xs h-9">
                <SelectValue placeholder="Chọn đơn vị phát sinh nghiệp vụ" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id} className="text-xs">
                    {org.name} {org.department ? `(${org.department})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedOrg?.department && (
              <p className="text-[11px] text-muted-foreground mt-1">
                Bộ phận chủ quản: {selectedOrg.department}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Phân loại nghiệp vụ nhập{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Select
              value={receiptType}
              onValueChange={(v) => {
                if (v) setReceiptType(v as GoodsReceiptFormData["receiptType"]);
              }}
            >
              <SelectTrigger className="text-xs h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(RECEIPT_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="text-xs">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Số phiếu <span className="text-destructive">*</span>
            </Label>
            <Input
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
              className="font-mono font-semibold text-xs h-9 text-primary"
              placeholder="VD: PNK-2026-0001"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Ngày lập phiếu <span className="text-destructive">*</span>
            </Label>
            <Input
              type="date"
              value={receiptDate}
              onChange={(e) => setReceiptDate(e.target.value)}
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Tài khoản Nợ tổng hợp
            </Label>
            <Input
              value={debitAccount}
              onChange={(e) => setDebitAccount(e.target.value)}
              className="font-mono text-xs h-9"
              placeholder="152, 155, 156..."
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Tài khoản Có tổng hợp
            </Label>
            <Input
              value={creditAccount}
              onChange={(e) => setCreditAccount(e.target.value)}
              className="font-mono text-xs h-9"
              placeholder="331, 111, 154..."
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
