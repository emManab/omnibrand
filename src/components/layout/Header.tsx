import { FormEvent, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { HelpCircle, Menu, Search, ShoppingBag, User, X, PackageCheck } from "lucide-react";
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
  const navLinkClass = ({ isActive }: { isActive: boolean }) => cn("whitespace-nowrap border-b-2 border-transparent px-2.5 py-2.5 text-[0.75rem] font-semibold text-[#34445e] transition hover:text-[#0875f5] sm:text-[0.8125rem]", isActive && "border-[#0875f5] text-[#0875f5]");

  return <header className="sticky top-0 z-40 border-b border-[#e8edf4] bg-white/95 backdrop-blur">
    <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-2 sm:px-6 lg:px-7">
      <button className="rounded-lg p-1.5 text-ink lg:hidden" onClick={()=>setOpen(v=>!v)} aria-label={open?"Close menu":"Open menu"} aria-expanded={open}>{open?<X size={18}/>:<Menu size={18}/>}</button>
      <Link to="/" className="flex shrink-0 items-center" aria-label="Printify home"><img src="/printify-logo.svg" alt="Printify" width="132" height="30" className="h-[26px] w-auto sm:h-[30px]" /></Link>
      <form onSubmit={onSearch} className="mx-2 hidden min-w-0 max-w-[590px] flex-1 md:flex">
        <label className="flex w-full items-center gap-2 rounded-full bg-[#f3f5f9] px-4 py-2">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search for products, templates or ideas..." aria-label="Search products" className="w-full bg-transparent text-[0.75rem] outline-none placeholder:text-[#8490a3] sm:text-[0.8125rem]"/>
          <button type="submit" aria-label="Submit search" className="text-[#65738a] hover:text-[#0875f5]"><Search size={15}/></button>
        </label>
      </form>
      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
        <Link to="/help" className="hidden items-center gap-1 rounded-full px-1.5 py-1.5 text-[0.75rem] font-medium text-[#4b5b73] hover:bg-[#f4f6fa] sm:flex"><HelpCircle size={13}/> Help</Link>
        <Link to={user?"/account":"/login"} className="hidden items-center gap-1 rounded-full px-1.5 py-1.5 text-[0.75rem] font-medium text-[#4b5b73] hover:bg-[#f4f6fa] sm:flex"><PackageCheck size={13}/> Orders</Link>
        <Link to={user?"/account":"/login"} className="flex items-center gap-1 rounded-full px-1.5 py-1.5 text-[0.75rem] font-medium text-[#4b5b73] hover:bg-[#f4f6fa]"><User size={13}/><span className="hidden sm:inline">{user?user.fullName.split(" ")[0]:"Sign in"}</span></Link>
        <Link to="/cart" aria-label={`Cart, ${count} items`} className="relative flex items-center gap-1.5 rounded-lg bg-[#0875f5] px-3 py-2 text-[0.75rem] font-bold text-white hover:bg-[#075fd0]"><ShoppingBag size={14}/><span className="hidden sm:inline">Cart</span>{count>0&&<span className="grid h-4 min-w-4 place-items-center rounded-full bg-white px-1 text-[0.6875rem] text-[#0875f5]">{count}</span>}</Link>
      </div>
    </div>
    <nav aria-label="Product categories" className="hidden border-t border-[#f3f5f8] lg:block">
      <div className="mx-auto flex max-w-[1440px] items-center gap-0.5 overflow-x-auto px-4 sm:px-6 lg:px-7">
        {navCategories.map(c=><NavLink key={c.slug} to={c.slug==="all"?"/catalog":`/catalog?category=${c.slug}`} className={navLinkClass}>{c.label}</NavLink>)}
        {extraLinks.map(c=><Link key={c.slug} to={c.slug==="inspiration"?"/catalog":`/catalog?category=${c.slug}`} className="whitespace-nowrap border-b-2 border-transparent px-2.5 py-2.5 text-[0.75rem] font-semibold text-[#34445e] hover:text-[#0875f5] sm:text-[0.8125rem]">{c.label}</Link>)}
      </div>
    </nav>
    {open&&<div className="border-t border-[#e8edf4] bg-white px-4 py-4 lg:hidden">
      <form onSubmit={onSearch} className="mb-3"><label className="flex items-center gap-2 rounded-full border border-[#e6eaf2] bg-[#f5f7fb] px-3 py-2"><Search size={15}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search products, templates or ideas" aria-label="Search products" className="w-full bg-transparent text-sm outline-none"/></label></form>
      <div className="grid gap-1 sm:grid-cols-2">{[...navCategories,...extraLinks].map(c=><Link key={c.slug} to={c.slug==="all"?"/catalog":`/catalog?category=${c.slug}`} onClick={()=>setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[#f5f7fb]">{c.label}</Link>)}<Link to="/help" onClick={()=>setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[#f5f7fb]">Help & support</Link></div>
    </div>}
  </header>;
}
