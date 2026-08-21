import { ArrowLeft, Save } from "lucide-react";
import { useState } from "react";
import { useFetcher, useLoaderData, useNavigate } from "react-router";

import type { ReceiptItemRow } from "~/components/goods-receipt/receipt-items-table";

import { ReceiptFooterSection } from "~/components/goods-receipt/receipt-footer-section";
import { ReceiptGeneralSection } from "~/components/goods-receipt/receipt-general-section";
import { ReceiptHeaderSection } from "~/components/goods-receipt/receipt-header-section";
import { ReceiptItemsTable } from "~/components/goods-receipt/receipt-items-table";
import { Button } from "~/components/ui/button";
import { convertNumberToVietnameseWords } from "~/lib/number-to-words";
import {
  withActionContext,
  withLoaderContext,
} from "~/lib/route-middleware.server";
import { masterDataService } from "~/services/master-data.service";
import { receiptService } from "~/services/receipt.service";
import { GoodsReceiptFormSchema } from "~/types/goods-receipt.types";

export const loader = withLoaderContext(async (_req, { requestId, url }) => {
  const parts = url.pathname.split("/");
  const id = parts[parts.length - 2];

  const [receiptRes, orgsRes, warehousesRes, productsRes] = await Promise.all([
    receiptService.getReceiptById(id, requestId),
    masterDataService.getOrganizations(requestId),
    masterDataService.getWarehouses(requestId),
    masterDataService.getProducts(undefined, requestId),
  ]);

  return {
    receipt: receiptRes.data,
    organizations: orgsRes.data || [],
    warehouses: warehousesRes.data || [],
    products: productsRes.data || [],
  };
});

export const action = withActionContext(async (body, { requestId, url }) => {
  const parts = url.pathname.split("/");
  const id = parts[parts.length - 2];
  const validated = GoodsReceiptFormSchema.parse(body);
  await receiptService.updateReceipt(id, validated, requestId);
  return { success: true };
});

export default function EditGoodsReceiptRoute() {
  const { receipt, organizations, warehouses, products } =
    useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const navigate = useNavigate();

  if (!receipt)
    return (
      <div className="p-6 text-center text-xs">Không tìm thấy chứng từ.</div>
    );

  const [organizationId, setOrganizationId] = useState(
    receipt.organization?.id || organizations[0]?.id || "",
  );
  const [receiptNumber, setReceiptNumber] = useState(receipt.receiptNumber);
  const [receiptDate, setReceiptDate] = useState(receipt.receiptDate);
  const [receiptType, setReceiptType] = useState(
    receipt.receiptType || "PURCHASE",
  );
  const [debitAccount, setDebitAccount] = useState(
    receipt.debitAccount || "152",
  );
  const [creditAccount, setCreditAccount] = useState(
    receipt.creditAccount || "331",
  );

  const [warehouseId, setWarehouseId] = useState(
    receipt.warehouse?.id || warehouses[0]?.id || "",
  );
  const [delivererName, setDelivererName] = useState(receipt.delivererName);
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
      productCode: i.productCode,
      productNameSnapshot: i.productName,
      unitSnapshot: i.unit,
      docQty: i.docQty,
      actualQty: i.actualQty,
      unitPrice: i.unitPrice,
      debitAccount: i.debitAccount,
      creditAccount: i.creditAccount,
      note: i.note,
    })),
  );

  const totalAmount = items.reduce(
    (acc, it) => acc + Number(it.actualQty || 0) * Number(it.unitPrice || 0),
    0,
  );
  const totalAmountWords = convertNumberToVietnameseWords(totalAmount);

  const handleUpdate = () => {
    const payload = {
      organizationId,
      receiptNumber,
      receiptDate,
      receiptType,
      debitAccount,
      creditAccount,
      warehouseId,
      delivererName,
      actualReceivedDate,
      docReference,
      docDate,
      docOrigin,
      description,
      attachedDocCount,
      creatorName,
      storekeeperName,
      chiefAccountantName,
      totalAmountWords,
      status: receipt.status,
      items,
    };

    fetcher.submit(payload as any, {
      method: "POST",
      encType: "application/json",
    });
  };

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
              Cập nhật bút toán và điều chỉnh lượng tồn kho tương ứng
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={handleUpdate}
          disabled={fetcher.state === "submitting"}
        >
          <Save className="h-4 w-4 mr-1.5" /> Lưu Thay Đổi
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
        setReceiptType={setReceiptType}
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
