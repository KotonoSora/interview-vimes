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

interface WarehouseOption {
  id: string;
  name: string;
  location: string;
}

interface ReceiptGeneralSectionProps {
  warehouses: WarehouseOption[];
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
  isReadOnly?: boolean;
}

export function ReceiptGeneralSection({
  warehouses,
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
  isReadOnly = false,
}: ReceiptGeneralSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          2. Thông Tin Giao Nhận & Chứng Từ Kèm Theo (Mục [3], [4], [5] TT 200)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Họ và tên người giao hàng *</Label>
          <Input
            value={delivererName}
            onChange={(e) => setDelivererName(e.target.value)}
            disabled={isReadOnly}
            placeholder="Họ tên người giao"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Kho tiếp nhận *</Label>
          <Select
            value={warehouseId}
            onValueChange={(val) => setWarehouseId(val || "")}
            disabled={isReadOnly}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn kho tiếp nhận" />
            </SelectTrigger>
            <SelectContent>
              {warehouses.map((wh) => (
                <SelectItem key={wh.id} value={wh.id}>
                  {wh.name} ({wh.location})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">
            Ngày thực nhận vào kho (Thủ kho ghi)
          </Label>
          <Input
            type="date"
            value={actualReceivedDate}
            onChange={(e) => setActualReceivedDate(e.target.value)}
            disabled={isReadOnly}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Số hóa đơn / Lệnh nhập kho số</Label>
          <Input
            value={docReference}
            onChange={(e) => setDocReference(e.target.value)}
            disabled={isReadOnly}
            placeholder="VD: HĐ-99882 hoặc LNK-01"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Ngày hóa đơn / chứng từ gốc</Label>
          <Input
            type="date"
            value={docDate}
            onChange={(e) => setDocDate(e.target.value)}
            disabled={isReadOnly}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Đơn vị xuất hóa đơn / Nhà cung cấp</Label>
          <Input
            value={docOrigin}
            onChange={(e) => setDocOrigin(e.target.value)}
            disabled={isReadOnly}
            placeholder="Tên doanh nghiệp giao hàng"
          />
        </div>

        <div className="col-span-1 md:col-span-3 space-y-1.5">
          <Label className="text-xs">
            Tóm tắt nội dung nghiệp vụ kinh tế (Điều 24 Luật Kế toán)
          </Label>
          <Textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isReadOnly}
            placeholder="Nhập kho theo hợp đồng số... hoặc lý do kiểm kê phát hiện thừa..."
          />
        </div>
      </CardContent>
    </Card>
  );
}
