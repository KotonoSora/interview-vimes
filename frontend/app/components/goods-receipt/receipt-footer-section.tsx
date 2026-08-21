import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

interface ReceiptFooterSectionProps {
  attachedDocCount: string;
  setAttachedDocCount: (val: string) => void;
  creatorName: string;
  setCreatorName: (val: string) => void;
  storekeeperName: string;
  setStorekeeperName: (val: string) => void;
  chiefAccountantName: string;
  setChiefAccountantName: (val: string) => void;
  isReadOnly?: boolean;
}

export function ReceiptFooterSection({
  attachedDocCount,
  setAttachedDocCount,
  creatorName,
  setCreatorName,
  storekeeperName,
  setStorekeeperName,
  chiefAccountantName,
  setChiefAccountantName,
  isReadOnly = false,
}: ReceiptFooterSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          4. Trách Nhiệm Ký Duyệt & Bàn Giao (Quy định TT 200)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Số chứng từ gốc kèm theo</Label>
          <Input
            value={attachedDocCount}
            onChange={(e) => setAttachedDocCount(e.target.value)}
            disabled={isReadOnly}
            placeholder="VD: 1 hóa đơn GTGT gốc, 1 biên bản giao nhận"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Người lập biểu</Label>
            <Input
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              disabled={isReadOnly}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Thủ kho</Label>
            <Input
              value={storekeeperName}
              onChange={(e) => setStorekeeperName(e.target.value)}
              disabled={isReadOnly}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Kế toán trưởng</Label>
            <Input
              value={chiefAccountantName}
              onChange={(e) => setChiefAccountantName(e.target.value)}
              disabled={isReadOnly}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
