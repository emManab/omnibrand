import { useEffect, useState } from "react";

type ProductImageProps = {
  src: string;
  alt: string;
  className?: string;
  accent?: string;
};

const fallbackPhotos = {
  cards: "https://images.unsplash.com/photo-1623305465231-d884ce752d59?auto=format&fit=crop&w=900&q=85",
  apparel: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",
  hoodie: "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?auto=format&fit=crop&w=900&q=85",
  stickers: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&w=900&q=85",
  packaging: "https://images.unsplash.com/photo-1771848194269-2e3b89b6465b?auto=format&fit=crop&w=900&q=85",
  drinkware: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=85",
  stationery: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=900&q=85",
  general: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=900&q=85",
};

function getFallback(alt: string) {
  const label = alt.toLowerCase();
  if (/business card|card stock/.test(label)) return fallbackPhotos.cards;
  if (/hoodie|sweatshirt/.test(label)) return fallbackPhotos.hoodie;
  if (/shirt|polo|apparel|cap|hat|tote|bag/.test(label)) return fallbackPhotos.apparel;
  if (/sticker|label/.test(label)) return fallbackPhotos.stickers;
  if (/packag|box|mailer/.test(label)) return fallbackPhotos.packaging;
  if (/bottle|drinkware|mug|tumbler/.test(label)) return fallbackPhotos.drinkware;
  if (/notebook|stationery|calendar|paper|poster|flyer|print/.test(label)) return fallbackPhotos.stationery;
  return fallbackPhotos.general;
}

/** Keep product layouts stable and retry failed remote photography with a matching image. */
export function ProductImage({ src, alt, className = "", accent = "#EEF3FF" }: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const fallback = getFallback(alt);

  useEffect(() => {
    setFailed(false);
    setUsingFallback(false);
  }, [src]);

  if (failed) {
    return <div className={`flex items-center justify-center overflow-hidden ${className}`} style={{background:`linear-gradient(135deg, ${accent}, #ffffff)`}} role="img" aria-label={alt || "Product image unavailable"}>
      <img src={fallback} alt={alt} className="h-full w-full object-cover opacity-90" loading="lazy" decoding="async" />
    </div>;
  }

  return <img
    src={usingFallback ? fallback : src}
    alt={alt}
    className={className}
    loading="lazy"
    decoding="async"
    onError={() => {
      if (!usingFallback && src !== fallback) setUsingFallback(true);
      else setFailed(true);
    }}
  />;
}
