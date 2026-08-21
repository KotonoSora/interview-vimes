import { toast } from "~/components/ui/toast";

/**
 * Lấy Base URL gốc của hệ thống Backend (mặc định http://localhost:3000)
 */
const getBackendOrigin = (): string => {
  let rawUrl = "http://localhost:3000";

  if (
    typeof import.meta !== "undefined" &&
    import.meta.env?.VITE_API_BASE_URL
  ) {
    rawUrl = import.meta.env.VITE_API_BASE_URL;
  } else if (typeof process !== "undefined" && process.env?.API_BASE_URL) {
    rawUrl = process.env.API_BASE_URL;
  }

  // Chuẩn hóa: Loại bỏ /api/v1 và dấu gạch chéo cuối nếu người dùng cấu hình nhầm
  return rawUrl.replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");
};

/**
 * Danh sách các endpoint cấp Root (Observability / Probes / Metrics)
 * Theo chuẩn OpenAPI 3.1.0, các đường dẫn này KHÔNG có tiền tố /api/v1
 */
const ROOT_ENDPOINTS = ["/healthz", "/ready", "/metrics"];

/**
 * Xây dựng URL hoàn chỉnh dựa theo đặc tả OpenAPI
 */
export const buildApiUrl = (endpoint: string): string => {
  const origin = getBackendOrigin();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // 1. Nếu là endpoint Root Observability -> http://origin/{endpoint}
  const isRootEndpoint = ROOT_ENDPOINTS.some(
    (rootPath) =>
      cleanEndpoint === rootPath || cleanEndpoint.startsWith(`${rootPath}?`),
  );

  if (isRootEndpoint) {
    return `${origin}${cleanEndpoint}`;
  }

  // 2. Nếu endpoint đã có sẵn /api/v1 -> không lặp lại
  if (cleanEndpoint.startsWith("/api/v1/")) {
    return `${origin}${cleanEndpoint}`;
  }

  // 3. Các API nghiệp vụ thông thường -> http://origin/api/v1/{endpoint}
  return `${origin}/api/v1${cleanEndpoint}`;
};

export class ApiClientError extends Error {
  public statusCode: number;
  public requestId?: string;
  public endpoint: string;
  public errors?: Array<{ path: string; message: string }>;

  constructor(
    message: string,
    statusCode: number,
    endpoint: string,
    requestId?: string,
    errors?: Array<{ path: string; message: string }>,
  ) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
    this.endpoint = endpoint;
    this.requestId = requestId;
    this.errors = errors;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  requestId?: string;
  disableToast?: boolean;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
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

  // Xây dựng URL chuẩn (tự động phân biệt root observability vs /api/v1)
  let fullUrl = buildApiUrl(endpoint);

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      fullUrl += (fullUrl.includes("?") ? "&" : "?") + queryString;
    }
  }

  const isMetricRequest =
    endpoint === "/metrics" || endpoint.endsWith("/metrics");

  const headers: HeadersInit = {
    "X-Request-Id": traceId,
    Accept: isMetricRequest ? "text/plain, */*" : "application/json",
    ...(!isMetricRequest && { "Content-Type": "application/json" }),
    ...customHeaders,
  };

  try {
    const response = await fetch(fullUrl, {
      ...customConfig,
      headers,
    });

    // 1. Phản hồi định dạng Prometheus Metrics (Text thuần)
    if (isMetricRequest) {
      return (await response.text()) as unknown as T;
    }

    // 2. Phản hồi định dạng JSON
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg =
        data.message ||
        `Lỗi yêu cầu HTTP ${response.status} khi gọi ${endpoint}`;

      // Bật Toast phía trình duyệt Client nếu cần
      if (typeof window !== "undefined" && !disableToast) {
        toast.add({
          type: "error",
          title: `Lỗi API [${response.status}]`,
          description: `${errorMsg} (${endpoint})`,
        });
      }

      throw new ApiClientError(
        errorMsg,
        response.status,
        endpoint,
        data.requestId || traceId,
        data.errors,
      );
    }

    return data as T;
  } catch (err) {
    if (err instanceof ApiClientError) {
      throw err;
    }

    const networkMsg =
      err instanceof Error ? err.message : "Mất kết nối tới máy chủ Backend";

    if (typeof window !== "undefined" && !disableToast) {
      toast.add({
        type: "error",
        title: "Lỗi kết nối API",
        description: `${networkMsg} -> ${fullUrl}`,
      });
    }

    throw new ApiClientError(networkMsg, 0, endpoint, traceId);
  }
}
