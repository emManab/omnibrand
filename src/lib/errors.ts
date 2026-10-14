/** Turns Supabase / Postgres / RPC errors into messages an admin or shopper can act on. */

export class NotConfiguredError extends Error {
  constructor() {
    super(
      "The store database is not connected. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env and restart.",
    );
    this.name = "NotConfiguredError";
  }
}

type PgLike = { code?: string; message?: string; details?: string; hint?: string };

const CONSTRAINTS: Record<string, string> = {
  products_slug_key: "That URL slug is already used by another product.",
  products_sku_key: "That SKU is already used by another product.",
  product_variants_sku_key: "A variant SKU is already in use.",
  categories_slug_key: "That URL slug is already used by another category.",
  products_sale_price_check: "The discounted price must be lower than the regular price.",
  products_price_check: "Price cannot be negative.",
  products_stock_quantity_check: "Stock cannot be negative.",
  banners_schedule_order: "The banner end date must be after its start date.",
};

export function friendlyError(error: unknown): string {
  if (error instanceof NotConfiguredError) return error.message;
  const e = (error ?? {}) as PgLike;
  const message = String(e.message ?? (error instanceof Error ? error.message : error) ?? "");

  // Our own RPC error codes ("code:detail")
  const [code, detail] = message.split(/:(.*)/s);
  switch (code) {
    case "not_authorized":
      return "You don't have permission to do that.";
    case "negative_stock":
      return "Stock cannot go below zero.";
    case "reason_required":
      return "Please enter a reason for this stock change.";
    case "variant_required":
      return detail
        ? `Choose a variant for ${detail.trim()} — its stock is tracked per variant.`
        : "Choose a variant — stock is tracked per variant for this product.";
    case "category_has_products":
      return `This category still has ${detail?.trim() ?? "some"} product(s). Reassign them to another category first.`;
    case "category_has_children":
      return "This category has sub-categories. Move or delete them first.";
    case "insufficient_stock":
      return `Sorry, ${detail?.trim() || "an item"} just sold out or doesn't have enough stock for your quantity.`;
    case "product_unavailable":
      return `${detail?.trim() || "An item"} is no longer available.`;
    case "variant_unavailable":
      return `The selected option for ${detail?.trim() || "an item"} is no longer available.`;
    case "empty_order":
      return "Your cart is empty.";
    default:
  }

  if (e.code === "23505") {
    const match = Object.keys(CONSTRAINTS).find((c) => message.includes(c) || e.details?.includes(c));
    return match ? CONSTRAINTS[match] : "That value is already in use.";
  }
  if (e.code === "23514") {
    const match = Object.keys(CONSTRAINTS).find((c) => message.includes(c));
    return match ? CONSTRAINTS[match] : "One of the values is out of the allowed range.";
  }
  if (e.code === "23503") return "That record is still in use elsewhere and can't be removed.";
  if (e.code === "42501" || /row-level security|permission denied/i.test(message)) {
    return "You don't have permission to do that. Sign in with an admin account.";
  }
  if (/Failed to fetch|NetworkError|network/i.test(message)) {
    return "Can't reach the server. Check your connection and try again.";
  }
  if (/JWT expired|invalid.*token/i.test(message)) return "Your session expired. Please sign in again.";
  return message || "Something went wrong. Please try again.";
}
