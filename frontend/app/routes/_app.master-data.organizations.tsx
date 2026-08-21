import { Building2 } from "lucide-react";
import { useLoaderData } from "react-router";

import type { Route } from "./+types/_app.master-data.organizations";

import { OrganizationTableSection } from "~/components/master-data/organization-table-section";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  requestIdContext,
  traceAndAuthMiddleware,
} from "~/middleware/auth-trace.server";
import { masterDataService } from "~/services/master-data.service";

export const middleware = [traceAndAuthMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
  const requestId = context.get(requestIdContext) || crypto.randomUUID();
  const res = await masterDataService.getOrganizations(requestId);
  return { organizations: res.data || [] };
}

export default function MasterDataOrganizationsRoute() {
  const { organizations } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold tracking-tight">
          Danh Mục Đơn Vị & Phòng Ban
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Danh sách các đơn vị, chi nhánh và phòng ban phát sinh chứng từ
        </p>
      </div>

      <Card>
        <CardHeader className="py-4 px-6 border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Danh Sách Đơn Vị ({organizations.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <OrganizationTableSection organizations={organizations} />
        </CardContent>
      </Card>
    </div>
  );
}
