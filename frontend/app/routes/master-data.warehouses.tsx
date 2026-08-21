import { useState } from "react";
import { useFetcher, useLoaderData } from "react-router";

import type { WarehouseItem } from "~/components/master-data/warehouse-table-section";

import { WarehouseFormModal } from "~/components/master-data/warehouse-form-modal";
import { WarehouseTableSection } from "~/components/master-data/warehouse-table-section";
import {
  withActionContext,
  withLoaderContext,
} from "~/lib/route-middleware.server";
import { masterDataService } from "~/services/master-data.service";

export const loader = withLoaderContext(async (_req, { requestId }) => {
  const res = await masterDataService.getWarehouses(requestId);
  return { warehouses: res.data || [] };
});

export const action = withActionContext(async (body, { requestId }) => {
  if (body.id) {
    await masterDataService.updateWarehouse(body.id, body, requestId);
  } else {
    await masterDataService.createWarehouse(body, requestId);
  }
  return { success: true };
});

export default function MasterDataWarehousesRoute() {
  const { warehouses } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] =
    useState<WarehouseItem | null>(null);

  const handleOpenCreate = () => {
    setSelectedWarehouse(null);
    setIsOpenModal(true);
  };

  const handleEdit = (wh: WarehouseItem) => {
    setSelectedWarehouse(wh);
    setIsOpenModal(true);
  };

  const handleSubmit = (data: Partial<WarehouseItem>) => {
    fetcher.submit(data as any, {
      method: "POST",
      encType: "application/json",
    });
    setIsOpenModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <WarehouseTableSection
        warehouses={warehouses}
        onOpenCreateModal={handleOpenCreate}
        onEditWarehouse={handleEdit}
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
