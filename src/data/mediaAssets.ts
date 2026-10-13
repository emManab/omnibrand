import { categoryImages, storefrontImages } from "./storefrontImages";

/**
 * Media Registry for Calcuttapress
 *
 * Supports both high-res fallback images and real video loops.
 * Place video files into `public/assets/videos/` or `public/assets/categories/` / `public/assets/banners/`.
 * If a video file is present, it will play smoothly (muted, auto-looping).
 * If the file is not yet added, it automatically renders the photography fallback!
 */

export interface MediaItem {
  image: string;
  video?: string;
  poster?: string;
  title?: string;
}

// Category video & image registry
export const categoryMedia: Record<string, MediaItem> = {
  "visiting-cards": {
    image: categoryImages.businessCards,
    video: "/assets/videos/categories/visiting-cards.mp4",
  },
  "polo-t-shirts": {
    image: categoryImages.poloShirts,
    video: "/assets/videos/categories/polo-t-shirts.mp4",
  },
  "dress-shirts": {
    image: categoryImages.dressShirts,
    video: "/assets/videos/categories/dress-shirts.mp4",
  },
  "t-shirts": {
    image: categoryImages.tshirts,
    video: "/assets/videos/categories/t-shirts.mp4",
  },
  "winter-wear": {
    image: categoryImages.winterWear,
    video: "/assets/videos/categories/winter-wear.mp4",
  },
  "stamps-ink": {
    image: categoryImages.stamps,
    video: "/assets/videos/categories/stamps-ink.mp4",
  },
  "signs-posters": {
    image: categoryImages.posters,
    video: "/assets/videos/categories/signs-posters.mp4",
  },
  "marketing-materials": {
    image: categoryImages.marketing,
    video: "/assets/videos/categories/marketing-materials.mp4",
  },
  "labels-stickers": {
    image: categoryImages.stickers,
    video: "/assets/videos/categories/labels-stickers.mp4",
  },
  "packaging": {
    image: categoryImages.packaging,
    video: "/assets/videos/categories/packaging.mp4",
  },
  "stationery": {
    image: categoryImages.stationery,
    video: "/assets/videos/categories/stationery.mp4",
  },
  "photo-gifts": {
    image: categoryImages.photoGifts,
    video: "/assets/videos/categories/photo-gifts.mp4",
  },
};

// Promotional Banner media registry
export const promoMedia = {
  businessCards: {
    image: storefrontImages.promos.businessCards,
    video: "/assets/videos/banners/promo-business-cards.mp4",
  },
  customApparel: {
    image: storefrontImages.promos.customApparel,
    video: "/assets/videos/banners/promo-apparel.mp4",
  },
  stickers: {
    image: storefrontImages.promos.stickers,
    video: "/assets/videos/banners/promo-stickers.mp4",
  },
  packaging: {
    image: storefrontImages.promos.packaging,
    video: "/assets/videos/banners/promo-packaging.mp4",
  },
};

// Hero Offers Configuration (Vistaprint-style offer slides)
export interface HeroOfferSlide {
  id: string;
  eyebrow: string;
  headline: string;
  code: string;
  validUntil: string;
  footerText: string;
  watermarkText: string;
  gradient: string;
  textColor: string;
  accentBg: string;
  videoSrc?: string;
  ctas: {
    label: string;
    to: string;
    primary?: boolean;
  }[];
}

export const heroOffers: HeroOfferSlide[] = [
  {
    id: "festival-savings",
    eyebrow: "Festival Savings: Buy More, Save More",
    headline: "₹300 off orders ₹2,499+ | ₹150 off orders ₹1,499+",
    code: "BMSM",
    validUntil: "Ends Oct. 20",
    footerText: "Whatever your business needs this festive season, enjoy savings across the site.",
    watermarkText: "BUY MORE, SAVE MORE",
    gradient: "from-[#297b8a] via-[#74876b] to-[#e48332]",
    textColor: "#111827",
    accentBg: "#faf9f5",
    videoSrc: "/assets/videos/hero-festival-savings.mp4",
    ctas: [
      { label: "Visiting Cards", to: "/catalog?category=business-cards", primary: true },
      { label: "Business Essentials", to: "/catalog?category=marketing" },
      { label: "Winterwear", to: "/catalog?category=apparel" },
    ],
  },
  {
    id: "new-customer",
    eyebrow: "First Order Special",
    headline: "Flat 20% Off Your First Custom Print Order",
    code: "WELCOME20",
    validUntil: "Limited Time Offer",
    footerText: "Premium cardstock, sharp color reproduction, and express doorstep delivery across India.",
    watermarkText: "PRINT WITH PRIDE",
    gradient: "from-[#1d3557] via-[#2a6f97] to-[#468faf]",
    textColor: "#111827",
    accentBg: "#f8f9fa",
    videoSrc: "/assets/videos/hero-welcome.mp4",
    ctas: [
      { label: "Standard Cards", to: "/catalog?category=business-cards", primary: true },
      { label: "Stickers & Labels", to: "/catalog?category=stickers" },
      { label: "Branded Boxes", to: "/catalog?category=packaging" },
    ],
  },
  {
    id: "winterwear-fest",
    eyebrow: "Team & Corporate Special",
    headline: "Save Up to 35% on Custom Hoodies & Winterwear",
    code: "WINTER35",
    validUntil: "Ends Oct. 25",
    footerText: "Outfit your team with warm fleece hoodies, premium embroidery, and custom screen prints.",
    watermarkText: "WEAR YOUR BRAND",
    gradient: "from-[#3c1361] via-[#522258] to-[#b83b5e]",
    textColor: "#111827",
    accentBg: "#fcfaf8",
    videoSrc: "/assets/videos/hero-winterwear.mp4",
    ctas: [
      { label: "Custom Hoodies", to: "/catalog?q=hoodie", primary: true },
      { label: "Polo T-shirts", to: "/catalog?q=polo" },
      { label: "Caps & Beanies", to: "/catalog?category=apparel" },
    ],
  },
];
