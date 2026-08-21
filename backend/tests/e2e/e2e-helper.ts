// tests/e2e/e2e-helper.ts
export const BASE_URL = process.env.API_BASE_URL || "http://localhost/api/v1";
export const ROOT_URL = BASE_URL.replace("/api/v1", "");
export const CLIENT_TRACE_ID = "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d";

export const parseJson = async <T = any>(res: Response): Promise<T> => {
  return (await res.json()) as T;
};
