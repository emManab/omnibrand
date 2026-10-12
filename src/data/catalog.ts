import type { CategorySlug, Product } from "@/types";

export const categories: {
  slug: CategorySlug;
  name: string;
  short: string;
  image: string;
}[] = [
  {
    slug: "business-cards",
    name: "Business Cards",
    short: "Letterpress, silk, recycled stock",
    image:
      "/categories/business-cards.svg",
  },
  {
    slug: "apparel",
    name: "Custom T-shirts",
    short: "Tees, hoodies, polos",
    image:
      "/categories/tshirts.svg",
  },
  {
    slug: "apparel",
    name: "Hoodies & Sweatshirts",
    short: "Printed and embroidered fleece",
    image:
      "/categories/hoodies.svg",
  },
  {
    slug: "stickers",
    name: "Stickers & Labels",
    short: "Vinyl, kraft, hologram",
    image:
      "/categories/stickers.svg",
  },
  {
    slug: "apparel",
    name: "Caps & Hats",
    short: "Embroidered and printed",
    image:
      "/categories/caps.svg",
  },
  {
    slug: "marketing",
    name: "Posters & Banners",
    short: "Fine art and office",
    image:
      "/categories/posters.svg",
  },
  {
    slug: "stationery",
    name: "Office Stationery",
    short: "Letterheads, notepads",
    image:
      "/categories/stationery.svg",
  },
  {
    slug: "packaging",
    name: "Packaging & Boxes",
    short: "Mailers, boxes, tape",
    image:
      "/categories/packaging.svg",
  },
  {
    slug: "gifts",
    name: "Drinkware",
    short: "Mugs, bottles, tumblers",
    image:
      "/categories/drinkware.svg",
  },
];

export const navCategories = [
  { slug: "all", label: "All Products" },
  { slug: "business-cards", label: "Business Cards" },
  { slug: "apparel", label: "Custom Apparel" },
  { slug: "stickers", label: "Stickers & Labels" },
  { slug: "marketing", label: "Marketing Materials" },
  { slug: "packaging", label: "Packaging" },
  { slug: "banners", label: "Signs & Banners" },
  { slug: "gifts", label: "Gifts" },
] as const;

const qty = [50, 100, 250, 500, 1000, 2500];

