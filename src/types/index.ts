export type CategorySlug =
  | "business-cards"
  | "apparel"
  | "stickers"
  | "marketing"
  | "packaging"
  | "banners"
  | "gifts"
  | "stationery";

export type ProductOption = {
  id: string;
  label: string;
  multiplier: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: CategorySlug;
  tagline: string;
  description: string;
  fromPrice: number;
  rating: number;
  reviews: number;
  image: string;
  accent: string;
  sizes: ProductOption[];
  materials: ProductOption[];
  finishes: ProductOption[];
  quantities: number[];
  editorPreset: "card" | "apparel" | "mug" | "packaging" | "sticker" | "banner";
  featured?: boolean;
  trending?: boolean;
  newArrival?: boolean;
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
