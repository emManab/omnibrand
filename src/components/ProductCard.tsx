import { Link } from "react-router-dom";
import { Heart, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { formatInr } from "@/lib/money";
import { ProductImage } from "@/components/ProductImage";
import { useCart } from "@/store/cart";

export function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  function addQuickly() {
    const size = product.sizes[0];
    const material = product.materials[0];
    const finish = product.finishes[0];
    add({ id: crypto.randomUUID(), productId: product.id, name: product.name, image: product.image, quantity: 1, size: size.label, material: material.label, finish: finish.label, unitPrice: product.fromPrice, lineTotal: product.fromPrice });
    toast.success(`${product.name} added to cart`);
  }

  return <article className="product-card group flex min-w-0 flex-col rounded-xl border border-[#e9edf4] bg-white p-1.5 shadow-[0_1px_3px_rgba(16,40,76,0.04)] sm:p-2">
    <div className="relative">
      <Link to={`/product/${product.slug}`} aria-label={`View ${product.name}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-[#f4f6f9]" style={{background:product.accent}}>
          <ProductImage src={product.image} alt={product.name} accent={product.accent} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.035]"/>
          {(product.newArrival||product.trending)&&<span className="absolute left-1.5 top-1.5 rounded bg-white/95 px-1.5 py-0.5 text-[0.5625rem] font-extrabold uppercase tracking-wide text-[#34445e] shadow-sm">{product.newArrival?"New":"Trending"}</span>}
        </div>
      </Link>
      <Link to="/login" aria-label={`Save ${product.name} to wishlist`} className="mobile-product-heart"><Heart size={18}/></Link>
    </div>
    <Link to={`/product/${product.slug}`} className="flex flex-1 flex-col px-0.5 pb-1 pt-2">
      <p className="line-clamp-2 min-h-7 text-[0.6875rem] font-bold leading-3 text-[#182b48] sm:text-[0.75rem] sm:leading-3.5">{product.name}</p>
      <div className="mt-1 flex items-center gap-0.5 text-[0.625rem] text-muted"><Star size={9} className="fill-[#ffb21a] text-[#ffb21a]"/><span className="font-bold text-[#283b57]">{product.rating}</span><span className="truncate">({product.reviews.toLocaleString("en-IN")})</span></div>
    </Link>
    <div className="mt-auto flex items-end justify-between gap-1 px-0.5 pb-1 pt-1.5">
      <div><p className="text-[0.5625rem] text-muted">From</p><p className="text-[0.75rem] font-extrabold text-[#14284b] sm:text-[0.8125rem]">{formatInr(product.fromPrice)}</p></div>
      <button type="button" aria-label={`Quick add ${product.name} to cart`} className="mobile-product-add transition-transform duration-200 hover:rotate-90 hover:scale-110" onClick={addQuickly}><Plus size={19}/></button>
    </div>
  </article>;
}
