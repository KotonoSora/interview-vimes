import type { BaseApiResponse } from "~/types/api.types";

import { apiClient } from "~/lib/api-client";

export interface MasterProduct {
  id: string;
  code: string;
  name: string;
  unit: string;
  defaultPrice: number;
}

export interface MasterWarehouse {
  id: string;
  code: string;
  name: string;
  location?: string;
}

export interface MasterOrganization {
  id: string;
  code: string;
  name: string;
  department?: string;
}

export const masterDataService = {
  async getProducts(search?: string, requestId?: string) {
    return apiClient<BaseApiResponse<MasterProduct[]>>(
      "/master-data/products",
      {
        method: "GET",
        params: search ? { search } : undefined,
        requestId,
      },
    );
  },

  async getWarehouses(requestId?: string) {
    return apiClient<BaseApiResponse<MasterWarehouse[]>>(
      "/master-data/warehouses",
      {
        method: "GET",
        requestId,
      },
    );
  },

  async getOrganizations(requestId?: string) {
    return apiClient<BaseApiResponse<MasterOrganization[]>>(
      "/master-data/organizations",
      {
        method: "GET",
        requestId,
      },
    );
  },
};
