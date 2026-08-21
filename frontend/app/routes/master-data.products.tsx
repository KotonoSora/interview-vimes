import { useState } from "react";
import { useFetcher, useLoaderData } from "react-router";

import type { ProductItem } from "~/components/master-data/product-table-section";

import { ProductFormModal } from "~/components/master-data/product-form-modal";
import { ProductTableSection } from "~/components/master-data/product-table-section";
import {
  withActionContext,
  withLoaderContext,
} from "~/lib/route-middleware.server";
import { masterDataService } from "~/services/master-data.service";

export const loader = withLoaderContext(async (_req, { requestId }) => {
  const res = await masterDataService.getProducts(undefined, requestId);
  return { products: res.data || [] };
});

export const action = withActionContext(async (body, { requestId }) => {
  if (body.id) {
    await masterDataService.updateProduct(body.id, body, requestId);
  } else {
    await masterDataService.createProduct(body, requestId);
  }
  return { success: true };
});

export default function MasterDataProductsRoute() {
  const { products } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(
    null,
  );

  const handleOpenCreate = () => {
    setSelectedProduct(null);
    setIsOpenModal(true);
  };

  const handleEdit = (product: ProductItem) => {
    setSelectedProduct(product);
    setIsOpenModal(true);
  };

  const handleSubmit = (data: Partial<ProductItem>) => {
    fetcher.submit(data as any, {
      method: "POST",
      encType: "application/json",
    });
    setIsOpenModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <ProductTableSection
        products={products}
        onOpenCreateModal={handleOpenCreate}
        onEditProduct={handleEdit}
      />
      <ProductFormModal
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        onSubmit={handleSubmit}
        initialData={selectedProduct}
        isLoading={fetcher.state === "submitting"}
      />
    </div>
  );
}
