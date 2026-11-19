import { TriangleAlert, type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "cn"

type ErrorStateProps = {
  icon?: LucideIcon
  title?: string
  description?: string
  /** Optional recovery slot, e.g. a retry <Button>. */
  action?: ReactNode
  className?: string
}

// Error state — destructive-tinted chip and copy; role="alert" so the failure
// is announced as soon as it renders.
function ErrorState({
  icon: Icon = TriangleAlert,
  title = "Something went wrong",
  description,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive"
      >
        <Icon className="size-5" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="font-heading text-base font-semibold">{title}</p>
        {description ? (
          <p className="max-w-prose text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="mt-1 flex justify-center">{action}</div> : null}
    </div>
  )
}

export { ErrorState, type ErrorStateProps }
