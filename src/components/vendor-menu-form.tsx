"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import { ArrowLeft, LockKeyhole, UtensilsCrossed } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/components/auth-provider"
import { EmptyState } from "@/components/empty-state"
import { ErrorState } from "@/components/error-state"
import { PageContainer } from "@/components/page-container"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { apiErrorMessage } from "@/lib/api-error"
import {
  MENU_CATEGORY_LABELS,
  MENU_CATEGORY_VALUES,
} from "@/lib/menu-categories"
import {
  useCreateVendorMenuItem,
  useUpdateVendorMenuItem,
  useVendorMenuItem,
} from "@/lib/vendor-queries"
import type { MenuItem, MenuItemCategory } from "@/types"
import { cn } from "cn"

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
const CATEGORY_OPTIONS = MENU_CATEGORY_VALUES.map((value) => ({
  value,
  label: MENU_CATEGORY_LABELS[value],
}))

type VendorMenuFormMode = "create" | "edit"

type FormValues = {
  name: string
  description: string
  category: MenuItemCategory
  price: string
  location: string
}

type FormErrors = Partial<Record<keyof FormValues | "image", string>>

const EMPTY_VALUES: FormValues = {
  name: "",
  description: "",
  category: "pizza",
  price: "",
  location: "",
}

function valuesFromItem(item: MenuItem): FormValues {
  return {
    name: item.name,
    description: item.description,
    category: item.category,
    price: String(item.price),
    location: item.location,
  }
}

function validate(
  values: FormValues,
  imageFile: File | null,
  mode: VendorMenuFormMode
): FormErrors {
  const errors: FormErrors = {}
  const name = values.name.trim()
  const description = values.description.trim()
  const location = values.location.trim()
  const priceText = values.price.trim()
  const price = Number(priceText)

  if (name.length < 3 || name.length > 100) {
    errors.name = "Name must be between 3 and 100 characters."
  }
  if (description.length < 10 || description.length > 1000) {
    errors.description = "Description must be between 10 and 1000 characters."
  }
  if (!MENU_CATEGORY_VALUES.includes(values.category)) {
    errors.category = "Choose a valid category."
  }
  if (
    priceText === "" ||
    !Number.isFinite(price) ||
    price <= 0 ||
    price > 10_000_000
  ) {
    errors.price = "Price must be greater than 0 and at most 10,000,000."
  }
  if (location.length < 3 || location.length > 200) {
    errors.location = "Location must be between 3 and 200 characters."
  }
  if (mode === "create") {
    if (!imageFile) {
      errors.image = "Choose an image to upload."
    } else if (!ALLOWED_IMAGE_TYPES.has(imageFile.type)) {
      errors.image = "Use a JPEG, PNG, or WebP image."
    } else if (imageFile.size > MAX_IMAGE_SIZE_BYTES) {
      errors.image = "Image must be 5MB or smaller."
    }
  }

  return errors
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="text-xs text-destructive">
      {message}
    </p>
  )
}

function statusVariant(
  status: MenuItem["status"]
): "success" | "pending" | "destructive" | "secondary" {
  if (status === "active") return "success"
  if (status === "pending" || status === "out_of_stock") return "pending"
  if (status === "rejected") return "destructive"
  return "secondary"
}

type VendorMenuFormProps = {
  mode: VendorMenuFormMode
  item?: MenuItem
}

