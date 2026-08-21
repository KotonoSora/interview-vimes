import { ArrowLeft, CheckCircle, Save } from "lucide-react";
import { useState } from "react";
import { useFetcher, useLoaderData, useNavigate } from "react-router";

import type { ReceiptItemRow } from "~/components/goods-receipt/receipt-items-table";

import { ReceiptFooterSection } from "~/components/goods-receipt/receipt-footer-section";
import { ReceiptGeneralSection } from "~/components/goods-receipt/receipt-general-section";
import { ReceiptHeaderSection } from "~/components/goods-receipt/receipt-header-section";
import { ReceiptItemsTable } from "~/components/goods-receipt/receipt-items-table";
import { Button } from "~/components/ui/button";
import { generateReceiptNumber } from "~/lib/formatters";
import { convertNumberToVietnameseWords } from "~/lib/number-to-words";
import {
  withActionContext,
  withLoaderContext,
} from "~/lib/route-middleware.server";
import { masterDataService } from "~/services/master-data.service";
import { receiptService } from "~/services/receipt.service";
import { GoodsReceiptFormSchema } from "~/types/goods-receipt.types";

export const loader = withLoaderContext(async (_req, { requestId }) => {
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
});

export const action = withActionContext(async (body, { requestId }) => {
  const validated = GoodsReceiptFormSchema.parse(body);
  const result = await receiptService.createReceipt(validated, requestId);
  return { success: true, receiptId: result.data?.receiptId };
});

export default function NewGoodsReceiptRoute() {
  const { organizations, warehouses, products, defaultReceiptNumber } =
    useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const navigate = useNavigate();

  const [organizationId, setOrganizationId] = useState(
    organizations[0]?.id || "",
  );
  const [receiptNumber, setReceiptNumber] = useState(defaultReceiptNumber);
  const [receiptDate, setReceiptDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [receiptType, setReceiptType] = useState("PURCHASE");
  const [debitAccount, setDebitAccount] = useState("152");
  const [creditAccount, setCreditAccount] = useState("331");

  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || "");
  const [delivererName, setDelivererName] = useState("");
  const [actualReceivedDate, setActualReceivedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [docReference, setDocReference] = useState("");
  const [docDate, setDocDate] = useState("");
  const [docOrigin, setDocOrigin] = useState("");
  const [description, setDescription] = useState("");

  const [attachedDocCount, setAttachedDocCount] = useState("1 hóa đơn gốc");
  const [creatorName, setCreatorName] = useState("Lê Văn Lập");
  const [storekeeperName, setStorekeeperName] = useState("Trần Văn Kho");
  const [chiefAccountantName, setChiefAccountantName] =
    useState("Phạm Thị Trưởng");

  const [items, setItems] = useState<ReceiptItemRow[]>([
    {
      productId: products[0]?.id || "",
      productCode: products[0]?.code || "",
      productNameSnapshot: products[0]?.name || "",
      unitSnapshot: products[0]?.unit || "",
      docQty: 1,
      actualQty: 1,
      unitPrice: products[0]?.defaultPrice || 0,
      debitAccount: "152",
      creditAccount: "331",
      note: "",
    },
  ]);

  const totalAmount = items.reduce(
    (acc, it) => acc + Number(it.actualQty || 0) * Number(it.unitPrice || 0),
    0,
  );
  const totalAmountWords = convertNumberToVietnameseWords(totalAmount);

  const handleSubmit = (status: "DRAFT" | "CONFIRMED") => {
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
      status,
      items,
    };

    fetcher.submit(payload as any, {
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
              Lập Phiếu Nhập Kho Mới
            </h1>
            <p className="text-xs text-muted-foreground">
              Mẫu số 01-VT ban hành theo Thông tư 200/2014/TT-BTC
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isSubmitting}
            onClick={() => handleSubmit("DRAFT")}
          >
            <Save className="h-4 w-4 mr-1.5" /> Lưu Bản Nháp
          </Button>
          <Button
            size="sm"
            disabled={isSubmitting}
            onClick={() => handleSubmit("CONFIRMED")}
          >
            <CheckCircle className="h-4 w-4 mr-1.5" /> Xác Nhận Nhập Kho
          </Button>
        </div>
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
