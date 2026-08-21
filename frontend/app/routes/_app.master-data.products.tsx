import { Package } from "lucide-react";
import { useLoaderData } from "react-router";

import type { Route } from "./+types/_app.master-data.products";

import { ProductTableSection } from "~/components/master-data/product-table-section";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  requestIdContext,
  traceAndAuthMiddleware,
} from "~/middleware/auth-trace.server";
import { masterDataService } from "~/services/master-data.service";

export const middleware = [traceAndAuthMiddleware];

export async function loader({ request, context }: Route.LoaderArgs) {
  const requestId = context.get(requestIdContext) || crypto.randomUUID();
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || undefined;

  const res = await masterDataService.getProducts(search, requestId);
  return { products: res.data || [], currentSearch: search || "" };
}

export default function MasterDataProductsRoute() {
  const { products, currentSearch } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold tracking-tight">
          Danh Mục Vật Tư / Hàng Hóa
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Master Catalog phục vụ tự động điền đơn giá và quy cách khi lập Phiếu
          Nhập Kho
        </p>
      </div>

      <Card>
        <CardHeader className="py-4 px-6 border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            Danh Mục Vật Tư ({products.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ProductTableSection
            products={products}
            initialSearch={currentSearch}
          />
        </CardContent>
      </Card>
    </div>
  );
}
