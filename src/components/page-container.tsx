import { cn } from "cn"

type PageContainerProps = React.ComponentProps<"div"> & {
  /** default = storefront (max-w-6xl), wide = dashboards (max-w-7xl) */
  size?: "default" | "wide"
}

// Consistent page container — one gutter convention (`px-4 sm:px-6 lg:px-8`)
// for every route, with the two sanctioned content widths.
function PageContainer({
  className,
  size = "default",
  ...props
}: PageContainerProps) {
  return (
    <div
      data-slot="page-container"
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        size === "wide" ? "max-w-7xl" : "max-w-6xl",
        className
      )}
      {...props}
    />
  )
}

export { PageContainer, type PageContainerProps }
