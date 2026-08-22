import {
  AlertCircle,
  ArrowLeft,
  FileSpreadsheet,
  Loader2,
  Save,
} from "lucide-react";
import { useEffect, useState } from "react";
import { data, useFetcher, useLoaderData, useNavigate } from "react-router";
import { z } from "zod";

import type { Route } from "./+types/_app.goods-receipts.$id_.edit";

import type { ReceiptItemRow } from "~/components/goods-receipt/receipt-items-table";
import type { UpdateGoodsReceiptRequest } from "~/types/goods-receipt.types";

import { ReceiptItemsTable } from "~/components/goods-receipt/receipt-items-table";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { DatePicker } from "~/components/ui/date-picker";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { toast } from "~/components/ui/toast";
import { RECEIPT_TYPE_LABELS } from "~/constants/receipt.constants";
import { convertNumberToVietnameseWords } from "~/lib/number-to-words";
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
      content:
        "Cập nhật thông tin chứng từ và điều chỉnh số lượng vật tư nhập kho.",
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
    throw new Response("Không thể chỉnh sửa phiếu đã ở trạng thái CANCELLED", {
      status: 422,
    });

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

  const [organizationId, setOrganizationId] = useState(
    receipt.organizationId ||
      receipt.organization?.id ||
      organizations[0]?.id ||
      "",
  );
  const [warehouseId, setWarehouseId] = useState(
    receipt.warehouseId || receipt.warehouse?.id || warehouses[0]?.id || "",
  );
  const [receiptDate, setReceiptDate] = useState(
    receipt.receiptDate || new Date().toISOString().split("T")[0],
  );
  const [receiptType, setReceiptType] = useState<
    UpdateGoodsReceiptRequest["receiptType"]
  >(receipt.receiptType || "PURCHASE");
  const [delivererName, setDelivererName] = useState(
    receipt.delivererName || "",
  );
  const [docReference, setDocReference] = useState(receipt.docReference || "");
  const [docDate, setDocDate] = useState(receipt.docDate || "");
  const [docOrigin, setDocOrigin] = useState(receipt.docOrigin || "");
  const [description, setDescription] = useState(receipt.description || "");
  const [debitAccount, setDebitAccount] = useState(
    receipt.debitAccount || "152",
  );
  const [creditAccount, setCreditAccount] = useState(
    receipt.creditAccount || "331",
  );

  const [items, setItems] = useState<ReceiptItemRow[]>(() => {
    const rawItems = receipt.items || [];
    if (rawItems.length === 0) {
      const p = products[0];
      return [
        {
          productId: p?.id || "",
          productNameSnapshot: p?.name || "Vật tư",
          unitSnapshot: p?.unit || "Cái",
          docQty: 1,
          actualQty: 1,
          unitPrice: p?.defaultPrice || 0,
          debitAccount: "152",
          creditAccount: "331",
          note: "",
        },
      ];
    }
    return rawItems.map((i) => ({
      productId: i.productId || products[0]?.id || "",
      productNameSnapshot:
        i.productNameSnapshot || i.productName || products[0]?.name || "Vật tư",
      unitSnapshot: i.unitSnapshot || i.unit || products[0]?.unit || "Cái",
      docQty: Number(i.docQty) || 0,
      actualQty: Number(i.actualQty) || 0,
      unitPrice: Number(i.unitPrice) || 0,
      debitAccount: i.debitAccount || "152",
      creditAccount: i.creditAccount || "331",
      note: i.note || "",
    }));
  });

  const totalAmount = items.reduce(
    (acc, it) => acc + Number(it.actualQty || 0) * Number(it.unitPrice || 0),
    0,
  );
  const totalAmountWords = convertNumberToVietnameseWords(totalAmount);

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

  const handleUpdate = () => {
    const finalOrgId = organizationId || organizations[0]?.id || "";
    const finalWhId = warehouseId || warehouses[0]?.id || "";
    const finalDeliverer = delivererName.trim() || "Người giao hàng";

    if (!finalOrgId || !finalWhId) {
      toast.add({
        type: "error",
        title: "Thiếu thông tin",
        description: "Vui lòng chọn Đơn vị và Kho tiếp nhận.",
      });
      return;
    }

    const payload: UpdateGoodsReceiptRequest = {
      receiptDate,
      organizationId: finalOrgId,
      warehouseId: finalWhId,
      receiptType,
      delivererName: finalDeliverer,
      docReference: docReference || null,
      docDate: docDate || null,
      docOrigin: docOrigin || null,
      description: description || null,
      debitAccount: debitAccount || null,
      creditAccount: creditAccount || null,
      totalAmountWords: totalAmountWords || null,
      status: receipt.status as UpdateGoodsReceiptRequest["status"],
      items: items.map((it) => ({
        productId: it.productId || products[0]?.id || "",
        productNameSnapshot: it.productNameSnapshot || "Vật tư",
        unitSnapshot: it.unitSnapshot || "Cái",
        docQty: Number(it.docQty),
        actualQty: Number(it.actualQty),
        unitPrice: Number(it.unitPrice),
        debitAccount: it.debitAccount || null,
        creditAccount: it.creditAccount || null,
        note: it.note || null,
      })),
    };

    fetcher.submit(payload as any, {
      method: "POST",
      encType: "application/json",
    });
  };

  const isSubmitting =
    fetcher.state === "submitting" || fetcher.state === "loading";

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-12">
      {fetcher.data && !fetcher.data.success && (
        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-2 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Không thể lưu thay đổi</p>
            <p>{fetcher.data.message}</p>
          </div>
        </div>
      )}

      <div className="flex flex-row items-center justify-between gap-3 pb-2 border-b">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="h-8 text-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Quay lại
        </Button>
        <Button
          size="sm"
          type="button"
          onClick={handleUpdate}
          disabled={isSubmitting}
          className="h-8 text-xs"
        >
          {isSubmitting ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5 mr-1.5" />
          )}
          {isSubmitting ? "Đang lưu..." : "Lưu Thay Đổi"}
        </Button>
      </div>

      <Card>
        <CardHeader className="py-2.5 px-4 border-b">
          <CardTitle className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
            <FileSpreadsheet className="h-4 w-4 text-primary" /> Thông tin chứng
            từ
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Số phiếu</Label>
            <Input
              value={receipt.receiptNumber}
              disabled
              className="h-8 text-xs font-mono bg-muted text-muted-foreground cursor-not-allowed"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Ngày lập *</Label>
            <DatePicker
              value={receiptDate}
              onChange={(val) => setReceiptDate(val || "")}
              className="w-full"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Đơn vị chủ quản *</Label>
            <Select
              value={organizationId}
              onValueChange={(val: string | null) =>
                val && setOrganizationId(val)
              }
            >
              <SelectTrigger className="h-8 text-xs w-full">
                <SelectValue placeholder="Chọn đơn vị" />
              </SelectTrigger>
              <SelectContent className="min-w-[280px]">
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id} className="text-xs">
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Kho tiếp nhận *</Label>
            <Select
              value={warehouseId}
              onValueChange={(val: string | null) => val && setWarehouseId(val)}
            >
              <SelectTrigger className="h-8 text-xs w-full">
                <SelectValue placeholder="Chọn kho" />
              </SelectTrigger>
              <SelectContent className="min-w-[280px]">
                {warehouses.map((wh) => (
                  <SelectItem key={wh.id} value={wh.id} className="text-xs">
                    {wh.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Người giao hàng *</Label>
            <Input
              value={delivererName}
              onChange={(e) => setDelivererName(e.target.value)}
              placeholder="Tên người giao"
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Số chứng từ gốc</Label>
            <Input
              value={docReference}
              onChange={(e) => setDocReference(e.target.value)}
              placeholder="HĐ, Lệnh..."
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Loại nghiệp vụ</Label>
            <Select
              value={receiptType}
              onValueChange={(val: string | null) =>
                val &&
                setReceiptType(val as UpdateGoodsReceiptRequest["receiptType"])
              }
            >
              <SelectTrigger className="h-8 text-xs w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="min-w-[240px]">
                {Object.entries(RECEIPT_TYPE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k} className="text-xs">
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Định khoản (Nợ / Có)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={debitAccount}
                onChange={(e) => setDebitAccount(e.target.value)}
                placeholder="152"
                className="h-8 text-xs font-mono"
              />
              <Input
                value={creditAccount}
                onChange={(e) => setCreditAccount(e.target.value)}
                placeholder="331"
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <ReceiptItemsTable
        items={items}
        setItems={setItems}
        products={products}
        totalAmountWords={totalAmountWords}
      />
    </div>
  );
}
