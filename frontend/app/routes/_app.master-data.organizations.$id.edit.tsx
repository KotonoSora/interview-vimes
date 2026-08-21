import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { data, useFetcher, useLoaderData, useNavigate } from "react-router";

import type { Route } from "./+types/_app.master-data.organizations.$id.edit";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { toast } from "~/components/ui/toast";
import {
  requestIdContext,
  traceAndAuthMiddleware,
} from "~/middleware/auth-trace.server";
import { masterDataService } from "~/services/master-data.service";

export const middleware = [traceAndAuthMiddleware];

export async function loader({ params, context }: Route.LoaderArgs) {
  const requestId = context.get(requestIdContext) || crypto.randomUUID();
  const id = params.id;

  if (!id) {
    throw new Response("Mã đơn vị không hợp lệ", { status: 400 });
  }

  const res = await masterDataService.getOrganizations(requestId);
  const organization = res.data?.find((o) => o.id === id);

  if (!organization) {
    throw new Response("Không tìm thấy thông tin đơn vị / phòng ban", {
      status: 404,
    });
  }

  return { organization };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const requestId = context.get(requestIdContext) || crypto.randomUUID();
  const id = params.id;

  if (!id) {
    return data(
      { success: false, message: "Mã đơn vị không hợp lệ" },
      { status: 400 },
    );
  }

  try {
    const body = await request.json();
    await masterDataService.updateOrganization(id, body, requestId);

    return data({
      success: true,
      message: "Cập nhật đơn vị / phòng ban thành công",
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Lỗi lưu đơn vị";
    return data({ success: false, message: errorMsg }, { status: 400 });
  }
}

export default function EditOrganizationRoute() {
  const { organization } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const navigate = useNavigate();

  const [name, setName] = useState(organization.name);
  const [department, setDepartment] = useState(organization.department || "");
  const [taxCode, setTaxCode] = useState(organization.taxCode || "");
  const [address, setAddress] = useState(organization.address || "");

  useEffect(() => {
    if (!fetcher.data) return;

    if (fetcher.data.success) {
      toast.add({
        type: "success",
        title: "Cập nhật thành công",
        description: `Đơn vị ${name} đã được cập nhật.`,
      });
      navigate("/master-data/organizations");
    } else {
      toast.add({
        type: "error",
        title: "Lỗi cập nhật",
        description: fetcher.data.message || "Vui lòng kiểm tra lại thông tin.",
      });
    }
  }, [fetcher.data, navigate, name]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.add({
        type: "error",
        title: "Thiếu dữ liệu",
        description: "Vui lòng nhập Tên đơn vị / Doanh nghiệp.",
      });
      return;
    }

    const payload = {
      name,
      department: department || undefined,
      taxCode: taxCode || undefined,
      address: address || undefined,
    };

    fetcher.submit(JSON.stringify(payload), {
      method: "POST",
      encType: "application/json",
    });
  };

  const isSubmitting = fetcher.state === "submitting";

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/master-data/organizations")}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Chỉnh Sửa Đơn Vị / Phòng Ban
          </h1>
          <p className="text-xs text-muted-foreground">
            Mã định danh: {organization.id}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Thông Tin Pháp Nhân / Bộ Phận
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold">
                Tên công ty / Doanh nghiệp{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Công ty Cổ phần Xây dựng & Thương mại ABC"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="department" className="text-xs font-semibold">
                  Bộ phận / Phòng ban
                </Label>
                <Input
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="VD: Phòng Vật tư - Thiết bị"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="taxCode" className="text-xs font-semibold">
                  Mã số thuế
                </Label>
                <Input
                  id="taxCode"
                  value={taxCode}
                  onChange={(e) => setTaxCode(e.target.value)}
                  placeholder="VD: 0401234567"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs font-semibold">
                Địa chỉ trụ sở
              </Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="VD: 123 Đường Bạch Đằng, Quận Hải Châu, TP. Đà Nẵng"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate("/master-data/organizations")}
            >
              Hủy
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1.5" />
              )}
              Lưu Thay Đổi
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
