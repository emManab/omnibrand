import type {
  Availability,
  Banner,
  BannerPlacement,
  BannerTheme,
  Category,
  Product,
  ProductImage,
  ProductVariant,
  PublishStatus,
  PrintOptions,
  EditorPreset,
} from "@/types";
import { mediaUrl } from "@/lib/media";
import { withPrintDefaults } from "@/lib/rules";

type Row = Record<string, unknown>;
const s = (v: unknown, d = "") => (v === null || v === undefined ? d : String(v));
const n = (v: unknown, d = 0) => (v === null || v === undefined || v === "" ? d : Number(v));
const arr = <T = Row>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

/** Columns selected for product lists (no gallery / variants — those load on the detail page). */
export const PRODUCT_LIST_COLS =
  "id,slug,sku,name,tagline,description,price,sale_price,status,is_featured,is_bestseller,is_trending,is_new," +
  "track_inventory,made_to_order,stock_quantity,low_stock_threshold,availability,editor_preset,accent,rating," +
  "review_count,print_options,primary_image_path,seo_title,seo_description,created_at,updated_at," +
  "product_categories(category_id,is_primary,category:categories(slug))";

export const PRODUCT_DETAIL_COLS =
  PRODUCT_LIST_COLS +
  ",product_images(id,path,alt,sort_order,is_primary)" +
  ",product_variants(id,product_id,sku,name,option_values,price_delta,stock_quantity,is_active,sort_order)";

export function mapImage(r: Row): ProductImage {
  return {
    id: s(r.id),
    path: s(r.path),
    url: mediaUrl(s(r.path)),
    alt: s(r.alt),
    sortOrder: n(r.sort_order),
    isPrimary: Boolean(r.is_primary),
  };
}

export function mapVariant(r: Row): ProductVariant {
  return {
    id: s(r.id),
    productId: s(r.product_id),
    sku: s(r.sku),
    name: s(r.name),
    optionValues: (r.option_values as Record<string, string>) ?? {},
    priceDelta: n(r.price_delta),
    stockQuantity: n(r.stock_quantity),
    isActive: r.is_active !== false,
    sortOrder: n(r.sort_order),
  };
}

export function mapProduct(r: Row): Product {
  const links = arr<{ category_id: string; is_primary: boolean; category: { slug: string } | null }>(
    r.product_categories,
  );
  const primary = links.find((l) => l.is_primary) ?? links[0];
  const raw = (r.print_options as Partial<PrintOptions>) ?? {};
  const opts = withPrintDefaults(raw);
  const price = n(r.price);
  const sale = r.sale_price === null || r.sale_price === undefined ? null : n(r.sale_price);
  const images = arr(r.product_images)
    .map(mapImage)
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder);
  return {
    id: s(r.id),
    slug: s(r.slug),
    sku: s(r.sku),
    name: s(r.name),
    category: primary?.category?.slug ?? "",
    categoryIds: links.map((l) => l.category_id),
    primaryCategoryId: primary?.category_id ?? null,
    tagline: s(r.tagline),
    description: s(r.description),
    fromPrice: sale ?? price,
    regularPrice: price,
    salePrice: sale,
    rating: n(r.rating),
    reviews: n(r.review_count),
    image: mediaUrl(s(r.primary_image_path)),
    images,
    accent: s(r.accent, "#EEF3FF"),
    sizes: opts.sizes,
    materials: opts.materials,
    finishes: opts.finishes,
    quantities: opts.quantities,
    printOptions: {
      sizes: raw.sizes ?? [],
      materials: raw.materials ?? [],
      finishes: raw.finishes ?? [],
      quantities: raw.quantities ?? [],
    },
    editorPreset: s(r.editor_preset, "card") as EditorPreset,
    status: s(r.status, "draft") as PublishStatus,
    featured: Boolean(r.is_featured),
    bestseller: Boolean(r.is_bestseller),
    trending: Boolean(r.is_trending),
    newArrival: Boolean(r.is_new),
    trackInventory: r.track_inventory !== false,
    madeToOrder: Boolean(r.made_to_order),
    stock: Math.max(0, n(r.stock_quantity)),
    lowStockThreshold: n(r.low_stock_threshold, 5),
    availability: s(r.availability, "in_stock") as Availability,
    variants: arr(r.product_variants).map(mapVariant).sort((a, b) => a.sortOrder - b.sortOrder),
    seoTitle: s(r.seo_title),
    seoDescription: s(r.seo_description),
    createdAt: s(r.created_at),
    updatedAt: s(r.updated_at),
  };
}

export function mapCategory(r: Row): Category {
  const count = arr<{ count: number }>(r.product_categories)[0]?.count;
  return {
    id: s(r.id),
    parentId: r.parent_id ? s(r.parent_id) : null,
    slug: s(r.slug),
    name: s(r.name),
    navLabel: s(r.nav_label) || s(r.name),
    shortDescription: s(r.short_description),
    description: s(r.description),
    imagePath: s(r.image_path),
    image: mediaUrl(s(r.image_path)),
    sortOrder: n(r.sort_order),
    isPublished: Boolean(r.is_published),
    isFeatured: Boolean(r.is_featured),
    showInNav: Boolean(r.show_in_nav),
    seoTitle: s(r.seo_title),
    seoDescription: s(r.seo_description),
    productCount: count,
    createdAt: s(r.created_at),
    updatedAt: s(r.updated_at),
  };
}

export function resolveBannerLink(r: Row): string {
  const product = r.product as { slug?: string } | null;
  const category = r.category as { slug?: string } | null;
  if (product?.slug) return `/product/${product.slug}`;
  if (category?.slug) return `/catalog?category=${category.slug}`;
  return s(r.cta_url) || "/catalog";
}

export function mapBanner(r: Row): Banner {
  const desktop = s(r.desktop_image_path);
  const mobile = s(r.mobile_image_path);
  return {
    id: s(r.id),
    placement: s(r.placement, "home_hero") as BannerPlacement,
    title: s(r.title),
    subtitle: s(r.subtitle),
    description: s(r.description),
    ctaLabel: s(r.cta_label),
    ctaUrl: s(r.cta_url),
    productId: r.product_id ? s(r.product_id) : null,
    categoryId: r.category_id ? s(r.category_id) : null,
    link: resolveBannerLink(r),
    desktopImagePath: desktop,
    mobileImagePath: mobile,
    desktopImage: mediaUrl(desktop),
    mobileImage: mediaUrl(mobile || desktop),
    videoPath: s(r.video_path),
    theme: (r.theme as BannerTheme) ?? {},
    sortOrder: n(r.sort_order),
    status: s(r.status, "draft") as PublishStatus,
    startsAt: r.starts_at ? s(r.starts_at) : null,
    endsAt: r.ends_at ? s(r.ends_at) : null,
    createdAt: s(r.created_at),
    updatedAt: s(r.updated_at),
  };
}
