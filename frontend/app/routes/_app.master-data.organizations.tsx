import { useEffect, useState } from "react";
import { data, useFetcher, useLoaderData } from "react-router";

import type { Route } from "./+types/_app.master-data.organizations";

import type { OrganizationItem } from "~/components/master-data/organization-table-section";

import { OrganizationFormModal } from "~/components/master-data/organization-form-modal";
import { OrganizationTableSection } from "~/components/master-data/organization-table-section";
import { toast } from "~/components/ui/toast";
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

export async function action({ request, context }: Route.ActionArgs) {
  const requestId = context.get(requestIdContext) || crypto.randomUUID();

  try {
    const body = await request.json();
    if (body.id) {
      await masterDataService.updateOrganization(body.id, body, requestId);
    } else {
      await masterDataService.createOrganization(body, requestId);
    }
    return data({
      success: true,
      message: "Cập nhật danh mục đơn vị / phòng ban thành công",
    });
  } catch (error: any) {
    return data(
      {
        success: false,
        message: error.message || "Lỗi lưu danh mục đơn vị / phòng ban",
      },
      { status: 400 },
    );
  }
}

export default function MasterDataOrganizationsRoute() {
  const { organizations } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationItem | null>(null);

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

  const handleSubmit = (orgData: Partial<OrganizationItem>) => {
    fetcher.submit(orgData, {
      method: "POST",
      encType: "application/json",
    });
    setIsOpenModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <OrganizationTableSection
        organizations={organizations}
        onOpenCreateModal={() => {
          setSelectedOrg(null);
          setIsOpenModal(true);
        }}
        onEditOrganization={(org) => {
          setSelectedOrg(org);
          setIsOpenModal(true);
        }}
      />
      <OrganizationFormModal
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        onSubmit={handleSubmit}
        initialData={selectedOrg}
        isLoading={fetcher.state === "submitting"}
      />
    </div>
  );
}
