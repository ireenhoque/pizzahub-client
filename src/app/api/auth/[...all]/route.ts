import { getAuth } from "@/lib/auth"

// Better Auth catch-all route: /api/auth/*.
//
// Exposes the standard endpoints the frontend and Express rely on:
//   GET  /api/auth/jwks   → RS256 public keys (pizzahub-server BETTER_AUTH_JWKS_URL)
//   GET  /api/auth/token  → short-lived RS256 JWT for the active session
//   POST /api/auth/sign-up/email, /api/auth/sign-in/email, /api/auth/sign-out
//
// The instance is created lazily, so the build never needs runtime secrets.

type RouteHandler = (request: Request) => Promise<Response>

async function handle(request: Request): Promise<Response> {
  const auth = await getAuth()
  return auth.handler(request)
}

export const GET: RouteHandler = handle
export const POST: RouteHandler = handle
export const PATCH: RouteHandler = handle
export const PUT: RouteHandler = handle
export const DELETE: RouteHandler = handle
