import { ApiError } from "@/lib/api-client"

// One place to turn API failures into user-facing copy. Zod details take
// priority over the generic envelope message so validation errors are actionable.
export function apiErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return error instanceof Error ? error.message : "Something went wrong."
  }

  const details = error.body?.details
  if (details?.length) {
    return details
      .map((detail) => `${detail.field}: ${detail.message}`)
      .join(" · ")
  }

  const fieldErrors = error.body?.errors
  if (fieldErrors) {
    const messages = Object.entries(fieldErrors).flatMap(([field, issues]) =>
      issues.map((issue) => `${field}: ${issue}`)
    )
    if (messages.length) return messages.join(" · ")
  }

  return error.message
}
