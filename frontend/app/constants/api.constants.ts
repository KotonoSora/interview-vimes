export const API_ENDPOINTS = {
  GOODS_RECEIPTS: "/goods-receipts",
  MASTER_PRODUCTS: "/master-data/products",
  MASTER_WAREHOUSES: "/master-data/warehouses",
  MASTER_ORGS: "/master-data/organizations",
  HEALTHZ: "/healthz",
  READY: "/ready",
  METRICS: "/metrics",
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  RATE_LIMITED: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  LIMIT_OPTIONS: [10, 20, 50, 100],
};