function VendorMenuForm({ mode, item }: VendorMenuFormProps) {
  const router = useRouter()
  const createMutation = useCreateVendorMenuItem()
  const updateMutation = useUpdateVendorMenuItem()

  const [values, setValues] = useState<FormValues>(() =>
    item ? valuesFromItem(item) : EMPTY_VALUES
  )
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function updateValue<K extends keyof FormValues>(
    key: K,
    value: FormValues[K]
  ) {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setImageFile(file)
    setErrors((current) => ({ ...current, image: undefined }))
    setPreviewUrl(
      file && ALLOWED_IMAGE_TYPES.has(file.type)
        ? URL.createObjectURL(file)
        : null
    )
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate(values, imageFile, mode)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    createMutation.reset()
    updateMutation.reset()

    if (mode === "create") {
      if (!imageFile) return
      createMutation.mutate(
        {
          name: values.name.trim(),
          description: values.description.trim(),
          category: values.category,
          price: Number(values.price.trim()),
          location: values.location.trim(),
          image: imageFile,
        },
        {
          onSuccess: () => {
            toast.success("Menu item submitted for approval")
            router.replace("/vendor/menu")
          },
        }
      )
      return
    }

    if (item) {
      updateMutation.mutate(
        {
          id: item.id,
          input: {
            name: values.name.trim(),
            description: values.description.trim(),
            category: values.category,
            price: Number(values.price.trim()),
            location: values.location.trim(),
          },
        },
        {
          onSuccess: () => {
            toast.success("Menu item updated")
            router.replace("/vendor/menu")
          },
        }
      )
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending
  const mutationError = createMutation.error ?? updateMutation.error
  const imagePreview = previewUrl ?? item?.imageUrl ?? null
  const title = mode === "create" ? "Add a menu item" : "Edit menu item"
  const caption =
    mode === "create"
      ? "New items are submitted to PizzaHub admins for approval."
      : "Update the details customers see. Approval status is managed by admins."

  return (
    <PageContainer size="wide" className="space-y-6 py-8 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
            Workspace
          </p>
          <h1 className="font-heading text-3xl font-bold">{title}</h1>
          <p className="max-w-prose text-muted-foreground">{caption}</p>
        </div>
        <Link
          href="/vendor/menu"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "w-full sm:w-auto"
          )}
        >
          <ArrowLeft aria-hidden="true" />
          Back to menu
        </Link>
      </div>

      {mutationError ? (
        <ErrorState
          title="Couldn't save the menu item"
          description={apiErrorMessage(mutationError)}
          action={
            <Button
              variant="outline"
              onClick={() => {
                createMutation.reset()
                updateMutation.reset()
              }}
            >
              Dismiss
            </Button>
          }
        />
      ) : null}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Item details</CardTitle>
            <CardDescription>
              Fields follow the PizzaHub menu requirements.
            </CardDescription>
            {mode === "edit" && item ? (
              <Badge variant={statusVariant(item.status)}>
                {item.status.replace(/_/g, " ")}
              </Badge>
            ) : null}
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="menu-name">Name</Label>
              <Input
                id="menu-name"
                value={values.name}
                maxLength={100}
                disabled={isPending}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "menu-name-error" : undefined}
                onChange={(event) => updateValue("name", event.target.value)}
                placeholder="Margherita pizza"
              />
              <FieldError id="menu-name-error" message={errors.name} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="menu-category">Category</Label>
              <Select
                items={CATEGORY_OPTIONS}
                value={values.category}
                disabled={isPending}
                onValueChange={(value) =>
                  updateValue(
                    "category",
                    (value ?? "pizza") as MenuItemCategory
                  )
                }
              >
                <SelectTrigger
                  id="menu-category"
                  className="h-10 w-full"
                  aria-invalid={Boolean(errors.category)}
                  aria-describedby={
                    errors.category ? "menu-category-error" : undefined
                  }
                >
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError id="menu-category-error" message={errors.category} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="menu-price">Price</Label>
              <Input
                id="menu-price"
                type="number"
                min={0}
                step="any"
                inputMode="decimal"
                value={values.price}
                disabled={isPending}
                aria-invalid={Boolean(errors.price)}
                aria-describedby={errors.price ? "menu-price-error" : undefined}
                onChange={(event) => updateValue("price", event.target.value)}
                placeholder="450"
              />
              <FieldError id="menu-price-error" message={errors.price} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="menu-location">Location / outlet</Label>
              <Input
                id="menu-location"
                value={values.location}
                maxLength={200}
                disabled={isPending}
                aria-invalid={Boolean(errors.location)}
                aria-describedby={
                  errors.location ? "menu-location-error" : undefined
                }
                onChange={(event) =>
                  updateValue("location", event.target.value)
                }
                placeholder="Dhanmondi"
              />
              <FieldError id="menu-location-error" message={errors.location} />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <Label htmlFor="menu-description">Description</Label>
              <textarea
                id="menu-description"
                value={values.description}
                rows={5}
                maxLength={1000}
                disabled={isPending}
                aria-invalid={Boolean(errors.description)}
                aria-describedby={
                  errors.description ? "menu-description-error" : undefined
                }
                onChange={(event) =>
                  updateValue("description", event.target.value)
                }
                placeholder="Fresh tomato sauce, mozzarella, and basil."
                className={cn(
                  "w-full min-w-0 rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm",
                  "field-sizing-content"
                )}
              />
              <FieldError
                id="menu-description-error"
                message={errors.description}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {mode === "create" ? "Menu image" : "Current image"}
            </CardTitle>
            <CardDescription>
              {mode === "create"
                ? "JPEG, PNG, or WebP up to 5MB."
                : "Image replacement is not available in this workspace."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted sm:max-w-md">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt={
                    mode === "create"
                      ? "Selected menu item preview"
                      : (item?.name ?? "")
                  }
                  fill
                  unoptimized={Boolean(previewUrl)}
                  sizes="(min-width: 640px) 28rem, 100vw"
                  className="object-cover"
                />
              ) : (
                <span className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                  <UtensilsCrossed className="size-8" aria-hidden="true" />
                  <span className="text-sm">Preview appears here</span>
                </span>
              )}
            </div>

            {mode === "create" ? (
              <div className="flex flex-col gap-2">
                <Label htmlFor="menu-image">Upload image</Label>
                <Input
                  id="menu-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={isPending}
                  aria-invalid={Boolean(errors.image)}
                  aria-describedby={
                    errors.image ? "menu-image-error" : undefined
                  }
                  onChange={handleImageChange}
                  className="h-11 cursor-pointer pt-2"
                />
                <FieldError id="menu-image-error" message={errors.image} />
              </div>
            ) : null}
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={isPending}
              className="h-10 w-full sm:w-auto"
            >
              {isPending
                ? "Saving…"
                : mode === "create"
                  ? "Submit for approval"
                  : "Save changes"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </PageContainer>
  )
}

