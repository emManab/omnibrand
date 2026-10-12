import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import type { Product } from "@/types";
import { formatInr } from "@/lib/money";
import { ProductImage } from "@/components/ProductImage";

export function ProductCard({ product }: { product: Product }) {
  return <Link to={`/product/${product.slug}`} className="group flex min-w-0 flex-col rounded-xl border border-[#e9edf4] bg-white p-1.5 shadow-[0_1px_3px_rgba(16,40,76,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-[#cbdcff] hover:shadow-md sm:p-2">
    <div className="relative aspect-square overflow-hidden rounded-lg bg-[#f4f6f9]" style={{background:product.accent}}>
      <ProductImage src={product.image} alt={product.name} accent={product.accent} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.035]"/>
      {(product.newArrival||product.trending)&&<span className="absolute left-1.5 top-1.5 rounded bg-white/95 px-1.5 py-0.5 text-[7px] font-extrabold uppercase tracking-wide text-[#34445e] shadow-sm">{product.newArrival?"New":"Trending"}</span>}
    </div>
    <div className="flex flex-1 flex-col px-0.5 pb-1 pt-2">
      <p className="line-clamp-2 min-h-7 text-[9px] font-bold leading-3 text-[#182b48] sm:text-[10px] sm:leading-3.5">{product.name}</p>
      <div className="mt-1 flex items-center gap-0.5 text-[8px] text-muted"><Star size={9} className="fill-[#ffb21a] text-[#ffb21a]"/><span className="font-bold text-[#283b57]">{product.rating}</span><span className="truncate">({product.reviews.toLocaleString("en-IN")})</span></div>
      <div className="mt-auto pt-1.5"><p className="text-[7px] text-muted">From</p><p className="text-[10px] font-extrabold text-[#14284b] sm:text-[11px]">{formatInr(product.fromPrice)}</p></div>
    </div>
  </Link>;
}
