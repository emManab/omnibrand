import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowDownUp, ChevronDown, SlidersHorizontal, Sparkles } from "lucide-react";
import { navCategories, products, searchProducts } from "@/data/catalog";
import { ProductCard } from "@/components/ProductCard";
import { cn } from "@/lib/cn";
import { ProductImage } from "@/components/ProductImage";
import { LiveChat } from "@/components/LiveChat";
import { supabaseEnabled } from "@/lib/supabase";
import { useCategories, useProducts } from "@/lib/queries";

export function Catalog() {
  const [params, setParams] = useSearchParams();
  const [sort, setSort] = useState<"recommended" | "price">("recommended");
  const [under500, setUnder500] = useState(false);
  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "all";

  const { data: dbCategories } = useCategories();
  const navItems = useMemo(() => {
    if (supabaseEnabled && dbCategories && dbCategories.length > 0) {
      return [
        { slug: "all", label: "All Products" },
        ...dbCategories
          .filter((c) => c.showInNav ?? true)
          .map((c) => ({ slug: c.slug, label: c.navLabel || c.name })),
      ];
    }
    return navCategories;
  }, [dbCategories]);

  const activeDbCategory = useMemo(() => {
    if (!supabaseEnabled || !dbCategories || category === "all") return undefined;
    return dbCategories.find((c) => c.slug === category);
  }, [dbCategories, category]);

  const { data: dbProducts } = useProducts(
    {
      status: "published",
      search: q || undefined,
      categoryIds: activeDbCategory ? [activeDbCategory.id] : undefined,
      sort: sort === "price" ? "price" : "recommended",
      maxPrice: under500 ? 500 : undefined,
    },
    { enabled: supabaseEnabled },
  );

  const items = useMemo(() => {
    if (supabaseEnabled && dbProducts) {
      return dbProducts.items;
    }
    const found = searchProducts(q, category).filter((p) => !under500 || p.fromPrice < 500);
    return sort === "price" ? [...found].sort((a, b) => a.fromPrice - b.fromPrice) : found;
  }, [q, category, sort, under500, dbProducts]);

  if (category === "business-cards" && !q) {
    const cardStyles = [
      { title: "Classic & Standard", note: "Everyday cards with a polished finish", image: "https://images.unsplash.com/photo-1504274066651-8d31a536b11a?auto=format&fit=crop&w=720&q=85" },
      { title: "Rounded Corners", note: "A softer look that stands out", image: "https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=720&q=85" },
      { title: "Premium & Textured", note: "Distinctive stocks and tactile finishes", image: "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?auto=format&fit=crop&w=720&q=85" },
      { title: "Square & Creative", note: "A modern shape for bold brands", image: "https://images.unsplash.com/photo-1596079890744-c1a0462d0975?auto=format&fit=crop&w=720&q=85" },
    ];
    const paperStyles = [
      { title: "Matte", note: "Smooth, low-glare finish", image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=720&q=85" },
      { title: "Soft-touch", note: "A refined, velvety feel", image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=720&q=85" },
      { title: "Uncoated", note: "Natural texture, easy to write on", image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=720&q=85" },
    ];
    const cardProduct =
      (supabaseEnabled && dbProducts ? dbProducts.items : products).find((p) => p.category === "business-cards") ??
      products.find((p) => p.category === "business-cards");

    return (
      <div className="business-cards-page mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <div className="business-cards-hero grid overflow-hidden rounded-2xl bg-[#263b5c] text-white md:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col items-start justify-center px-6 py-8 sm:px-10 sm:py-12 lg:px-14">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a9d9ff]">Make a memorable first impression</p>
            <h1 className="mt-3 max-w-lg text-3xl font-extrabold leading-tight tracking-[-0.035em] sm:text-4xl">Business cards that feel like your brand.</h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/80 sm:text-base">Choose your shape, paper and finish. Create a card that people will want to keep.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to={cardProduct ? `/product/${cardProduct.slug}` : "/catalog?category=business-cards"} className="rounded-lg bg-white px-5 py-3 text-sm font-bold text-[#172c4b] transition hover:bg-[#eaf3ff]">Explore business cards</Link>
              <Link to="/editor/custom-t-shirts" className="rounded-lg border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Start designing</Link>
            </div>
          </div>
          <div className="business-cards-hero-art relative min-h-[230px] overflow-hidden sm:min-h-[300px]">
            <img src="https://images.unsplash.com/photo-1504274066651-8d31a536b11a?auto=format&fit=crop&w=1200&q=90" alt="Premium business cards arranged on a desk" className="absolute inset-0 h-full w-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#263b5c] via-[#263b5c]/25 to-transparent md:from-[#263b5c]/70 md:via-transparent" />
            <div className="absolute bottom-5 right-5 rounded-xl border border-white/30 bg-white/90 px-4 py-3 text-[#172c4b] shadow-xl backdrop-blur">
              <p className="text-xs font-semibold">Calcuttapress quality</p>
              <p className="mt-0.5 text-sm font-extrabold">Your brand, in hand.</p>
            </div>
          </div>
        </div>
        <section className="mt-9 sm:mt-12">
          <div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0875f5]">Find your style</p><h2 className="mt-1 text-xl font-extrabold tracking-tight text-[#102748] sm:text-2xl">Shop by card style</h2><p className="mt-1 text-sm text-[#66758b]">A format for every kind of introduction.</p></div></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">{cardStyles.map((item) => <Link key={item.title} to={cardProduct ? `/product/${cardProduct.slug}` : "/catalog?category=business-cards"} className="group overflow-hidden rounded-xl border border-[#e6eaf2] bg-white transition hover:-translate-y-1 hover:shadow-lg"><div className="aspect-[1.15/1] overflow-hidden bg-[#f2f4f7]"><img src={item.image} alt={item.title} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" /></div><div className="p-3 sm:p-4"><h3 className="text-sm font-bold text-[#172c4b] sm:text-base">{item.title}</h3><p className="mt-1 text-xs leading-5 text-[#68778c] sm:text-sm">{item.note}</p><span className="mt-3 inline-block text-xs font-bold text-[#0875f5]">Explore style ↗</span></div></Link>)}</div>
        </section>
        <section className="mt-9 sm:mt-12">
          <div className="mb-4"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0875f5]">The finishing touch</p><h2 className="mt-1 text-xl font-extrabold tracking-tight text-[#102748] sm:text-2xl">Choose your paper & finish</h2><p className="mt-1 text-sm text-[#66758b]">Small details make a big difference.</p></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">{paperStyles.map((item) => <Link key={item.title} to={cardProduct ? `/product/${cardProduct.slug}` : "/catalog?category=business-cards"} className="group flex items-center gap-3 rounded-xl border border-[#e6eaf2] bg-white p-2.5 transition hover:border-[#b9d7ff] hover:shadow-md sm:gap-4 sm:p-3"><img src={item.image} alt="" loading="lazy" className="h-20 w-20 rounded-lg object-cover sm:h-24 sm:w-24" /><div><h3 className="text-sm font-bold text-[#172c4b] sm:text-base">{item.title}</h3><p className="mt-1 text-xs leading-5 text-[#68778c]">{item.note}</p></div></Link>)}</div>
        </section>
        <section className="mt-9 rounded-2xl border border-[#e6eaf2] bg-[#f7f9fc] p-4 sm:mt-12 sm:p-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-extrabold text-[#102748] sm:text-2xl">Ready to make yours?</h2><p className="mt-1 text-sm text-[#66758b]">Start with our featured business card and customise the details.</p></div><Link to={cardProduct ? `/product/${cardProduct.slug}` : "/catalog?category=business-cards"} className="rounded-lg bg-[#0875f5] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#075fd0]">View business cards</Link></div>
          {items.length > 0 && <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{items.map((p) => <ProductCard key={p.id} product={p} />)}</div>}
        </section>
      </div>
    );
  }

  const heroProduct =
    (supabaseEnabled && dbProducts ? dbProducts.items : products).find(
      (p) => p.category === (category === "all" ? "apparel" : category),
    ) ?? products[1];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6 catalog-page">
      <div className="mobile-catalog-hero">
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#254b77]">Custom apparel</p>
          <h1 className="mt-1 text-2xl font-extrabold leading-tight text-[#102748]">{category === "apparel" ? "Wear your brand proudly." : q ? `Results for “${q}”` : "Find your next favourite."}</h1>
          <p className="mt-2 text-sm leading-5 text-[#385577]">High quality custom products for your business, events and everyday style.</p>
        </div>
        <ProductImage src={heroProduct?.image ?? products[1].image} alt="Custom printed products" className="h-full min-h-[160px] w-full rounded-xl object-cover"/>
      </div>
      <p className="text-sm text-muted catalog-eyebrow">Catalogue</p>
      <h1 className="mt-1 font-display text-4xl font-semibold catalog-title">
        {q ? `Results for “${q}”` : "Everything we print"}
      </h1>
      <p className="mt-2 max-w-xl text-muted catalog-description">
        Filter by category, then open a product to pick stock, size and quantity — or jump into the editor.
      </p>

      <div className="mt-6 flex flex-wrap gap-2 catalog-categories">
        {navItems.map((c) => (
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
        <button
          type="button"
          onClick={() => {
            const next = new URLSearchParams(params);
            next.set("category", category === "apparel" ? "all" : "apparel");
            setParams(next);
          }}
        >
          <SlidersHorizontal size={17} /> Filter
        </button>
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
      <LiveChat />
    </div>
  );
}
