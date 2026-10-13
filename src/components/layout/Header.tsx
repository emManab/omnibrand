import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, Heart, Menu, Search, ShoppingBag, X, PackageCheck, ArrowRight } from "lucide-react";
import { navCategories, products } from "@/data/catalog";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { cn } from "@/lib/cn";


const megaMenus: Record<string, { columns: { title: string; items: { label: string; to: string }[] }[]; headline: string; cta: string; ctaTo: string }> = {
  "Business Cards": { columns: [
    { title: "Shop by Style", items: [{label:"Standard Business Cards",to:"/catalog?category=business-cards"},{label:"Premium Business Cards",to:"/catalog?category=business-cards"},{label:"Rounded Corner Cards",to:"/catalog?category=business-cards"},{label:"Square Business Cards",to:"/catalog?category=business-cards"},{label:"Custom Shape Cards",to:"/catalog?category=business-cards"}]},
    { title: "Paper & Finish", items: [{label:"Matte Finish",to:"/catalog?category=business-cards"},{label:"Glossy Finish",to:"/catalog?category=business-cards"},{label:"Soft Touch",to:"/catalog?category=business-cards"},{label:"Spot UV",to:"/catalog?category=business-cards"},{label:"Recycled Paper",to:"/catalog?category=business-cards"}]},
    { title: "For Every Business", items: [{label:"Startups & Small Business",to:"/catalog?category=business-cards"},{label:"Real Estate",to:"/catalog?category=business-cards"},{label:"Consultants & Freelancers",to:"/catalog?category=business-cards"},{label:"Restaurants & Cafés",to:"/catalog?category=business-cards"}]},
    { title: "Helpful Tools", items: [{label:"Design Online",to:"/editor/custom-t-shirts"},{label:"Upload a Design",to:"/editor/custom-t-shirts"},{label:"Templates",to:"/catalog?category=business-cards"},{label:"QR Code Cards",to:"/catalog?category=business-cards"}]}
  ], headline:"Make a lasting first impression.", cta:"Explore business cards", ctaTo:"/catalog?category=business-cards" },
  "Custom Apparel": { columns: [
    {title:"Shop Apparel",items:[{label:"Custom T-shirts",to:"/catalog?category=apparel"},{label:"Polo Shirts",to:"/catalog?q=polo"},{label:"Hoodies & Sweatshirts",to:"/catalog?q=hoodie"},{label:"Long Sleeve Shirts",to:"/catalog?category=apparel"},{label:"Workwear",to:"/catalog?category=apparel"}]},
    {title:"Print & Finish",items:[{label:"Screen Printing",to:"/catalog?category=apparel"},{label:"Embroidery",to:"/catalog?category=apparel"},{label:"Full-colour Printing",to:"/catalog?category=apparel"},{label:"Premium Fabrics",to:"/catalog?category=apparel"}]},
    {title:"For Teams",items:[{label:"Startups & Teams",to:"/catalog?category=apparel"},{label:"Events & Merch",to:"/catalog?category=apparel"},{label:"Restaurants & Cafés",to:"/catalog?category=apparel"},{label:"Creators & Clubs",to:"/catalog?category=apparel"}]},
    {title:"Helpful Tools",items:[{label:"Design Online",to:"/editor/custom-t-shirts"},{label:"Upload Artwork",to:"/editor/custom-t-shirts"},{label:"Apparel Templates",to:"/catalog?category=apparel"}]}
  ],headline:"Wear your brand with pride.",cta:"Explore custom apparel",ctaTo:"/catalog?category=apparel" },
  "Stickers & Labels": {columns:[
    {title:"Shop Stickers",items:[{label:"Die-cut Stickers",to:"/catalog?category=stickers"},{label:"Sticker Sheets",to:"/catalog?category=stickers"},{label:"Round Stickers",to:"/catalog?category=stickers"},{label:"Product Labels",to:"/catalog?category=stickers"}]},
    {title:"Materials",items:[{label:"Glossy Vinyl",to:"/catalog?category=stickers"},{label:"Matte Vinyl",to:"/catalog?category=stickers"},{label:"Transparent Labels",to:"/catalog?category=stickers"},{label:"Kraft Labels",to:"/catalog?category=stickers"}]},
    {title:"Popular Uses",items:[{label:"Packaging & Shipping",to:"/catalog?category=stickers"},{label:"Retail Products",to:"/catalog?category=stickers"},{label:"Events & Giveaways",to:"/catalog?category=stickers"}]},
    {title:"Helpful Tools",items:[{label:"Design Stickers",to:"/catalog?category=stickers"},{label:"Upload Artwork",to:"/catalog?category=stickers"},{label:"Sticker Templates",to:"/catalog?category=stickers"}]}
  ],headline:"Small details. Big brand energy.",cta:"Explore stickers & labels",ctaTo:"/catalog?category=stickers"},
  "Marketing Materials": {columns:[
    {title:"Print Essentials",items:[{label:"Flyers & Leaflets",to:"/catalog?category=marketing"},{label:"Posters",to:"/catalog?category=marketing"},{label:"Brochures",to:"/catalog?category=marketing"},{label:"Booklets",to:"/catalog?category=marketing"}]},
    {title:"Promote Your Brand",items:[{label:"Business Stationery",to:"/catalog?category=marketing"},{label:"Direct Mail",to:"/catalog?category=marketing"},{label:"Event Handouts",to:"/catalog?category=marketing"}]},
    {title:"For Every Business",items:[{label:"Retail & Hospitality",to:"/catalog?category=marketing"},{label:"Small Business",to:"/catalog?category=marketing"},{label:"Events & Exhibitions",to:"/catalog?category=marketing"}]},
    {title:"Helpful Tools",items:[{label:"Design Materials",to:"/catalog?category=marketing"},{label:"Upload a Design",to:"/catalog?category=marketing"},{label:"Templates",to:"/catalog?category=marketing"}]}
  ],headline:"Turn great ideas into print.",cta:"Explore marketing materials",ctaTo:"/catalog?category=marketing"},
  "Packaging": {columns:[
    {title:"Shop Packaging",items:[{label:"Custom Boxes",to:"/catalog?category=packaging"},{label:"Mailer Boxes",to:"/catalog?category=packaging"},{label:"Shipping Labels",to:"/catalog?category=packaging"},{label:"Tissue Paper",to:"/catalog?category=packaging"}]},
    {title:"Brand Finishes",items:[{label:"Printed Tape",to:"/catalog?category=packaging"},{label:"Product Stickers",to:"/catalog?category=packaging"},{label:"Eco-friendly Packaging",to:"/catalog?category=packaging"}]},
    {title:"For Your Business",items:[{label:"Online Stores",to:"/catalog?category=packaging"},{label:"Food & Beverage",to:"/catalog?category=packaging"},{label:"Retail & Gifting",to:"/catalog?category=packaging"}]},
    {title:"Helpful Tools",items:[{label:"Packaging Design",to:"/catalog?category=packaging"},{label:"Upload Artwork",to:"/catalog?category=packaging"},{label:"Packaging Templates",to:"/catalog?category=packaging"}]}
  ],headline:"Packaging that feels like you.",cta:"Explore packaging",ctaTo:"/catalog?category=packaging"},
  "Signs & Banners": {columns:[
    {title:"Signs",items:[{label:"Posters & Signs",to:"/catalog?category=marketing"},{label:"Foam Boards",to:"/catalog?category=marketing"},{label:"Window Graphics",to:"/catalog?category=marketing"}]},
    {title:"Banners",items:[{label:"Vinyl Banners",to:"/catalog?category=marketing"},{label:"Roll-up Banners",to:"/catalog?category=marketing"},{label:"Event Backdrops",to:"/catalog?category=marketing"}]},
    {title:"Use Cases",items:[{label:"Retail Displays",to:"/catalog?category=marketing"},{label:"Trade Shows",to:"/catalog?category=marketing"},{label:"Celebrations",to:"/catalog?category=marketing"}]},
    {title:"Helpful Tools",items:[{label:"Design a Banner",to:"/catalog?category=marketing"},{label:"Upload Artwork",to:"/catalog?category=marketing"}]}
  ],headline:"Be seen. Be remembered.",cta:"Explore signs & banners",ctaTo:"/catalog?category=marketing"},
  "Gifts": {columns:[
    {title:"Shop Gifts",items:[{label:"Custom Mugs",to:"/catalog?category=gifts"},{label:"Bottles & Drinkware",to:"/catalog?category=gifts"},{label:"Tote Bags",to:"/catalog?category=gifts"},{label:"Personalised Gifts",to:"/catalog?category=gifts"}]},
    {title:"Popular Picks",items:[{label:"Team Gifts",to:"/catalog?category=gifts"},{label:"Event Giveaways",to:"/catalog?category=gifts"},{label:"Client Thank-yous",to:"/catalog?category=gifts"}]},
    {title:"Make It Yours",items:[{label:"Add Your Logo",to:"/catalog?category=gifts"},{label:"Bulk Orders",to:"/catalog?category=gifts"},{label:"Gift Sets",to:"/catalog?category=gifts"}]},
    {title:"Helpful Tools",items:[{label:"Design a Gift",to:"/catalog?category=gifts"},{label:"Browse Ideas",to:"/catalog?category=gifts"}]}
  ],headline:"Good ideas make great gifts.",cta:"Explore gifts",ctaTo:"/catalog?category=gifts"},
  "Office Stationery": {columns:[
    {title:"Office Essentials",items:[{label:"Letterheads",to:"/catalog?category=stationery"},{label:"Notepads",to:"/catalog?category=stationery"},{label:"Envelopes",to:"/catalog?category=stationery"},{label:"Presentation Folders",to:"/catalog?category=stationery"}]},
    {title:"Everyday Printing",items:[{label:"Desk Calendars",to:"/catalog?category=stationery"},{label:"Labels",to:"/catalog?category=stationery"},{label:"Document Printing",to:"/catalog?category=stationery"}]},
    {title:"For Your Team",items:[{label:"New Business Kits",to:"/catalog?category=stationery"},{label:"Office Replenishment",to:"/catalog?category=stationery"},{label:"Client Meetings",to:"/catalog?category=stationery"}]},
    {title:"Helpful Tools",items:[{label:"Design Stationery",to:"/catalog?category=stationery"},{label:"Upload Artwork",to:"/catalog?category=stationery"}]}
  ],headline:"Make every detail feel professional.",cta:"Explore office stationery",ctaTo:"/catalog?category=stationery"},
  "Inspiration": {columns:[
    {title:"Get Inspired",items:[{label:"Small Business Branding",to:"/catalog"},{label:"Packaging Ideas",to:"/catalog?category=packaging"},{label:"Event & Trade Show Ideas",to:"/catalog?category=marketing"}]},
    {title:"Popular Guides",items:[{label:"Business Card Design",to:"/catalog?category=business-cards"},{label:"Choosing Print Finishes",to:"/catalog?category=business-cards"},{label:"Branded Apparel Ideas",to:"/catalog?category=apparel"}]},
    {title:"For Your Business",items:[{label:"Build Your Brand Kit",to:"/catalog"},{label:"Launch Checklist",to:"/catalog"},{label:"Marketing Basics",to:"/catalog?category=marketing"}]},
    {title:"Helpful Tools",items:[{label:"Design Online",to:"/editor/custom-t-shirts"},{label:"Explore Products",to:"/catalog"}]}
  ],headline:"Ideas worth putting in print.",cta:"Explore inspiration",ctaTo:"/catalog"}
};

