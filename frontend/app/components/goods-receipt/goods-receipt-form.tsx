import { ArrowLeft, CheckCircle, Loader2, Save } from "lucide-react";
import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router";

import type { ReceiptItemRow } from "~/components/goods-receipt/receipt-items-table";
import type {
  MasterOrganization,
  MasterProduct,
  MasterWarehouse,
} from "~/services/master-data.service";
import type {
  GoodsReceipt,
  GoodsReceiptFormData,
  GoodsReceiptItem,
  ReceiptType,
} from "~/types/goods-receipt.types";

import { ReceiptItemsTable } from "~/components/goods-receipt/receipt-items-table";
import { DatePicker } from "~/components/shared/date-picker";
import { Button } from "~/components/ui/button";
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

export type { GoodsReceiptFormData };

interface Props {
  initialReceipt?: GoodsReceipt | null;
  defaultReceiptNumber?: string;
  organizations: MasterOrganization[];
  warehouses: MasterWarehouse[];
  products: MasterProduct[];
  isSubmitting: boolean;
  onSubmit: (data: GoodsReceiptFormData, status: "DRAFT" | "CONFIRMED") => void;
}

export function GoodsReceiptForm({
  initialReceipt,
  defaultReceiptNumber = "",
  organizations,
  warehouses,
  products,
  isSubmitting,
  onSubmit,
}: Props) {
  const navigate = useNavigate();
  const isEdit = !!initialReceipt;

  // 1. Thông tin chung
  const [organizationId, setOrganizationId] = useState(
    initialReceipt?.organizationId ||
      initialReceipt?.organization?.id ||
      organizations[0]?.id ||
      "",
  );
  const [warehouseId, setWarehouseId] = useState(
    initialReceipt?.warehouseId ||
      initialReceipt?.warehouse?.id ||
      warehouses[0]?.id ||
      "",
  );
  const [receiptNumber, setReceiptNumber] = useState(
    initialReceipt?.receiptNumber || defaultReceiptNumber,
  );
  const [receiptDate, setReceiptDate] = useState(
    initialReceipt?.receiptDate || new Date().toISOString().split("T")[0],
  );
  const [actualReceivedDate, setActualReceivedDate] = useState(
    initialReceipt?.actualReceivedDate || "",
  );
  const [receiptType, setReceiptType] = useState<ReceiptType>(
    initialReceipt?.receiptType || "PURCHASE",
  );
  const [delivererName, setDelivererName] = useState(
    initialReceipt?.delivererName || "",
  );
  const [description, setDescription] = useState(
    initialReceipt?.description || "",
  );

  // 2. Chứng từ kèm theo & Hạch toán
  const [docReference, setDocReference] = useState(
    initialReceipt?.docReference || "",
  );
  const [docDate, setDocDate] = useState(initialReceipt?.docDate || "");
  const [docOrigin, setDocOrigin] = useState(initialReceipt?.docOrigin || "");
  const [attachedDocCount, setAttachedDocCount] = useState(
    initialReceipt?.attachedDocCount || "",
  );
  const [debitAccount, setDebitAccount] = useState(
    initialReceipt?.debitAccount || "152",
  );
  const [creditAccount, setCreditAccount] = useState(
    initialReceipt?.creditAccount || "331",
  );

  // 3. Nhân sự ký duyệt chứng từ
  const [creatorName, setCreatorName] = useState(
    initialReceipt?.creatorName || "",
  );
  const [storekeeperName, setStorekeeperName] = useState(
    initialReceipt?.storekeeperName || "",
  );
  const [chiefAccountantName, setChiefAccountantName] = useState(
    initialReceipt?.chiefAccountantName || "",
  );

  // 4. Danh sách vật tư
  const [items, setItems] = useState<ReceiptItemRow[]>(() => {
    const rawItems = (initialReceipt?.items || []) as GoodsReceiptItem[];
    if (rawItems.length === 0) {
      const p = products[0];
      return [
        {
          productId: p?.id || "",
          productNameSnapshot: p?.name || "Vật tư",
          unitSnapshot: p?.unit || "Kg",
          docQty: 1,
          actualQty: 1,
          unitPrice: p?.defaultPrice || 0,
          debitAccount: "152",
          creditAccount: "331",
          note: "",
        },
      ];
    }
    return rawItems.map((i: GoodsReceiptItem) => ({
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

  const typeOptions = React.useMemo(
    () =>
      (Object.entries(RECEIPT_TYPE_LABELS) as [ReceiptType, string][]).map(
        ([k, v]) => ({ value: k, label: v }),
      ),
    [],
  );

  const orgOptions = React.useMemo(
    () =>
      organizations.map((o) => ({
        value: o.id,
        label: o.code ? `[${o.code}] ${o.name}` : o.name,
      })),
    [organizations],
  );

  const warehouseOptions = React.useMemo(
    () =>
      warehouses.map((w) => ({
        value: w.id,
        label: w.code ? `[${w.code}] ${w.name}` : w.name,
      })),
    [warehouses],
  );

  const handleFormSubmit = (status: "DRAFT" | "CONFIRMED") => {
    const finalOrg = organizationId || organizations[0]?.id || "";
    const finalWh = warehouseId || warehouses[0]?.id || "";
    const finalDeliverer = delivererName.trim();

    if (!finalOrg || !finalWh || !finalDeliverer) {
      toast.add({
        type: "error",
        title: "Thiếu thông tin bắt buộc",
        description:
          "Vui lòng điền đầy đủ Đơn vị, Kho tiếp nhận và Tên người giao hàng.",
      });
      return;
    }

    const payload: GoodsReceiptFormData = {
      receiptNumber,
      receiptDate,
      actualReceivedDate: actualReceivedDate || null,
      organizationId: finalOrg,
      warehouseId: finalWh,
      receiptType,
      delivererName: finalDeliverer,
      docReference: docReference || null,
      docDate: docDate || null,
      docOrigin: docOrigin || null,
      description: description || null,
      debitAccount: debitAccount || null,
      creditAccount: creditAccount || null,
      totalAmountWords: totalAmountWords || null,
      attachedDocCount: attachedDocCount || null,
      creatorName: creatorName || null,
      storekeeperName: storekeeperName || null,
      chiefAccountantName: chiefAccountantName || null,
      status,
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

    onSubmit(payload, status);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16 pt-2">
      {/* THANH ĐIỀU HƯỚNG & HÀNH ĐỘNG */}
      <div className="flex flex-row items-center justify-between gap-3 pb-4 border-b">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="h-9 shadow-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại
        </Button>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            type="button"
            disabled={isSubmitting}
            onClick={() => handleFormSubmit("DRAFT")}
            className="h-9 font-medium shadow-sm"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isEdit ? "Lưu Thay Đổi" : "Lưu Bản Nháp"}
          </Button>
          {!isEdit && (
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleFormSubmit("CONFIRMED")}
              className="h-9 font-bold shadow-sm"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Hoàn Tất Nhập Kho
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* KHỐI 1: THÔNG TIN PHÁP LÝ & ĐỐI TÁC */}
        <div className="xl:col-span-8 space-y-6">
          <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
            <div className="bg-muted/30 px-5 py-3 border-b font-bold text-sm text-foreground">
              1. THÔNG TIN CHỨNG TỪ & ĐỐI TÁC TIẾP NHẬN
            </div>
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-muted-foreground">
                    Số phiếu{" "}
                    <span className="text-destructive font-bold">*</span>
                  </Label>
                  <Input
                    value={receiptNumber}
                    disabled={isEdit}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    className={`h-9 font-mono font-bold shadow-none ${
                      isEdit
                        ? "text-muted-foreground bg-muted/50 cursor-not-allowed border-dashed"
                        : "text-primary bg-primary/5 border-primary/20"
                    }`}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-muted-foreground">
                    Ngày lập phiếu{" "}
                    <span className="text-destructive font-bold">*</span>
                  </Label>
                  <DatePicker
                    value={receiptDate}
                    onChange={(val: string) => setReceiptDate(val || "")}
                    className="h-9 w-full shadow-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-muted-foreground">
                    Loại nghiệp vụ{" "}
                    <span className="text-destructive font-bold">*</span>
                  </Label>
                  <Select
                    items={typeOptions}
                    value={receiptType}
                    onValueChange={(val: string | null) =>
                      val && setReceiptType(val as ReceiptType)
                    }
                  >
                    <SelectTrigger className="h-9 w-full shadow-none text-left truncate">
                      <SelectValue placeholder="Chọn loại nghiệp vụ" />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-muted-foreground">
                    Đơn vị chủ quản{" "}
                    <span className="text-destructive font-bold">*</span>
                  </Label>
                  <Select
                    items={orgOptions}
                    value={organizationId}
                    onValueChange={(val: string | null) =>
                      val && setOrganizationId(val)
                    }
                  >
                    <SelectTrigger className="h-9 w-full shadow-none text-left truncate">
                      <SelectValue placeholder="Chọn đơn vị..." />
                    </SelectTrigger>
                    <SelectContent>
                      {orgOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-muted-foreground">
                    Kho tiếp nhận{" "}
                    <span className="text-destructive font-bold">*</span>
                  </Label>
                  <Select
                    items={warehouseOptions}
                    value={warehouseId}
                    onValueChange={(val: string | null) =>
                      val && setWarehouseId(val)
                    }
                  >
                    <SelectTrigger className="h-9 w-full shadow-none text-left truncate">
                      <SelectValue placeholder="Chọn kho..." />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouseOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-muted-foreground">
                    Ngày nhập thực tế
                  </Label>
                  <DatePicker
                    value={actualReceivedDate}
                    onChange={(val: string) => setActualReceivedDate(val || "")}
                    placeholder="Chọn ngày thực nhập..."
                    className="h-9 w-full shadow-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-muted-foreground">
                  Họ tên người giao hàng{" "}
                  <span className="text-destructive font-bold">*</span>
                </Label>
                <Input
                  value={delivererName}
                  onChange={(e) => setDelivererName(e.target.value)}
                  placeholder="Nhập tên người trực tiếp giao vật tư..."
                  className="h-9 shadow-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-muted-foreground">
                  Lý do nhập / Diễn giải nghiệp vụ
                </Label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nhập diễn giải chi tiết cho chứng từ nhập kho này..."
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                />
              </div>

              {/* Nhân sự phụ trách */}
              <div className="pt-2 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Người lập biểu
                  </Label>
                  <Input
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    placeholder="Tên người lập..."
                    className="h-8 text-xs shadow-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Thủ kho tiếp nhận
                  </Label>
                  <Input
                    value={storekeeperName}
                    onChange={(e) => setStorekeeperName(e.target.value)}
                    placeholder="Tên thủ kho..."
                    className="h-8 text-xs shadow-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Kế toán trưởng
                  </Label>
                  <Input
                    value={chiefAccountantName}
                    onChange={(e) => setChiefAccountantName(e.target.value)}
                    placeholder="Tên KTT..."
                    className="h-8 text-xs shadow-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KHỐI 2: CHỨNG TỪ GỐC & HẠCH TOÁN */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
            <div className="bg-muted/30 px-5 py-3 border-b font-bold text-sm text-foreground">
              2. CHỨNG TỪ GỐC KÈM THEO
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-muted-foreground">
                  Số chứng từ gốc
                </Label>
                <Input
                  value={docReference}
                  onChange={(e) => setDocReference(e.target.value)}
                  placeholder="VD: HĐ số 0012345, Lệnh ĐĐ..."
                  className="h-9 shadow-none font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-muted-foreground">
                  Ngày chứng từ gốc
                </Label>
                <DatePicker
                  value={docDate}
                  onChange={(val: string) => setDocDate(val || "")}
                  placeholder="Chọn ngày chứng từ..."
                  className="h-9 w-full shadow-none"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-muted-foreground">
                  Đơn vị phát hành
                </Label>
                <Input
                  value={docOrigin}
                  onChange={(e) => setDocOrigin(e.target.value)}
                  placeholder="Tên nhà cung cấp / Công ty..."
                  className="h-9 shadow-none"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-muted-foreground">
                  Kèm theo số CT gốc
                </Label>
                <Input
                  value={attachedDocCount}
                  onChange={(e) => setAttachedDocCount(e.target.value)}
                  placeholder="VD: 02 liên HĐ, 01 BBBG..."
                  className="h-9 shadow-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
            <div className="bg-muted/30 px-5 py-3 border-b font-bold text-sm text-foreground">
              3. HẠCH TOÁN KẾ TOÁN
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-muted-foreground">
                    Tài khoản Nợ
                  </Label>
                  <Input
                    value={debitAccount}
                    onChange={(e) => setDebitAccount(e.target.value)}
                    placeholder="152, 153..."
                    className="h-9 shadow-none font-mono text-blue-600 dark:text-blue-400 font-bold bg-blue-500/5 border-blue-500/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-muted-foreground">
                    Tài khoản Có
                  </Label>
                  <Input
                    value={creditAccount}
                    onChange={(e) => setCreditAccount(e.target.value)}
                    placeholder="331, 111..."
                    className="h-9 shadow-none font-mono text-amber-600 dark:text-amber-400 font-bold bg-amber-500/5 border-amber-500/20"
                  />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground italic text-center">
                (Định khoản áp dụng cho toàn bộ danh sách vật tư bên dưới)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KHỐI 3: BẢNG CHI TIẾT VẬT TƯ THỰC NHẬP */}
      <ReceiptItemsTable
        items={items}
        setItems={setItems}
        products={products}
        totalAmountWords={totalAmountWords}
      />
    </div>
  );
}
