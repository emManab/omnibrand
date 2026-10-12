import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { navCategories, searchProducts } from "@/data/catalog";
import { ProductCard } from "@/components/ProductCard";
import { cn } from "@/lib/cn";

export function Catalog() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "all";
  const items = useMemo(() => searchProducts(q, category), [q, category]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <p className="text-sm text-muted">Catalogue</p>
      <h1 className="mt-1 font-display text-4xl font-semibold">
        {q ? `Results for “${q}”` : "Everything we print"}
      </h1>
      <p className="mt-2 max-w-xl text-muted">
        Filter by category, then open a product to pick stock, size and quantity — or jump into the editor.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
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

      <p className="mt-6 text-sm text-muted">{items.length} products</p>
      <div className="mt-4 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {items.length === 0 && (
        <p className="mt-10 rounded-2xl border border-dashed border-line p-10 text-center text-muted">
          Nothing matches that search. Try “cards”, “hoodie”, or “packaging”.
        </p>
      )}
    </div>
  );
}
