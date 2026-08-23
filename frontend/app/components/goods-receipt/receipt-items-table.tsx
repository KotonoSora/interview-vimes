import { Package, Plus, Trash2 } from "lucide-react";
import * as React from "react";

import type { MasterProduct } from "~/services/master-data.service";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { formatCurrencyVND } from "~/lib/formatters";

export interface ReceiptItemRow {
  productId: string;
  productNameSnapshot: string;
  unitSnapshot: string;
  docQty: number;
  actualQty: number;
  unitPrice: number;
  debitAccount?: string | null;
  creditAccount?: string | null;
  note?: string | null;
}

interface Props {
  items: ReceiptItemRow[];
  setItems: React.Dispatch<React.SetStateAction<ReceiptItemRow[]>>;
  products: MasterProduct[];
  totalAmountWords?: string | null;
}

export function ReceiptItemsTable({
  items,
  setItems,
  products,
  totalAmountWords,
}: Props) {
  // Mảng lookup items chuẩn cho Base UI Select
  const productSelectItems = React.useMemo(() => {
    return products.map((p) => ({
      value: p.id,
      label: p.code ? `[${p.code}] ${p.name}` : p.name,
    }));
  }, [products]);

  const handleProductChange = (index: number, productId: string | null) => {
    if (!productId) return;
    const selected = products.find((p) => p.id === productId);
    if (!selected) return;
    setItems((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        productId: selected.id,
        productNameSnapshot: selected.name,
        unitSnapshot: selected.unit,
        unitPrice: selected.defaultPrice || 0,
      };
      return next;
    });
  };

  const handleChange = (
    index: number,
    field: keyof ReceiptItemRow,
    value: unknown,
  ) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addItem = () => {
    const p = products[0];
    setItems((prev) => [
      ...prev,
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
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const total = items.reduce(
    (sum, it) => sum + Number(it.actualQty || 0) * Number(it.unitPrice || 0),
    0,
  );

  return (
    <Card className="overflow-hidden shadow-sm border">
      <CardHeader className="py-3 px-5 border-b flex flex-row items-center justify-between bg-muted/20">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" /> Chi Tiết Vật Tư / Hàng
          Hóa Thực Nhập ({items.length})
        </CardTitle>
        <Button
          size="sm"
          onClick={addItem}
          type="button"
          className="h-8 text-xs font-semibold"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Thêm Dòng Vật Tư
        </Button>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 text-xs sm:text-sm">
              <TableHead className="w-12 text-center font-semibold">
                STT
              </TableHead>
              <TableHead className="min-w-[300px] font-semibold">
                Tên, quy cách vật tư / hàng hóa{" "}
                <span className="text-destructive font-bold">*</span>
              </TableHead>
              <TableHead className="w-24 text-center font-semibold">
                ĐVT
              </TableHead>
              <TableHead className="w-32 text-right font-semibold">
                SL Chứng từ{" "}
                <span className="text-destructive font-bold">*</span>
              </TableHead>
              <TableHead className="w-32 text-right font-semibold">
                SL Thực nhập{" "}
                <span className="text-destructive font-bold">*</span>
              </TableHead>
              <TableHead className="w-36 text-right font-semibold">
                Đơn giá (VNĐ){" "}
                <span className="text-destructive font-bold">*</span>
              </TableHead>
              <TableHead className="w-40 text-right font-semibold">
                Thành tiền
              </TableHead>
              <TableHead className="min-w-[160px] font-semibold">
                Ghi chú dòng
              </TableHead>
              <TableHead className="w-12 text-center"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((row, idx) => {
              const selectedProduct = products.find(
                (p) => p.id === row.productId,
              );

              return (
                <TableRow key={idx} className="hover:bg-muted/20 group">
                  <TableCell className="text-center text-sm font-medium text-muted-foreground">
                    {idx + 1}
                  </TableCell>

                  <TableCell className="py-2.5">
                    <Select
                      items={productSelectItems}
                      value={row.productId}
                      onValueChange={(val: string | null) =>
                        handleProductChange(idx, val)
                      }
                    >
                      <SelectTrigger className="h-9 text-sm font-medium w-full text-left truncate shadow-none">
                        <SelectValue placeholder="Chọn vật tư..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-64 min-w-[360px]">
                        {productSelectItems.map((item) => (
                          <SelectItem
                            key={item.value}
                            value={item.value}
                            className="text-sm"
                          >
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell className="text-center text-sm text-muted-foreground font-medium">
                    {row.unitSnapshot || selectedProduct?.unit || "—"}
                  </TableCell>

                  <TableCell className="py-2.5">
                    <Input
                      type="number"
                      min="0"
                      step="0.001"
                      value={row.docQty}
                      onChange={(e) =>
                        handleChange(idx, "docQty", Number(e.target.value))
                      }
                      className="h-9 text-sm text-right font-mono shadow-none"
                    />
                  </TableCell>

                  <TableCell className="py-2.5">
                    <Input
                      type="number"
                      min="0"
                      step="0.001"
                      value={row.actualQty}
                      onChange={(e) =>
                        handleChange(idx, "actualQty", Number(e.target.value))
                      }
                      className="h-9 text-sm text-right font-mono font-bold text-primary shadow-none border-primary/40 focus-visible:ring-primary/40"
                    />
                  </TableCell>

                  <TableCell className="py-2.5">
                    <Input
                      type="number"
                      min="0"
                      step="100"
                      value={row.unitPrice}
                      onChange={(e) =>
                        handleChange(idx, "unitPrice", Number(e.target.value))
                      }
                      className="h-9 text-sm text-right font-mono shadow-none"
                    />
                  </TableCell>

                  <TableCell className="text-right font-mono font-bold text-sm text-foreground whitespace-nowrap bg-muted/10">
                    {formatCurrencyVND(
                      Number(row.actualQty || 0) * Number(row.unitPrice || 0),
                    )}
                  </TableCell>

                  <TableCell className="py-2.5">
                    <Input
                      type="text"
                      placeholder="Ghi chú chi tiết..."
                      value={row.note || ""}
                      onChange={(e) =>
                        handleChange(idx, "note", e.target.value)
                      }
                      className="h-9 text-sm shadow-none bg-transparent"
                    />
                  </TableCell>

                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => removeItem(idx)}
                      disabled={items.length <= 1}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <div className="p-4 bg-muted/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-t">
          <div className="text-sm text-muted-foreground">
            Bằng chữ:{" "}
            <span className="font-semibold text-foreground italic">
              {totalAmountWords || "Không đồng"}
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono">
            <span className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">
              Tổng cộng:
            </span>
            <span className="text-xl font-bold text-primary">
              {formatCurrencyVND(total)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
