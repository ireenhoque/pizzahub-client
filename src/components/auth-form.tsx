"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"
import { dashboardPathForRole } from "@/lib/roles"

type AuthFormProps = {
  mode: "sign-in" | "sign-up"
}

function destinationForRole(role: unknown): string {
  return dashboardPathForRole(role) ?? "/"
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSignUp = mode === "sign-up"

  // One endpoint handles both Google sign-up and sign-in: Better Auth creates
  // the user on first login, and the database hook pins customer defaults.
  async function handleGoogleSignIn() {
    setError(null)
    setIsSubmitting(true)

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      })

      if (result.error) {
        setError(result.error.message ?? "Could not continue with Google.")
        setIsSubmitting(false)
      }
      // On success the browser navigates to Google; no further action here.
    } catch {
      setError("Could not continue with Google.")
      setIsSubmitting(false)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const formData = new FormData(event.currentTarget)
      const email = String(formData.get("email") ?? "").trim()
      const password = String(formData.get("password") ?? "")

      if (isSignUp) {
        const name = String(formData.get("name") ?? "").trim()
        const result = await authClient.signUp.email({ name, email, password })

        if (result.error) {
          setError(result.error.message ?? "Could not create your account.")
          return
        }

        toast.success("Account created")
        router.push("/")
        router.refresh()
        return
      }

      const result = await authClient.signIn.email({ email, password })

      if (result.error) {
        setError(result.error.message ?? "Could not sign you in.")
        return
      }

      if (result.data?.user.isBlocked) {
        await authClient.signOut()
        setError("Your account has been blocked. Contact PizzaHub support.")
        return
      }

      toast.success("Signed in")
      router.push(destinationForRole(result.data?.user.role))
      router.refresh()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-2xl">
          {isSignUp ? "Create your account" : "Welcome back"}
        </CardTitle>
        <CardDescription>
          {isSignUp
            ? "Order from local pizzerias in a few clicks."
            : "Sign in to continue to PizzaHub."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {isSignUp ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Ada Lovelace"
                required
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              minLength={isSignUp ? 8 : undefined}
              placeholder="••••••••"
              required
            />
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting
              ? isSignUp
                ? "Creating account…"
                : "Signing in…"
              : isSignUp
                ? "Create account"
                : "Sign in"}
          </Button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
        >
          Continue with Google
        </Button>
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        {isSignUp ? (
          <>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </>
        ) : (
          <>
            New to PizzaHub?{" "}
            <Link
              href="/register"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Create an account
            </Link>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