export const products: Product[] = [
  {
    id: "bc-standard",
    slug: "standard-business-cards",
    name: "Standard Business Cards",
    category: "business-cards",
    tagline: "350gsm uncoated stock, sharp colour",
    description:
      "The workhorse card for teams that hand them out every week. Printed both sides on 350gsm uncoated stock with optional spot UV.",
    fromPrice: 499,
    rating: 4.8,
    reviews: 2140,
    image:
      "https://images.unsplash.com/photo-1623305465231-d884ce752d59?auto=format&fit=crop&w=900&q=80",
    accent: "#EEF3FF",
    sizes: [
      { id: "85x55", label: "85 × 55 mm", multiplier: 1 },
      { id: "90x50", label: "90 × 50 mm", multiplier: 1.05 },
      { id: "sq", label: "55 × 55 mm square", multiplier: 1.1 },
    ],
    materials: [
      { id: "uncoated", label: "350gsm uncoated", multiplier: 1 },
      { id: "silk", label: "400gsm silk", multiplier: 1.25 },
      { id: "cotton", label: "Cotton letterpress", multiplier: 1.8 },
    ],
    finishes: [
      { id: "none", label: "No extra finish", multiplier: 1 },
      { id: "matt", label: "Matt laminate", multiplier: 1.15 },
      { id: "spot", label: "Spot UV", multiplier: 1.35 },
    ],
    quantities: qty,
    editorPreset: "card",
    featured: true,
  },
  {
    id: "tee-crew",
    slug: "custom-t-shirts",
    name: "Custom T-shirts",
    category: "apparel",
    tagline: "180gsm combed cotton, DTG print",
    description:
      "Soft crewnecks with full-front or left-chest print. Colour-managed DTG so brand palettes stay honest across bulk runs.",
    fromPrice: 399,
    rating: 4.7,
    reviews: 1864,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    accent: "#E8F6EE",
    sizes: [
      { id: "s", label: "S", multiplier: 1 },
      { id: "m", label: "M", multiplier: 1 },
      { id: "l", label: "L", multiplier: 1 },
      { id: "xl", label: "XL", multiplier: 1.05 },
      { id: "xxl", label: "XXL", multiplier: 1.1 },
    ],
    materials: [
      { id: "cotton", label: "180gsm cotton", multiplier: 1 },
      { id: "organic", label: "Organic ringspun", multiplier: 1.2 },
      { id: "blend", label: "Tri-blend", multiplier: 1.15 },
    ],
    finishes: [
      { id: "dtg", label: "DTG print", multiplier: 1 },
      { id: "screen", label: "Screen print (bulk)", multiplier: 0.92 },
      { id: "embroidery", label: "Embroidery", multiplier: 1.4 },
    ],
    quantities: [1, 12, 25, 50, 100, 250],
    editorPreset: "apparel",
    featured: true,
    trending: true,
  },
  {
    id: "mug-ceramic",
    slug: "ceramic-mugs",
    name: "Ceramic Mugs",
    category: "gifts",
    tagline: "11oz wrap print, dishwasher safe",
    description:
      "Office mugs that survive the dishwasher. Wrap or front-only print on glazed ceramic with optional gift boxes.",
    fromPrice: 249,
    rating: 4.9,
    reviews: 980,
    image:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=80",
    accent: "#FFF4E8",
    sizes: [
      { id: "11oz", label: "11 oz", multiplier: 1 },
      { id: "15oz", label: "15 oz", multiplier: 1.2 },
    ],
    materials: [
      { id: "white", label: "White ceramic", multiplier: 1 },
      { id: "black", label: "Black ceramic", multiplier: 1.1 },
    ],
    finishes: [
      { id: "wrap", label: "Full wrap", multiplier: 1 },
      { id: "front", label: "Front print", multiplier: 0.9 },
    ],
    quantities: [1, 12, 24, 48, 96],
    editorPreset: "mug",
    featured: true,
    newArrival: true,
  },
  {
    id: "poster-a2",
    slug: "posters",
    name: "Posters",
    category: "marketing",
    tagline: "170gsm satin, indoor display",
    description:
      "Campaign posters with calibrated colour on 170gsm satin. Optional foam board mounting for events.",
    fromPrice: 199,
    rating: 4.6,
    reviews: 640,
    image:
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=900&q=80",
    accent: "#F3EEFF",
    sizes: [
      { id: "a3", label: "A3", multiplier: 1 },
      { id: "a2", label: "A2", multiplier: 1.6 },
      { id: "a1", label: "A1", multiplier: 2.4 },
    ],
    materials: [
      { id: "satin", label: "170gsm satin", multiplier: 1 },
      { id: "photo", label: "Photo gloss", multiplier: 1.2 },
    ],
    finishes: [
      { id: "none", label: "Rolled", multiplier: 1 },
      { id: "board", label: "Foam board", multiplier: 1.5 },
    ],
    quantities: [1, 5, 10, 25, 50],
    editorPreset: "banner",
    featured: true,
  },
  {
    id: "hoodie",
    slug: "hoodies",
    name: "Hoodies",
    category: "apparel",
    tagline: "320gsm fleece, print or embroidery",
    description:
      "Heavyweight pullovers for merch drops and onboarding kits. Print large across the chest or embroider a small mark.",
    fromPrice: 799,
    rating: 4.8,
    reviews: 512,
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80",
    accent: "#EEF2FF",
    sizes: [
      { id: "m", label: "M", multiplier: 1 },
      { id: "l", label: "L", multiplier: 1 },
      { id: "xl", label: "XL", multiplier: 1.08 },
    ],
    materials: [
      { id: "fleece", label: "320gsm fleece", multiplier: 1 },
      { id: "organic", label: "Organic French terry", multiplier: 1.25 },
    ],
    finishes: [
      { id: "dtg", label: "DTG print", multiplier: 1 },
      { id: "embroidery", label: "Chest embroidery", multiplier: 1.3 },
    ],
    quantities: [1, 10, 25, 50, 100],
    editorPreset: "apparel",
    featured: true,
    trending: true,
  },
  {
    id: "sticker-diecut",
    slug: "die-cut-stickers",
    name: "Die-cut Stickers",
    category: "stickers",
    tagline: "Kiss-cut vinyl, outdoor durable",
    description:
      "Cut to the shape of your mark. Permanent outdoor vinyl with optional holographic overlay.",
    fromPrice: 349,
    rating: 4.9,
    reviews: 1204,
    image:
      "https://images.unsplash.com/photo-1621252756235-7f37e5e5125e?auto=format&fit=crop&w=900&q=80",
    accent: "#EAF7FF",
    sizes: [
      { id: "50", label: "50 mm", multiplier: 1 },
      { id: "75", label: "75 mm", multiplier: 1.3 },
      { id: "100", label: "100 mm", multiplier: 1.7 },
    ],
    materials: [
      { id: "vinyl", label: "White vinyl", multiplier: 1 },
      { id: "clear", label: "Clear vinyl", multiplier: 1.15 },
      { id: "holo", label: "Holographic", multiplier: 1.45 },
    ],
    finishes: [
      { id: "gloss", label: "Gloss", multiplier: 1 },
      { id: "matt", label: "Matt", multiplier: 1.05 },
    ],
    quantities: [50, 100, 250, 500, 1000],
    editorPreset: "sticker",
    featured: true,
    trending: true,
  },
  {
    id: "flyer-a5",
    slug: "flyers",
    name: "Flyers",
    category: "marketing",
    tagline: "130gsm gloss, fast turnaround",
    description:
      "Single or double-sided flyers for events and retail. Printed on 130gsm gloss with optional thicker stock.",
    fromPrice: 599,
    rating: 4.5,
    reviews: 430,
    image:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=900&q=80",
    accent: "#FFF0F3",
    sizes: [
      { id: "a6", label: "A6", multiplier: 0.85 },
      { id: "a5", label: "A5", multiplier: 1 },
      { id: "a4", label: "A4", multiplier: 1.45 },
    ],
    materials: [
      { id: "gloss", label: "130gsm gloss", multiplier: 1 },
      { id: "silk", label: "170gsm silk", multiplier: 1.2 },
    ],
    finishes: [
      { id: "ss", label: "Single sided", multiplier: 1 },
      { id: "ds", label: "Double sided", multiplier: 1.4 },
    ],
    quantities: [100, 250, 500, 1000, 2500],
    editorPreset: "card",
    trending: true,
  },
  {
    id: "brochure",
    slug: "brochures",
    name: "Brochures",
    category: "marketing",
    tagline: "Folded 170gsm, saddle stitch optional",
    description:
      "Bi-fold and tri-fold brochures with tight registration. Add saddle-stitched booklets for longer stories.",
    fromPrice: 899,
    rating: 4.7,
    reviews: 288,
    image:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80",
    accent: "#F0F7FF",
    sizes: [
      { id: "a5", label: "A5 bi-fold", multiplier: 1 },
      { id: "a4", label: "A4 tri-fold", multiplier: 1.5 },
    ],
    materials: [
      { id: "silk", label: "170gsm silk", multiplier: 1 },
      { id: "uncoated", label: "Uncoated writing", multiplier: 1.1 },
    ],
    finishes: [
      { id: "fold", label: "Folded", multiplier: 1 },
      { id: "stitch", label: "Saddle stitch", multiplier: 1.35 },
    ],
    quantities: [50, 100, 250, 500],
    editorPreset: "card",
  },
  {
    id: "mailer",
    slug: "branded-mailers",
    name: "Branded Mailer Boxes",
    category: "packaging",
    tagline: "E-flute, inside and outside print",
    description:
      "Rigid mailers that unbox like a product launch. Print outside, inside, or both, with optional tissue wrap.",
    fromPrice: 1299,
    rating: 4.8,
    reviews: 176,
    image:
      "https://images.unsplash.com/photo-1771848194269-2e3b89b6465b?auto=format&fit=crop&w=900&q=80",
    accent: "#FFF7ED",
    sizes: [
      { id: "s", label: "Small 20×12×8 cm", multiplier: 1 },
      { id: "m", label: "Medium 30×20×10 cm", multiplier: 1.4 },
      { id: "l", label: "Large 40×30×12 cm", multiplier: 1.9 },
    ],
    materials: [
      { id: "white", label: "White e-flute", multiplier: 1 },
      { id: "kraft", label: "Kraft e-flute", multiplier: 0.95 },
    ],
    finishes: [
      { id: "out", label: "Outside print", multiplier: 1 },
      { id: "both", label: "Inside + outside", multiplier: 1.45 },
    ],
    quantities: [25, 50, 100, 250, 500],
    editorPreset: "packaging",
    trending: true,
  },
  {
    id: "tote",
    slug: "canvas-totes",
    name: "Canvas Tote Bags",
    category: "apparel",
    tagline: "12oz cotton canvas",
    description:
      "Reusable totes for events and retail. Screen print or DTG on natural or dyed canvas.",
    fromPrice: 349,
    rating: 4.6,
    reviews: 390,
    image:
      "https://images.unsplash.com/photo-1597484661643-2d57e7a3aca6?auto=format&fit=crop&w=900&q=80",
    accent: "#F3F0FF",
    sizes: [{ id: "std", label: "38 × 42 cm", multiplier: 1 }],
    materials: [
      { id: "natural", label: "Natural canvas", multiplier: 1 },
      { id: "black", label: "Black canvas", multiplier: 1.08 },
    ],
    finishes: [
      { id: "1c", label: "1 colour screen", multiplier: 1 },
      { id: "dtg", label: "Full colour DTG", multiplier: 1.35 },
    ],
    quantities: [10, 25, 50, 100, 250],
    editorPreset: "apparel",
    trending: true,
    newArrival: true,
  },
  {
    id: "cap",
    slug: "caps",
    name: "Caps",
    category: "apparel",
    tagline: "Structured 6-panel, embroidered",
    description:
      "Structured cotton caps with 3D puff or flat embroidery. Adjustable strap, retail-ready.",
    fromPrice: 449,
    rating: 4.7,
    reviews: 221,
    image:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=900&q=80",
    accent: "#EEF6FF",
    sizes: [{ id: "os", label: "One size", multiplier: 1 }],
    materials: [
      { id: "cotton", label: "Cotton twill", multiplier: 1 },
      { id: "wool", label: "Melton wool", multiplier: 1.3 },
    ],
    finishes: [
      { id: "flat", label: "Flat embroidery", multiplier: 1 },
      { id: "puff", label: "3D puff", multiplier: 1.25 },
    ],
    quantities: [12, 24, 48, 96],
    editorPreset: "apparel",
    trending: true,
  },
  {
    id: "notebook",
    slug: "branded-notebooks",
    name: "Branded Notebooks",
    category: "stationery",
    tagline: "A5 layflat, foil option",
    description:
      "Layflat A5 notebooks with printed covers and optional foil. Lined, dotted, or blank interiors.",
    fromPrice: 279,
    rating: 4.8,
    reviews: 154,
    image:
      "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=900&q=80",
    accent: "#F4F1EA",
    sizes: [
      { id: "a6", label: "A6", multiplier: 0.85 },
      { id: "a5", label: "A5", multiplier: 1 },
    ],
    materials: [
      { id: "soft", label: "Softcover", multiplier: 1 },
      { id: "hard", label: "Hardcover", multiplier: 1.4 },
    ],
    finishes: [
      { id: "print", label: "Full colour print", multiplier: 1 },
      { id: "foil", label: "Foil stamp", multiplier: 1.3 },
    ],
    quantities: [25, 50, 100, 250],
    editorPreset: "card",
    newArrival: true,
  },
  {
    id: "bottle",
    slug: "steel-bottles",
    name: "Steel Water Bottles",
    category: "gifts",
    tagline: "500ml powder-coated steel",
    description:
      "Double-wall bottles with wrap print or engraved marks. Keeps water cold through a long site visit.",
    fromPrice: 599,
    rating: 4.7,
    reviews: 198,
    image:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80",
    accent: "#E8F4FF",
    sizes: [
      { id: "500", label: "500 ml", multiplier: 1 },
      { id: "750", label: "750 ml", multiplier: 1.2 },
    ],
    materials: [
      { id: "white", label: "White powder coat", multiplier: 1 },
      { id: "navy", label: "Navy powder coat", multiplier: 1 },
    ],
    finishes: [
      { id: "print", label: "Wrap print", multiplier: 1 },
      { id: "engrave", label: "Laser engrave", multiplier: 1.2 },
    ],
    quantities: [12, 24, 48, 96],
    editorPreset: "mug",
    newArrival: true,
    trending: true,
  },
  {
    id: "banner-vinyl",
    slug: "vinyl-banners",
    name: "Vinyl Banners",
    category: "banners",
    tagline: "13oz outdoor vinyl, hemmed",
    description:
      "Weathered-tested outdoor banners with brass eyelets. Indoor fabric option for exhibitions.",
    fromPrice: 899,
    rating: 4.6,
    reviews: 142,
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80",
    accent: "#EEF2FF",
    sizes: [
      { id: "3x2", label: "3 × 2 ft", multiplier: 1 },
      { id: "6x3", label: "6 × 3 ft", multiplier: 1.8 },
      { id: "8x4", label: "8 × 4 ft", multiplier: 2.4 },
    ],
    materials: [
      { id: "vinyl", label: "13oz vinyl", multiplier: 1 },
      { id: "fabric", label: "Indoor fabric", multiplier: 1.15 },
    ],
    finishes: [
      { id: "hem", label: "Hem + eyelets", multiplier: 1 },
      { id: "pole", label: "Pole pockets", multiplier: 1.2 },
    ],
    quantities: [1, 2, 5, 10],
    editorPreset: "banner",
    trending: true,
  },
  {
    id: "lanyard",
    slug: "lanyards",
    name: "Event Lanyards",
    category: "gifts",
    tagline: "20mm polyester, dye-sub",
    description:
      "Full-colour dye-sub lanyards for conferences. Breakaway clips and badge reels available.",
    fromPrice: 199,
    rating: 4.5,
    reviews: 87,
    image:
      "https://images.unsplash.com/photo-1560439514-4e9645039924?auto=format&fit=crop&w=900&q=80",
    accent: "#F0F9FF",
    sizes: [{ id: "20", label: "20 mm width", multiplier: 1 }],
    materials: [{ id: "poly", label: "Polyester", multiplier: 1 }],
    finishes: [
      { id: "clip", label: "Trigger clip", multiplier: 1 },
      { id: "reel", label: "Badge reel", multiplier: 1.2 },
    ],
    quantities: [50, 100, 250, 500],
    editorPreset: "sticker",
    newArrival: true,
  },
  {
    id: "polo",
    slug: "polo-shirts",
    name: "Polo Shirts",
    category: "apparel",
    tagline: "Pique cotton, left-chest mark",
    description:
      "Uniform polos with embroidered or printed marks. Colour-matched collars for brand kits.",
    fromPrice: 549,
    rating: 4.6,
    reviews: 133,
    image:
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=900&q=80",
    accent: "#ECFDF3",
    sizes: [
      { id: "m", label: "M", multiplier: 1 },
      { id: "l", label: "L", multiplier: 1 },
      { id: "xl", label: "XL", multiplier: 1.06 },
    ],
    materials: [
      { id: "pique", label: "Pique cotton", multiplier: 1 },
      { id: "perf", label: "Performance knit", multiplier: 1.18 },
    ],
    finishes: [
      { id: "emb", label: "Left-chest embroidery", multiplier: 1 },
      { id: "print", label: "DTG print", multiplier: 0.95 },
    ],
    quantities: [6, 12, 25, 50, 100],
    editorPreset: "apparel",
    newArrival: true,
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string) {
  return products.find((p) => p.id === id);
}

export function searchProducts(query: string, category?: string) {
  const q = query.trim().toLowerCase();
  return products.filter((p) => {
    const catOk = !category || category === "all" || p.category === category;
    if (!q) return catOk;
    return (
      catOk &&
      (p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.category.includes(q))
    );
  });
}
