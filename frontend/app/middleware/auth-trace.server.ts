import { createContext, data } from "react-router";

import type { RouterContextProvider } from "react-router";

import { ApiClientError } from "~/lib/api-client";

export const requestIdContext = createContext<string>("requestId");

export async function traceAndAuthMiddleware(
  {
    request,
    context,
  }: { request: Request; context: Readonly<RouterContextProvider> },
  next: () => Promise<Response>,
) {
  const traceId = request.headers.get("X-Request-Id") || crypto.randomUUID();
  context.set(requestIdContext, traceId);

  try {
    const response = await next();
    response.headers.set("X-Request-Id", traceId);
    return response;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw data(
        {
          message: error.message,
          endpoint: error.endpoint,
          errors: error.errors,
          requestId: error.requestId || traceId,
        },
        { status: error.statusCode || 500 },
      );
    }
    throw error;
  }
}
