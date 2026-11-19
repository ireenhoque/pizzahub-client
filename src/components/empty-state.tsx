import { Inbox, type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "cn"

type EmptyStateProps = {
  icon?: LucideIcon
  title: string
  description?: string
  /** Optional call-to-action slot, e.g. a <Button>. */
  action?: ReactNode
  className?: string
}

// Empty state — muted icon chip + heading + supporting copy + optional action.
// role="status" so assistive tech announces the state without interrupting.
function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card px-6 py-12 text-center",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground"
      >
        <Icon className="size-5" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="font-heading text-base font-semibold">{title}</p>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="mt-1 flex justify-center">{action}</div> : null}
    </div>
  )
}

export { EmptyState, type EmptyStateProps }
