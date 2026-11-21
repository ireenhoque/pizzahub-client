// Safe environment access — every variable is read, validated, and typed
// here, once. Only NEXT_PUBLIC_* variables are used in browser code (they are
// inlined at build time); server-only secrets must never take that prefix.
// Add real values to `.env.local` (see .env.example).

const isProduction = process.env.NODE_ENV === "production"

function readPublicUrl(
  name: string,
  value: string | undefined,
  developmentFallback: string
): string {
  const raw = value?.trim()

  if (!raw) {
    if (isProduction) {
      throw new Error(`${name} is required in production`)
    }
    console.warn(
      `[env] ${name} is not set — using the local development default.`
    )
    return developmentFallback
  }

  try {
    const url = new URL(raw)
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("unsupported protocol")
    }
    return url.toString().replace(/\/+$/, "")
  } catch {
    if (isProduction) {
      throw new Error(`${name} must be a valid absolute URL in production`)
    }
    // Never print the raw value: a malformed URL may contain credentials.
    console.warn(
      `[env] ${name} is not a valid absolute URL — using the local development default.`
    )
    return developmentFallback
  }
}

export const env = Object.freeze({
  /** PizzaHub API base — must be browser-reachable and include `/api`. */
  apiBaseUrl: readPublicUrl(
    "NEXT_PUBLIC_API_BASE_URL",
    process.env.NEXT_PUBLIC_API_BASE_URL,
    "http://localhost:5000/api"
  ),
  /** Canonical public origin of this app (metadata, absolute links). */
  siteUrl: readPublicUrl(
    "NEXT_PUBLIC_SITE_URL",
    process.env.NEXT_PUBLIC_SITE_URL,
    "http://localhost:3000"
  ),
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction,
})

/** Build an absolute URL from the configured site origin. */
export function absoluteUrl(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${env.siteUrl}${normalized}`
}
