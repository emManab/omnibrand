import { useEffect, useState } from "react";
import { PackageOpen } from "lucide-react";

type ProductImageProps = {
  src: string;
  alt: string;
  className?: string;
  accent?: string;
};

/**
 * Remote catalogue photography can occasionally fail to load. Keep the layout
 * stable and show a branded placeholder instead of a broken-image icon.
 */
export function ProductImage({
  src,
  alt,
  className = "",
  accent = "#EEF3FF",
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed || !src) {
    return (
      <div
        className={`flex items-center justify-center overflow-hidden ${className}`}
        style={{ background: `linear-gradient(135deg, ${accent}, #ffffff)` }}
        role="img"
        aria-label={alt || "Product image unavailable"}
      >
        <span className="flex flex-col items-center gap-2 px-3 text-center text-brand/70">
          <PackageOpen aria-hidden="true" size={30} strokeWidth={1.5} />
          {alt && <span className="text-xs font-medium">{alt}</span>}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
