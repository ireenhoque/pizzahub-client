// Next.js attaches a `digest` hash to errors forwarded to route error
// boundaries (match it against server logs to find the original error).
// Augment Error so `error.digest` is typed everywhere.

declare global {
  interface Error {
    digest?: string
  }
}

export {}
