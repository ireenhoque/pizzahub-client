"use client"

// Last-resort boundary for errors in the root layout itself. It replaces the
// root layout, so it renders its own <html>/<body> and inlines the PizzaHub
// palette — globals.css and next/font are unavailable here.
export default function GlobalError({
  error,
  reset,
}: {
  error: unknown
  reset?: () => void
}) {
  const digest = error instanceof Error ? error.digest : undefined

  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          margin: 0,
          display: "grid",
          placeItems: "center",
          padding: "1.5rem",
          background: "#FFF8EF",
          color: "#24211F",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <title>PizzaHub — Unexpected error</title>
        <div style={{ maxWidth: "28rem", textAlign: "center" }}>
          <p
            style={{
              margin: 0,
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#E65A32",
            }}
          >
            PizzaHub
          </p>
          <h1
            style={{ margin: "0.5rem 0", fontSize: "1.75rem", fontWeight: 800 }}
          >
            Something went wrong
          </h1>
          <p style={{ margin: 0, fontSize: "0.95rem", color: "#6E635A" }}>
            The app hit an unexpected error while loading. Reloading usually
            fixes it.
          </p>
          {reset ? (
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: "1.5rem",
                padding: "0.6rem 1.25rem",
                border: 0,
                borderRadius: "0.5rem",
                background: "#E65A32",
                color: "#FFF8EF",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          ) : null}
          {digest ? (
            <p
              style={{
                marginTop: "1rem",
                fontSize: "0.7rem",
                color: "#6E635A",
              }}
            >
              Error reference: {digest}
            </p>
          ) : null}
        </div>
      </body>
    </html>
  )
}
