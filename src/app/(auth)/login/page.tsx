import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign in",
}

// Placeholder — the real sign-in form is built in a later iteration.

export default function SignInPage() {
  return (
    <div className="flex flex-col gap-3 text-center">
      <h1 className="font-heading text-3xl font-bold">Welcome back</h1>
      <p className="text-sm text-muted-foreground">
        Sign-in is not implemented yet — the authentication UI is coming soon.
      </p>
    </div>
  )
}
