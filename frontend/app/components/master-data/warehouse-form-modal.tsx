import { useEffect, useState } from "react";

import type { WarehouseItem } from "./warehouse-table-section";

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

interface WarehouseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (wh: Partial<WarehouseItem>) => void;
  initialData?: WarehouseItem | null;
  isLoading?: boolean;
}

export function WarehouseFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: WarehouseFormModalProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [keeperName, setKeeperName] = useState("");

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code || "");
      setName(initialData.name || "");
      setLocation(initialData.location || "");
      setKeeperName(initialData.keeperName || "");
    } else {
      setCode("");
      setName("");
      setLocation("");
      setKeeperName("");
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: initialData?.id,
      code,
      name,
      location,
      keeperName,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">
            {initialData ? "Chỉnh Sửa Kho Bãi" : "Thêm Mới Kho Bãi"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Mã kho *</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="VD: KHO-TONG"
              required
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Tên kho *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Kho Vật Tư Tổng Hợp"
              required
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Địa chỉ / Vị trí vật lý *</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="VD: Lô B2, KCN Đình Vũ, Hải Phòng"
              required
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Thủ kho phụ trách mặc định</Label>
            <Input
              value={keeperName}
              onChange={(e) => setKeeperName(e.target.value)}
              placeholder="VD: Trần Văn Kho"
              className="text-xs"
            />
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
