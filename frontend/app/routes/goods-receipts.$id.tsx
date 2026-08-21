import { ArrowLeft, Edit, Printer } from "lucide-react";
import { useLoaderData, useNavigate } from "react-router";

import { ReceiptPrintableA4 } from "~/components/goods-receipt/receipt-printable-a4";
import { Button } from "~/components/ui/button";
import { withLoaderContext } from "~/lib/route-middleware.server";
import { receiptService } from "~/services/receipt.service";

export const loader = withLoaderContext(async (_req, { requestId, url }) => {
  const id = url.pathname.split("/").pop() || "";
  const res = await receiptService.getReceiptById(id, requestId);
  return { receipt: res.data };
});

export default function GoodsReceiptDetailRoute() {
  const { receipt } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  if (!receipt) {
    return (
      <div className="p-6 text-center text-xs">Không tìm thấy chứng từ.</div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/goods-receipts")}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Phiếu Nhập Kho: {receipt.receiptNumber}
            </h1>
            <p className="text-xs text-muted-foreground">
              Trạng thái: {receipt.status}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/goods-receipts/${receipt.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-1.5" /> Chỉnh sửa
          </Button>
          <Button size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1.5" /> In Phiếu A4
          </Button>
        </div>
      </div>

      <div className="printable-document">
        <ReceiptPrintableA4 receipt={receipt as any} />
      </div>
    </div>
  );
}
