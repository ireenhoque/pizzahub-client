// Safe environment access — every variable is read, validated, and typed
// here, once. Only NEXT_PUBLIC_* variables are used (they are inlined at
// build time and safe in the browser); server-only secrets must never take
// the NEXT_PUBLIC_ prefix. Add real values to `.env.local` (see .env.example).

function readUrl(name: string, value: string | undefined, fallback: string) {
  const raw = value?.trim()

  if (!raw) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[env] ${name} is not set — using fallback "${fallback}". ` +
          `Copy .env.example to .env.local and fill it in.`
      )
    }
    return fallback
  }

  try {
    return new URL(raw).toString().replace(/\/+$/, "")
  } catch {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[env] ${name} ("${raw}") is not a valid URL — using fallback "${fallback}".`
      )
    }
    return fallback
  }
}

export const env = Object.freeze({
  /** PizzaHub API base — matches PORT in pizzahub-server/.env */
  apiBaseUrl: readUrl(
    "NEXT_PUBLIC_API_BASE_URL",
    process.env.NEXT_PUBLIC_API_BASE_URL,
    "http://localhost:5000/api"
  ),
  /** Canonical public origin of this app (metadata, absolute links). */
  siteUrl: readUrl(
    "NEXT_PUBLIC_SITE_URL",
    process.env.NEXT_PUBLIC_SITE_URL,
    "http://localhost:3000"
  ),
  isDevelopment: process.env.NODE_ENV === "development",
})

/** Build an absolute URL from the configured site origin. */
export function absoluteUrl(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${env.siteUrl}${normalized}`
}
