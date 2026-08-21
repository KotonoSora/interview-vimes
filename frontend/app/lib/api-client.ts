import type { ApiErrorResponse, BaseApiResponse } from "~/types/api.types";

const getApiBaseUrl = (): string => {
  // 1. Vite environment variable (Client & SSR)
  if (
    typeof import.meta !== "undefined" &&
    import.meta.env?.VITE_API_BASE_URL
  ) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // 2. Node.js process.env fallback
  if (typeof process !== "undefined" && process.env?.API_BASE_URL) {
    return process.env.API_BASE_URL;
  }
  return "http://localhost:8080/api/v1";
};

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  requestId?: string;
}

export class ApiClientError extends Error {
  public statusCode: number;
  public requestId?: string;
  public errors?: Array<{ path: string; message: string }>;

  constructor(
    message: string,
    statusCode: number,
    requestId?: string,
    errors?: Array<{ path: string; message: string }>,
  ) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
    this.requestId = requestId;
    this.errors = errors;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    params,
    requestId,
    headers: customHeaders,
    ...customConfig
  } = options;
  const baseUrl = getApiBaseUrl();

  let url = `${baseUrl}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const traceId =
    requestId ||
    (typeof crypto !== "undefined" ? crypto.randomUUID() : "client-trace-id");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Request-Id": traceId,
    ...customHeaders,
  };

  const config: RequestInit = {
    ...customConfig,
    headers,
  };

  try {
    const response = await fetch(url, config);

    if (endpoint === "/metrics") {
      const textData = await response.text();
      return textData as unknown as T;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorData = data as ApiErrorResponse;
      throw new ApiClientError(
        errorData.message || `Lỗi yêu cầu HTTP ${response.status}`,
        response.status,
        errorData.requestId || traceId,
        errorData.errors,
      );
    }

    return data as T;
  } catch (err) {
    if (err instanceof ApiClientError) {
      throw err;
    }
    throw new ApiClientError(
      err instanceof Error ? err.message : "Mất kết nối tới API Gateway",
      0,
      traceId,
    );
  }
}
