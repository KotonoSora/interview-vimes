import { useEffect, useState } from "react";

import type { OrganizationItem } from "./organization-table-section";

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

interface OrganizationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (org: Partial<OrganizationItem>) => void;
  initialData?: OrganizationItem | null;
  isLoading?: boolean;
}

export function OrganizationFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: OrganizationFormModalProps) {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDepartment(initialData.department || "");
      setTaxCode(initialData.taxCode || "");
      setAddress(initialData.address || "");
    } else {
      setName("");
      setDepartment("");
      setTaxCode("");
      setAddress("");
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: initialData?.id,
      name,
      department,
      taxCode,
      address,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">
            {initialData
              ? "Chỉnh Sửa Đơn Vị / Bộ Phận"
              : "Thêm Mới Đơn Vị / Bộ Phận"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Tên đơn vị / Công ty *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: CÔNG TY CỔ PHẦN VIMES"
              required
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Phòng ban / Bộ phận *</Label>
            <Input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="VD: Phòng Kế Toán - Vật Tư"
              required
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Mã số thuế</Label>
            <Input
              value={taxCode}
              onChange={(e) => setTaxCode(e.target.value)}
              placeholder="VD: 0101234567"
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Địa chỉ trụ sở</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="VD: Tòa nhà VIMES, Quận Cầu Giấy, Hà Nội"
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
