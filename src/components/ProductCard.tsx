import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import type { Product } from "@/types";
import { formatInr } from "@/lib/money";
import { ProductImage } from "@/components/ProductImage";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div
        className="aspect-square overflow-hidden rounded-2xl border border-line"
        style={{ background: product.accent }}
      >
        <ProductImage
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="mt-3">
        <p className="font-medium">{product.name}</p>
        <p className="mt-0.5 text-sm text-muted">{product.tagline}</p>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="font-semibold">From {formatInr(product.fromPrice)}</span>
          <span className="flex items-center gap-1 text-muted">
            <Star size={13} className="fill-amber-400 text-amber-400" />
            {product.rating}
          </span>
        </div>
      </div>
    </Link>
  );
}
