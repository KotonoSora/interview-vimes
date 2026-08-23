import { toast } from "~/components/ui/toast";

const isServer = typeof window === "undefined";

/**
 * Resolves the appropriate Backend Base URL depending on execution runtime.
 * - Server (SSR / Node.js): Uses internal network URL (e.g., Docker DNS 'http://backend-api:8082' or local host).
 * - Client (Browser): Uses a relative URL or Nginx reverse proxy URL ('http://localhost:8080').
 */
const getBackendOrigin = (): string => {
  // 1. Server-Side Execution (SSR loader running inside Node.js)
  if (isServer) {
    const serverUrl =
      (typeof process !== "undefined" && process.env?.API_BASE_URL) ||
      "http://backend-api:8082";

    return serverUrl
      .replace(/\/api\/v1\/?$/, "") // Remove duplicate '/api/v1' suffix if present
      .replace(/\/+$/, ""); // Trim trailing slashes
  }

  // 2. Client-Side Execution (Browser runtime)
  // Default to empty string to let requests leverage relative pathing via Nginx proxy (/api/v1/...)
  let clientUrl = "";
  if (
    typeof import.meta !== "undefined" &&
    import.meta.env?.VITE_API_BASE_URL
  ) {
    clientUrl = import.meta.env.VITE_API_BASE_URL;
  }

  return clientUrl
    .replace(/\/api\/v1\/?$/, "") // Remove duplicate '/api/v1' suffix if present
    .replace(/\/+$/, ""); // Trim trailing slashes
};

const ROOT_ENDPOINTS = ["/healthz", "/ready", "/metrics"];

/**
 * Constructs a standardized API endpoint URL.
 */
export const buildApiUrl = (endpoint: string): string => {
  const origin = getBackendOrigin();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // Preserve root-level health/metrics endpoints
  if (
    ROOT_ENDPOINTS.some(
      (r) => cleanEndpoint === r || cleanEndpoint.startsWith(`${r}?`),
    )
  ) {
    return `${origin}${cleanEndpoint}`;
  }

  // Ensure standard '/api/v1' prefix for business logic endpoints
  if (cleanEndpoint.startsWith("/api/v1/")) {
    return `${origin}${cleanEndpoint}`;
  }

  return `${origin}/api/v1${cleanEndpoint}`;
};

export class ApiClientError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public endpoint: string,
    public requestId?: string,
    public errors?: Array<{ path: string; message: string }>,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit & {
    params?: Record<string, string | number | boolean | undefined | null>;
    requestId?: string;
    disableToast?: boolean;
  } = {},
): Promise<T> {
  const {
    params,
    requestId,
    disableToast = false,
    headers: customHeaders,
    ...customConfig
  } = options;
  const traceId =
    requestId ||
    (typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : "trace-id");
  let fullUrl = buildApiUrl(endpoint);

  if (params) {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") sp.append(k, String(v));
    });
    const qs = sp.toString();
    if (qs) fullUrl += (fullUrl.includes("?") ? "&" : "?") + qs;
  }

  const isMetric = endpoint === "/metrics" || endpoint.endsWith("/metrics");
  const headers: HeadersInit = {
    "X-Request-Id": traceId,
    Accept: isMetric ? "text/plain, */*" : "application/json",
    ...(!isMetric && { "Content-Type": "application/json" }),
    ...customHeaders,
  };

  try {
    const res = await fetch(fullUrl, { ...customConfig, headers });
    if (isMetric) return (await res.text()) as unknown as T;
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data.message || `Lỗi HTTP ${res.status}`;
      if (typeof window !== "undefined" && !disableToast) {
        toast.add({
          type: "error",
          title: `Lỗi API [${res.status}]`,
          description: msg,
        });
      }
      throw new ApiClientError(
        msg,
        res.status,
        endpoint,
        data.requestId || traceId,
        data.errors,
      );
    }
    return data as T;
  } catch (err) {
    if (err instanceof ApiClientError) throw err;
    const netMsg = err instanceof Error ? err.message : "Mất kết nối server";
    if (typeof window !== "undefined" && !disableToast) {
      toast.add({ type: "error", title: "Lỗi kết nối", description: netMsg });
    }
    throw new ApiClientError(netMsg, 0, endpoint, traceId);
  }
}
