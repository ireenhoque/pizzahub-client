// Shared formatting helpers — locale-aware via Intl, no hardcoded data.

/** Mirrors `MENU_ITEM_CURRENCY` in pizzahub-server; all menu prices are BDT. */
export const MENU_CURRENCY = "BDT" as const

export function formatCurrency(
  amount: number,
  currency = "USD",
  locale = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount)
}

export function formatNumber(
  value: number,
  locale = "en-US",
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value)
}

export function formatDate(
  value: Date | string | number,
  locale = "en-US",
  options?: Intl.DateTimeFormatOptions
): string {
  const date = value instanceof Date ? value : new Date(value)
  return new Intl.DateTimeFormat(
    locale,
    options ?? { dateStyle: "medium" }
  ).format(date)
}
