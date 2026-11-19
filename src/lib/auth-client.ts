"use client"

import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields, jwtClient } from "better-auth/client/plugins"

import { USER_ROLES } from "@/types"

// Browser auth client. Defaults to the same-origin `/api/auth` base URL, so
// session cookies stay first-party and no CORS is involved.
//
// `jwtClient()` exposes `authClient.token()` for the short-lived RS256 JWT.
// `inferAdditionalFields` mirrors the server's server-owned fields so session
// reads are typed without importing the server-only auth module.
export const authClient = createAuthClient({
  plugins: [
    jwtClient(),
    inferAdditionalFields({
      user: {
        role: {
          type: [...USER_ROLES],
          required: true,
          defaultValue: "customer",
          input: false,
          returned: true,
        },
        isBlocked: {
          type: "boolean",
          required: true,
          defaultValue: false,
          input: false,
          returned: true,
        },
      },
    }),
  ],
})
