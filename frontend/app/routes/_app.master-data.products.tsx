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

export function meta() {
  return [
    { title: "Danh Mục Vật Tư & Hàng Hóa | VIMES Inventory" },
    {
      name: "description",
      content:
        "Tra cứu danh mục sản phẩm, quy cách kỹ thuật và bảng giá tiêu chuẩn.",
    },
  ];
}

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
    <div className="space-y-4 max-w-7xl mx-auto px-2 sm:px-4">
      <div>
        <h1 className="text-lg font-bold">Danh Mục Vật Tư & Hàng Hóa</h1>
        <p className="text-xs text-muted-foreground">
          Catalog phục vụ tự động điền đơn giá và quy cách khi lập phiếu
        </p>
      </div>
      <Card>
        <CardHeader className="py-2.5 px-4 border-b">
          <CardTitle className="text-xs font-semibold flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" /> Danh Sách Vật Tư (
            {products.length})
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
