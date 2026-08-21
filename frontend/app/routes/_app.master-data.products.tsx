import { useEffect, useState } from "react";
import { data, useFetcher, useLoaderData } from "react-router";

import type { Route } from "./+types/_app.master-data.products";

import type { ProductItem } from "~/components/master-data/product-table-section";

import { ProductFormModal } from "~/components/master-data/product-form-modal";
import { ProductTableSection } from "~/components/master-data/product-table-section";
import { toast } from "~/components/ui/toast";
import {
  requestIdContext,
  traceAndAuthMiddleware,
} from "~/middleware/auth-trace.server";
import { masterDataService } from "~/services/master-data.service";

export const middleware = [traceAndAuthMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
  const requestId = context.get(requestIdContext) || crypto.randomUUID();
  const res = await masterDataService.getProducts(undefined, requestId);
  return { products: res.data || [] };
}

export async function action({ request, context }: Route.ActionArgs) {
  const requestId = context.get(requestIdContext) || crypto.randomUUID();

  try {
    const body = await request.json();
    if (body.id) {
      await masterDataService.updateProduct(body.id, body, requestId);
    } else {
      await masterDataService.createProduct(body, requestId);
    }
    return data({
      success: true,
      message: "Cập nhật danh mục vật tư thành công",
    });
  } catch (error: any) {
    return data(
      { success: false, message: error.message || "Lỗi lưu danh mục vật tư" },
      { status: 400 },
    );
  }
}

export default function MasterDataProductsRoute() {
  const { products } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(
    null,
  );

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

  const handleSubmit = (productData: Partial<ProductItem>) => {
    fetcher.submit(productData, {
      method: "POST",
      encType: "application/json",
    });
    setIsOpenModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <ProductTableSection
        products={products}
        onOpenCreateModal={() => {
          setSelectedProduct(null);
          setIsOpenModal(true);
        }}
        onEditProduct={(p) => {
          setSelectedProduct(p);
          setIsOpenModal(true);
        }}
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
