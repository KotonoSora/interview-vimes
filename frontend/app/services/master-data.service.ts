import type { OrganizationItem } from "~/components/master-data/organization-table-section";
import type { ProductItem } from "~/components/master-data/product-table-section";
import type { WarehouseItem } from "~/components/master-data/warehouse-table-section";
import type { BaseApiResponse } from "~/types/api.types";

import { apiClient } from "~/lib/api-client";

export const masterDataService = {
  // --- Danh mục Vật tư / Hàng hóa ---
  getProducts: async (search?: string, requestId?: string) => {
    return apiClient<BaseApiResponse<ProductItem[]>>("/master-data/products", {
      method: "GET",
      params: { search },
      requestId,
    });
  },

  createProduct: async (payload: Partial<ProductItem>, requestId?: string) => {
    return apiClient<BaseApiResponse<ProductItem>>("/master-data/products", {
      method: "POST",
      body: JSON.stringify(payload),
      requestId,
    });
  },

  updateProduct: async (
    id: string,
    payload: Partial<ProductItem>,
    requestId?: string,
  ) => {
    return apiClient<BaseApiResponse<ProductItem>>(
      `/master-data/products/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
        requestId,
      },
    );
  },

  // --- Danh mục Kho bãi ---
  getWarehouses: async (requestId?: string) => {
    return apiClient<BaseApiResponse<WarehouseItem[]>>(
      "/master-data/warehouses",
      {
        method: "GET",
        requestId,
      },
    );
  },

  createWarehouse: async (
    payload: Partial<WarehouseItem>,
    requestId?: string,
  ) => {
    return apiClient<BaseApiResponse<WarehouseItem>>(
      "/master-data/warehouses",
      {
        method: "POST",
        body: JSON.stringify(payload),
        requestId,
      },
    );
  },

  updateWarehouse: async (
    id: string,
    payload: Partial<WarehouseItem>,
    requestId?: string,
  ) => {
    return apiClient<BaseApiResponse<WarehouseItem>>(
      `/master-data/warehouses/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
        requestId,
      },
    );
  },

  // --- Danh mục Đơn vị / Phòng ban ---
  getOrganizations: async (requestId?: string) => {
    return apiClient<BaseApiResponse<OrganizationItem[]>>(
      "/master-data/organizations",
      {
        method: "GET",
        requestId,
      },
    );
  },

  createOrganization: async (
    payload: Partial<OrganizationItem>,
    requestId?: string,
  ) => {
    return apiClient<BaseApiResponse<OrganizationItem>>(
      "/master-data/organizations",
      {
        method: "POST",
        body: JSON.stringify(payload),
        requestId,
      },
    );
  },

  updateOrganization: async (
    id: string,
    payload: Partial<OrganizationItem>,
    requestId?: string,
  ) => {
    return apiClient<BaseApiResponse<OrganizationItem>>(
      `/master-data/organizations/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
        requestId,
      },
    );
  },
};
