import { env } from "@/lib/env"
import type { ApiErrorBody } from "@/types"

// Centralized API client — one place for the base URL, JSON headers,
// timeouts, and error normalization. Works in server and client components
// (it reads no secrets; server-only credentials would live elsewhere).

/**
 * In-memory access-token getter registered by the client auth provider.
 *
 * The short-lived Better Auth JWT lives in React state/refs — never in
 * `localStorage` or any other web storage. The Express API is the
 * authorization authority and re-checks the user in MongoDB on every request.
 */
let accessTokenGetter: (() => string | null) | undefined

/** Registers (or clears) the getter used to attach `Authorization: Bearer`. */
export function setAccessTokenGetter(
  getter: (() => string | null) | null
): void {
  accessTokenGetter = getter ?? undefined
}

export class ApiError extends Error {
  readonly status: number
  readonly statusText: string
  readonly body?: ApiErrorBody

  constructor(
    message: string,
    status: number,
    statusText: string,
    body?: ApiErrorBody
  ) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.statusText = statusText
    this.body = body
  }
}

export type ApiRequestInit = Omit<RequestInit, "body"> & {
  /** Serialized as JSON when present. */
  body?: unknown
  /** Abort the request after this many milliseconds. Default 15000. */
  timeoutMs?: number
}

async function readErrorBody(
  response: Response
): Promise<ApiErrorBody | undefined> {
  try {
    const data: unknown = await response.json()
    return data && typeof data === "object" ? (data as ApiErrorBody) : undefined
  } catch {
    return undefined
  }
}

export async function apiFetch<T>(
  path: string,
  init: ApiRequestInit = {}
): Promise<T> {
  const { body, timeoutMs = 15_000, headers, signal, ...rest } = init
  const url = `${env.apiBaseUrl}/${path.replace(/^\/+/, "")}`

  const timeoutSignal = AbortSignal.timeout(timeoutMs)
  const requestSignal = signal
    ? AbortSignal.any([timeoutSignal, signal])
    : timeoutSignal

  const requestHeaders = new Headers(headers)
  requestHeaders.set("Accept", "application/json")
  if (body !== undefined) requestHeaders.set("Content-Type", "application/json")

  // Attach the in-memory JWT when available; an explicit caller header wins.
  const accessToken = accessTokenGetter?.()
  if (accessToken && !requestHeaders.has("Authorization")) {
    requestHeaders.set("Authorization", `Bearer ${accessToken}`)
  }

  let response: Response
  try {
    response = await fetch(url, {
      ...rest,
      headers: requestHeaders,
      signal: requestSignal,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "TimeoutError") {
      throw new ApiError(
        `Request timed out after ${timeoutMs}ms`,
        0,
        "TimeoutError"
      )
    }
    throw new ApiError(
      cause instanceof Error ? cause.message : "Network request failed",
      0,
      "NetworkError"
    )
  }

  if (!response.ok) {
    const errorBody = await readErrorBody(response)
    throw new ApiError(
      errorBody?.message ?? `${response.status} ${response.statusText}`,
      response.status,
      response.statusText,
      errorBody
    )
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

/** Verb helpers over `apiFetch`. */
export const api = {
  get: <T>(path: string, init?: ApiRequestInit) =>
    apiFetch<T>(path, { ...init, method: "GET" }),
  post: <T>(path: string, body?: unknown, init?: ApiRequestInit) =>
    apiFetch<T>(path, { ...init, method: "POST", body }),
  put: <T>(path: string, body?: unknown, init?: ApiRequestInit) =>
    apiFetch<T>(path, { ...init, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, init?: ApiRequestInit) =>
    apiFetch<T>(path, { ...init, method: "PATCH", body }),
  delete: <T>(path: string, init?: ApiRequestInit) =>
    apiFetch<T>(path, { ...init, method: "DELETE" }),
}
