import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { jwt } from "better-auth/plugins"
import { MongoClient } from "mongodb"

import { USER_ROLES } from "@/types"

// Server-only Better Auth configuration.
//
// This module owns the `users` collection in the existing PizzaHub database.
// Express never creates or updates users; it only reads `role` and `isBlocked`
// from MongoDB on every protected request (see pizzahub-server
// `src/app/db/collections.ts` and `src/app/auth/require-auth.ts`).
//
// Initialization is lazy on purpose: `next build` must succeed without runtime
// secrets, while the first auth request fails with a clear message if a
// required variable is missing.

type AuthGlobal = typeof globalThis & {
  /** Reused across HMR reloads so dev never opens multiple Mongo clients. */
  __pizzahubMongoClient?: MongoClient
}

const authGlobal = globalThis as AuthGlobal

function requireEnv(name: string): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(
      `${name} is not set. Add it to .env.local (see .env.example).`
    )
  }

  return value
}

function getMongoClient(): MongoClient {
  authGlobal.__pizzahubMongoClient ??= new MongoClient(
    requireEnv("MONGODB_URI")
  )
  return authGlobal.__pizzahubMongoClient
}

async function createAuth() {
  const client = getMongoClient()
  await client.connect()

  const db = client.db(requireEnv("DB_NAME"))

  // JWT issuer/audience must match pizzahub-server exactly (no trailing slash).
  const baseURL = requireEnv("BETTER_AUTH_URL")
  const issuer = requireEnv("JWT_ISSUER")
  const audience = requireEnv("JWT_AUDIENCE")
  const secret = requireEnv("BETTER_AUTH_SECRET")

  return betterAuth({
    appName: "PizzaHub",
    baseURL,
    secret,
    database: mongodbAdapter(db, { client }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
    },
    // Official Better Auth Google provider. Credentials stay server-side; the
    // callback URL is derived from baseURL:
    //   local: http://localhost:3000/api/auth/callback/google
    socialProviders: {
      google: {
        clientId: requireEnv("GOOGLE_CLIENT_ID"),
        clientSecret: requireEnv("GOOGLE_CLIENT_SECRET"),
      },
    },
    user: {
      // Better Auth's default model is `user`; PizzaHub's Express API reads `users`.
      modelName: "users",
      additionalFields: {
        // Server-owned role. `input: false` strips it from every client-supplied
        // body (sign-up and update-user), and the create hook pins the default.
        role: {
          type: [...USER_ROLES],
          required: true,
          defaultValue: "customer",
          input: false,
          returned: true,
        },
        // Server-owned block flag. Toggled only by trusted administrative code.
        isBlocked: {
          type: "boolean",
          required: true,
          defaultValue: false,
          input: false,
          returned: true,
        },
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => ({
            // Public registration always creates customers; role escalation is
            // impossible through Better Auth endpoints.
            data: { ...user, role: "customer", isBlocked: false },
          }),
        },
        update: {
          before: async (user) => {
            // Never let a self-service update change server-owned fields. Role
            // and block status are provisioned by controlled admin processes.
            const safe: Record<string, unknown> = { ...user }
            delete safe.role
            delete safe.isBlocked
            return { data: safe }
          },
        },
      },
    },
    plugins: [
      jwt({
        jwks: {
          // Express pins `algorithms: ["RS256"]`; keep the key explicitly RSA.
          keyPairConfig: { alg: "RS256", modulusLength: 2048 },
        },
        jwt: {
          issuer,
          audience,
          expirationTime: "15m",
          // The Express API trusts identity claims only; role/block status is
          // always re-read from MongoDB, so it is deliberately not in the token.
          definePayload: ({ user }) => ({
            email: typeof user.email === "string" ? user.email : undefined,
            email_verified: user.emailVerified === true,
          }),
        },
      }),
    ],
  })
}

type Auth = Awaited<ReturnType<typeof createAuth>>

let authPromise: Promise<Auth> | undefined

/**
 * Returns the singleton Better Auth instance, creating it on first use.
 *
 * Route handlers must `await getAuth()` per request; other server code can use
 * `auth.api` from the resolved instance.
 */
export function getAuth(): Promise<Auth> {
  authPromise ??= createAuth()
  return authPromise
}
