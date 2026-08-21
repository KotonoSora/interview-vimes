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
    const res = await apiClient<any>("/master-data/products", {
      method: "GET",
      params: search ? { search } : undefined,
      requestId,
    });
    const listRaw = Array.isArray(res?.data)
      ? res.data
      : Array.isArray(res)
        ? res
        : [];
    const list: MasterProduct[] = listRaw.map((p: any) => ({
      id: p.id,
      code: p.code || p.product_code || "",
      name: p.name || p.product_name || "",
      unit: p.unit || "Cái",
      defaultPrice: Number(p.defaultPrice ?? p.default_price ?? p.price ?? 0),
    }));
    return { success: true, data: list };
  },

  async getWarehouses(requestId?: string) {
    const res = await apiClient<any>("/master-data/warehouses", {
      method: "GET",
      requestId,
    });
    const listRaw = Array.isArray(res?.data)
      ? res.data
      : Array.isArray(res)
        ? res
        : [];
    const list: MasterWarehouse[] = listRaw.map((w: any) => ({
      id: w.id,
      code: w.code || w.warehouse_code || "",
      name: w.name || w.warehouse_name || "",
      location: w.location || w.warehouse_location || undefined,
    }));
    return { success: true, data: list };
  },

  async getOrganizations(requestId?: string) {
    const res = await apiClient<any>("/master-data/organizations", {
      method: "GET",
      requestId,
    });
    const listRaw = Array.isArray(res?.data)
      ? res.data
      : Array.isArray(res)
        ? res
        : [];
    const list: MasterOrganization[] = listRaw.map((o: any) => ({
      id: o.id,
      code: o.code || o.org_code || "",
      name: o.name || o.org_name || "",
      department: o.department || undefined,
    }));
    return { success: true, data: list };
  },
};
