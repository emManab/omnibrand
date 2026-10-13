const photo = (id: string, width = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

/**
 * Keep homepage/category photography in one place.
 * Category thumbnails are intentionally separate from promotional banner images,
 * so changing a tile never unintentionally changes a banner.
 */
export const categoryImages = {
  businessCards: photo("photo-1623305465231-d884ce752d59", 600),
  tshirts: photo("photo-1521572163474-6864f9cf17ab", 600),
  hoodies: photo("photo-1556821840-3a63f95609a7", 600),
  stickers: photo("photo-1611532736597-de2d4265fba3", 600),
  caps: photo("photo-1588850561407-ed78c282e89b", 600),
  posters: photo("photo-1586281380349-632531db7ed4", 600),
  stationery: photo("photo-1517842645767-c639042777db", 600),
  packaging: photo("photo-1607082349566-187342175e2f", 600),
  drinkware: photo("photo-1602143407151-7111542de6e8", 600),
} as const;

export const storefrontImages = {
  hero: {
    hoodie: photo("photo-1620799140188-3b2a02fd9a77", 900),
    bottle: photo("photo-1602143407151-7111542de6e8", 500),
    cap: photo("photo-1588850561407-ed78c282e89b", 500),
    tote: photo("photo-1597484661643-2d57e7a3aca6", 500),
  },
  promos: {
    businessCards: "/images/calcuttapress-business-cards.svg",
    customApparel: "/images/calcuttapress-custom-apparel.svg",
    stickers: photo("photo-1611532736597-de2d4265fba3", 900),
    packaging: photo("photo-1607082349566-187342175e2f", 900),
  },
} as const;
