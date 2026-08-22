import { toast } from "~/components/ui/toast";

const getBackendOrigin = (): string => {
  let rawUrl = "";
  if (typeof process !== "undefined" && process.env?.API_BASE_URL) {
    rawUrl = process.env.API_BASE_URL;
  } else if (
    typeof import.meta !== "undefined" &&
    import.meta.env?.VITE_API_BASE_URL
  ) {
    rawUrl = import.meta.env.VITE_API_BASE_URL;
  }
  if (!rawUrl) rawUrl = "http://127.0.0.1:3000";
  return rawUrl
    .replace("//localhost", "//127.0.0.1")
    .replace(/\/api\/v1\/?$/, "")
    .replace(/\/+$/, "");
};

const ROOT_ENDPOINTS = ["/healthz", "/ready", "/metrics"];

export const buildApiUrl = (endpoint: string): string => {
  const origin = getBackendOrigin();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  if (
    ROOT_ENDPOINTS.some(
      (r) => cleanEndpoint === r || cleanEndpoint.startsWith(`${r}?`),
    )
  ) {
    return `${origin}${cleanEndpoint}`;
  }
  if (cleanEndpoint.startsWith("/api/v1/")) return `${origin}${cleanEndpoint}`;
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
