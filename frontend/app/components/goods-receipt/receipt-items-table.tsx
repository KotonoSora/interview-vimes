import { Package, Plus, Trash2 } from "lucide-react";

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
    <Card className="overflow-hidden shadow-sm">
      <CardHeader className="py-2.5 px-4 border-b flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-semibold flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" /> Danh Sách Vật Tư Thực
          Nhập ({items.length})
        </CardTitle>
        <Button
          size="sm"
          variant="outline"
          onClick={addItem}
          type="button"
          className="h-7 text-xs"
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Thêm dòng
        </Button>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 text-xs">
              <TableHead className="w-10 text-center font-semibold">
                STT
              </TableHead>
              <TableHead className="min-w-[280px] font-semibold">
                Tên, quy cách vật tư / hàng hóa
              </TableHead>
              <TableHead className="w-20 text-center font-semibold">
                ĐVT
              </TableHead>
              <TableHead className="w-28 text-right font-semibold">
                SL Chứng từ
              </TableHead>
              <TableHead className="w-28 text-right font-semibold">
                SL Thực nhập
              </TableHead>
              <TableHead className="w-32 text-right font-semibold">
                Đơn giá (VNĐ)
              </TableHead>
              <TableHead className="w-36 text-right font-semibold">
                Thành tiền
              </TableHead>
              <TableHead className="w-10 text-center"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((row, idx) => {
              const selectedProduct = products.find(
                (p) => p.id === row.productId,
              );
              const displayName = selectedProduct
                ? `${selectedProduct.code ? `[${selectedProduct.code}] ` : ""}${selectedProduct.name}`
                : row.productNameSnapshot || "Chọn vật tư...";

              return (
                <TableRow key={idx} className="hover:bg-muted/20">
                  <TableCell className="text-center text-xs font-medium">
                    {idx + 1}
                  </TableCell>

                  <TableCell>
                    <Select
                      value={row.productId}
                      onValueChange={(val: string | null) =>
                        handleProductChange(idx, val)
                      }
                    >
                      <SelectTrigger className="h-8 text-xs font-medium w-full text-left truncate">
                        <SelectValue placeholder="Chọn vật tư">
                          {displayName}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="max-h-64 min-w-[320px]">
                        {products.map((p) => (
                          <SelectItem
                            key={p.id}
                            value={p.id}
                            className="text-xs"
                          >
                            <span className="font-mono font-semibold text-primary mr-1.5">
                              [{p.code}]
                            </span>
                            <span>{p.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell className="text-center text-xs text-muted-foreground font-medium">
                    {row.unitSnapshot || selectedProduct?.unit || "—"}
                  </TableCell>

                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="0.001"
                      value={row.docQty}
                      onChange={(e) =>
                        handleChange(idx, "docQty", Number(e.target.value))
                      }
                      className="h-8 text-xs text-right font-mono"
                    />
                  </TableCell>

                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="0.001"
                      value={row.actualQty}
                      onChange={(e) =>
                        handleChange(idx, "actualQty", Number(e.target.value))
                      }
                      className="h-8 text-xs text-right font-mono font-semibold"
                    />
                  </TableCell>

                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="100"
                      value={row.unitPrice}
                      onChange={(e) =>
                        handleChange(idx, "unitPrice", Number(e.target.value))
                      }
                      className="h-8 text-xs text-right font-mono"
                    />
                  </TableCell>

                  <TableCell className="text-right font-mono font-bold text-xs text-primary whitespace-nowrap">
                    {formatCurrencyVND(
                      Number(row.actualQty || 0) * Number(row.unitPrice || 0),
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => removeItem(idx)}
                      disabled={items.length <= 1}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <div className="p-3 bg-muted/20 border-t flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
          <div className="italic text-muted-foreground">
            Bằng chữ:{" "}
            <span className="font-semibold text-foreground">
              {totalAmountWords || "—"}
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <span className="font-semibold text-muted-foreground uppercase text-[11px]">
              Tổng tiền thanh toán:
            </span>
            <span className="text-sm font-bold text-primary">
              {formatCurrencyVND(total)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
