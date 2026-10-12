import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ArrowUpRight, Heart, Menu, Search, ShoppingBag, User, X, PackageCheck, ArrowRight } from "lucide-react";
import { navCategories, products, searchProducts } from "@/data/catalog";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { cn } from "@/lib/cn";

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
  const navLinkClass = ({ isActive }: { isActive: boolean }) => cn("whitespace-nowrap border-b-2 border-transparent px-3 py-3 text-[0.8125rem] font-medium text-[#34445e] transition-colors hover:border-[#0875f5] hover:text-[#0875f5]", isActive && "border-[#0875f5] text-[#0875f5]");

  return <header className="sticky top-0 z-40 border-b border-[#e8edf4] bg-white/95 backdrop-blur">
    <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-3 sm:px-6 lg:gap-7 lg:px-7">
      <button className="rounded-lg p-1.5 text-ink lg:hidden" onClick={()=>setOpen(v=>!v)} aria-label={open?"Close menu":"Open menu"} aria-expanded={open}>{open?<X size={18}/>:<Menu size={18}/>}</button>
      <Link to="/" className="flex shrink-0 items-center" aria-label="Printify home"><img src="/printify-logo.png" alt="Printify" width="132" height="30" className="h-[30px] w-auto sm:h-[30px]" /></Link>
      <div ref={searchRef} className="printify-search relative mx-2 hidden min-w-0 max-w-[640px] flex-1 md:block">
        <form onSubmit={onSearch} role="search" className={cn("flex w-full items-center gap-3 rounded-full border bg-white px-4 py-2 transition-all duration-150", searchFocused ? "border-[#a9cfff] shadow-[0_0_0_3px_rgba(8,117,245,0.09)]" : "border-[#dfe5ee] hover:border-[#b9c5d5]")}>
          <input value={q} onFocus={() => setSearchFocused(true)} onChange={e=>{setQ(e.target.value);setSearchFocused(true);}} placeholder="Search for products, templates or ideas..." aria-label="Search products" aria-expanded={searchFocused && !!q.trim()} aria-controls="search-suggestions" className="min-w-0 w-full border-0 bg-transparent py-1.5 text-[0.875rem] text-[#263b5c] outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none placeholder:text-[#8793a7]"/>
          {q && <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="rounded-full p-1 text-[#7a8799] hover:bg-[#f1f4f8]"><X size={15}/></button>}
          <button type="submit" aria-label="Submit search" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#0875f5] text-white transition hover:bg-[#075fd0]"><Search size={17}/></button>
        </form>
        {searchFocused && q.trim() && <div id="search-suggestions" role="listbox" className="absolute left-0 right-0 top-[calc(100%+10px)] z-[80] overflow-hidden rounded-2xl border border-[#e4e9f1] bg-white py-2 shadow-[0_18px_55px_rgba(20,39,70,0.18)]">
          <div className="flex items-center justify-between px-4 pb-2 pt-1"><p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-[#8a96a8]">Suggestions</p><span className="text-[0.6875rem] text-[#98a2b2]">Search Printify</span></div>
          {suggestions.categories.length > 0 && <div className="px-2 pb-1">{suggestions.categories.map(item => <button type="button" key={item.slug} onClick={() => {setSearchFocused(false);navigate(item.slug === "all" ? "/catalog" : `/catalog?category=${item.slug}`);}} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-[#33445d] hover:bg-[#f3f7fc]"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#f0f5fc] text-[#55708e]"><Search size={15}/></span><span className="flex-1">{item.label}</span><ArrowUpRight size={14} className="text-[#8a96a8]"/></button>)}</div>}
          {suggestions.products.length > 0 && <><div className="mx-4 my-1 border-t border-[#edf0f5]"/><p className="px-4 pb-1 pt-2 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-[#8a96a8]">Matching products</p><div className="px-2">{suggestions.products.map(product => <Link role="option" key={product.id} to={`/product/${product.slug}`} onClick={() => setSearchFocused(false)} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#263b5c] hover:bg-[#f3f7fc]"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#f1f4f8]"><ShoppingBag size={16} className="text-[#71829a]"/></span><span className="min-w-0 flex-1"><span className="block truncate font-semibold">{product.name}</span><span className="block truncate text-xs text-[#7b899d]">{product.tagline}</span></span><ArrowRight size={14} className="text-[#94a0b0]"/></Link>)}</div></>}
          {suggestions.categories.length === 0 && suggestions.products.length === 0 && <button type="submit" onClick={() => {setSearchFocused(false);navigate(`/catalog?q=${encodeURIComponent(q.trim())}`);}} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[#33445d] hover:bg-[#f3f7fc]"><Search size={16}/> Search for “{q.trim()}”</button>}
          <button type="submit" onClick={() => {setSearchFocused(false);navigate(`/catalog?q=${encodeURIComponent(q.trim())}`);}} className="mt-1 flex w-full items-center justify-between border-t border-[#edf0f5] px-4 py-3 text-sm font-semibold text-[#0875f5] hover:bg-[#f8fbff]">See all results for “{q.trim()}” <ArrowRight size={15}/></button>
        </div>}
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
        <Link to="/login" aria-label="Wishlist" className="mobile-header-icon"><Heart size={22}/></Link>
        <Link to="/help" className="hidden items-center gap-1.5 px-2 py-2 text-[0.8125rem] font-medium text-[#34445e] transition hover:text-[#0875f5] sm:flex">Help</Link>
        <Link to={user?"/account":"/login"} className="hidden items-center gap-1.5 px-2 py-2 text-[0.8125rem] font-medium text-[#34445e] transition hover:text-[#0875f5] sm:flex"><PackageCheck size={15}/> Orders</Link>
        <Link to={user?"/account":"/login"} className="flex items-center gap-1.5 px-2 py-2 text-[0.8125rem] font-medium text-[#34445e] transition hover:text-[#0875f5]"><User size={13}/><span className="hidden sm:inline">{user?user.fullName.split(" ")[0]:"Sign in"}</span></Link>
        <Link to="/cart" aria-label={`Cart, ${count} items`} className="relative flex items-center gap-1.5 rounded-md border border-[#d9dee7] px-3 py-2 text-[0.8125rem] font-semibold text-[#243650] transition hover:border-[#0875f5] hover:text-[#0875f5]"><ShoppingBag size={14}/><span className="hidden sm:inline">Cart</span>{count>0&&<span className="grid h-4 min-w-4 place-items-center rounded-full bg-white px-1 text-[0.6875rem] text-[#0875f5]">{count}</span>}</Link>
      </div>
    </div>
    <form onSubmit={onSearch} className="mobile-search-row">
      <label className="flex w-full items-center gap-2 rounded-full border border-[#dfe5ee] bg-white px-4 py-2.5 transition focus-within:border-[#a9cfff] focus-within:shadow-[0_0_0_3px_rgba(8,117,245,0.08)]"><Search size={19} className="shrink-0 text-[#102748]"/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search for products, templates or ideas..." aria-label="Search products" className="w-full border-0 bg-transparent text-sm outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none placeholder:text-[#7d899c]"/><button type="submit" aria-label="Submit search" className="text-[#65738a]"><Search size={17}/></button></label>
    </form>
    <nav aria-label="Product categories" className="hidden border-t border-[#edf0f5] bg-white lg:block">
      <div className="mx-auto flex max-w-[1440px] items-center gap-1 overflow-x-auto px-4 sm:px-6 lg:px-7">
        {navCategories.map(c=><NavLink key={c.slug} to={c.slug==="all"?"/catalog":`/catalog?category=${c.slug}`} className={navLinkClass}>{c.label}</NavLink>)}
        {extraLinks.map(c=><Link key={c.slug} to={c.slug==="inspiration"?"/catalog":`/catalog?category=${c.slug}`} className="whitespace-nowrap border-b-2 border-transparent px-3 py-3 text-[0.8125rem] font-medium text-[#34445e] transition-colors hover:border-[#0875f5] hover:text-[#0875f5]">{c.label}</Link>)}
      </div>
    </nav>
    {open&&<div className="border-t border-[#e8edf4] bg-white px-4 py-4 lg:hidden">
      <form onSubmit={onSearch} className="mb-3"><label className="flex items-center gap-2 rounded-full border border-[#e6eaf2] bg-[#f5f7fb] px-3 py-2"><Search size={15}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search products, templates or ideas" aria-label="Search products" className="w-full bg-transparent text-sm outline-none"/></label></form>
      <div className="grid gap-1 sm:grid-cols-2">{[...navCategories,...extraLinks].map(c=><Link key={c.slug} to={c.slug==="all"?"/catalog":`/catalog?category=${c.slug}`} onClick={()=>setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[#f5f7fb]">{c.label}</Link>)}<Link to="/help" onClick={()=>setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[#f5f7fb]">Help & support</Link></div>
    </div>}
  </header>;
}