const extraLinks = [
  { label: "Office Stationery", slug: "stationery" },
  { label: "Gifts", slug: "gifts" },
  { label: "Inspiration", slug: "inspiration" },
];

export function Header() {
  const navigate = useNavigate();
  const items = useCart((s) => s.items);
  const user = useAuth((s) => s.user);
  const count = useMemo(() => items.reduce((n, i) => n + i.quantity, 0), [items]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const suggestions = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return { categories: [], products: [] };
    const aliases: Record<string, string[]> = { shirt: ["t-shirt", "tshirt", "polo", "hoodie", "apparel"], shirts: ["t-shirt", "tshirt", "polo", "hoodie", "apparel"], tee: ["t-shirt", "tshirt", "apparel"], tees: ["t-shirt", "tshirt", "apparel"], card: ["business card"], cards: ["business card"] };
    const terms = [term, ...(aliases[term] ?? [])];
    const matchingProducts = products.filter((p) => terms.some((t) => `${p.name} ${p.tagline} ${p.category}`.toLowerCase().includes(t))).slice(0, 4);
    const matchingCategories = navCategories.filter((item) => terms.some((t) => item.label.toLowerCase().includes(t) || (t === "apparel" && item.slug === "apparel"))).slice(0, 4);
    return { categories: matchingCategories, products: matchingProducts };
  }, [q]);
  useEffect(() => {
    function handlePointer(event: PointerEvent) { if (searchRef.current && !searchRef.current.contains(event.target as Node)) setSearchFocused(false); }
    function handleKey(event: KeyboardEvent) { if (event.key === "Escape") setSearchFocused(false); }
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => { document.removeEventListener("pointerdown", handlePointer); document.removeEventListener("keydown", handleKey); };
  }, []);
  function onSearch(e: FormEvent) {
    e.preventDefault();
    navigate(`/catalog?q=${encodeURIComponent(q.trim())}`);
    setOpen(false);
  }

  return <header className="sticky top-0 z-40 border-b border-[#e8edf4] bg-white/95 backdrop-blur">
    <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-3 sm:px-6 lg:gap-7 lg:px-7">
      <button className="rounded-lg p-1.5 text-ink lg:hidden" onClick={()=>setOpen(v=>!v)} aria-label={open?"Close menu":"Open menu"} aria-expanded={open}>{open?<X size={18}/>:<Menu size={18}/>}</button>
      <Link to="/" className="flex shrink-0 items-center" aria-label="Calcuttapress home"><picture><source media="(max-width: 767px)" srcSet="/calcuttapress-mobile-logo.svg" /><img src="/calcuttapress-logo.png" alt="Calcuttapress" className="h-[38px] w-auto max-w-[214px] max-[360px]:h-[32px] sm:h-[42px] sm:max-w-none lg:h-[44px]" /></picture></Link>
      <div ref={searchRef} className="printify-search relative mx-2 hidden min-w-0 max-w-[640px] flex-1 md:block">
        <form onSubmit={onSearch} role="search" className={cn("flex w-full items-center gap-3 rounded-full border bg-white px-4 py-2 transition-all duration-150", searchFocused ? "border-[#a9cfff] shadow-[0_0_0_3px_rgba(8,117,245,0.09)]" : "border-[#dfe5ee] hover:border-[#b9c5d5]")}>
          <input value={q} onFocus={() => setSearchFocused(true)} onChange={e=>{setQ(e.target.value);setSearchFocused(true);}} placeholder="Search for products, templates or ideas..." aria-label="Search products" aria-expanded={searchFocused && !!q.trim()} aria-controls="search-suggestions" className="min-w-0 w-full border-0 bg-transparent py-1.5 text-[0.875rem] text-[#263b5c] outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none placeholder:text-[#8793a7]"/>
          {q && <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="rounded-full p-1 text-[#7a8799] hover:bg-[#f1f4f8]"><X size={15}/></button>}
          <button type="submit" aria-label="Submit search" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#0875f5] text-white transition hover:bg-[#075fd0]"><Search size={17}/></button>
        </form>
        {searchFocused && q.trim() && <div id="search-suggestions" role="listbox" className="absolute left-0 right-0 top-[calc(100%+10px)] z-[80] overflow-hidden rounded-2xl border border-[#e4e9f1] bg-white py-2 shadow-[0_18px_55px_rgba(20,39,70,0.18)]">
          <div className="flex items-center justify-between px-4 pb-2 pt-1"><p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-[#8a96a8]">Suggestions</p><span className="text-[0.6875rem] text-[#98a2b2]">Search Calcuttapress</span></div>
          {suggestions.categories.length > 0 && <div className="px-2 pb-1">{suggestions.categories.map(item => <button type="button" key={item.slug} onClick={() => {setSearchFocused(false);navigate(item.slug === "all" ? "/catalog" : `/catalog?category=${item.slug}`);}} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-[#33445d] hover:bg-[#f3f7fc]"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#f0f5fc] text-[#55708e]"><Search size={15}/></span><span className="flex-1">{item.label}</span><ArrowUpRight size={14} className="text-[#8a96a8]"/></button>)}</div>}
          {suggestions.products.length > 0 && <><div className="mx-4 my-1 border-t border-[#edf0f5]"/><p className="px-4 pb-1 pt-2 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-[#8a96a8]">Matching products</p><div className="px-2">{suggestions.products.map(product => <Link role="option" key={product.id} to={`/product/${product.slug}`} onClick={() => setSearchFocused(false)} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#263b5c] hover:bg-[#f3f7fc]"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#f1f4f8]"><ShoppingBag size={16} className="text-[#71829a]"/></span><span className="min-w-0 flex-1"><span className="block truncate font-semibold">{product.name}</span><span className="block truncate text-xs text-[#7b899d]">{product.tagline}</span></span><ArrowRight size={14} className="text-[#94a0b0]"/></Link>)}</div></>}
          {suggestions.categories.length === 0 && suggestions.products.length === 0 && <button type="submit" onClick={() => {setSearchFocused(false);navigate(`/catalog?q=${encodeURIComponent(q.trim())}`);}} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[#33445d] hover:bg-[#f3f7fc]"><Search size={16}/> Search for “{q.trim()}”</button>}
          <button type="submit" onClick={() => {setSearchFocused(false);navigate(`/catalog?q=${encodeURIComponent(q.trim())}`);}} className="mt-1 flex w-full items-center justify-between border-t border-[#edf0f5] px-4 py-3 text-sm font-semibold text-[#0875f5] hover:bg-[#f8fbff]">See all results for “{q.trim()}” <ArrowRight size={15}/></button>
        </div>}
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
        <Link to="/login" aria-label="Wishlist" className="mobile-header-icon hidden sm:flex"><Heart size={22}/></Link>
        <Link to="/help" className="hidden items-center gap-1.5 px-2 py-2 text-[0.8125rem] font-medium text-[#34445e] transition hover:text-[#0875f5] sm:flex">Help</Link>
        <Link to={user?"/account":"/login"} className="hidden items-center gap-1.5 px-2 py-2 text-[0.8125rem] font-medium text-[#34445e] transition hover:text-[#0875f5] sm:flex"><PackageCheck size={15}/> Orders</Link>
        <Link to="/cart" aria-label={`Cart, ${count} items`} className="relative flex items-center gap-1.5 rounded-md border border-[#d9dee7] px-3 py-2 text-[0.8125rem] font-semibold text-[#243650] transition hover:border-[#0875f5] hover:text-[#0875f5]"><ShoppingBag size={14}/><span className="hidden sm:inline">Cart</span>{count>0&&<span className="grid h-4 min-w-4 place-items-center rounded-full bg-white px-1 text-[0.6875rem] text-[#0875f5]">{count}</span>}</Link>
      </div>
    </div>
    <form onSubmit={onSearch} className="mobile-search-row">
      <label className="flex w-full items-center gap-2 rounded-full border border-[#dfe5ee] bg-white px-4 py-2.5 transition focus-within:border-[#a9cfff] focus-within:shadow-[0_0_0_3px_rgba(8,117,245,0.08)]"><Search size={19} className="shrink-0 text-[#102748]"/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search for products, templates or ideas..." aria-label="Search products" className="w-full border-0 bg-transparent text-sm outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none placeholder:text-[#7d899c]"/></label>
    </form>
    <nav aria-label="Product categories" className="hidden border-t border-[#edf0f5] bg-white lg:block" onMouseLeave={() => setActiveMega(null)}>
      <div className="mx-auto flex max-w-[1560px] items-stretch justify-between gap-1 overflow-x-auto px-4 xl:px-7">
        {[{ slug: "all", label: "All Products" }, ...navCategories.filter(c => c.slug !== "all"), { slug: "stationery", label: "Office Stationery" }, { slug: "inspiration", label: "Inspiration" }].map((item) => {
          const key = item.label;
          const target = item.slug === "inspiration" ? "/catalog" : `/catalog?category=${item.slug}`;
          return <Link key={key} to={target} onMouseEnter={() => setActiveMega(megaMenus[key] ? key : null)} onFocus={() => setActiveMega(megaMenus[key] ? key : null)} onClick={() => setActiveMega(null)} className={cn("relative flex shrink-0 items-center gap-1 whitespace-nowrap border-b-2 px-3 py-4 text-[0.8125rem] font-medium transition-colors", activeMega === key ? "border-[#0875f5] text-[#0875f5]" : "border-transparent text-[#253854] hover:text-[#0875f5]")}>{item.label}{megaMenus[key] && <span className={cn("text-[0.7rem] transition-transform",activeMega === key && "rotate-180")}>⌄</span>}</Link>;
        })}
      </div>
      {activeMega && <div className="absolute left-0 right-0 z-[75] border-y border-[#e7edf5] bg-white shadow-[0_22px_45px_rgba(19,39,70,.15)]" onMouseEnter={() => setActiveMega(activeMega)}>
        <div className="mx-auto grid max-w-[1560px] grid-cols-[1fr_1fr_1fr_1fr_1.55fr] gap-0 px-7 py-6">
          {(megaMenus[activeMega] ?? megaMenus["Business Cards"]).columns.map((column, index) => <div key={column.title} className={cn("px-5",index > 0 && "border-l border-[#e8edf4]")}>
            <h3 className="mb-3 text-sm font-bold text-[#102748]">{column.title}</h3>
            <div className="space-y-1.5">{column.items.map((entry) => <Link key={entry.label} to={entry.to} onClick={() => setActiveMega(null)} className="group flex items-center justify-between gap-2 rounded-md px-2 py-2 text-[0.8125rem] text-[#465a76] transition hover:bg-[#f2f7ff] hover:text-[#0875f5]">{entry.label}<ArrowUpRight size={13} className="shrink-0 opacity-0 transition group-hover:opacity-100"/></Link>)}</div>
          </div>)}
          <Link to={megaMenus[activeMega]?.ctaTo ?? "/catalog"} onClick={() => setActiveMega(null)} className="group relative flex min-h-[220px] flex-col justify-end overflow-hidden rounded-xl bg-gradient-to-br from-[#eaf5ff] via-[#f6faff] to-[#d9ebff] p-6 transition hover:shadow-md">
            <span className="mb-2 text-[0.625rem] font-bold uppercase tracking-[0.2em] text-[#0875f5]">CALCUTTAPRESS COLLECTION</span><span className="max-w-[240px] text-2xl font-extrabold leading-tight tracking-tight text-[#102748]">{megaMenus[activeMega]?.headline ?? "Make a lasting first impression."}</span><span className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#0875f5]">{megaMenus[activeMega]?.cta ?? "Explore collection"} <ArrowRight size={15}/></span>
            <span className="pointer-events-none absolute -right-5 -top-8 h-36 w-36 rounded-full border-[24px] border-white/70 transition-transform group-hover:scale-110"/><span className="pointer-events-none absolute -right-2 -top-1 h-16 w-16 rounded-full bg-[#0875f5]/15"/>
          </Link>
        </div>
      </div>}
    </nav>
    {open&&<div className="border-t border-[#e8edf4] bg-white px-4 py-4 lg:hidden">
      <form onSubmit={onSearch} className="mb-3"><label className="flex items-center gap-2 rounded-full border border-[#e6eaf2] bg-[#f5f7fb] px-3 py-2"><Search size={15}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search products, templates or ideas" aria-label="Search products" className="w-full bg-transparent text-sm outline-none"/></label></form>
      <div className="grid gap-1 sm:grid-cols-2">{[...navCategories,...extraLinks].map(c=><Link key={c.slug} to={c.slug==="all"?"/catalog":`/catalog?category=${c.slug}`} onClick={()=>setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[#f5f7fb]">{c.label}</Link>)}<Link to="/help" onClick={()=>setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[#f5f7fb]">Help & support</Link></div>
    </div>}
  </header>;
}
