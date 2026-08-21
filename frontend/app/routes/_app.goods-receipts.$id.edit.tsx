import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { data, useFetcher, useLoaderData, useNavigate } from "react-router";

import type { Route } from "./+types/_app.goods-receipts.$id.edit";

import type { ReceiptItemRow } from "~/components/goods-receipt/receipt-items-table";
import type { GoodsReceiptFormData } from "~/types/goods-receipt.types";

import { ReceiptFooterSection } from "~/components/goods-receipt/receipt-footer-section";
import { ReceiptGeneralSection } from "~/components/goods-receipt/receipt-general-section";
import { ReceiptHeaderSection } from "~/components/goods-receipt/receipt-header-section";
import { ReceiptItemsTable } from "~/components/goods-receipt/receipt-items-table";
import { Button } from "~/components/ui/button";
import { toast } from "~/components/ui/toast";
import { convertNumberToVietnameseWords } from "~/lib/number-to-words";
import {
  requestIdContext,
  traceAndAuthMiddleware,
} from "~/middleware/auth-trace.server";
import { masterDataService } from "~/services/master-data.service";
import { receiptService } from "~/services/receipt.service";
import { GoodsReceiptFormSchema } from "~/types/goods-receipt.types";

export const middleware = [traceAndAuthMiddleware];

