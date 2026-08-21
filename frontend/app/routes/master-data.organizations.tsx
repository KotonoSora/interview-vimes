import { useState } from "react";
import { useFetcher, useLoaderData } from "react-router";

import type { OrganizationItem } from "~/components/master-data/organization-table-section";

import { OrganizationFormModal } from "~/components/master-data/organization-form-modal";
import { OrganizationTableSection } from "~/components/master-data/organization-table-section";
import {
  withActionContext,
  withLoaderContext,
} from "~/lib/route-middleware.server";
import { masterDataService } from "~/services/master-data.service";

export const loader = withLoaderContext(async (_req, { requestId }) => {
  const res = await masterDataService.getOrganizations(requestId);
  return { organizations: res.data || [] };
});

export const action = withActionContext(async (body, { requestId }) => {
  if (body.id) {
    await masterDataService.updateOrganization(body.id, body, requestId);
  } else {
    await masterDataService.createOrganization(body, requestId);
  }
  return { success: true };
});

export default function MasterDataOrganizationsRoute() {
  const { organizations } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationItem | null>(null);

  const handleOpenCreate = () => {
    setSelectedOrg(null);
    setIsOpenModal(true);
  };

  const handleEdit = (org: OrganizationItem) => {
    setSelectedOrg(org);
    setIsOpenModal(true);
  };

  const handleSubmit = (data: Partial<OrganizationItem>) => {
    fetcher.submit(data as any, {
      method: "POST",
      encType: "application/json",
    });
    setIsOpenModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <OrganizationTableSection
        organizations={organizations}
        onOpenCreateModal={handleOpenCreate}
        onEditOrganization={handleEdit}
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
