import { ArrowLeft, Edit, Loader2, Printer, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { Link, useFetcher, useLoaderData, useNavigate } from "react-router";

import type { Route } from "./+types/_app.goods-receipts.$id";

import { ReceiptPrintableA4 } from "~/components/goods-receipt/receipt-printable-a4";
import { Button } from "~/components/ui/button";
import { toast } from "~/components/ui/toast";
import {
  requestIdContext,
  traceAndAuthMiddleware,
} from "~/middleware/auth-trace.server";
import { receiptService } from "~/services/receipt.service";

export function meta({ matches }: Route.MetaArgs) {
  const match = matches?.find(
    (m) => m?.id === "routes/_app.goods-receipts.$id",
  );
  const data = (
    match && "loaderData" in match ? match.loaderData : undefined
  ) as { receipt?: { receiptNumber?: string } } | undefined;
  const number = data?.receipt?.receiptNumber || "Chi Tiết";
  return [
    { title: `${number} - Chi Tiết Phiếu Nhập | VIMES Inventory` },
    {
      name: "description",
      content: "Chi tiết chứng từ, ký duyệt 4 bên và in ấn khổ A4.",
    },
  ];
}

export const middleware = [traceAndAuthMiddleware];

export async function loader({ params, context }: Route.LoaderArgs) {
  const requestId = context.get(requestIdContext) || crypto.randomUUID();
  const id = params.id;
  if (!id) throw new Response("Mã không hợp lệ", { status: 400 });
  const res = await receiptService.getReceiptById(id, requestId);
  if (!res.data) throw new Response("Chứng từ không tồn tại", { status: 404 });
  return { receipt: res.data };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const requestId = context.get(requestIdContext) || crypto.randomUUID();
  const id = params.id;
  if (!id) throw new Response("Mã không hợp lệ", { status: 400 });
  if (request.method === "DELETE") {
    const res = await receiptService.deleteOrCancelReceipt(id, requestId);
    return { success: true, message: res.message || "Xử lý thành công" };
  }
  return { success: false, message: "Phương thức không hỗ trợ" };
}

export default function GoodsReceiptDetailRoute() {
  const { receipt } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!fetcher.data) return;
    if (fetcher.data.success) {
      toast.add({
        type: "success",
        title: "Thành công",
        description: fetcher.data.message,
      });
      navigate("/goods-receipts");
    } else {
      toast.add({
        type: "error",
        title: "Lỗi",
        description: fetcher.data.message,
      });
    }
  }, [fetcher.data, navigate]);

  const handleDeleteOrCancel = () => {
    const msg =
      receipt.status === "DRAFT"
        ? "Bạn có chắc chắn muốn XÓA bản nháp này?"
        : "CẢNH BÁO: Phiếu nhập sẽ bị HỦY và trừ hoàn ngược số dư tồn kho (Stock Reversal). Tiếp tục?";
    if (window.confirm(msg)) {
      fetcher.submit(null, { method: "DELETE" });
    }
  };

  const isDeleting = fetcher.state === "submitting";

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-12 px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print pb-2 border-b">
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
            <h1 className="text-lg font-bold">
              Phiếu:{" "}
              <span className="text-primary font-mono">
                {receipt.receiptNumber}
              </span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Mẫu số 01 - VT theo TT 200/2014/TT-BTC
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {receipt.status !== "CANCELLED" && (
            <>
              <Link
                to={`/goods-receipts/${receipt.id}/edit`}
                className="inline-flex items-center border px-3 py-1 rounded text-xs h-8 hover:bg-muted font-medium"
              >
                <Edit className="h-3.5 w-3.5 mr-1" /> Sửa
              </Link>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteOrCancel}
                disabled={isDeleting}
                className="h-8 text-xs"
              >
                {isDeleting ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                )}
                {receipt.status === "DRAFT" ? "Xóa Nháp" : "Hủy Phiếu"}
              </Button>
            </>
          )}
          <Button
            size="sm"
            onClick={() => window.print()}
            className="h-8 text-xs"
          >
            <Printer className="h-3.5 w-3.5 mr-1" /> In A4
          </Button>
        </div>
      </div>
      <div className="printable-document overflow-x-auto shadow-sm rounded-lg">
        <ReceiptPrintableA4 receipt={receipt} />
      </div>
    </div>
  );
}
