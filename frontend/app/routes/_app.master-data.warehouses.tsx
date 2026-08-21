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

export const middleware = [traceAndAuthMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
  const requestId = context.get(requestIdContext) || crypto.randomUUID();
  const res = await masterDataService.getWarehouses(requestId);
  return { warehouses: res.data || [] };
}

export default function MasterDataWarehousesRoute() {
  const { warehouses } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold tracking-tight">
          Danh Mục Kho Bãi Tiếp Nhận
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Danh sách các địa điểm lưu kho vật lý trực thuộc doanh nghiệp
        </p>
      </div>

      <Card>
        <CardHeader className="py-4 px-6 border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Warehouse className="h-4 w-4 text-primary" />
            Danh Sách Kho Hàng ({warehouses.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <WarehouseTableSection warehouses={warehouses} />
        </CardContent>
      </Card>
    </div>
  );
}
