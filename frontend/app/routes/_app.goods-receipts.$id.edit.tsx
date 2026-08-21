import { ArrowLeft, FileSpreadsheet, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { data, useFetcher, useLoaderData, useNavigate } from "react-router";

import type { Route } from "./+types/_app.goods-receipts.$id.edit";

import type { ReceiptItemRow } from "~/components/goods-receipt/receipt-items-table";
import type { UpdateGoodsReceiptRequest } from "~/types/goods-receipt.types";

import { ReceiptItemsTable } from "~/components/goods-receipt/receipt-items-table";
import { Button } from "~/components/ui/button";
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
    (m) => m?.id === "routes/_app.goods-receipts.$id.edit",
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
  if (!id) throw new Response("Mã không hợp lệ", { status: 400 });

  const [receiptRes, orgsRes, warehousesRes, productsRes] = await Promise.all([
    receiptService.getReceiptById(id, requestId),
    masterDataService.getOrganizations(requestId),
    masterDataService.getWarehouses(requestId),
    masterDataService.getProducts(undefined, requestId),
  ]);

  if (!receiptRes.data)
    throw new Response("Chứng từ không tồn tại", { status: 404 });
  if (receiptRes.data.status === "CANCELLED")
    throw new Response("Không thể sửa phiếu đã HỦY", { status: 422 });

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
      { success: false, message: "Mã không hợp lệ" },
      { status: 400 },
    );

  try {
    const rawData = await request.json();
    const parsedData = UpdateGoodsReceiptSchema.parse(rawData);
    await receiptService.updateReceipt(id, parsedData, requestId);
    return data({ success: true, message: "Cập nhật chứng từ thành công" });
  } catch (error: unknown) {
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
  const [receiptDate, setReceiptDate] = useState(receipt.receiptDate || "");
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

  // Chuẩn hóa nạp items từ response
  const [items, setItems] = useState<ReceiptItemRow[]>(
    (receipt.items || []).map((i) => ({
      productId: i.productId,
      productNameSnapshot: i.productNameSnapshot || i.productName || "",
      unitSnapshot: i.unitSnapshot || i.unit || "Cái",
      docQty: Number(i.docQty) || 0,
      actualQty: Number(i.actualQty) || 0,
      unitPrice: Number(i.unitPrice) || 0,
      debitAccount: i.debitAccount || "152",
      creditAccount: i.creditAccount || "331",
      note: i.note || "",
    })),
  );

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
        title: "Lỗi",
        description: fetcher.data.message || "Kiểm tra lại dữ liệu.",
      });
    }
  }, [fetcher.data, navigate, receipt.id]);

  const handleUpdate = () => {
    if (!organizationId || !warehouseId || !delivererName.trim()) {
      toast.add({
        type: "error",
        title: "Thiếu thông tin",
        description: "Vui lòng nhập đủ Đơn vị, Kho và Người giao.",
      });
      return;
    }

    const payload: UpdateGoodsReceiptRequest = {
      receiptDate,
      organizationId,
      warehouseId,
      receiptType,
      delivererName,
      docReference: docReference || null,
      docDate: docDate || null,
      docOrigin: docOrigin || null,
      description: description || null,
      debitAccount: debitAccount || null,
      creditAccount: creditAccount || null,
      totalAmountWords: totalAmountWords || null,
      status: receipt.status as UpdateGoodsReceiptRequest["status"],
      items: items.map((it) => ({
        productId: it.productId,
        productNameSnapshot: it.productNameSnapshot,
        unitSnapshot: it.unitSnapshot,
        docQty: Number(it.docQty),
        actualQty: Number(it.actualQty),
        unitPrice: Number(it.unitPrice),
        debitAccount: it.debitAccount || null,
        creditAccount: it.creditAccount || null,
        note: it.note || null,
      })),
    };

    fetcher.submit(JSON.stringify(payload), {
      method: "POST",
      encType: "application/json",
    });
  };

  const isSubmitting = fetcher.state === "submitting";

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-12 px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">
              Chỉnh Sửa Chứng Từ: {receipt.receiptNumber}
            </h1>
            <p className="text-xs text-muted-foreground">
              Mẫu số 01 - VT theo TT 200/2014/TT-BTC
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={handleUpdate}
          disabled={isSubmitting}
          className="h-8 text-xs"
        >
          {isSubmitting ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5 mr-1.5" />
          )}{" "}
          Lưu Thay Đổi
        </Button>
      </div>

      <Card>
        <CardHeader className="py-2.5 px-4 border-b">
          <CardTitle className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
            <FileSpreadsheet className="h-4 w-4 text-primary" /> Thông tin chung
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Số phiếu</Label>
            <Input
              value={receipt.receiptNumber}
              disabled
              className="h-8 text-xs font-mono bg-muted"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Ngày lập</Label>
            <Input
              type="date"
              value={receiptDate}
              onChange={(e) => setReceiptDate(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Đơn vị chủ quản *</Label>
            <Select
              value={organizationId}
              onValueChange={(val) => val && setOrganizationId(val)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Chọn đơn vị" />
              </SelectTrigger>
              <SelectContent>
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
              onValueChange={(val) => val && setWarehouseId(val)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Chọn kho" />
              </SelectTrigger>
              <SelectContent>
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
              onValueChange={(val) =>
                val &&
                setReceiptType(val as UpdateGoodsReceiptRequest["receiptType"])
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(RECEIPT_TYPE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k} className="text-xs">
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Bút toán (Nợ / Có)</Label>
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