export async function loader({ params, context }: Route.LoaderArgs) {
  const requestId = context.get(requestIdContext) || crypto.randomUUID();
  const id = params.id;

  if (!id) {
    throw new Response("Không tìm thấy mã chứng từ", { status: 400 });
  }

  const [receiptRes, orgsRes, warehousesRes, productsRes] = await Promise.all([
    receiptService.getReceiptById(id, requestId),
    masterDataService.getOrganizations(requestId),
    masterDataService.getWarehouses(requestId),
    masterDataService.getProducts(undefined, requestId),
  ]);

  if (!receiptRes.data) {
    throw new Response("Chứng từ không tồn tại trên hệ thống", { status: 404 });
  }

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

  if (!id) {
    return data(
      { success: false, message: "Mã chứng từ không hợp lệ" },
      { status: 400 },
    );
  }

  try {
    const rawData = await request.json();
    const parsedData: GoodsReceiptFormData =
      GoodsReceiptFormSchema.parse(rawData);
    await receiptService.updateReceipt(id, parsedData, requestId);

    return data({
      success: true,
      message: "Cập nhật phiếu nhập kho thành công",
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Không thể cập nhật phiếu nhập kho";
    return data(
      {
        success: false,
        message: errorMessage,
      },
      { status: 400 },
    );
  }
}

export default function EditGoodsReceiptRoute() {
  const { receipt, organizations, warehouses, products } =
    useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const navigate = useNavigate();

  const [organizationId, setOrganizationId] = useState(
    receipt.organization?.id || organizations[0]?.id || "",
  );
  const [receiptNumber, setReceiptNumber] = useState(receipt.receiptNumber);
  const [receiptDate, setReceiptDate] = useState(receipt.receiptDate);
  const [receiptType, setReceiptType] = useState<
    GoodsReceiptFormData["receiptType"]
  >((receipt.receiptType as GoodsReceiptFormData["receiptType"]) || "PURCHASE");
  const [debitAccount, setDebitAccount] = useState(
    receipt.debitAccount || "152",
  );
  const [creditAccount, setCreditAccount] = useState(
    receipt.creditAccount || "331",
  );

  const [warehouseId, setWarehouseId] = useState(
    receipt.warehouse?.id || warehouses[0]?.id || "",
  );
  const [delivererName, setDelivererName] = useState(
    receipt.delivererName || "",
  );
  const [actualReceivedDate, setActualReceivedDate] = useState(
    receipt.actualReceivedDate || receipt.receiptDate,
  );
  const [docReference, setDocReference] = useState(receipt.docReference || "");
  const [docDate, setDocDate] = useState(receipt.docDate || "");
  const [docOrigin, setDocOrigin] = useState(receipt.docOrigin || "");
  const [description, setDescription] = useState(receipt.description || "");

  const [attachedDocCount, setAttachedDocCount] = useState(
    receipt.attachedDocCount || "",
  );
  const [creatorName, setCreatorName] = useState(
    receipt.signatures?.creatorName || "",
  );
  const [storekeeperName, setStorekeeperName] = useState(
    receipt.signatures?.storekeeperName || "",
  );
  const [chiefAccountantName, setChiefAccountantName] = useState(
    receipt.signatures?.chiefAccountantName || "",
  );

  const [items, setItems] = useState<ReceiptItemRow[]>(
    receipt.items.map((i) => ({
      productId: i.productId,
      productCode: i.productCode || "",
      productNameSnapshot: i.productName,
      unitSnapshot: i.unit,
      docQty: i.docQty,
      actualQty: i.actualQty,
      unitPrice: i.unitPrice,
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
        title: "Cập nhật thành công",
        description: `Chứng từ ${receiptNumber} đã được cập nhật.`,
      });
      navigate(`/goods-receipts/${receipt.id}`);
    } else {
      toast.add({
        type: "error",
        title: "Lỗi cập nhật",
        description: fetcher.data.message || "Vui lòng kiểm tra lại thông tin.",
      });
    }
  }, [fetcher.data, navigate, receipt.id, receiptNumber]);

  const handleUpdate = () => {
    if (!organizationId) {
      toast.add({
        type: "error",
        title: "Thiếu thông tin",
        description: "Vui lòng chọn Đơn vị / Phòng ban.",
      });
      return;
    }
    if (!warehouseId) {
      toast.add({
        type: "error",
        title: "Thiếu thông tin",
        description: "Vui lòng chọn Kho tiếp nhận.",
      });
      return;
    }
    if (!delivererName.trim()) {
      toast.add({
        type: "error",
        title: "Thiếu thông tin",
        description: "Vui lòng nhập Họ tên người giao hàng.",
      });
      return;
    }

    const payload: GoodsReceiptFormData = {
      organizationId,
      receiptNumber,
      receiptDate,
      receiptType,
      debitAccount: debitAccount || undefined,
      creditAccount: creditAccount || undefined,
      warehouseId,
      delivererName,
      actualReceivedDate: actualReceivedDate || undefined,
      docReference: docReference || undefined,
      docDate: docDate || undefined,
      docOrigin: docOrigin || undefined,
      description: description || undefined,
      attachedDocCount: attachedDocCount || undefined,
      creatorName: creatorName || undefined,
      storekeeperName: storekeeperName || undefined,
      chiefAccountantName: chiefAccountantName || undefined,
      totalAmountWords,
      status: receipt.status as GoodsReceiptFormData["status"],
      items: items.map((it) => ({
        productId: it.productId,
        productCode: it.productCode || undefined,
        productNameSnapshot: it.productNameSnapshot,
        unitSnapshot: it.unitSnapshot,
        docQty: Number(it.docQty),
        actualQty: Number(it.actualQty),
        unitPrice: Number(it.unitPrice),
        debitAccount: it.debitAccount || undefined,
        creditAccount: it.creditAccount || undefined,
        note: it.note || undefined,
      })),
    };

    fetcher.submit(JSON.stringify(payload), {
      method: "POST",
      encType: "application/json",
    });
  };

  const isSubmitting = fetcher.state === "submitting";

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex items-center justify-between">
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
            <h1 className="text-xl font-bold tracking-tight">
              Chỉnh Sửa Phiếu Nhập: {receipt.receiptNumber}
            </h1>
            <p className="text-xs text-muted-foreground">
              Mẫu 01 - VT theo Thông tư 200/2014/TT-BTC
            </p>
          </div>
        </div>
        <Button size="sm" onClick={handleUpdate} disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-1.5" />
          )}
          Lưu Thay Đổi
        </Button>
      </div>

      <ReceiptHeaderSection
        organizations={organizations}
        organizationId={organizationId}
        setOrganizationId={setOrganizationId}
        receiptNumber={receiptNumber}
        setReceiptNumber={setReceiptNumber}
        receiptDate={receiptDate}
        setReceiptDate={setReceiptDate}
        receiptType={receiptType}
        setReceiptType={(val) =>
          setReceiptType(val as GoodsReceiptFormData["receiptType"])
        }
        debitAccount={debitAccount}
        setDebitAccount={setDebitAccount}
        creditAccount={creditAccount}
        setCreditAccount={setCreditAccount}
      />

      <ReceiptGeneralSection
        warehouses={warehouses}
        warehouseId={warehouseId}
        setWarehouseId={setWarehouseId}
        delivererName={delivererName}
        setDelivererName={setDelivererName}
        actualReceivedDate={actualReceivedDate}
        setActualReceivedDate={setActualReceivedDate}
        docReference={docReference}
        setDocReference={setDocReference}
        docDate={docDate}
        setDocDate={setDocDate}
        docOrigin={docOrigin}
        setDocOrigin={setDocOrigin}
        description={description}
        setDescription={setDescription}
      />

      <ReceiptItemsTable
        items={items}
        setItems={setItems}
        products={products}
        totalAmountWords={totalAmountWords}
      />

      <ReceiptFooterSection
        attachedDocCount={attachedDocCount}
        setAttachedDocCount={setAttachedDocCount}
        creatorName={creatorName}
        setCreatorName={setCreatorName}
        storekeeperName={storekeeperName}
        setStorekeeperName={setStorekeeperName}
        chiefAccountantName={chiefAccountantName}
        setChiefAccountantName={setChiefAccountantName}
      />
    </div>
  );
}
