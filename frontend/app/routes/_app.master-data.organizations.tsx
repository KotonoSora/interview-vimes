import { Building2 } from "lucide-react";
import { useLoaderData } from "react-router";

import type { Route } from "./+types/_app.master-data.organizations";

import { OrganizationTableSection } from "~/components/master-data/organization-table-section";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { PAGE_ROUTES } from "~/constants/navigation.constants";
import {
  requestIdContext,
  traceAndAuthMiddleware,
} from "~/middleware/auth-trace.server";
import { masterDataService } from "~/services/master-data.service";

export function meta() {
  return [
    { title: PAGE_ROUTES.MASTER_ORGANIZATIONS.metaTitle },
    {
      name: "description",
      content: PAGE_ROUTES.MASTER_ORGANIZATIONS.description,
    },
  ];
}

export const middleware = [traceAndAuthMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
  const requestId = context.get(requestIdContext) || crypto.randomUUID();
  const res = await masterDataService.getOrganizations(requestId);
  return { organizations: res.data || [] };
}

export default function MasterDataOrganizationsRoute() {
  const { organizations } = useLoaderData<typeof loader>();
  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <Card>
        <CardHeader className="py-2.5 px-4 border-b">
          <CardTitle className="text-xs font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />{" "}
            {PAGE_ROUTES.MASTER_ORGANIZATIONS.title} ({organizations.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <OrganizationTableSection organizations={organizations} />
        </CardContent>
      </Card>
    </div>
  );
}
