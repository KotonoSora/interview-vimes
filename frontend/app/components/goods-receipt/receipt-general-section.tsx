import { Truck } from "lucide-react";

import type { MasterWarehouse } from "~/services/master-data.service";

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
import { Textarea } from "~/components/ui/textarea";

export interface WarehouseOption {
  id: string;
  code?: string;
  name: string;
  location?: string;
}

export interface ReceiptGeneralSectionProps {
  warehouses: WarehouseOption[] | MasterWarehouse[];
  warehouseId: string;
  setWarehouseId: (val: string) => void;
  delivererName: string;
  setDelivererName: (val: string) => void;
  actualReceivedDate: string;
  setActualReceivedDate: (val: string) => void;
  docReference: string;
  setDocReference: (val: string) => void;
  docDate: string;
  setDocDate: (val: string) => void;
  docOrigin: string;
  setDocOrigin: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
}

export function ReceiptGeneralSection({
  warehouses = [],
  warehouseId,
  setWarehouseId,
  delivererName,
  setDelivererName,
  actualReceivedDate,
  setActualReceivedDate,
  docReference,
  setDocReference,
  docDate,
  setDocDate,
  docOrigin,
  setDocOrigin,
  description,
  setDescription,
}: ReceiptGeneralSectionProps) {
  const selectedWh = warehouses.find((w) => w.id === warehouseId);

  return (
    <Card>
      <CardHeader className="py-3 px-6 border-b">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Truck className="h-4 w-4 text-primary" />
          2. Thông Tin Giao Nhận & Chứng Từ Gốc Kèm Theo
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-xs font-semibold">
              Kho tiếp nhận vật tư <span className="text-destructive">*</span>
            </Label>
            <Select
              value={warehouseId}
              onValueChange={(val) => {
                if (val) setWarehouseId(val);
              }}
            >
              <SelectTrigger className="text-xs h-9">
                <SelectValue placeholder="Chọn kho hàng tiếp nhận" />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((wh) => (
                  <SelectItem key={wh.id} value={wh.id} className="text-xs">
                    {wh.name} {wh.location ? `- ${wh.location}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedWh?.location && (
              <p className="text-[11px] text-muted-foreground mt-1">
                Địa điểm lưu kho: {selectedWh.location}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Ngày thực nhập ghi thẻ kho
            </Label>
            <Input
              type="date"
              value={actualReceivedDate}
              onChange={(e) => setActualReceivedDate(e.target.value)}
              className="text-xs h-9"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Họ tên người giao hàng <span className="text-destructive">*</span>
            </Label>
            <Input
              value={delivererName}
              onChange={(e) => setDelivererName(e.target.value)}
              placeholder="VD: Nguyễn Văn A (Lái xe / Đại diện NCC)"
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Theo chứng từ số (Hóa đơn / Lệnh)
            </Label>
            <Input
              value={docReference}
              onChange={(e) => setDocReference(e.target.value)}
              placeholder="VD: HĐ-GTGT-99882"
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Ngày phát hành chứng từ gốc
            </Label>
            <Input
              type="date"
              value={docDate}
              onChange={(e) => setDocDate(e.target.value)}
              className="text-xs h-9"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Đơn vị / Đơn vị giao hàng
            </Label>
            <Input
              value={docOrigin}
              onChange={(e) => setDocOrigin(e.target.value)}
              placeholder="VD: Công ty Thép Việt Nhật"
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-xs font-semibold">
              Diễn giải / Lý do nhập kho
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Nhập kho vật tư phục vụ công trình dự án Tòa nhà VIMES..."
              rows={2}
              className="text-xs resize-none min-h-[38px]"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
