/** Category slugs now come from the database, so this is just a string. */
export type CategorySlug = string;

export type PublishStatus = "draft" | "published" | "archived";
export type Availability = "in_stock" | "low_stock" | "out_of_stock" | "made_to_order";
export type EditorPreset = "card" | "apparel" | "mug" | "packaging" | "sticker" | "banner";

export type ProductOption = {
  id: string;
  label: string;
  multiplier: number;
};

/** Raw print-calculator options as stored in products.print_options (may be empty). */
export type PrintOptions = {
  sizes: ProductOption[];
  materials: ProductOption[];
  finishes: ProductOption[];
  quantities: number[];
};

export type ProductImage = {
  id: string;
  path: string;
  url: string;
  alt: string;
  sortOrder: number;
  isPrimary: boolean;
};

export type ProductVariant = {
  id: string;
  productId: string;
  sku: string;
  name: string;
  optionValues: Record<string, string>;
  priceDelta: number;
  stockQuantity: number;
  isActive: boolean;
  sortOrder: number;
};

export type Product = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  /** Slug of the primary category ("" when uncategorised). */
  category: CategorySlug;
  categoryIds: string[];
  primaryCategoryId: string | null;
  tagline: string;
  description: string;
  /** Effective "from" price: the sale price when set, otherwise the regular price. */
  fromPrice: number;
  regularPrice: number;
  salePrice: number | null;
  rating: number;
  reviews: number;
  /** Resolved public URL of the primary image ("" when none). */
  image: string;
  images: ProductImage[];
  accent: string;
  /** Calculator options with safe defaults applied (never empty). */
  sizes: ProductOption[];
  materials: ProductOption[];
  finishes: ProductOption[];
  quantities: number[];
  printOptions: PrintOptions;
  editorPreset: EditorPreset;
  status: PublishStatus;
  featured?: boolean;
  bestseller?: boolean;
  trending?: boolean;
  newArrival?: boolean;
  trackInventory: boolean;
  madeToOrder: boolean;
  stock: number;
  lowStockThreshold: number;
  availability: Availability;
  variants: ProductVariant[];
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  parentId: string | null;
  slug: string;
  name: string;
  navLabel: string;
  shortDescription: string;
  description: string;
  imagePath: string;
  image: string;
  sortOrder: number;
  isPublished: boolean;
  isFeatured: boolean;
  showInNav: boolean;
  seoTitle: string;
  seoDescription: string;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
};

export type BannerPlacement = "home_hero" | "home_promo_top" | "home_promo_bottom";

export type BannerTheme = {
  gradient?: string;
  tone?: string;
  dark?: boolean;
  code?: string;
  validUntil?: string;
  watermark?: string;
  ctas?: { label: string; to: string }[];
};

export type Banner = {
  id: string;
  placement: BannerPlacement;
  title: string;
  subtitle: string;
  description: string;
  ctaLabel: string;
  ctaUrl: string;
  productId: string | null;
  categoryId: string | null;
  /** Resolved destination (product / category / custom url). */
  link: string;
  desktopImagePath: string;
  mobileImagePath: string;
  desktopImage: string;
  mobileImage: string;
  videoPath: string;
  theme: BannerTheme;
  sortOrder: number;
  status: PublishStatus;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InventoryMovement = {
  id: number;
  productId: string;
  productName: string;
  productSku: string;
  variantId: string | null;
  delta: number;
  quantityAfter: number;
  reason: string;
  note: string;
  createdAt: string;
};

export type DashboardStats = {
  activeProducts: number;
  draftProducts: number;
  archivedProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  madeToOrder: number;
  categories: number;
  publishedCategories: number;
  ordersTotal: number;
  orders30d: number;
  revenue30d: number;
};

export type SiteSettings = {
  store: { name: string; tagline: string; supportEmail: string; supportPhone: string };
  announcement: { enabled: boolean; text: string; code: string; validUntil: string; linkTo: string };
  shipping: { freeThreshold: number; flatFee: number };
  social: { instagram: string; linkedin: string; youtube: string };
};

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  image: string;
  quantity: number;
  size: string;
  material: string;
  finish: string;
  unitPrice: number;
  lineTotal: number;
  variantId?: string;
  variantLabel?: string;
  designDataUrl?: string;
  designJson?: string;
};

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "artwork_review"
  | "approved"
  | "in_production"
  | "shipped"
  | "delivered"
  | "cancelled";

export type Order = {
  id: string;
  userId: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
};

export type Profile = {
  id: string;
  email: string;
  fullName: string;
  role: "customer" | "admin";
};
