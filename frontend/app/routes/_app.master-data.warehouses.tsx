import { Warehouse } from "lucide-react";
import { useLoaderData } from "react-router";

import type { Route } from "./+types/_app.master-data.warehouses";

import { WarehouseTableSection } from "~/components/master-data/warehouse-table-section";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  requestIdContext,
  traceAndAuthMiddleware,
} from "~/middleware/auth-trace.server";
import { masterDataService } from "~/services/master-data.service";

export function meta() {
  return [
    { title: "Danh Mục Kho Bãi Tiếp Nhận | VIMES Inventory" },
    {
      name: "description",
      content: "Danh sách các địa điểm kho vật lý trực thuộc doanh nghiệp.",
    },
  ];
}

export const middleware = [traceAndAuthMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
  const requestId = context.get(requestIdContext) || crypto.randomUUID();
  const res = await masterDataService.getWarehouses(requestId);
  return { warehouses: res.data || [] };
}

export default function MasterDataWarehousesRoute() {
  const { warehouses } = useLoaderData<typeof loader>();
  return (
    <div className="space-y-4 max-w-7xl mx-auto px-2 sm:px-4">
      <div>
        <h1 className="text-lg font-bold">Danh Mục Kho Bãi</h1>
        <p className="text-xs text-muted-foreground">
          Danh sách các địa điểm tiếp nhận và lưu kho
        </p>
      </div>
      <Card>
        <CardHeader className="py-2.5 px-4 border-b">
          <CardTitle className="text-xs font-semibold flex items-center gap-2">
            <Warehouse className="h-4 w-4 text-primary" /> Danh Sách Kho (
            {warehouses.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <WarehouseTableSection warehouses={warehouses} />
        </CardContent>
      </Card>
    </div>
  );
}
