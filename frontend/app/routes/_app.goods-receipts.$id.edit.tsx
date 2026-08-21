import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { data, useFetcher, useLoaderData, useNavigate } from "react-router";

import type { Route } from "./+types/_app.goods-receipts.$id.edit";

import type { ReceiptItemRow } from "~/components/goods-receipt/receipt-items-table";
import type { UpdateGoodsReceiptRequest } from "~/types/goods-receipt.types";

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
import { UpdateGoodsReceiptSchema } from "~/types/goods-receipt.types";

export const middleware = [traceAndAuthMiddleware];

export async function loader({ params, context }: Route.LoaderArgs) {
  const requestId = context.get(requestIdContext) || crypto.randomUUID();
  const id = params.id;

  if (!id) {
    throw new Response("Mã chứng từ không hợp lệ", { status: 400 });
  }

  const [receiptRes, orgsRes, warehousesRes, productsRes] = await Promise.all([
    receiptService.getReceiptById(id, requestId),
    masterDataService.getOrganizations(requestId),
    masterDataService.getWarehouses(requestId),
    masterDataService.getProducts(undefined, requestId),
  ]);

  if (!receiptRes.data) {
    throw new Response("Chứng từ không tồn tại", { status: 404 });
  }

  if (receiptRes.data.status === "CANCELLED") {
    throw new Response(
      "Không thể chỉnh sửa phiếu nhập đã ở trạng thái CANCELLED",
      { status: 422 },
    );
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
    const parsedData = UpdateGoodsReceiptSchema.parse(rawData);
    await receiptService.updateReceipt(id, parsedData, requestId);

    return data({
      success: true,
      message: "Cập nhật phiếu nhập kho thành công",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Không thể cập nhật phiếu nhập kho";
    return data({ success: false, message }, { status: 400 });
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
  const [receiptNumber] = useState(receipt.receiptNumber);
  const [receiptDate, setReceiptDate] = useState(receipt.receiptDate);
  const [receiptType, setReceiptType] = useState<
    UpdateGoodsReceiptRequest["receiptType"]
  >(receipt.receiptType || "PURCHASE");
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
        description: fetcher.data.message || "Vui lòng kiểm tra lại dữ liệu.",
      });
    }
  }, [fetcher.data, navigate, receipt.id, receiptNumber]);

  const handleUpdate = () => {
    const payload: UpdateGoodsReceiptRequest = {
      receiptDate,
      actualReceivedDate: actualReceivedDate || null,
      organizationId,
      warehouseId,
      receiptType,
      description: description || null,
      delivererName,
      docReference: docReference || null,
      docDate: docDate || null,
      docOrigin: docOrigin || null,
      debitAccount: debitAccount || null,
      creditAccount: creditAccount || null,
      totalAmountWords: totalAmountWords || null,
      attachedDocCount: attachedDocCount || null,
      creatorName: creatorName || null,
      storekeeperName: storekeeperName || null,
      chiefAccountantName: chiefAccountantName || null,
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
        setReceiptNumber={() => {}}
        receiptDate={receiptDate}
        setReceiptDate={setReceiptDate}
        receiptType={receiptType || "PURCHASE"}
        setReceiptType={(val) =>
          setReceiptType(val as UpdateGoodsReceiptRequest["receiptType"])
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
