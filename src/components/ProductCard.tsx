import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import type { Product } from "@/types";
import { formatInr } from "@/lib/money";
import { ProductImage } from "@/components/ProductImage";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/product/${product.slug}`} className="group flex min-w-0 flex-col rounded-2xl border border-[#e9edf4] bg-white p-2.5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#cbdcff] hover:shadow-lg sm:p-3">
      <div className="relative aspect-square overflow-hidden rounded-xl" style={{ background: product.accent }}>
        <ProductImage
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
        />
        {(product.newArrival || product.trending) && (
          <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[#24466f] shadow-sm">
            {product.newArrival ? "New" : "Trending"}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col pt-3">
        <p className="line-clamp-2 min-h-9 text-xs font-semibold leading-4 text-[#14284b] sm:text-sm">{product.name}</p>
        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-muted">
          <Star size={12} className="fill-amber-400 text-amber-400" />
          <span className="font-semibold text-ink">{product.rating}</span>
          <span>({product.reviews.toLocaleString("en-IN")})</span>
        </div>
        <div className="mt-auto pt-2">
          <p className="text-[10px] font-medium text-muted">From</p>
          <p className="text-sm font-extrabold text-[#14284b] sm:text-base">{formatInr(product.fromPrice)}</p>
        </div>
      </div>
    </Link>
  );
}
