import { FormEvent, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { HelpCircle, Menu, Search, ShoppingBag, User, X } from "lucide-react";
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
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 lg:px-6">
        <button
          className="rounded-lg p-2 text-ink lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-sm font-bold text-white">
            O
          </span>
          <span className="text-lg font-semibold tracking-tight">OmniBrand</span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto text-[13.5px] font-medium text-ink/80 lg:flex">
          {navCategories.map((c) => (
            <NavLink
              key={c.slug}
              to={c.slug === "all" ? "/catalog" : `/catalog?category=${c.slug}`}
              className={({ isActive }) =>
                cn(
                  "whitespace-nowrap rounded-full px-2.5 py-1.5 hover:bg-paper",
                  isActive && "text-brand",
                )
              }
            >
              {c.label}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-sm">
          <label className="flex w-full items-center gap-2 rounded-full border border-line bg-paper px-3 py-2">
            <Search size={16} className="text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products, categories or ideas"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
            />
          </label>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link to="/help" className="hidden items-center gap-1 rounded-full px-2 py-1.5 text-sm text-muted hover:bg-paper sm:flex">
            <HelpCircle size={16} /> Help
          </Link>
          <Link
            to={user ? "/account" : "/login"}
            className="flex items-center gap-1 rounded-full px-2 py-1.5 text-sm font-medium hover:bg-paper"
          >
            <User size={16} />
            <span className="hidden sm:inline">{user ? user.fullName.split(" ")[0] : "Sign in"}</span>
          </Link>
          <Link
            to="/cart"
            className="relative grid h-10 w-10 place-items-center rounded-full bg-brand text-white hover:bg-brand-dark"
            aria-label="Cart"
          >
            <ShoppingBag size={18} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-navy px-1 text-[11px] font-semibold">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-white px-4 py-4 lg:hidden">
          <form onSubmit={onSearch} className="mb-3">
            <label className="flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-2">
              <Search size={16} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products"
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>
          </form>
          <div className="grid gap-1">
            {navCategories.map((c) => (
              <Link
                key={c.slug}
                to={c.slug === "all" ? "/catalog" : `/catalog?category=${c.slug}`}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2 text-sm font-medium hover:bg-paper"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
