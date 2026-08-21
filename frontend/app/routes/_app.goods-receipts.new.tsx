import { ArrowLeft, CheckCircle, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { data, useFetcher, useLoaderData, useNavigate } from "react-router";

import type { Route } from "./+types/_app.goods-receipts.new";

import type { ReceiptItemRow } from "~/components/goods-receipt/receipt-items-table";
import type { GoodsReceiptFormData } from "~/types/goods-receipt.types";

import { ReceiptFooterSection } from "~/components/goods-receipt/receipt-footer-section";
import { ReceiptGeneralSection } from "~/components/goods-receipt/receipt-general-section";
import { ReceiptHeaderSection } from "~/components/goods-receipt/receipt-header-section";
import { ReceiptItemsTable } from "~/components/goods-receipt/receipt-items-table";
import { Button } from "~/components/ui/button";
import { toast } from "~/components/ui/toast";
import { generateReceiptNumber } from "~/lib/formatters";
import { convertNumberToVietnameseWords } from "~/lib/number-to-words";
import {
  requestIdContext,
  traceAndAuthMiddleware,
} from "~/middleware/auth-trace.server";
import { masterDataService } from "~/services/master-data.service";
import { receiptService } from "~/services/receipt.service";
import { GoodsReceiptFormSchema } from "~/types/goods-receipt.types";

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
    const parsedData: GoodsReceiptFormData =
      GoodsReceiptFormSchema.parse(rawData);
    const response = await receiptService.createReceipt(parsedData, requestId);

    return data({
      success: true,
      message: "Lưu phiếu nhập kho thành công",
      receiptId: response.data?.receiptId,
    });
  } catch (error: any) {
    return data(
      {
        success: false,
        message: error.message || "Không thể tạo phiếu nhập kho",
        errors: error.errors || [],
      },
      { status: 400 },
    );
  }
}

export default function NewGoodsReceiptRoute() {
  const { organizations, warehouses, products, defaultReceiptNumber } =
    useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const navigate = useNavigate();

  const [organizationId, setOrganizationId] = useState(
    organizations[0]?.id || "",
  );
  const [receiptNumber, setReceiptNumber] = useState(defaultReceiptNumber);
  const [receiptDate, setReceiptDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [receiptType, setReceiptType] =
    useState<GoodsReceiptFormData["receiptType"]>("PURCHASE");
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

  useEffect(() => {
    if (!fetcher.data) return;

    if (fetcher.data.success) {
      toast.add({
        type: "success",
        title: "Tạo phiếu thành công",
        description: `Chứng từ ${receiptNumber} đã được ghi nhận vào hệ thống.`,
      });
      navigate("/goods-receipts");
    } else {
      toast.add({
        type: "error",
        title: "Lỗi lưu dữ liệu",
        description: fetcher.data.message || "Vui lòng kiểm tra lại dữ liệu.",
      });
    }
  }, [fetcher.data, navigate, receiptNumber]);

  const handleSave = (status: "DRAFT" | "CONFIRMED") => {
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
      status,
      items: items.map((it) => ({
        productId: it.productId,
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

    fetcher.submit(payload, {
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
              Mẫu 01-VT ban hành theo Thông tư 200/2014/TT-BTC
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isSubmitting}
            onClick={() => handleSave("DRAFT")}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1.5" />
            )}
            Lưu Bản Nháp
          </Button>
          <Button
            size="sm"
            disabled={isSubmitting}
            onClick={() => handleSave("CONFIRMED")}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-1.5" />
            )}
            Xác Nhận Nhập Kho
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
