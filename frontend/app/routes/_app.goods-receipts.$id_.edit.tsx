import { AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { data, useFetcher, useLoaderData, useNavigate } from "react-router";
import { z } from "zod";

import type { Route } from "./+types/_app.goods-receipts.$id_.edit";

import type { GoodsReceiptFormData } from "~/components/goods-receipt/goods-receipt-form";

import { GoodsReceiptForm } from "~/components/goods-receipt/goods-receipt-form";
import { toast } from "~/components/ui/toast";
import { PAGE_ROUTES } from "~/constants/navigation.constants";
import {
  requestIdContext,
  traceAndAuthMiddleware,
} from "~/middleware/auth-trace.server";
import { masterDataService } from "~/services/master-data.service";
import { receiptService } from "~/services/receipt.service";
import { UpdateGoodsReceiptSchema } from "~/types/goods-receipt.types";

export function meta({ matches }: Route.MetaArgs) {
  const match = matches?.find(
    (m) => m?.id === "routes/_app.goods-receipts.$id_.edit",
  );
  const d = (match && "loaderData" in match ? match.loaderData : undefined) as
    { receipt?: { receiptNumber?: string } } | undefined;
  const number = d?.receipt?.receiptNumber || "Chứng Từ";
  return [
    { title: `Chỉnh Sửa ${number} | VIMES Inventory` },
    {
      name: "description",
      content: PAGE_ROUTES.GOODS_RECEIPT_EDIT.description,
    },
  ];
}

export const middleware = [traceAndAuthMiddleware];

export async function loader({ params, context }: Route.LoaderArgs) {
  const requestId = context.get(requestIdContext) || crypto.randomUUID();
  const id = params.id;
  if (!id) throw new Response("Mã chứng từ không hợp lệ", { status: 400 });

  const [receiptRes, orgsRes, warehousesRes, productsRes] = await Promise.all([
    receiptService.getReceiptById(id, requestId),
    masterDataService.getOrganizations(requestId),
    masterDataService.getWarehouses(requestId),
    masterDataService.getProducts(undefined, requestId),
  ]);

  if (!receiptRes.data)
    throw new Response("Chứng từ không tồn tại", { status: 404 });
  if (receiptRes.data.status === "CANCELLED")
    throw new Response("Không thể chỉnh sửa phiếu đã hủy", { status: 422 });

  return {
    receipt: receiptRes.data,
    organizations: orgsRes.data || [],
    warehouses: warehousesRes.data || [],
    products: productsRes.data || [],
  };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const requestId = context.get(requestIdContext) || crypto.randomUUID();
  const id = params.id;
  if (!id)
    return data(
      { success: false, message: "Mã chứng từ không hợp lệ" },
      { status: 400 },
    );

  try {
    const rawData = await request.json();
    const parsedData = UpdateGoodsReceiptSchema.parse(rawData);
    await receiptService.updateReceipt(id, parsedData, requestId);
    return data({ success: true, message: "Cập nhật chứng từ thành công" });
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
      error instanceof Error ? error.message : "Không thể cập nhật chứng từ";
    return data({ success: false, message }, { status: 400 });
  }
}

export default function EditGoodsReceiptRoute() {
  const { receipt, organizations, warehouses, products } =
    useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!fetcher.data) return;
    if (fetcher.data.success) {
      toast.add({
        type: "success",
        title: "Thành công",
        description: "Chứng từ đã được cập nhật.",
      });
      navigate(`/goods-receipts/${receipt.id}`);
    } else {
      toast.add({
        type: "error",
        title: "Lỗi lưu dữ liệu",
        description: fetcher.data.message || "Vui lòng kiểm tra lại.",
      });
    }
  }, [fetcher.data, navigate, receipt.id]);

  const handleSubmit = (formData: GoodsReceiptFormData) => {
    fetcher.submit(formData as any, {
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
            <p className="font-bold">Lưu thay đổi thất bại</p>
            <p>{fetcher.data.message}</p>
          </div>
        </div>
      )}

      <GoodsReceiptForm
        initialReceipt={receipt}
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
