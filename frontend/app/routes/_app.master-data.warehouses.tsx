import { useEffect, useState } from "react";
import { data, useFetcher, useLoaderData } from "react-router";

import type { Route } from "./+types/_app.master-data.warehouses";

import type { WarehouseItem } from "~/components/master-data/warehouse-table-section";

import { WarehouseFormModal } from "~/components/master-data/warehouse-form-modal";
import { WarehouseTableSection } from "~/components/master-data/warehouse-table-section";
import { toast } from "~/components/ui/toast";
import {
  requestIdContext,
  traceAndAuthMiddleware,
} from "~/middleware/auth-trace.server";
import { masterDataService } from "~/services/master-data.service";

export const middleware = [traceAndAuthMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
  const requestId = context.get(requestIdContext) || crypto.randomUUID();
  const res = await masterDataService.getWarehouses(requestId);
  return { warehouses: res.data || [] };
}

export async function action({ request, context }: Route.ActionArgs) {
  const requestId = context.get(requestIdContext) || crypto.randomUUID();

  try {
    const body = await request.json();
    if (body.id) {
      await masterDataService.updateWarehouse(body.id, body, requestId);
    } else {
      await masterDataService.createWarehouse(body, requestId);
    }
    return data({
      success: true,
      message: "Cập nhật danh mục kho bãi thành công",
    });
  } catch (error: any) {
    return data(
      { success: false, message: error.message || "Lỗi lưu danh mục kho bãi" },
      { status: 400 },
    );
  }
}

export default function MasterDataWarehousesRoute() {
  const { warehouses } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] =
    useState<WarehouseItem | null>(null);

  useEffect(() => {
    if (!fetcher.data) return;

    if (fetcher.data.success) {
      toast.add({
        type: "success",
        title: "Thành công",
        description: fetcher.data.message,
      });
    } else {
      toast.add({
        type: "error",
        title: "Thất bại",
        description: fetcher.data.message,
      });
    }
  }, [fetcher.data]);

  const handleSubmit = (whData: Partial<WarehouseItem>) => {
    fetcher.submit(whData, {
      method: "POST",
      encType: "application/json",
    });
    setIsOpenModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <WarehouseTableSection
        warehouses={warehouses}
        onOpenCreateModal={() => {
          setSelectedWarehouse(null);
          setIsOpenModal(true);
        }}
        onEditWarehouse={(wh) => {
          setSelectedWarehouse(wh);
          setIsOpenModal(true);
        }}
      />
      <WarehouseFormModal
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        onSubmit={handleSubmit}
        initialData={selectedWarehouse}
        isLoading={fetcher.state === "submitting"}
      />
    </div>
  );
}
