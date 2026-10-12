import { Heart, Home, LayoutGrid, Sparkles, UserRound } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/cn";

const links = [
  { label: "Home", to: "/", icon: Home },
  { label: "Categories", to: "/catalog", icon: LayoutGrid },
  { label: "Design", to: "/editor/custom-t-shirts", icon: Sparkles },
  { label: "Wishlist", to: "/login", icon: Heart },
  { label: "Account", to: "/account", icon: UserRound },
];

export function MobileBottomNav() {
  const { pathname } = useLocation();
  return <nav aria-label="Mobile navigation" className="mobile-bottom-nav">
    <NavLink to="/" aria-label="Printify home" className="mobile-bottom-nav__brand"><img src="/printly-logo.svg" alt="Printly" width="104" height="24" /></NavLink>
    {links.map((item) => <NavLink key={item.label} to={item.to} className={cn("mobile-bottom-nav__item", (item.label === "Home" ? pathname === "/" : item.label === "Categories" ? pathname === "/catalog" : item.label === "Design" ? pathname.startsWith("/editor/") : pathname === item.to) && "is-active")}>
      <item.icon aria-hidden="true" size={21} strokeWidth={2} />
      <span>{item.label}</span>
    </NavLink>)}
  </nav>;
}
