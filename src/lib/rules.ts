import type { Availability, Banner, PrintOptions } from "@/types";

// ---------------------------------------------------------------------------
// Inventory rules (mirrors the generated `products.availability` column in SQL)
// ---------------------------------------------------------------------------
export function availabilityOf(p: {
  madeToOrder: boolean;
  trackInventory: boolean;
  stock: number;
  lowStockThreshold: number;
}): Availability {
  if (p.madeToOrder) return "made_to_order";
  if (!p.trackInventory) return "in_stock";
  if (p.stock <= 0) return "out_of_stock";
  if (p.stock <= p.lowStockThreshold) return "low_stock";
  return "in_stock";
}

/** Out-of-stock products can't be bought; made-to-order never is blocked by zero stock. */
export function isPurchasable(availability: Availability): boolean {
  return availability !== "out_of_stock";
}

export function availabilityLabel(availability: Availability, stock?: number): string {
  switch (availability) {
    case "out_of_stock":
      return "Out of stock";
    case "low_stock":
      return stock && stock > 0 ? `Only ${stock} left` : "Low stock";
    case "made_to_order":
      return "Made to order";
    default:
      return "In stock";
  }
}

// ---------------------------------------------------------------------------
// Slugs / validation
// ---------------------------------------------------------------------------
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export type FieldErrors<T extends string = string> = Partial<Record<T, string>>;

export type ProductFormValues = {
  name: string;
  slug: string;
  sku: string;
  price: string;
  salePrice: string;
  stock: string;
  lowStockThreshold: string;
  rating: string;
  seoTitle: string;
  seoDescription: string;
  trackInventory: boolean;
  madeToOrder: boolean;
  primaryCategoryId: string;
  hasVariants: boolean;
};

export function validateProduct(v: ProductFormValues): FieldErrors<keyof ProductFormValues> {
  const e: FieldErrors<keyof ProductFormValues> = {};
  if (!v.name.trim()) e.name = "Name is required.";
  else if (v.name.trim().length > 140) e.name = "Name must be 140 characters or fewer.";

  if (!v.slug.trim()) e.slug = "URL slug is required.";
  else if (!SLUG_RE.test(v.slug)) e.slug = "Use lowercase letters, numbers and single hyphens only.";

  if (v.sku.trim().length > 60) e.sku = "SKU must be 60 characters or fewer.";

  const price = Number(v.price);
  if (v.price.trim() === "" || !Number.isFinite(price)) e.price = "Enter a valid price.";
  else if (price < 0) e.price = "Price cannot be negative.";
  else if (price > 10_000_000) e.price = "Price is unrealistically large.";

  if (v.salePrice.trim() !== "") {
    const sale = Number(v.salePrice);
    if (!Number.isFinite(sale) || sale < 0) e.salePrice = "Enter a valid discounted price.";
    else if (Number.isFinite(price) && sale >= price) e.salePrice = "Must be lower than the regular price.";
  }

  if (v.trackInventory && !v.hasVariants) {
    const stock = Number(v.stock);
    if (v.stock.trim() === "" || !Number.isInteger(stock)) e.stock = "Stock must be a whole number.";
    else if (stock < 0) e.stock = "Stock cannot be negative.";
  }
  const thr = Number(v.lowStockThreshold);
  if (v.lowStockThreshold.trim() === "" || !Number.isInteger(thr) || thr < 0) {
    e.lowStockThreshold = "Threshold must be a whole number of 0 or more.";
  }

  if (v.rating.trim() !== "") {
    const r = Number(v.rating);
    if (!Number.isFinite(r) || r < 0 || r > 5) e.rating = "Rating must be between 0 and 5.";
  }
  if (v.seoTitle.length > 70) e.seoTitle = "Keep the SEO title under 70 characters.";
  if (v.seoDescription.length > 170) e.seoDescription = "Keep the SEO description under 170 characters.";
  return e;
}

export type CategoryFormValues = { name: string; slug: string; parentId: string; selfId?: string };

