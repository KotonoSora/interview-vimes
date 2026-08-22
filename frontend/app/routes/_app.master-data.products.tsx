import { Package } from "lucide-react";
import { useLoaderData } from "react-router";

import type { Route } from "./+types/_app.master-data.products";

import { ProductTableSection } from "~/components/master-data/product-table-section";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { PAGE_ROUTES } from "~/constants/navigation.constants";
import {
  requestIdContext,
  traceAndAuthMiddleware,
} from "~/middleware/auth-trace.server";
import { masterDataService } from "~/services/master-data.service";

export function meta() {
  return [
    { title: PAGE_ROUTES.MASTER_PRODUCTS.metaTitle },
    { name: "description", content: PAGE_ROUTES.MASTER_PRODUCTS.description },
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
    <div className="space-y-4 max-w-7xl mx-auto">
      <Card>
        <CardHeader className="py-2.5 px-4 border-b">
          <CardTitle className="text-xs font-semibold flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />{" "}
            {PAGE_ROUTES.MASTER_PRODUCTS.title} ({products.length})
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
