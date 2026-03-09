import type { ApiErrorPayload } from "@/lib/types";

const DEFAULT_REQUEST_TIMEOUT_MS = 15_000;
const UNKNOWN_API_ERROR_CODE = "UNKNOWN_ERROR";

export class ApiClientError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const defaultSignal =
    typeof AbortSignal !== "undefined" && AbortSignal.timeout
      ? AbortSignal.timeout(DEFAULT_REQUEST_TIMEOUT_MS)
      : undefined;

  const headers = {
    "content-type": "application/json",
    ...(options.headers ?? {}),
  };

  const response = await fetch(path, {
    ...options,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
    signal: options.signal ?? defaultSignal,
  });

  if (!response.ok) {
    let payload: ApiErrorPayload | null = null;
    try {
      payload = (await response.json()) as ApiErrorPayload;
    } catch {
      payload = null;
    }
    throw new ApiClientError(
      response.status,
      payload?.error?.code ?? UNKNOWN_API_ERROR_CODE,
      payload?.error?.message ??
        `Request failed with status ${response.status}`,
      payload?.error?.details,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