function VendorMenuFormSkeleton() {
  return (
    <PageContainer size="wide" className="space-y-6 py-8 sm:py-10">
      <div role="status" aria-label="Loading menu item" className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-full max-w-prose" />
        <Card>
          <CardContent className="grid gap-5 md:grid-cols-2">
            {[0, 1, 2, 3, 4].map((index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}

function VendorMenuEditor({ id }: { id: string }) {
  const { user, isPending: authIsPending } = useAuth()
  const itemQuery = useVendorMenuItem(authIsPending ? null : id)
  const item = itemQuery.data?.data.menuItem

  if (authIsPending || itemQuery.isPending) return <VendorMenuFormSkeleton />

  if (itemQuery.isError) {
    return (
      <PageContainer size="wide" className="py-8 sm:py-10">
        <ErrorState
          title="Couldn't load this menu item"
          description={apiErrorMessage(itemQuery.error)}
          action={
            <Button variant="outline" onClick={() => void itemQuery.refetch()}>
              Try again
            </Button>
          }
        />
      </PageContainer>
    )
  }

  if (!item) {
    return (
      <PageContainer size="wide" className="py-8 sm:py-10">
        <EmptyState
          icon={UtensilsCrossed}
          title="Menu item not found"
          description="It may have been deleted or the link is incorrect."
          action={
            <Link
              href="/vendor/menu"
              className={cn(buttonVariants(), "w-full sm:w-auto")}
            >
              <ArrowLeft aria-hidden="true" />
              Back to menu
            </Link>
          }
        />
      </PageContainer>
    )
  }

  if (!user || user.id !== item.vendorId) {
    return (
      <PageContainer size="wide" className="py-8 sm:py-10">
        <EmptyState
          icon={LockKeyhole}
          title="You can't edit this item"
          description="This menu item belongs to a different vendor account."
          action={
            <Link
              href="/vendor/menu"
              className={cn(buttonVariants(), "w-full sm:w-auto")}
            >
              <ArrowLeft aria-hidden="true" />
              Back to menu
            </Link>
          }
        />
      </PageContainer>
    )
  }

  return <VendorMenuForm mode="edit" item={item} />
}

export { VendorMenuEditor, VendorMenuForm, VendorMenuFormSkeleton }
