import { AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { data, useFetcher, useLoaderData, useNavigate } from "react-router";
import { z } from "zod";

import type { Route } from "./+types/_app.goods-receipts.new";

import type { GoodsReceiptFormData } from "~/components/goods-receipt/goods-receipt-form";

import { GoodsReceiptForm } from "~/components/goods-receipt/goods-receipt-form";
import { toast } from "~/components/ui/toast";
import { PAGE_ROUTES } from "~/constants/navigation.constants";
import { generateReceiptNumber } from "~/lib/formatters";
import {
  requestIdContext,
  traceAndAuthMiddleware,
} from "~/middleware/auth-trace.server";
import { masterDataService } from "~/services/master-data.service";
import { receiptService } from "~/services/receipt.service";
import { CreateGoodsReceiptSchema } from "~/types/goods-receipt.types";

export function meta() {
  return [
    { title: PAGE_ROUTES.GOODS_RECEIPT_NEW.metaTitle },
    { name: "description", content: PAGE_ROUTES.GOODS_RECEIPT_NEW.description },
  ];
}

export const middleware = [traceAndAuthMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
  const requestId = context.get(requestIdContext) || crypto.randomUUID();
  const [orgsRes, warehousesRes, productsRes] = await Promise.all([
    masterDataService.getOrganizations(requestId),
    masterDataService.getWarehouses(requestId),
    masterDataService.getProducts(undefined, requestId),
  ]);

  return {
    organizations: orgsRes.data || [],
    warehouses: warehousesRes.data || [],
    products: productsRes.data || [],
    defaultReceiptNumber: generateReceiptNumber(),
  };
}

export async function action({ request, context }: Route.ActionArgs) {
  const requestId = context.get(requestIdContext) || crypto.randomUUID();
  try {
    const rawData = await request.json();
    const parsedData = CreateGoodsReceiptSchema.parse(rawData);
    const response = await receiptService.createReceipt(parsedData, requestId);
    return data({
      success: true,
      message: "Lập phiếu nhập kho thành công",
      receiptId: response.data?.receiptId,
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const issueMsgs = error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
      return data(
        { success: false, message: `Lỗi xác thực: ${issueMsgs}` },
        { status: 400 },
      );
    }
    const message =
      error instanceof Error ? error.message : "Không thể tạo phiếu nhập kho";
    return data({ success: false, message }, { status: 400 });
  }
}

export default function NewGoodsReceiptRoute() {
  const { organizations, warehouses, products, defaultReceiptNumber } =
    useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!fetcher.data) return;
    if (fetcher.data.success) {
      toast.add({
        type: "success",
        title: "Thành công",
        description: "Chứng từ đã được ghi nhận vào hệ thống.",
      });
      navigate("/goods-receipts");
    } else {
      toast.add({
        type: "error",
        title: "Lỗi",
        description: fetcher.data.message || "Vui lòng kiểm tra lại thông tin.",
      });
    }
  }, [fetcher.data, navigate]);

  const handleSubmit = (
    formData: GoodsReceiptFormData,
    status: "DRAFT" | "CONFIRMED",
  ) => {
    fetcher.submit({ ...formData, status } as any, {
      method: "POST",
      encType: "application/json",
    });
  };

  return (
    <div className="space-y-4">
      {fetcher.data && !fetcher.data.success && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3 text-sm text-destructive max-w-[1400px] mx-auto">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Lưu chứng từ thất bại</p>
            <p>{fetcher.data.message}</p>
          </div>
        </div>
      )}

      <GoodsReceiptForm
        defaultReceiptNumber={defaultReceiptNumber}
        organizations={organizations}
        warehouses={warehouses}
        products={products}
        isSubmitting={
          fetcher.state === "submitting" || fetcher.state === "loading"
        }
        onSubmit={handleSubmit}
      />
    </div>
  );
}
