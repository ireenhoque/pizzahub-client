import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Create account",
}

// Placeholder — the real sign-up form is built in a later iteration.

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-3 text-center">
      <h1 className="font-heading text-3xl font-bold">Create your account</h1>
      <p className="text-sm text-muted-foreground">
        Registration is not implemented yet — the authentication UI is coming
        soon.
      </p>
    </div>
  )
}
