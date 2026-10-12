import { FormEvent, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { HelpCircle, Heart, Menu, Search, ShoppingBag, User, X, PackageCheck } from "lucide-react";
import { navCategories } from "@/data/catalog";
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
  function onSearch(e: FormEvent) {
    e.preventDefault();
    navigate(`/catalog?q=${encodeURIComponent(q.trim())}`);
    setOpen(false);
  }
  const navLinkClass = ({ isActive }: { isActive: boolean }) => cn("whitespace-nowrap rounded-md px-3 py-3 text-[0.8125rem] font-semibold text-[#34445e] transition-colors hover:bg-[#f3f7ff] hover:text-[#0875f5]", isActive && "bg-[#eef5ff] text-[#0875f5]");

  return <header className="sticky top-0 z-40 border-b border-[#e8edf4] bg-white/95 backdrop-blur">
    <div className="header-utility-bar border-b border-[#f0f2f6] bg-[#f8f9fb]">
      <div className="mx-auto flex h-8 max-w-[1440px] items-center justify-end gap-5 px-4 text-[0.6875rem] font-medium text-[#5c6b80] sm:px-6 lg:px-7">
        <Link to="/help" className="inline-flex items-center gap-1.5 transition hover:text-[#0875f5]"><HelpCircle size={12}/> Help & support</Link>
        <Link to="/account" className="transition hover:text-[#0875f5]">My Projects</Link>
        <Link to="/login" className="transition hover:text-[#0875f5]">My Favourites</Link>
      </div>
    </div>
    <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-3 sm:px-6 lg:gap-6 lg:px-7">
      <button className="rounded-lg p-1.5 text-ink lg:hidden" onClick={()=>setOpen(v=>!v)} aria-label={open?"Close menu":"Open menu"} aria-expanded={open}>{open?<X size={18}/>:<Menu size={18}/>}</button>
      <Link to="/" className="flex shrink-0 items-center" aria-label="Printify home"><img src="/printify-logo.png" alt="Printify" width="132" height="30" className="h-[30px] w-auto sm:h-[30px]" /></Link>
      <form onSubmit={onSearch} className="mx-2 hidden min-w-0 max-w-[640px] flex-1 md:flex">
        <label className="flex w-full items-center gap-3 rounded-full border border-[#e7ebf2] bg-[#f7f8fa] px-4 py-2.5 transition focus-within:border-[#9dc6ff] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#0875f5]/10">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search for products, templates or ideas..." aria-label="Search products" className="w-full bg-transparent text-[0.8125rem] outline-none placeholder:text-[#8490a3]"/>
          <button type="submit" aria-label="Submit search" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#0875f5] text-white transition hover:bg-[#075fd0]"><Search size={15}/></button>
        </label>
      </form>
      <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
        <Link to="/login" aria-label="Wishlist" className="mobile-header-icon"><Heart size={22}/></Link>
        <Link to="/help" className="hidden items-center gap-1 rounded-full px-1.5 py-1.5 text-[0.75rem] font-medium text-[#4b5b73] hover:bg-[#f4f6fa] sm:flex"><HelpCircle size={13}/> Help</Link>
        <Link to={user?"/account":"/login"} className="hidden items-center gap-1 rounded-full px-1.5 py-1.5 text-[0.75rem] font-medium text-[#4b5b73] hover:bg-[#f4f6fa] sm:flex"><PackageCheck size={13}/> Orders</Link>
        <Link to={user?"/account":"/login"} className="flex items-center gap-1 rounded-full px-1.5 py-1.5 text-[0.75rem] font-medium text-[#4b5b73] hover:bg-[#f4f6fa]"><User size={13}/><span className="hidden sm:inline">{user?user.fullName.split(" ")[0]:"Sign in"}</span></Link>
        <Link to="/cart" aria-label={`Cart, ${count} items`} className="relative flex items-center gap-1.5 rounded-lg bg-[#0875f5] px-3 py-2 text-[0.75rem] font-bold text-white hover:bg-[#075fd0]"><ShoppingBag size={14}/><span className="hidden sm:inline">Cart</span>{count>0&&<span className="grid h-4 min-w-4 place-items-center rounded-full bg-white px-1 text-[0.6875rem] text-[#0875f5]">{count}</span>}</Link>
      </div>
    </div>
    <form onSubmit={onSearch} className="mobile-search-row">
      <label className="flex w-full items-center gap-2 rounded-full bg-[#f3f5f9] px-4 py-3"><Search size={19} className="shrink-0 text-[#102748]"/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search for products, templates or ideas..." aria-label="Search products" className="w-full bg-transparent text-sm outline-none placeholder:text-[#7d899c]"/><button type="submit" aria-label="Submit search" className="text-[#65738a]"><Search size={17}/></button></label>
    </form>
    <nav aria-label="Product categories" className="hidden border-t border-[#edf0f5] bg-white lg:block">
      <div className="mx-auto flex max-w-[1440px] items-center gap-1 overflow-x-auto px-4 sm:px-6 lg:px-7">
        {navCategories.map(c=><NavLink key={c.slug} to={c.slug==="all"?"/catalog":`/catalog?category=${c.slug}`} className={navLinkClass}>{c.label}</NavLink>)}
        {extraLinks.map(c=><Link key={c.slug} to={c.slug==="inspiration"?"/catalog":`/catalog?category=${c.slug}`} className="whitespace-nowrap rounded-md px-3 py-3 text-[0.8125rem] font-semibold text-[#34445e] transition-colors hover:bg-[#f3f7ff] hover:text-[#0875f5]">{c.label}</Link>)}
      </div>
    </nav>
    {open&&<div className="border-t border-[#e8edf4] bg-white px-4 py-4 lg:hidden">
      <form onSubmit={onSearch} className="mb-3"><label className="flex items-center gap-2 rounded-full border border-[#e6eaf2] bg-[#f5f7fb] px-3 py-2"><Search size={15}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search products, templates or ideas" aria-label="Search products" className="w-full bg-transparent text-sm outline-none"/></label></form>
      <div className="grid gap-1 sm:grid-cols-2">{[...navCategories,...extraLinks].map(c=><Link key={c.slug} to={c.slug==="all"?"/catalog":`/catalog?category=${c.slug}`} onClick={()=>setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[#f5f7fb]">{c.label}</Link>)}<Link to="/help" onClick={()=>setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[#f5f7fb]">Help & support</Link></div>
    </div>}
  </header>;
}
