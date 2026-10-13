import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";

export function PremiumHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const items = useCart((s) => s.items);
  const user = useAuth((s) => s.user);
  const cartCount = items.reduce((n, i) => n + i.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const categories = [
    { label: "Business Cards", path: "/catalog?category=business-cards" },
    { label: "Custom Apparel", path: "/catalog?category=apparel" },
    { label: "Stickers & Labels", path: "/catalog?category=stickers" },
    { label: "Marketing Materials", path: "/catalog?category=marketing" },
    { label: "Packaging", path: "/catalog?category=packaging" },
    { label: "Gifts & Drinkware", path: "/catalog?category=gifts" },
  ];

  return (
    <>
      {/* Floating Glass Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isScrolled ? "mt-4" : "mt-6"
        }`}
      >
        {/* Outer Shell - Double Bezel Architecture */}
        <div className="mx-auto max-w-7xl px-4">
          <div className="rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-black/5 backdrop-blur-2xl dark:bg-black/20 dark:ring-white/10">
            {/* Inner Core */}
            <nav className="rounded-[calc(2rem-0.375rem)] bg-white/95 px-6 py-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-xl dark:bg-black/90">
              <div className="flex items-center justify-between">
                {/* Logo */}
                <Link
                  to="/"
                  className="flex items-center gap-3 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:opacity-70"
                >
                  <img src="/calcuttapress-logo.png" alt="Calcuttapress" className="h-9 w-auto max-w-[190px]" />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden items-center gap-8 lg:flex">
                  {categories.slice(0, 4).map((cat) => (
                    <Link
                      key={cat.path}
                      to={cat.path}
                      className="text-sm font-medium text-[#34445e] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-[#0875f5] dark:text-white/70 dark:hover:text-white"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                  {/* Search - Hidden on mobile */}
                  <form onSubmit={handleSearch} className="hidden md:block">
                    <div className="group relative">
                      <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="w-48 rounded-full border border-black/5 bg-black/5 px-4 py-2 pl-10 text-sm text-[#182b48] outline-none transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] placeholder:text-[#8793a7] focus:w-64 focus:border-[#0875f5]/20 focus:bg-white focus:ring-2 focus:ring-[#0875f5]/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:bg-white/10"
                      />
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8793a7] transition-colors group-focus-within:text-[#0875f5]" />
                    </div>
                  </form>

                  {/* User Account - Nested Island Button */}
                  <Link
                    to={user ? "/account" : "/login"}
                    className="group hidden rounded-full bg-black/5 p-2.5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-black/10 active:scale-[0.98] dark:bg-white/10 dark:hover:bg-white/20 md:block"
                  >
                    <User className="h-5 w-5 text-[#34445e] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105 dark:text-white/70" />
                  </Link>

                  {/* Cart - Nested Island Button with Badge */}
                  <Link
                    to="/cart"
                    className="group relative rounded-full bg-black/5 p-2.5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-black/10 active:scale-[0.98] dark:bg-white/10 dark:hover:bg-white/20"
                  >
                    <ShoppingBag className="h-5 w-5 text-[#34445e] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105 dark:text-white/70" />
                    {cartCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#0875f5] text-[10px] font-bold text-white shadow-lg">
                        {cartCount}
                      </span>
                    )}
                  </Link>

                  {/* Hamburger - Fluid Morph */}
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="group rounded-full bg-black/5 p-2.5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-black/10 active:scale-[0.98] dark:bg-white/10 dark:hover:bg-white/20 lg:hidden"
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                  >
                    <div className="relative h-5 w-5">
                      <span
                        className={`absolute left-0 top-1 h-0.5 w-5 bg-[#34445e] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] dark:bg-white/70 ${
                          isMenuOpen ? "rotate-45 translate-y-1.5" : ""
                        }`}
                      />
                      <span
                        className={`absolute left-0 top-1/2 h-0.5 w-5 -translate-y-1/2 bg-[#34445e] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] dark:bg-white/70 ${
                          isMenuOpen ? "opacity-0" : ""
                        }`}
                      />
                      <span
                        className={`absolute bottom-1 left-0 h-0.5 w-5 bg-[#34445e] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] dark:bg-white/70 ${
                          isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                        }`}
                      />
                    </div>
                  </button>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] lg:hidden ${
          isMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-3xl dark:bg-white/5" />

        {/* Menu Content with Staggered Reveal */}
        <div className="relative flex min-h-[100dvh] flex-col items-center justify-center p-8">
          <nav className="space-y-6">
            {categories.map((cat, idx) => (
              <Link
                key={cat.path}
                to={cat.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block text-center text-3xl font-black tracking-tight text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-[#0875f5] ${
                  isMenuOpen
                    ? "translate-y-0 opacity-100 blur-0"
                    : "translate-y-12 opacity-0 blur-md"
                }`}
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transitionDelay: isMenuOpen ? `${idx * 100}ms` : "0ms",
                }}
              >
                {cat.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="mt-12 w-full max-w-md">
            <div
              className={`transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                isMenuOpen
                  ? "translate-y-0 opacity-100 blur-0 delay-500"
                  : "translate-y-12 opacity-0 blur-md"
              }`}
            >
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-full border border-white/10 bg-white/5 px-6 py-4 text-center text-white outline-none backdrop-blur-xl transition-all duration-500 placeholder:text-white/40 focus:border-white/20 focus:bg-white/10"
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
