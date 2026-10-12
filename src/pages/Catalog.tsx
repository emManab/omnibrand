import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowDownUp, ChevronDown, SlidersHorizontal, Sparkles } from "lucide-react";
import { navCategories, products, searchProducts } from "@/data/catalog";
import { ProductCard } from "@/components/ProductCard";
import { cn } from "@/lib/cn";
import { ProductImage } from "@/components/ProductImage";

export function Catalog() {
  const [params, setParams] = useSearchParams();
  const [sort, setSort] = useState<"recommended" | "price">("recommended");
  const [under500, setUnder500] = useState(false);
  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "all";
  const items = useMemo(() => {
    const found = searchProducts(q, category).filter((p) => !under500 || p.fromPrice < 500);
    return sort === "price" ? [...found].sort((a, b) => a.fromPrice - b.fromPrice) : found;
  }, [q, category, sort, under500]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6 catalog-page">
      <div className="mobile-catalog-hero">
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#254b77]">Custom apparel</p>
          <h1 className="mt-1 text-2xl font-extrabold leading-tight text-[#102748]">{category === "apparel" ? "Wear your brand proudly." : q ? `Results for “${q}”` : "Find your next favourite."}</h1>
          <p className="mt-2 text-sm leading-5 text-[#385577]">High quality custom products for your business, events and everyday style.</p>
        </div>
        <ProductImage src={products.find((p) => p.category === (category === "all" ? "apparel" : category))?.image ?? products[1].image} alt="Custom printed products" className="h-full min-h-[160px] w-full rounded-xl object-cover"/>
      </div>
      <p className="text-sm text-muted catalog-eyebrow">Catalogue</p>
      <h1 className="mt-1 font-display text-4xl font-semibold catalog-title">
        {q ? `Results for “${q}”` : "Everything we print"}
      </h1>
      <p className="mt-2 max-w-xl text-muted catalog-description">
        Filter by category, then open a product to pick stock, size and quantity — or jump into the editor.
      </p>

      <div className="mt-6 flex flex-wrap gap-2 catalog-categories">
        {navCategories.map((c) => (
          <button
            key={c.slug}
            onClick={() => {
              const next = new URLSearchParams(params);
              if (c.slug === "all") next.delete("category");
              else next.set("category", c.slug);
              setParams(next);
            }}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm",
              category === c.slug ? "bg-navy text-white" : "bg-paper",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mobile-catalog-controls">
        <button type="button" onClick={() => setParams((current) => { const next = new URLSearchParams(current); next.set("category", category === "apparel" ? "all" : "apparel"); return next; }}><SlidersHorizontal size={17}/> Filter</button>
        <button type="button" onClick={() => setSort((value) => value === "recommended" ? "price" : "recommended")}><ArrowDownUp size={17}/> {sort === "price" ? "Price: low first" : "Sort"}</button>
        <button type="button" onClick={() => setUnder500((value) => !value)} className={under500 ? "is-selected" : ""}>Price <ChevronDown size={17}/></button>
      </div>
      <p className="mt-6 text-sm text-muted catalog-count">{items.length} products</p>
      <div className="mt-4 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 catalog-grid">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {items.length === 0 && (
        <p className="mt-10 rounded-2xl border border-dashed border-line p-10 text-center text-muted">
          Nothing matches that search. Try “cards”, “hoodie”, or “packaging”.
        </p>
      )}
      <Link to="/editor/custom-t-shirts" className="mobile-design-help">
        <div><p className="text-lg font-extrabold">Need help with your design?</p><p className="mt-1 text-sm">Use our online design tool or upload your own artwork.</p><span className="mt-3 inline-flex rounded-lg bg-[#102748] px-4 py-2.5 text-sm font-bold text-white">Start Designing <Sparkles size={15} className="ml-2"/></span></div>
        <Sparkles className="mobile-design-help__art" size={62}/>
      </Link>
    </div>
  );
}
