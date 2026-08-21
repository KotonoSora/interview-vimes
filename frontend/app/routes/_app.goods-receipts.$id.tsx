import { ArrowLeft, Edit, Printer } from "lucide-react";
import { Link, useLoaderData, useNavigate } from "react-router";

import type { Route } from "./+types/_app.goods-receipts.$id";

import { ReceiptPrintableA4 } from "~/components/goods-receipt/receipt-printable-a4";
import { Button } from "~/components/ui/button";
import {
  requestIdContext,
  traceAndAuthMiddleware,
} from "~/middleware/auth-trace.server";
import { receiptService } from "~/services/receipt.service";

export const middleware = [traceAndAuthMiddleware];

export async function loader({ params, context }: Route.LoaderArgs) {
  const requestId = context.get(requestIdContext) || crypto.randomUUID();
  const id = params.id;

  if (!id) {
    throw new Response("Không tìm thấy mã chứng từ", { status: 400 });
  }

  const res = await receiptService.getReceiptById(id, requestId);

  if (!res.data) {
    throw new Response("Chứng từ không tồn tại trên hệ thống", { status: 404 });
  }

  return { receipt: res.data };
}

export default function GoodsReceiptDetailRoute() {
  const { receipt } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Thanh công cụ điều hướng và thao tác (tự ẩn khi in qua CSS print) */}
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
              Mẫu số 01 - VT ban hành theo TT 200/2014/TT-BTC
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/goods-receipts/${receipt.id}/edit`}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Edit className="h-4 w-4 mr-1.5" /> Chỉnh sửa
          </Link>
          <Button size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1.5" /> In Phiếu A4
          </Button>
        </div>
      </div>

      {/* Chứng từ khổ A4 hiển thị theo đúng quy định kế toán */}
      <div className="printable-document">
        <ReceiptPrintableA4 receipt={receipt} />
      </div>
    </div>
  );
}
