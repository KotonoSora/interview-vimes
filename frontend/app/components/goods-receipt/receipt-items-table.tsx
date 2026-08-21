import { Plus, Trash2 } from "lucide-react";

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

export interface ReceiptItemRow {
  productId: string;
  productCode?: string;
  productNameSnapshot: string;
  unitSnapshot: string;
  docQty: number;
  actualQty: number;
  unitPrice: number;
  debitAccount?: string;
  creditAccount?: string;
  note?: string;
}

interface ProductCatalogOption {
  id: string;
  code: string;
  name: string;
  unit: string;
  defaultPrice: number;
}

interface ReceiptItemsTableProps {
  items: ReceiptItemRow[];
  setItems: React.Dispatch<React.SetStateAction<ReceiptItemRow[]>>;
  products: ProductCatalogOption[];
  totalAmountWords?: string;
  isReadOnly?: boolean;
}

export function ReceiptItemsTable({
  items,
  setItems,
  products,
  totalAmountWords,
  isReadOnly = false,
}: ReceiptItemsTableProps) {
  const handleProductChange = (index: number, productId: string) => {
    const p = products.find((prod) => prod.id === productId);
    if (!p) return;
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      productId: p.id,
      productCode: p.code,
      productNameSnapshot: p.name,
      unitSnapshot: p.unit,
      unitPrice: p.defaultPrice || 0,
    };
    setItems(newItems);
  };

  const handleFieldChange = (
    index: number,
    field: keyof ReceiptItemRow,
    value: any,
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItemRow = () => {
    const firstP = products[0] || {
      id: "",
      code: "",
      name: "",
      unit: "",
      defaultPrice: 0,
    };
    setItems([
      ...items,
      {
        productId: firstP.id,
        productCode: firstP.code,
        productNameSnapshot: firstP.name,
        unitSnapshot: firstP.unit,
        docQty: 1,
        actualQty: 1,
        unitPrice: firstP.defaultPrice || 0,
        debitAccount: "152",
        creditAccount: "331",
        note: "",
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce(
    (acc, it) => acc + Number(it.actualQty || 0) * Number(it.unitPrice || 0),
    0,
  );

  return (
    <Card>
      <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            3. Danh Sách Chi Tiết Vật Tư, Hàng Hóa Thực Nhập (Mục [6], [7], [8])
          </CardTitle>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Thành tiền Cột 4 = Số lượng thực nhập (Cột 2) × Đơn giá (Cột 3)
          </p>
        </div>
        {!isReadOnly && (
          <Button size="sm" variant="secondary" onClick={addItemRow}>
            <Plus className="h-4 w-4 mr-1" /> Thêm dòng
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-[45px] text-center">STT</TableHead>
              <TableHead className="w-[280px]">
                Tên, quy cách vật tư (Cột B)
              </TableHead>
              <TableHead className="w-[90px]">Mã (Cột C)</TableHead>
              <TableHead className="w-[70px]">ĐVT (D)</TableHead>
              <TableHead className="w-[100px] text-right">
                SL C.Từ (1)
              </TableHead>
              <TableHead className="w-[100px] text-right">
                SL Thực (2)
              </TableHead>
              <TableHead className="w-[120px] text-right">
                Đơn giá (3)
              </TableHead>
              <TableHead className="w-[130px] text-right">
                Thành tiền (4)
              </TableHead>
              <TableHead className="w-[150px]">Ghi chú</TableHead>
              {!isReadOnly && <TableHead className="w-[40px]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((row, idx) => {
              const amount =
                Number(row.actualQty || 0) * Number(row.unitPrice || 0);
              return (
                <TableRow key={idx}>
                  <TableCell className="text-center font-medium text-xs">
                    {idx + 1}
                  </TableCell>
                  <TableCell>
                    {isReadOnly ? (
                      <span className="font-medium text-xs">
                        {row.productNameSnapshot}
                      </span>
                    ) : (
                      <Select
                        value={row.productId}
                        onValueChange={(val) =>
                          handleProductChange(idx, val || "")
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Chọn vật tư" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {row.productCode || "—"}
                  </TableCell>
                  <TableCell className="text-xs">{row.unitSnapshot}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="any"
                      min="0"
                      disabled={isReadOnly}
                      className="h-8 text-right text-xs"
                      value={row.docQty}
                      onChange={(e) =>
                        handleFieldChange(idx, "docQty", e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="any"
                      min="0"
                      disabled={isReadOnly}
                      className="h-8 text-right text-xs font-semibold"
                      value={row.actualQty}
                      onChange={(e) =>
                        handleFieldChange(idx, "actualQty", e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="any"
                      min="0"
                      disabled={isReadOnly}
                      className="h-8 text-right text-xs"
                      value={row.unitPrice}
                      onChange={(e) =>
                        handleFieldChange(idx, "unitPrice", e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right font-semibold text-xs">
                    {new Intl.NumberFormat("vi-VN").format(amount)} ₫
                  </TableCell>
                  <TableCell>
                    <Input
                      disabled={isReadOnly}
                      placeholder="Hao hụt..."
                      className="h-8 text-xs"
                      value={row.note || ""}
                      onChange={(e) =>
                        handleFieldChange(idx, "note", e.target.value)
                      }
                    />
                  </TableCell>
                  {!isReadOnly && (
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        disabled={items.length <= 1}
                        onClick={() => removeItemRow(idx)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Tổng cộng & bằng chữ */}
        <div className="p-4 bg-muted/20 border-t space-y-1.5">
          <div className="flex justify-between items-center text-sm font-semibold">
            <span>Cộng thành tiền (Cột 4):</span>
            <span className="text-base text-primary">
              {new Intl.NumberFormat("vi-VN").format(totalAmount)} VNĐ
            </span>
          </div>
          {totalAmountWords && (
            <div className="text-xs text-muted-foreground italic">
              <strong>Bằng chữ (Mục [10]):</strong> {totalAmountWords}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
