// app/lib/route-middleware.server.ts
import { data } from "react-router";
import { ZodError } from "zod";

import { ApiClientError } from "~/lib/api-client";

export interface MiddlewareContext {
  requestId: string;
  url: URL;
}

export function withLoaderContext<T>(
  handler: (request: Request, ctx: MiddlewareContext) => Promise<T>,
) {
  return async ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    const requestId =
      request.headers.get("X-Request-Id") || crypto.randomUUID();

    try {
      return await handler(request, { requestId, url });
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw data(
          {
            message: error.message,
            errors: error.errors,
            requestId: error.requestId,
          },
          { status: error.statusCode || 500 },
        );
      }
      throw error;
    }
  };
}

export function withActionContext<T>(
  handler: (formData: FormData | any, ctx: MiddlewareContext) => Promise<T>,
) {
  return async ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    const requestId =
      request.headers.get("X-Request-Id") || crypto.randomUUID();

    try {
      const contentType = request.headers.get("Content-Type") || "";
      let payload: any;

      if (contentType.includes("application/json")) {
        payload = await request.json();
      } else {
        payload = await request.formData();
      }

      return await handler(payload, { requestId, url });
    } catch (error) {
      if (error instanceof ZodError) {
        return data(
          {
            success: false,
            message: "Dữ liệu nhập vào không hợp lệ",
            errors: error.issues.map((e) => ({
              path: e.path.join("."),
              message: e.message,
            })),
          },
          { status: 422 },
        );
      }

      if (error instanceof ApiClientError) {
        return data(
          {
            success: false,
            message: error.message,
            errors: error.errors,
            requestId: error.requestId,
          },
          { status: error.statusCode || 400 },
        );
      }

      return data(
        {
          success: false,
          message: error instanceof Error ? error.message : "Lỗi xử lý máy chủ",
        },
        { status: 500 },
      );
    }
  };
}
