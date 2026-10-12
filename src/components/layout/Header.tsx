import { FormEvent, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { HelpCircle, Menu, Search, ShoppingBag, User, X, PackageCheck } from "lucide-react";
import { navCategories } from "@/data/catalog";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { cn } from "@/lib/cn";

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

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 lg:gap-5 lg:px-6">
        <button
          className="rounded-lg p-2 text-ink lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="Printify home">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-lg font-extrabold tracking-tight text-white">P</span>
          <span className="text-xl font-extrabold tracking-tight text-[#14284b]">Printify</span>
        </Link>

        <form onSubmit={onSearch} className="hidden min-w-0 max-w-xl flex-1 md:flex">
          <label className="flex w-full items-center gap-2 rounded-full border border-line bg-[#f5f7fb] px-4 py-2.5">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for products, templates or ideas..."
              aria-label="Search products"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
            />
            <button type="submit" aria-label="Submit search" className="text-muted hover:text-brand"><Search size={17} /></button>
          </label>
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <Link to="/help" className="hidden items-center gap-1 rounded-full px-2 py-1.5 text-sm text-muted hover:bg-paper sm:flex">
            <HelpCircle size={16} /> <span>Help</span>
          </Link>
          <Link to={user ? "/account" : "/login"} className="hidden items-center gap-1 rounded-full px-2 py-1.5 text-sm text-muted hover:bg-paper sm:flex">
            <PackageCheck size={16} /> <span>Orders</span>
          </Link>
          <Link
            to={user ? "/account" : "/login"}
            className="flex items-center gap-1 rounded-full px-2 py-1.5 text-sm font-medium hover:bg-paper"
          >
            <User size={16} />
            <span className="hidden sm:inline">{user ? user.fullName.split(" ")[0] : "Sign in"}</span>
          </Link>
          <Link to="/cart" className="relative flex h-10 items-center gap-2 rounded-xl bg-brand px-3 text-sm font-semibold text-white hover:bg-brand-dark" aria-label={`Cart, ${count} items`}>
            <ShoppingBag size={17} /><span className="hidden sm:inline">Cart</span>
            {count > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[11px] font-bold text-brand">{count}</span>}
          </Link>
        </div>
      </div>

      <nav aria-label="Product categories" className="hidden border-t border-[#f0f2f6] lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 lg:px-6">
          {navCategories.map((c) => (
            <NavLink
              key={c.slug}
              to={c.slug === "all" ? "/catalog" : `/catalog?category=${c.slug}`}
              className={({ isActive }) => cn(
                "whitespace-nowrap border-b-2 border-transparent px-3 py-3 text-[12px] font-medium text-ink/75 hover:text-brand",
                isActive && "border-brand text-brand",
              )}
            >{c.label}</NavLink>
          ))}
          <Link to="/catalog?category=stationery" className="whitespace-nowrap border-b-2 border-transparent px-3 py-3 text-[12px] font-medium text-ink/75 hover:text-brand">Office Stationery</Link>
          <Link to="/catalog?category=inspiration" className="whitespace-nowrap border-b-2 border-transparent px-3 py-3 text-[12px] font-medium text-ink/75 hover:text-brand">Inspiration</Link>
        </div>
      </nav>

      {open && (
        <div className="border-t border-line bg-white px-4 py-4 lg:hidden">
          <form onSubmit={onSearch} className="mb-3">
            <label className="flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-2">
              <Search size={16} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products, templates or ideas" aria-label="Search products" className="w-full bg-transparent text-sm outline-none" />
            </label>
          </form>
          <div className="grid gap-1 sm:grid-cols-2">
            {navCategories.map((c) => (
              <Link key={c.slug} to={c.slug === "all" ? "/catalog" : `/catalog?category=${c.slug}`} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-paper">{c.label}</Link>
            ))}
            <Link to="/help" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-paper">Help & support</Link>
            <Link to="/cart" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-paper">Shopping cart ({count})</Link>
          </div>
        </div>
      )}
    </header>
  );
}
