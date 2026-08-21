import { useEffect, useState } from "react";

import type { ProductItem } from "./product-table-section";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: Partial<ProductItem>) => void;
  initialData?: ProductItem | null;
  isLoading?: boolean;
}

export function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: ProductFormModalProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [defaultPrice, setDefaultPrice] = useState(0);

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code || "");
      setName(initialData.name || "");
      setUnit(initialData.unit || "");
      setDefaultPrice(initialData.defaultPrice || 0);
    } else {
      setCode("");
      setName("");
      setUnit("Cái");
      setDefaultPrice(0);
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: initialData?.id,
      code,
      name,
      unit,
      defaultPrice: Number(defaultPrice),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">
            {initialData ? "Chỉnh Sửa Vật Tư" : "Thêm Mới Vật Tư, Hàng Hóa"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Mã vật tư / SKU *</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="VD: VT-001"
              required
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Tên, quy cách phẩm chất vật tư *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Thép phi 10 Hòa Phát"
              required
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Đơn vị tính (ĐVT) *</Label>
              <Input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="VD: Kg, Cây, Bộ, Cuộn..."
                required
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Đơn giá định mức (VNĐ)</Label>
              <Input
                type="number"
                min="0"
                value={defaultPrice}
                onChange={(e) => setDefaultPrice(Number(e.target.value))}
                className="text-xs text-right"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" size="sm" disabled={isLoading}>
              {isLoading
                ? "Đang lưu..."
                : initialData
                  ? "Lưu thay đổi"
                  : "Tạo mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