export function validateCategory(v: CategoryFormValues): FieldErrors<keyof CategoryFormValues> {
  const e: FieldErrors<keyof CategoryFormValues> = {};
  if (!v.name.trim()) e.name = "Name is required.";
  if (!v.slug.trim()) e.slug = "URL slug is required.";
  else if (!SLUG_RE.test(v.slug)) e.slug = "Use lowercase letters, numbers and single hyphens only.";
  if (v.selfId && v.parentId === v.selfId) e.parentId = "A category can't be its own parent.";
  return e;
}

export type BannerFormValues = {
  title: string;
  ctaUrl: string;
  startsAt: string;
  endsAt: string;
};

export function validateBanner(v: BannerFormValues): FieldErrors<keyof BannerFormValues> {
  const e: FieldErrors<keyof BannerFormValues> = {};
  if (!v.title.trim()) e.title = "Title is required.";
  if (v.ctaUrl.trim() && !/^(\/|https?:\/\/)/i.test(v.ctaUrl.trim())) {
    e.ctaUrl = "Use a site path like /catalog or a full https:// URL.";
  }
  if (v.startsAt && v.endsAt && new Date(v.endsAt) <= new Date(v.startsAt)) {
    e.endsAt = "End must be after the start.";
  }
  return e;
}

// ---------------------------------------------------------------------------
// Banner schedule + link resolution
// ---------------------------------------------------------------------------
export function bannerIsLive(
  b: Pick<Banner, "status" | "startsAt" | "endsAt">,
  now: Date = new Date(),
): boolean {
  if (b.status !== "published") return false;
  if (b.startsAt && new Date(b.startsAt) > now) return false;
  if (b.endsAt && new Date(b.endsAt) <= now) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Print options defaults
// ---------------------------------------------------------------------------
export function withPrintDefaults(raw: Partial<PrintOptions> | null | undefined) {
  const std = [{ id: "standard", label: "Standard", multiplier: 1 }];
  const pick = <T,>(v: T[] | undefined, fallback: T[]) => (Array.isArray(v) && v.length ? v : fallback);
  return {
    sizes: pick(raw?.sizes, std),
    materials: pick(raw?.materials, std),
    finishes: pick(raw?.finishes, std),
    quantities: pick(raw?.quantities, [1]),
  };
}

// ---------------------------------------------------------------------------
// Image upload validation (client-side; the bucket also enforces size + MIME)
// ---------------------------------------------------------------------------
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export function validateImageFile(
  file: { type: string; size: number; name: string },
  maxMb = 5,
): string | null {
  if (!IMAGE_TYPES.includes(file.type)) {
    return `${file.name}: only JPG, PNG, WebP or AVIF images are allowed.`;
  }
  if (file.size > maxMb * 1024 * 1024) {
    return `${file.name}: image is larger than ${maxMb} MB.`;
  }
  if (file.size === 0) return `${file.name}: the file is empty.`;
  return null;
}

// ---------------------------------------------------------------------------
// Category tree helpers
// ---------------------------------------------------------------------------
type TreeCat = { id: string; parentId: string | null; slug: string };

/** The category (by slug) plus every descendant id — used so "Apparel" also lists its sub-categories. */
export function categoryAndDescendantIds(categories: TreeCat[], slug: string): string[] {
  const root = categories.find((c) => c.slug === slug);
  if (!root) return [];
  const ids = new Set<string>([root.id]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const c of categories) {
      if (c.parentId && ids.has(c.parentId) && !ids.has(c.id)) {
        ids.add(c.id);
        grew = true;
      }
    }
  }
  return [...ids];
}

/** True if making `parentId` the parent of `id` would create a cycle. */
export function wouldCreateCycle(categories: TreeCat[], id: string, parentId: string | null): boolean {
  let cursor = parentId;
  const seen = new Set<string>();
  while (cursor) {
    if (cursor === id) return true;
    if (seen.has(cursor)) return true;
    seen.add(cursor);
    cursor = categories.find((c) => c.id === cursor)?.parentId ?? null;
  }
  return false;
}
